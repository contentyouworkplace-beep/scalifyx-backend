const Anthropic = require('@anthropic-ai/sdk');
const { searchKnowledgeBase, getStarterFAQs } = require('../data/knowledgeBase');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Scalify AI — a friendly, professional website creation assistant for Indian small businesses.

YOUR JOB: Collect business details through natural conversation, then generate a website.

CONVERSATION FLOW (follow this order strictly):
1. BUSINESS TYPE — Ask what kind of business they have (restaurant, salon, doctor, shop, etc.)
2. BUSINESS NAME — Ask for the exact business name
3. PHONE NUMBER — Ask for their contact phone number (10-digit Indian number)
4. WHATSAPP NUMBER — Ask if WhatsApp number is same or different
5. BUSINESS ADDRESS — Ask for full address or at least city
6. SHORT DESCRIPTION — Ask them to describe their business in 1-2 lines
7. SERVICES/PRODUCTS LIST — Ask for their main services or products (comma separated). Give examples relevant to their business type.
8. BUSINESS TIMINGS — Ask for opening hours (e.g., Mon-Sat 10 AM - 8 PM)
9. LOGO — Ask if they want to upload a logo (or we'll create a text logo)
10. PHOTOS — Ask for 2-5 business/product photos
11. COLOR THEME — Offer 6 color options: Blue, Green, Red, Orange, Purple, Black
12. SOCIAL MEDIA — Ask for Instagram/Facebook links (optional)

RULES:
- Ask ONE question at a time. Be conversational and warm.
- Use emojis moderately (1-2 per message).
- Give examples relevant to their business type.
- Validate phone numbers (must be 10 digits).
- If they seem confused, give an example answer.
- Keep responses short (2-4 lines max).
- Speak in simple English (many users may not be fluent).
- After collecting ALL info, confirm the summary and say you're generating the website.
- Be encouraging and positive about their business.
- If they ask about pricing, mention plans starting at ₹1,499/month.

WHEN ALL DATA IS COLLECTED, respond with a JSON block in this exact format:
\`\`\`json
{
  "action": "GENERATE_WEBSITE",
  "data": {
    "businessType": "...",
    "businessName": "...",
    "phone": "...",
    "whatsapp": "...",
    "address": "...",
    "description": "...",
    "services": ["service1", "service2"],
    "timings": "...",
    "colorTheme": "#hex",
    "socialLinks": { "instagram": "...", "facebook": "..." }
  }
}
\`\`\`

If the user asks to EDIT an existing website, respond with:
\`\`\`json
{
  "action": "EDIT_WEBSITE",
  "changes": {
    "field": "value_to_change"
  }
}
\`\`\`
`;

/**
 * Process a chat message through Claude AI
 * @param {Array} conversationHistory - Array of {role, content} messages
 * @param {string} userMessage - Latest user message
 * @returns {Object} { reply: string, action?: object }
 */
async function processChat(conversationHistory, userMessage) {
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages,
  });

  const reply = response.content[0].text;

  // Check if AI wants to generate/edit a website
  let action = null;
  const jsonMatch = reply.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      action = JSON.parse(jsonMatch[1]);
    } catch (e) {
      // Not valid JSON, ignore
    }
  }

  // Clean reply (remove JSON block for user display)
  const cleanReply = reply.replace(/```json\n[\s\S]*?\n```/g, '').trim();

  return {
    reply: cleanReply || '⏳ Creating your website now...',
    action,
    fullReply: reply,
  };
}

/**
 * Analyze a screenshot/reference image to extract design details
 * Uses Claude Vision to understand layout, colors, style
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} userNotes - Optional notes from user
 * @returns {Object} { designAnalysis, suggestedLayout, colorPalette }
 */
async function analyzeScreenshot(imageBase64, userNotes = '') {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
        },
        {
          type: 'text',
          text: `Analyze this website screenshot/reference image. Extract:
1. Layout structure (sections, grid style)
2. Color palette (primary, secondary, background, text colors as hex)
3. Design style (modern, minimal, corporate, playful, dark, etc.)
4. Key sections visible (hero, features, testimonials, etc.)
5. Typography feel (bold, elegant, casual)
${userNotes ? `\nUser notes: ${userNotes}` : ''}

Respond in JSON:
{
  "layout": "description of layout",
  "sections": ["hero", "features", ...],
  "colors": { "primary": "#hex", "secondary": "#hex", "background": "#hex", "text": "#hex" },
  "style": "modern/minimal/etc",
  "typography": "bold/elegant/casual",
  "suggestions": "what to replicate for a small business site"
}`
        }
      ]
    }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return { layout: 'standard', style: 'modern', suggestions: text };
}

/**
 * Analyze a URL reference to extract design inspirations
 */
async function analyzeURLReference(url) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `The user wants a website inspired by: ${url}

Based on this well-known website or URL pattern, describe:
1. Likely design style
2. Color scheme
3. Key sections to include
4. Layout suggestions for a small business version

Respond in JSON:
{
  "style": "description",
  "colors": { "primary": "#hex", "secondary": "#hex", "background": "#hex" },
  "sections": ["hero", "features", ...],
  "layout": "description",
  "suggestions": "how to adapt for small business"
}`
    }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return { style: 'modern', suggestions: text };
}

/**
 * Generate website content using AI
 * @param {Object} businessData - Collected business details
 * @returns {Object} Generated website content
 */
async function generateWebsiteContent(businessData) {
  const extras = [];
  if (businessData.template) extras.push(`Template style: ${businessData.template}`);
  if (businessData.referenceUrl) extras.push(`Design inspired by: ${businessData.referenceUrl}`);
  if (businessData.freeformDescription) extras.push(`User's custom vision: ${businessData.freeformDescription}`);
  if (businessData.designAnalysis) extras.push(`Design analysis: ${JSON.stringify(businessData.designAnalysis)}`);

  const prompt = `You are a WORLD-CLASS website content strategist and conversion expert who has studied 10,000+ top-performing websites across every niche.

YOUR EXPERTISE:
- You have analyzed the TOP 100 websites in the "${businessData.businessType || 'business'}" niche globally
- You know what converts visitors into customers for THIS specific industry
- You understand Indian consumer psychology, local SEO, and trust signals that work in India
- You write copy that is persuasive, emotional, and action-oriented — not generic filler
- Every word you write is intentional and optimized for conversions

NICHE RESEARCH (apply this knowledge):
Before generating content, mentally review what the BEST ${businessData.businessType || 'business'} websites in India do:
- What headlines make people stop scrolling?
- What trust signals matter most for this business type?
- What questions do customers ask before choosing this type of business?
- What emotional triggers drive bookings/purchases in this niche?
- What makes a ${businessData.businessType || 'business'} website feel premium vs amateur?

BUSINESS DETAILS:
Business: ${businessData.businessName}
Type: ${businessData.businessType}
Description: ${businessData.description}
Services: ${businessData.services?.join(', ')}
Phone: ${businessData.phone}
WhatsApp: ${businessData.whatsapp || businessData.phone}
Address: ${businessData.address}
Timings: ${businessData.timings}
Color Theme: ${businessData.colorTheme || '#10B981'}
${extras.length > 0 ? '\nAdditional context:\n' + extras.join('\n') : ''}

QUALITY STANDARDS (CRITICAL — read carefully):
1. ZERO generic content — every line must feel custom-written for THIS exact business
2. Headlines must be power-packed, emotional, and benefit-driven (not "Welcome to X")
3. Service descriptions must sell the OUTCOME, not just list features
4. Testimonials must sound like REAL people (use Indian names relevant to the city/area, specific details)
5. FAQs must answer the ACTUAL questions customers ask for this niche (not generic ones)
6. Stats/highlights must be realistic and specific to the business type
7. About section must tell a STORY, not just state facts
8. CTAs must create urgency without being pushy
9. Every section must have a clear purpose in the conversion funnel
10. Content should make the business look like the BEST in their city

UNSPLASH IMAGE STRATEGY:
For heroImage, pick the PERFECT search query that would return a stunning, high-quality photo for this specific business type. Think like a designer — what background image would make the hero section breathtaking?
For serviceImages, pick specific queries for each service that return professional, relevant photos.

Generate in this EXACT JSON format:

{
  "heroHeadline": "A POWERFUL 5-10 word headline — emotional, benefit-driven, specific to the niche. NOT generic. Example for dentist: 'Your Smile Deserves the Best Care in Town'. Example for restaurant: 'Where Every Bite Tells a Story of Flavor'",
  "heroSubheadline": "2 lines that build on the headline, establish credibility, and create desire. Mention the city name. Include a micro-trust signal.",
  "heroCTA": "Action-oriented CTA specific to the business (Book Appointment / Order Now / Get a Free Quote / Reserve Your Table)",
  "heroSecondCTA": "Secondary CTA (Explore Our Menu / View Services / See Our Work / Check Plans)",
  "heroImage": "Unsplash search query for a stunning hero background (e.g., 'modern dental clinic interior' or 'indian restaurant fine dining')",
  "aboutTitle": "A UNIQUE about heading that reflects the brand's personality (NOT 'About Us'). Example: 'A Legacy of Healing Since 2005' or 'Crafted with Passion, Served with Love'",
  "aboutText": "5-6 sentences that tell a STORY. Start with the founding story or passion. Mention specific expertise. Include a line about the team. End with the mission/promise to customers. Make it emotional and relatable.",
  "aboutHighlights": [
    { "number": "REALISTIC_NUMBER", "label": "Specific metric for this business type" },
    { "number": "REALISTIC_NUMBER", "label": "Another trust metric" },
    { "number": "REALISTIC_NUMBER", "label": "Third metric (e.g., Google rating, years, treatments done)" },
    { "number": "REALISTIC_NUMBER", "label": "Fourth metric that builds trust" }
  ],
  "whyChooseUs": [
    { "title": "3-4 word USP title", "description": "1-2 sentences explaining WHY this matters to the customer", "icon": "relevant emoji" },
    { "title": "Another USP", "description": "Customer-benefit focused description", "icon": "emoji" },
    { "title": "Another USP", "description": "Description", "icon": "emoji" },
    { "title": "Another USP", "description": "Description", "icon": "emoji" }
  ],
  "servicesWithDescriptions": [
    { "name": "Service Name", "description": "3-4 sentences: What it is → Who needs it → What outcome they get → Why choose us for this. Make it SELL.", "icon": "emoji", "highlight": "Key benefit in 3-4 words", "image": "Unsplash search query for this specific service" }
  ],
  "galleryImages": [
    { "query": "Unsplash search for this business type photo 1", "caption": "Short caption" },
    { "query": "Unsplash search for this business type photo 2", "caption": "Short caption" },
    { "query": "Unsplash search for this business type photo 3", "caption": "Short caption" },
    { "query": "Unsplash search for this business type photo 4", "caption": "Short caption" },
    { "query": "Unsplash search for this business type photo 5", "caption": "Short caption" },
    { "query": "Unsplash search for this business type photo 6", "caption": "Short caption" }
  ],
  "testimonials": [
    { "name": "Indian name matching the city/area", "text": "SPECIFIC testimonial mentioning what service they used and the positive outcome. 2-3 sentences. Must read like a real Google review.", "rating": 5, "service": "Which service they used" },
    { "name": "Another Indian name", "text": "Different style testimonial — maybe about value for money or staff friendliness", "rating": 5, "service": "Service" },
    { "name": "Another name", "text": "Testimonial focusing on a different aspect (e.g., cleanliness, speed, expertise)", "rating": 5, "service": "Service" },
    { "name": "Another name", "text": "Shorter but impactful testimonial", "rating": 4, "service": "Service" }
  ],
  "faqItems": [
    { "question": "The #1 question customers ask before choosing a ${businessData.businessType || 'business'}", "answer": "Detailed, helpful, trust-building answer. 2-3 sentences." },
    { "question": "A pricing/cost related question common in this niche", "answer": "Transparent answer that positions the business favorably" },
    { "question": "A question about quality/experience/credentials", "answer": "Answer that builds authority" },
    { "question": "A practical/logistics question (parking, timing, process)", "answer": "Helpful answer" },
    { "question": "A question that addresses a common fear/objection in this niche", "answer": "Reassuring answer" },
    { "question": "A question about what makes this business different", "answer": "Answer highlighting USPs" }
  ],
  "trustBadges": [
    { "icon": "emoji", "text": "Trust signal relevant to this business (e.g., 'ISO Certified', 'FSSAI Licensed', 'Govt. Registered')" },
    { "icon": "emoji", "text": "Another trust badge" },
    { "icon": "emoji", "text": "Another trust badge" },
    { "icon": "emoji", "text": "Another trust badge" }
  ],
  "ctaBanner": {
    "headline": "A compelling mid-page CTA headline (e.g., 'Ready to Experience the Difference?')",
    "subtext": "1 line supporting text that creates soft urgency",
    "buttonText": "CTA button text"
  },
  "metaTitle": "SEO title — include business name, primary service, and city (60 chars max)",
  "metaDescription": "SEO description — benefit-driven, include a CTA, mention city (155 chars max)",
  "ogDescription": "Social sharing description that makes people click",
  "footerTagline": "A memorable brand tagline — short, impactful, unique to this business"
}

FINAL CHECK BEFORE RESPONDING:
- Is EVERY piece of content specific to ${businessData.businessName} and ${businessData.businessType}? Or could it work for any business? If generic, REWRITE IT.
- Would a real customer in ${businessData.address || 'India'} be impressed by this website? Or would it look templated?
- Are the testimonials believable? Would you trust them as a real customer?
- Does the hero headline make you want to scroll down? Or is it forgettable?`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to generate website content');
}

// ─── SALES ASSISTANT for free users ───

const SALES_SYSTEM_PROMPT = `You are Scalify AI — a warm, persuasive sales assistant for Scalify, an affordable Website + SEO subscription service for Indian small businesses.

YOUR GOAL: Answer user questions honestly, build trust, and convince them to subscribe to Scalify Pro (₹1,499/month).

ABOUT SCALIFYX PRO (₹1,499/month — 63% OFF from ₹2,499):
- Professional multi-page website (unlimited pages)
- Full SEO optimization (on-page, technical, local)
- Free hosting, SSL, maintenance
- Google Search Console setup
- Monthly analytics & SEO reports
- Click-to-call, WhatsApp button, contact forms
- Mobile responsive design
- Social media integration
- Unlimited website updates via chat
- Priority chat support (AI + human)

SALES APPROACH:
- Be warm, friendly, and conversational (like a knowledgeable friend, not a pushy salesman)
- Answer questions honestly — never lie or exaggerate
- Use real comparisons: "A developer charges ₹25,000+ for a website alone"
- Relate to their business type when possible
- Use ₹ pricing (Indian audience)
- Keep responses concise (3-6 lines max)
- Use 1-2 emojis per message (not too many)
- After answering 3+ questions or when interest is shown, gently suggest subscribing
- If they say they're not interested, respect it but highlight what they're missing
- Address objections directly with facts
- Use social proof ("thousands of businesses", "97% of consumers search online")

KNOWLEDGE TO USE (from our 500+ FAQ database):
{KNOWLEDGE_CONTEXT}

IMPORTANT RULES:
- Never promise specific Google ranking positions (e.g., "guaranteed #1")
- Don't trash-talk specific competitors by name — just compare features
- Be honest about limitations (e.g., "full e-commerce coming soon")
- If they ask something you don't know, say "Let me connect you with our team" 
- Speak simple English (many users may not be fluent)
- If user speaks Hindi, respond in Hinglish (Hindi + English mix)

RESPONSE FORMAT:
- Keep answers focused and actionable
- Use bullet points for lists
- Bold (**text**) for key numbers like ₹1,499
- End with a soft CTA when appropriate (not every message)

At the end of your response, on a new line, add exactly one of these tags:
[SHOW_CTA] — if the user seems interested/ready to buy
[NO_CTA] — if they're just asking questions or not ready yet
`;

/**
 * Process a sales/FAQ chat message for free users
 * Uses knowledge base for context + Claude for natural conversation
 */
async function processSalesChat(conversationHistory, userMessage) {
  // Search knowledge base for relevant context
  const kbResults = searchKnowledgeBase(userMessage, 5);
  const knowledgeContext = kbResults.length > 0
    ? kbResults.map(r => `Q: ${r.q}\nA: ${r.a}`).join('\n\n')
    : 'No specific FAQ match — use your general knowledge about Scalify.';

  const systemPrompt = SALES_SYSTEM_PROMPT.replace('{KNOWLEDGE_CONTEXT}', knowledgeContext);

  const messages = [
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: userMessage },
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  let reply = response.content[0].text;
  
  // Extract CTA tag
  const showCTA = reply.includes('[SHOW_CTA]');
  reply = reply.replace(/\[SHOW_CTA\]|\[NO_CTA\]/g, '').trim();

  return {
    reply,
    showCTA,
  };
}

module.exports = { processChat, processSalesChat, generateWebsiteContent, analyzeScreenshot, analyzeURLReference };
