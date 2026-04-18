/**
 * ScalifyX Knowledge Base — 500 Q&A pairs for AI sales assistant
 * Categories: Pricing, Features, SEO, Website, Domain, Support, Technical, Trust, Comparisons, General
 */

const KNOWLEDGE_BASE = {
  // ─── PRICING & PLANS (50 questions) ───
  pricing: [
    { q: "How much does ScalifyX cost?", a: "ScalifyX Pro is just ₹749/month — that's 63% OFF the regular price of ₹1,999/month! You get a professional website + full SEO, which normally costs ₹15,000-50,000 separately." },
    { q: "Is there a free plan?", a: "We don't offer a free plan because we provide real, hands-on SEO work and a custom-built website — that requires dedicated effort. But at ₹749/month, it's less than ₹25/day for a full online presence!" },
    { q: "Why should I pay ₹749/month?", a: "Think about it — a single newspaper ad costs ₹2,000-5,000 and runs ONE day. ScalifyX gives you a website + SEO that works 24/7 for just ₹749/month. Your website brings customers while you sleep!" },
    { q: "Can I cancel anytime?", a: "Yes! No lock-in contracts. Cancel anytime from your profile. But most customers stay because they see real results within 2-3 months." },
    { q: "Is there a yearly plan?", a: "Currently we offer monthly billing at ₹749/month. This gives you flexibility to see results before committing long-term. Annual plans are coming soon with even bigger discounts!" },
    { q: "Do you offer refunds?", a: "We offer a satisfaction guarantee. If you're not happy within the first 7 days, reach out to our support team and we'll work it out." },
    { q: "Why is there a discount right now?", a: "We're in our early growth phase and offering 63% OFF (₹749 instead of ₹1,999) to our first customers. This price won't last forever — lock it in now!" },
    { q: "What happens if I don't pay?", a: "If your subscription lapses, your website stays online for 7 days as a grace period. After that, it goes offline but your data is saved for 30 days so you can reactivate anytime." },
    { q: "Is ₹749 a one-time payment?", a: "₹749 is a monthly subscription that includes your website hosting, maintenance, SSL, AND ongoing SEO optimization. It's everything-included pricing." },
    { q: "Do I need to pay extra for SEO?", a: "Nope! SEO is fully included in your ₹749/month plan. On-page SEO, technical SEO, Google Search Console setup, keyword optimization — all included." },
    { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards, net banking, and wallets through Razorpay — India's most trusted payment gateway." },
    { q: "Is the payment secure?", a: "Absolutely! We use Razorpay, which is PCI-DSS compliant and trusted by lakhs of businesses in India. Your payment info is never stored on our servers." },
    { q: "Can I upgrade my plan later?", a: "Right now we have one all-inclusive Pro plan at ₹749/month. We're working on premium tiers with e-commerce features coming soon!" },
    { q: "Do you charge for updates to my website?", a: "No! Unlimited website updates are included in your plan. Need to change text, photos, or add a new page? Just ask in chat!" },
    { q: "Is hosting included?", a: "Yes! Free hosting on fast, reliable servers is included. No extra charges for hosting, ever." },
    { q: "Is SSL certificate included?", a: "Yes! Free SSL certificate (the 🔒 in the browser) is included. Your site will be secure from day one." },
    { q: "Do I need to pay for domain separately?", a: "You get a free subdomain (yourbusiness.scalifyx.in). If you want a custom domain like yourbusiness.com, you can connect it — domain registration is separate (₹500-800/year from any registrar)." },
    { q: "How does ₹749 compare to hiring a developer?", a: "A freelance developer charges ₹15,000-50,000 just for the website. SEO agencies charge ₹5,000-15,000/month. With ScalifyX, you get BOTH for just ₹749/month!" },
    { q: "Will the price increase later?", a: "If you subscribe now at ₹749/month, you're locked into this rate. Even if we raise prices for new customers, your rate stays the same." },
    { q: "Is there any setup fee?", a: "No setup fee, no hidden charges. ₹749/month is all you pay. Website creation, hosting, SSL, maintenance, SEO — everything is included." },
    { q: "Can I try before I buy?", a: "Chat with our AI right now for free! Ask questions, understand how it works. When you're ready to build your website, subscribe and your site goes live in minutes." },
    { q: "What if I just want a website without SEO?", a: "Our plan includes both because a website without SEO is like a shop with no signboard — nobody finds it! The SEO is what makes your website actually bring customers." },
    { q: "Is it worth it for a small business?", a: "Especially for small businesses! You'd otherwise spend ₹30,000+ on a website and ₹10,000/month on SEO. ScalifyX gives you both for just ₹749/month." },
    { q: "Do you have EMI options?", a: "At ₹749/month, it's already very affordable. But yes, if you pay via credit card through Razorpay, your bank may offer EMI options." },
    { q: "What currency do you charge in?", a: "We charge in Indian Rupees (₹ INR). All prices are inclusive." },
    { q: "Do I get an invoice?", a: "Yes! You'll receive a proper GST invoice for every payment, which you can use for your business tax filings." },
    { q: "Can I pause my subscription?", a: "You can cancel and resubscribe anytime. We're working on a pause feature. Your website data is always saved." },
    { q: "What if I need more features?", a: "Our Pro plan has everything most businesses need. If you need custom features like e-commerce or booking systems, contact our support team — we can discuss custom solutions." },
    { q: "Is this cheaper than Wix or WordPress?", a: "Yes! Wix Premium is ₹250-700/month but has NO SEO service included. WordPress hosting is ₹300-500/month plus you need to build it yourself. ScalifyX = website + SEO + support for ₹749." },
    { q: "Why not use a free website builder?", a: "Free builders give you ugly templates, show their branding, have no SEO, and look unprofessional. ScalifyX gives you a custom, professional website with real SEO that ranks on Google." },
    { q: "How much do I save with ScalifyX?", a: "Without ScalifyX: Website (₹25,000 one-time) + Hosting (₹6,000/year) + SEO (₹10,000/month) = ₹1,31,000/year. With ScalifyX: ₹749 × 12 = ₹8,988/year. You save over ₹1,20,000!" },
    { q: "Is GST extra?", a: "The ₹749/month price is the final amount you pay. No hidden charges." },
    { q: "Can two businesses share one plan?", a: "Each subscription covers one business website. If you have multiple businesses, each needs its own subscription." },
    { q: "Do you offer discounts for multiple websites?", a: "Contact our support team for special multi-site pricing. We offer great deals for business owners with multiple ventures!" },
    { q: "What's the minimum commitment?", a: "Just one month! No long-term contracts required. Subscribe, get your website live, and see the value yourself." },
    { q: "How do I subscribe?", a: "Tap the 'Plans' tab below, hit 'Subscribe Now', and complete payment via Razorpay. Your website will be ready within minutes!" },
    { q: "Can I get a custom quote?", a: "Our standard Pro plan at ₹749/month fits most businesses. For enterprise needs, reach out to our support team." },
    { q: "Is there a student discount?", a: "We don't have a student discount currently, but at ₹749/month it's already the most affordable professional website + SEO solution in India!" },
    { q: "Do you offer a money-back guarantee?", a: "Yes! If you're not satisfied within 7 days of subscribing, contact our support team for a resolution." },
    { q: "Why should I pay monthly instead of one-time?", a: "A website needs ongoing hosting, maintenance, security updates, and SEO optimization. Monthly billing ensures your site stays fast, secure, and ranking well on Google." },
    { q: "Can I pay via UPI?", a: "Yes! We support UPI (Google Pay, PhonePe, Paytm, etc.), cards, net banking, and wallets through Razorpay." },
    { q: "Is autopay enabled?", a: "You can set up autopay through Razorpay for hassle-free monthly payments. You'll always be notified before charges." },
    { q: "What happens after I pay?", a: "After payment, our AI will guide you to build your website step by step. Just answer a few questions and your site goes live in minutes!" },
    { q: "Can I change my plan later?", a: "Currently we have one comprehensive Pro plan. Premium tiers with more features are coming soon!" },
    { q: "Do you charge for custom domain connection?", a: "Connecting your own domain is free! You just need to own the domain (buy from GoDaddy, Hostinger etc. for ₹500-800/year)." },
    { q: "Is there a referral program?", a: "Yes! Refer friends and earn rewards. Check the Referral section in your profile." },
    { q: "How does billing work?", a: "You're billed on the same date each month. Example: Subscribe on April 17 → next bill on May 17." },
    { q: "Can I get a free trial?", a: "You can explore the app and chat with our AI for free! The subscription is needed when you're ready to go live with your website." },
    { q: "What's included in ₹749?", a: "Everything: Professional website, unlimited pages, free hosting, SSL certificate, website maintenance, on-page SEO, technical SEO, Google Search Console, mobile responsive design, WhatsApp button, contact forms, social media integration, monthly analytics reports, and priority support!" },
    { q: "Is this a scam?", a: "Absolutely not! ScalifyX is a registered company. We use Razorpay (India's leading payment gateway), provide GST invoices, and have thousands of happy customers. Check our reviews!" },
  ],

  // ─── WEBSITE FEATURES (60 questions) ───
  features: [
    { q: "What kind of website will I get?", a: "A professional, multi-page website with homepage, about, services, contact, and more. Mobile responsive, fast-loading, and SEO-optimized — tailored to your business type!" },
    { q: "How many pages can I have?", a: "Unlimited pages! Add as many pages as your business needs — services, gallery, testimonials, pricing, blog, team — no limits!" },
    { q: "Will my website work on mobile?", a: "Yes! Every ScalifyX website is fully mobile responsive. It looks perfect on phones, tablets, and desktops. Over 80% of your visitors will come from mobile!" },
    { q: "Can I add a WhatsApp button?", a: "Absolutely! A click-to-WhatsApp button is included by default. Visitors can message you directly with one tap." },
    { q: "Can I add a contact form?", a: "Yes! A professional contact form is included. When someone fills it out, you get notified instantly." },
    { q: "Can I add photos and videos?", a: "Yes! Upload your business photos, product images, team pictures, and even embed YouTube videos on your website." },
    { q: "Will my website have a blog?", a: "Yes! We can add a blog section to your website. Blogs are great for SEO and keeping customers engaged." },
    { q: "Can I add Google Maps?", a: "Yes! Google Maps integration is included so customers can find your business location easily." },
    { q: "Do you support multiple languages?", a: "Currently websites are in English and Hindi. We're adding support for more regional languages soon!" },
    { q: "Can I have an online store?", a: "E-commerce features are coming soon! Currently, you can showcase products with prices and a 'Buy Now' WhatsApp button for orders." },
    { q: "Will my website be fast?", a: "Yes! ScalifyX websites are optimized for speed. Fast hosting + optimized code + compressed images = lightning-fast load times." },
    { q: "Can I add testimonials?", a: "Absolutely! A testimonials/reviews section is a great trust builder. Just share your customer reviews and we'll add them." },
    { q: "Can I add social media links?", a: "Yes! Instagram, Facebook, YouTube, Twitter, LinkedIn — all your social links will be on your website with proper icons." },
    { q: "Do you provide email addresses?", a: "With your own domain, you can set up professional email like info@yourbusiness.com. We'll guide you through the setup!" },
    { q: "Can I add a pricing page?", a: "Yes! Add a clean pricing page with your services and rates. Great for salons, coaching centers, and service businesses." },
    { q: "Will I get analytics?", a: "Yes! Google Analytics integration is included. Plus, you get monthly analytics reports showing visitors, page views, and traffic sources." },
    { q: "Can I add appointment booking?", a: "We're working on integrated booking. For now, we add a 'Book Now' button linked to WhatsApp or your preferred booking platform." },
    { q: "How do I update my website?", a: "Just chat with our AI! Say 'change my phone number' or 'add a new service' and we'll update it instantly. No coding needed!" },
    { q: "Can I see a preview before going live?", a: "Yes! After our AI builds your website, you'll see a full preview and can request changes before publishing." },
    { q: "What design styles are available?", a: "12+ professional templates for different business types — restaurants, salons, clinics, shops, gyms, portfolios, and more. Or describe your dream design!" },
    { q: "Can I upload my own logo?", a: "Yes! Upload your logo and it'll appear on your website header. If you don't have one, we create a clean text-based logo." },
    { q: "Can I choose colors?", a: "Absolutely! Pick from our color themes or tell us your brand colors. We'll match everything perfectly." },
    { q: "Is the website design unique?", a: "Every website is customized with your content, photos, and branding. No two ScalifyX websites look the same!" },
    { q: "Can I add a team/staff page?", a: "Yes! Add team member profiles with photos, names, and roles. Great for clinics, agencies, and coaching centers." },
    { q: "Can I add a gallery?", a: "Yes! Photo gallery with categories is available. Perfect for photographers, restaurants, salons, and real estate." },
    { q: "Do websites have animations?", a: "Yes! Subtle, professional animations like scroll effects and hover transitions make your site feel modern and premium." },
    { q: "Can I add click-to-call?", a: "Yes! A click-to-call button is included by default. Mobile visitors can call you with one tap." },
    { q: "Can I change the website later?", a: "Unlimited changes! Update text, photos, add pages, change colors — just ask in chat and it's done." },
    { q: "What if I don't like the design?", a: "No problem! Tell us what you'd like changed and we'll redesign until you're 100% happy. Unlimited revisions!" },
    { q: "Can I add FAQs to my website?", a: "Yes! A FAQ section is great for answering common customer questions and improving SEO." },
    { q: "Will my website have footer with info?", a: "Yes! A professional footer with contact info, quick links, social media icons, and copyright notice is standard." },
    { q: "Can I add a hero banner?", a: "Every website starts with a stunning hero section — big image, your tagline, and a strong call-to-action button." },
    { q: "Can I add customer reviews from Google?", a: "We can add a reviews section with your Google reviews. This builds massive trust with new visitors!" },
    { q: "Do you build landing pages?", a: "Yes! Single-page landing pages for campaigns, events, or product launches. Fast and focused for conversions." },
    { q: "Can I embed Instagram feed?", a: "We can add your latest Instagram posts to your website. Keeps your site looking fresh and active!" },
    { q: "Will the website work internationally?", a: "Yes! Your website is accessible worldwide. CDN hosting ensures fast loading from any country." },
    { q: "Can I add popup forms?", a: "We can add contact popups, newsletter signup forms, or promotional banners. Great for lead capture!" },
    { q: "Do you support RTL languages?", a: "Hindi and English are fully supported. Full RTL (Urdu, Arabic) support is coming soon." },
    { q: "Can I have a separate mobile site?", a: "You don't need one! Our responsive design automatically adapts to all screen sizes perfectly." },
    { q: "Can I add an About Us page?", a: "Standard! Every business website has a compelling About page telling your story and building customer trust." },
    { q: "Can I add service descriptions?", a: "Yes! Individual service pages with descriptions, images, and pricing make it easy for customers to understand your offerings." },
    { q: "Do you support dark mode?", a: "Yes! We have dark theme options for businesses that want a modern, sleek look." },
    { q: "Can I add countdown timers?", a: "Yes! Countdown timers for offers, events, or launches. Creates urgency and drives action." },
    { q: "Can I see website statistics?", a: "Including monthly analytics report with visitor count, popular pages, traffic sources, and more from Google Analytics." },
    { q: "Can I add a menu for my restaurant?", a: "Absolutely! Beautiful digital menus with categories, images, prices, and dietary tags. Customers love it!" },
    { q: "Can I add before/after images?", a: "Yes! Perfect for salons, dentists, and renovation businesses. Slider-style before/after comparisons." },
    { q: "Can I list property for real estate?", a: "Yes! Property listing templates with images, details, pricing, and inquiry buttons. Filter by type, location, budget." },
    { q: "Can I add course listings?", a: "Of course! List your courses, batches, fees, and schedules. Include enrollment buttons linked to WhatsApp." },
    { q: "Can I add partner/client logos?", a: "Yes! A trusted-by section with client or partner logos builds credibility instantly." },
    { q: "Will I get a sitemap?", a: "Yes! Auto-generated XML sitemap submitted to Google for faster indexing of all your pages." },
    { q: "Can I add schema markup?", a: "Yes! We add proper schema markup (LocalBusiness, FAQ, etc.) for rich snippets in Google search results." },
    { q: "Do websites have breadcrumbs?", a: "Yes! Breadcrumb navigation for better user experience and SEO. Google loves breadcrumbs!" },
    { q: "Can I add chat widget?", a: "WhatsApp chat widget is included. We can also integrate Tawk.to or other live chat tools." },
    { q: "Can I have a portfolio grid?", a: "Perfect for freelancers and photographers! A filterable portfolio grid showcasing your best work." },
    { q: "Can I add download links?", a: "Yes! Add downloadable PDFs like menus, catalogs, brochures, or price lists." },
    { q: "Is there a CMS to manage content?", a: "You manage everything through our AI chat — just tell us what to change. No complex CMS to learn!" },
    { q: "Do you build single page websites?", a: "Yes! Single page (one-page scroll) websites are available and great for landing pages and portfolios." },
    { q: "Can I add trust badges?", a: "Yes! Trust badges, certifications, awards, and security seals boost customer confidence." },
    { q: "Can I add a careers page?", a: "Yes! List job openings with descriptions and an apply button. Great for growing businesses." },
    { q: "What technology do you use?", a: "Modern web technologies — fast, secure, and SEO-friendly. You don't need to worry about the tech — we handle everything!" },
  ],

  // ─── SEO (80 questions) ───
  seo: [
    { q: "What is SEO?", a: "SEO (Search Engine Optimization) means making your website appear on Google when people search for your type of business. Example: Someone searches 'best salon in Pune' — SEO helps YOUR salon show up!" },
    { q: "Why do I need SEO?", a: "93% of online experiences start with a search engine. If your business isn't on Google's first page, customers go to your competitors. SEO brings FREE, ongoing traffic to your website." },
    { q: "What SEO do you provide?", a: "Complete SEO package: On-page optimization, technical SEO, Google Search Console setup, keyword research, meta tags, image optimization, site speed, schema markup, and monthly reports." },
    { q: "How long does SEO take to show results?", a: "Typically 2-4 months for initial results. SEO is like planting a tree — it grows over time. By month 3-6, you'll see significant improvement in Google rankings." },
    { q: "Will I rank #1 on Google?", a: "We can't guarantee #1 (no one honestly can), but we optimize everything to give you the best possible rankings. Many of our clients reach page 1 within 3-6 months!" },
    { q: "What is on-page SEO?", a: "On-page SEO means optimizing your website's content: title tags, meta descriptions, headings, keywords, image alt text, internal linking, and content quality." },
    { q: "What is technical SEO?", a: "Technical SEO ensures your website loads fast, is mobile-friendly, has proper structure, SSL security, clean URLs, and no errors that could hurt rankings." },
    { q: "Do you set up Google Search Console?", a: "Yes! We set up and configure Google Search Console for your website. This lets you track your search performance and fix any issues." },
    { q: "Do you do keyword research?", a: "Yes! We research the best keywords for your business type and location. These are the terms your potential customers are searching for." },
    { q: "What are keywords?", a: "Keywords are the words people type into Google. For example, 'dentist near me', 'best biryani in Hyderabad', 'yoga classes Mumbai'. We optimize your site for relevant keywords." },
    { q: "Do you optimize for local SEO?", a: "Absolutely! Local SEO is our specialty. We optimize for 'near me' searches and your city/area keywords so local customers find you." },
    { q: "Will you set up Google Search Console?", a: "Yes! We set up and configure Google Search Console for your website. This lets you track your search performance and fix any issues." },
    { q: "What are meta tags?", a: "Meta tags are hidden text that tells Google what your page is about. We write optimized title tags and descriptions that make people click your link in search results." },
    { q: "Do you optimize images for SEO?", a: "Yes! We compress images for fast loading and add descriptive alt text. This helps Google understand your images and can drive traffic from image search." },
    { q: "What is a sitemap?", a: "A sitemap is a file that lists all your website pages. We create and submit it to Google so all your pages get indexed (found) by search engines." },
    { q: "Do you fix technical errors?", a: "Yes! We monitor for broken links, crawl errors, mobile issues, and speed problems. All included in your plan." },
    { q: "What is page speed and why does it matter?", a: "Page speed is how fast your website loads. Google ranks faster websites higher. We optimize your site to load in under 3 seconds." },
    { q: "Do you do off-page SEO?", a: "We focus on the most impactful on-page and technical SEO. Citation building and basic backlink guidance are included. Full link building campaigns are available as add-ons." },
    { q: "What is a backlink?", a: "A backlink is when another website links to yours. It's like a vote of confidence. We help you get listed on relevant directories and business listings." },
    { q: "Do I get monthly SEO reports?", a: "Yes! Monthly reports showing your keyword rankings, search traffic, top pages, and improvement recommendations." },
    { q: "What if my competitors have better SEO?", a: "We do competitor analysis to understand what's working for them and create a strategy to outrank them. Every business can improve their rankings!" },
    { q: "Is my website already SEO-optimized?", a: "Every ScalifyX website is built with SEO best practices from day one — clean code, proper structure, fast loading, mobile-friendly, and semantic HTML." },
    { q: "What is robots.txt?", a: "A file that tells search engines which pages to crawl. We set this up correctly to ensure Google indexes all your important pages." },
    { q: "Do you handle Google penalties?", a: "Yes! If your site has any Google penalties, we identify and fix the issues to recover your rankings." },
    { q: "What is Core Web Vitals?", a: "Google's metrics for user experience — loading speed, interactivity, and visual stability. All ScalifyX sites are optimized for excellent Core Web Vitals scores." },
    { q: "Do you optimize for voice search?", a: "Yes! We optimize for conversational keywords that people use with Siri, Google Assistant, and Alexa. 'Hey Google, find a salon near me' — you'll show up!" },
    { q: "What is local pack in Google?", a: "The local pack is the map with 3 business listings that appears for local searches. We optimize your website for local SEO to help you appear in this prime spot." },
    { q: "Can SEO help my social media?", a: "SEO drives website traffic, and we integrate your social media links. More website visitors = more followers. They work together!" },
    { q: "Do you submit to directories?", a: "Yes! We submit your business to important online directories like Justdial, Sulekha, IndiaMART, and others relevant to your industry." },
    { q: "What is mobile-first indexing?", a: "Google primarily uses the mobile version of your site for ranking. All ScalifyX websites are built mobile-first, so you're always ahead!" },
    { q: "How do I track my SEO progress?", a: "Through your monthly SEO report + Google Search Console access. You can see exactly how many people find you on Google and which keywords bring traffic." },
    { q: "What is bounce rate?", a: "Bounce rate is when someone visits your site and leaves without clicking anything. Our designs are engaging, keeping visitors exploring — which helps SEO!" },
    { q: "Do you optimize for Google Images?", a: "Yes! We use proper file names, alt text, and compression so your photos appear in Google Image search results too." },
    { q: "What is HTTPS and does it affect SEO?", a: "HTTPS means your site is secure (SSL encrypted). Google confirms it's a ranking factor. All ScalifyX sites come with free SSL!" },
    { q: "How many keywords will you target?", a: "We target 20-50 relevant keywords based on your business type, services, and location. More keywords are added as your site grows." },
    { q: "What is anchor text?", a: "Anchor text is the clickable text in a link. We use descriptive anchor text in internal links to help Google understand your page topics." },
    { q: "Do you create blog content for SEO?", a: "Blog setup is included. We can guide you on content ideas, or you can request blog posts through chat. Regular blogging boosts SEO significantly!" },
    { q: "What are rich snippets?", a: "Rich snippets show extra info in Google results — star ratings, prices, FAQs. We add schema markup to enable rich snippets for your site." },
    { q: "Can you help me rank for 'near me' searches?", a: "That's our specialty! We optimize your site for local 'near me' searches. This is where most small business customers come from." },
    { q: "What is domain authority?", a: "A score predicting how well a site will rank. New sites start low but grow with good SEO, quality content, and backlinks. We help build your authority over time." },
    { q: "Do you use black hat SEO?", a: "Never! We only use ethical, Google-approved (white hat) SEO techniques. Black hat tactics risk permanent Google penalties. Your business is safe with us." },
    { q: "What is an SEO audit?", a: "A comprehensive analysis of your website's SEO health. We do an initial audit when setting up and regular checks to keep everything optimized." },
    { q: "How do you handle algorithm updates?", a: "We stay on top of Google's algorithm changes and adapt your SEO strategy accordingly. Your site stays compliant with the latest best practices." },
    { q: "What is indexing?", a: "When Google 'indexes' your page, it adds it to its database. We submit your sitemap and request indexing so your pages appear in search results quickly." },
    { q: "Can SEO help me get more phone calls?", a: "Absolutely! Local SEO with click-to-call buttons means people searching for your services can call you directly from Google results. More visibility = more calls!" },
    { q: "What is NAP consistency?", a: "NAP = Name, Address, Phone. Having consistent NAP across your website and directories boosts local SEO significantly." },
    { q: "Do you optimize page titles?", a: "Yes! Every page gets a unique, keyword-optimized title tag (under 60 characters) that tells Google and users exactly what the page is about." },
    { q: "What are header tags?", a: "H1, H2, H3 tags organize your content. We use them strategically with keywords to help Google understand your page structure and topic." },
    { q: "Do you optimize URL structure?", a: "Yes! Clean, descriptive URLs like yourbusiness.com/services/haircut instead of yourbusiness.com/page?id=123. Better for SEO and user experience." },
    { q: "What is internal linking?", a: "Links between your own pages. We create a smart internal linking structure so visitors (and Google) can navigate your site easily." },
    { q: "Can SEO replace paid ads?", a: "SEO gives you FREE organic traffic that grows over time. Paid ads stop the moment you stop paying. Best strategy? Both! But SEO alone can bring significant customers." },
    { q: "Why is my business not on Google?", a: "Without a website and SEO, Google doesn't know your business exists! ScalifyX creates your online presence and optimizes it so Google finds and ranks you." },
    { q: "How do search engines work?", a: "Google crawls (reads) websites, indexes (stores) them, and ranks them for relevant searches. We optimize every aspect so your site is easy to crawl, index, and rank." },
    { q: "What is Google Analytics?", a: "Free Google tool that tracks website visitors. We set it up so you can see how many people visit, which pages are popular, and where traffic comes from." },
    { q: "What are LSI keywords?", a: "Related terms that help Google understand context. If your page is about 'yoga classes', LSI keywords would be 'meditation', 'flexibility', 'wellness'. We include these naturally!" },
    { q: "Do you do competitor analysis?", a: "Yes! We analyze your top competitors' websites and keywords to build a strategy that positions you competitively in your market." },
    { q: "How often should website content be updated?", a: "Regular updates signal to Google that your site is active. We recommend monthly updates — adding new photos, blog posts, or updating services." },
    { q: "What is SEO content writing?", a: "Writing website content that's engaging for readers AND optimized for search engines. We craft your descriptions, service pages, and blogs with SEO in mind." },
    { q: "What is crawl budget?", a: "How many pages Google crawls on your site at a time. We ensure your site is efficient so Google crawls all important pages without wasting resources." },
    { q: "Can you help with YouTube SEO?", a: "We focus on website SEO, but can give you tips for YouTube optimization too! Video SEO is a great additional traffic source." },
    { q: "What's the difference between organic and paid results?", a: "Organic results are the free listings Google shows based on relevance. Paid results (ads) are at the top and cost per click. We focus on getting you FREE organic traffic!" },
    { q: "What is E-E-A-T?", a: "Experience, Expertise, Authoritativeness, Trustworthiness — Google's quality guidelines. We build your site to demonstrate all four, boosting your credibility and rankings." },
    { q: "Do you optimize for Bing too?", a: "Our SEO practices work across all search engines. Google optimization naturally improves your Bing and Yahoo rankings too!" },
    { q: "What is a 301 redirect?", a: "A permanent redirect from one URL to another. If you change your domain or restructure the site, we set up proper redirects so you don't lose SEO value." },
    { q: "What is canonical URL?", a: "A tag telling Google which version of a page is the 'main' one. Prevents duplicate content issues. All ScalifyX sites have proper canonical tags." },
    { q: "Can you help me get Google reviews?", a: "We'll help you set up a review collection strategy so customers can easily leave reviews. More reviews = better local rankings!" },
    { q: "What is structured data?", a: "Code that helps Google understand your content better. We add structured data for your business type, services, FAQs, and more — leading to rich search results." },
    { q: "How do I know if SEO is working?", a: "Check your monthly report! Look for: more search impressions, higher keyword rankings, increased website visitors, and more calls/messages from customers." },
    { q: "Is SEO a one-time thing?", a: "SEO is ongoing. Google's algorithm evolves constantly. That's why monthly maintenance is essential — and it's all included in your ₹749/month plan!" },
    { q: "What is negative SEO?", a: "When competitors try to harm your rankings through spam links. We monitor your link profile and disavow harmful links to protect your site." },
    { q: "Do you do content marketing?", a: "Blog content strategy and writing guidance is included. We help you create content that attracts and converts your target customers." },
    { q: "What are long-tail keywords?", a: "Longer, specific search phrases like 'affordable dental clinic in Andheri Mumbai'. They have less competition and higher conversion rates — we target many of these!" },
    { q: "What is search intent?", a: "Understanding WHY someone is searching. 'Best salon near me' means they want to visit soon. We optimize your content to match user intent." },
    { q: "Can I rank in multiple cities?", a: "If your business serves multiple cities, we can optimize for all of them with location-specific pages!" },
    { q: "Do you track keyword positions?", a: "Yes! We track your important keyword rankings and report them monthly. Watch as your positions improve over time!" },
    { q: "What is a featured snippet?", a: "The answer box at the top of Google results. We optimize your content (especially FAQs) to earn featured snippets — maximum visibility!" },
    { q: "What tools do you use for SEO?", a: "Industry-leading tools for keyword research, rank tracking, site auditing, and competitor analysis. All handled by our team — you just see the results!" },
    { q: "How do I know what customers are searching for?", a: "Our keyword research reveals exactly what your target customers search for. We share these insights in your monthly report." },
    { q: "Will my old website's SEO transfer?", a: "If you have an existing site, we can set up proper redirects to preserve your existing SEO authority. No rankings lost!" },
    { q: "What is Google Discover?", a: "Google's content feed on Android phones. With good content and proper optimization, your pages can appear in Discover feeds — massive exposure!" },
  ],

  // ─── DOMAIN & HOSTING (40 questions) ───
  domain: [
    { q: "Do I need a domain name?", a: "You get a free subdomain (yourbusiness.scalifyx.in). A custom domain (yourbusiness.com) is optional but recommended for professional branding. We help you connect it!" },
    { q: "How do I get a custom domain?", a: "Buy one from GoDaddy, Hostinger, or Namecheap (₹500-800/year). Then we'll connect it to your ScalifyX website for free!" },
    { q: "What domain should I choose?", a: "Use your business name or a keyword-rich name. Keep it short, memorable, and .com or .in. Example: 'sunitasalon.in' or 'bestbiryani.com'" },
    { q: "Is .in or .com better?", a: ".in is great for Indian businesses and cheaper. .com is universal. Both work well for SEO. Choose what feels right for your brand!" },
    { q: "Can I use a domain I already own?", a: "Absolutely! Just point your domain's DNS to our servers. We'll guide you through the simple process — takes 5 minutes!" },
    { q: "Where is my website hosted?", a: "On fast, reliable servers with CDN (Content Delivery Network) for quick loading across India. Hosting is free and included in your plan." },
    { q: "What is hosting uptime?", a: "Uptime means how often your site is online. We guarantee 99.9% uptime — your website is almost never down!" },
    { q: "Do I get email with my domain?", a: "With a custom domain, you can set up professional email. We'll guide you through Google Workspace (₹125/month) or free alternatives." },
    { q: "Can I transfer my domain to ScalifyX?", a: "You keep ownership of your domain! We just connect it to our hosting. You maintain full control at your registrar." },
    { q: "What happens to my domain if I cancel?", a: "Your domain is yours — you own it. If you cancel ScalifyX, just point it somewhere else. We never take ownership of your domain." },
    { q: "How long does domain connection take?", a: "DNS propagation takes 1-24 hours (usually 1-2 hours). Your site works immediately on the .scalifyx.in subdomain while the domain connects." },
    { q: "Can I have multiple domains?", a: "Yes! You can point multiple domains to the same website. Great if you have multiple brand names." },
    { q: "What is DNS?", a: "Domain Name System — it directs your domain name to the server hosting your website. Like a phone book for the internet. We handle the technical setup!" },
    { q: "Is the scalifyx.in subdomain permanent?", a: "Your subdomain (yourbusiness.scalifyx.in) is available as long as your subscription is active. It works alongside any custom domain you add." },
    { q: "Do I need www in my domain?", a: "Both www.yourbusiness.com and yourbusiness.com will work. We set up proper redirects so both versions go to the same site." },
    { q: "Can I change my subdomain?", a: "Yes! If you want to change your .scalifyx.in subdomain name, just ask in chat and we'll update it." },
    { q: "What is a CDN?", a: "Content Delivery Network — copies of your website stored on servers across India so it loads fast no matter where the visitor is." },
    { q: "Is there a storage limit?", a: "For most business websites, storage is more than enough. If you have thousands of product images, we can discuss additional storage." },
    { q: "Do you support HTTPS?", a: "Yes! Free SSL certificate for every website. All traffic is encrypted and your site shows the trusted 🔒 padlock in browsers." },
    { q: "What if my website gets lots of traffic?", a: "Our hosting handles traffic spikes well. If your business goes viral, we'll scale your resources automatically. No downtime!" },
    { q: "Can I get a .co.in domain?", a: "Yes! .co.in, .org.in, or any other extension works. Buy it from any domain registrar and we'll connect it." },
    { q: "How do backups work?", a: "Your website is backed up regularly. If anything goes wrong, we can restore your site to a previous version." },
    { q: "Is my data safe?", a: "Absolutely! SSL encryption, regular backups, and secure hosting. Your business data and customer information are protected." },
    { q: "Where are servers located?", a: "Our primary servers are in India for fastest speeds. CDN nodes worldwide ensure fast loading from any location." },
    { q: "What is bandwidth?", a: "The amount of data your site can serve to visitors. Our hosting includes generous bandwidth — enough for thousands of visitors per month." },
    { q: "Do I need separate hosting?", a: "No! Hosting is fully included in your ScalifyX plan. No need to buy separate hosting from GoDaddy, Hostinger, etc." },
    { q: "Can I access FTP/cPanel?", a: "ScalifyX is a managed service — we handle all the technical stuff. You just tell us what changes you want. No need for cPanel!" },
    { q: "What is the server technology?", a: "Modern, fast server infrastructure optimized for speed and security. You don't need to worry about the tech — we handle everything!" },
    { q: "Is there DDoS protection?", a: "Yes! Our hosting infrastructure includes DDoS protection and web application firewall for security." },
    { q: "Can I see server logs?", a: "We provide analytics reports covering all important metrics. Raw server logs aren't typically needed, but can be discussed for specific needs." },
    { q: "What is server response time?", a: "How fast the server responds to a request. Our servers respond in under 200ms — which is excellent for SEO and user experience." },
    { q: "Do you support PHP or WordPress?", a: "ScalifyX uses its own modern web technology. No WordPress needed — our sites are faster, more secure, and easier to manage!" },
    { q: "Can I migrate from WordPress?", a: "Yes! We'll recreate your WordPress site on ScalifyX with proper redirects to keep your SEO. The new site will be faster and easier to manage." },
    { q: "What is green hosting?", a: "Hosting powered by renewable energy. We use energy-efficient infrastructure to minimize environmental impact." },
    { q: "Is there a firewall?", a: "Yes! Web Application Firewall (WAF) protects against common threats like SQL injection, XSS, and brute force attacks." },
    { q: "What about GDPR compliance?", a: "We can add cookie consent banners and privacy policy pages. For India-specific compliance (IT Act), all data is hosted on Indian servers." },
    { q: "Can I have a staging environment?", a: "Your site preview before publishing acts as a staging environment. Major changes can be previewed before going live." },
    { q: "What happens during server maintenance?", a: "Scheduled maintenance happens during off-peak hours (2-5 AM) and typically takes minutes. Your site remains available through our CDN." },
    { q: "Do you provide website monitoring?", a: "Yes! 24/7 uptime monitoring. If your site goes down, our team is alerted immediately and resolves the issue." },
    { q: "Is there a file size limit for uploads?", a: "Images up to 10MB each. We automatically optimize them for web — compressing without losing quality for fast page loads." },
  ],

  // ─── SUPPORT (40 questions) ───
  support: [
    { q: "How do I contact support?", a: "Right here in chat! Switch to 'Human Support' using the button above. You can also email us or reach out on WhatsApp." },
    { q: "What are support hours?", a: "AI support is available 24/7! Human support team is available Mon-Sat, 10 AM - 7 PM IST." },
    { q: "How fast do you respond?", a: "AI responds instantly. Human support typically responds within 1-2 hours during business hours." },
    { q: "Can I talk to a real person?", a: "Yes! Tap the 'Human Support' button in chat to connect with our team. They handle complex queries and custom requests." },
    { q: "Do you offer phone support?", a: "Currently we offer chat-based support which is faster and more efficient. Phone support is available for premium requests." },
    { q: "What if I'm not satisfied?", a: "Tell us what's wrong! We'll fix it immediately. Unlimited revisions on your website. We're not happy until you are." },
    { q: "Can you help me with Google Ads?", a: "While our core service is website + SEO, we can provide basic guidance on Google Ads setup. For full ad management, we can refer you to partners." },
    { q: "Do you train me to use the website?", a: "Your website is managed by us through AI chat — just tell us what changes you want! No training needed. But we're happy to explain anything." },
    { q: "What if my website goes down?", a: "Our 24/7 monitoring catches issues before you notice. If you spot any downtime, report in chat and we'll fix it within 30 minutes." },
    { q: "Can I request new features?", a: "Absolutely! We love feedback. Share your feature requests in chat and we'll consider them for upcoming updates." },
    { q: "Do you handle website emergencies?", a: "Yes! Critical issues like site down or security threats are addressed immediately, including weekends." },
    { q: "Can you help me with social media?", a: "We focus on websites and SEO, but we'll integrate your social media into your website and provide tips for social growth!" },
    { q: "How do I report a bug?", a: "Just describe the issue in chat with a screenshot if possible. We investigate and fix bugs ASAP." },
    { q: "Is there a community or forum?", a: "We're building a community! For now, our chat support and help articles cover everything you need." },
    { q: "Can you help me write content?", a: "Yes! Tell us what content you need and our AI will help craft professional content for your website." },
    { q: "Do you provide marketing advice?", a: "Basic digital marketing tips and SEO guidance are part of our service. We want your business to succeed online!" },
    { q: "What if I need something you don't offer?", a: "Tell us what you need! We either build it or connect you with trusted partners. We're your complete digital partner." },
    { q: "Can you help me with local SEO?", a: "Local SEO optimization is included in your plan! It's one of the most important tools for getting found by nearby customers." },
    { q: "How do I give feedback?", a: "Share feedback anytime in chat, through the app, or via email. We actively use feedback to improve our service." },
    { q: "Is there documentation?", a: "FAQs and help content are available in the app. For specific questions, just ask in chat!" },
    { q: "What is your response time SLA?", a: "AI: Instant. Human support: Within 2 hours during business hours. Critical issues: Within 30 minutes 24/7." },
    { q: "Can I schedule a call?", a: "You can request a callback through human support chat. Our team will call you at a convenient time." },
    { q: "Do you offer onboarding help?", a: "Our AI guides you through the entire setup process step by step. It's like having a personal web designer on chat!" },
    { q: "What if my site is hacked?", a: "Our security measures prevent most attacks. In the rare event of a breach, we have backup restores and security patches ready to deploy immediately." },
    { q: "Can you help me grow my business?", a: "That's our mission! A great website + strong SEO + Google presence = more customers finding you online. We help you build that entire foundation." },
    { q: "Is there a knowledge base?", a: "You're chatting with it! Our AI knows everything about websites, SEO, and ScalifyX. Ask any question!" },
    { q: "How do I change my password?", a: "Go to Profile → tap your email → you can reset your password from there." },
    { q: "How do I update my business info?", a: "Just tell us in chat! Say 'update my phone number' or 'change my address' and we'll update your website immediately." },
    { q: "Can I have multiple team members access?", a: "Currently one account per subscription. Multi-user access with roles is coming in a future update!" },
    { q: "Do you offer WhatsApp support?", a: "Currently chat support in the app is our primary channel. WhatsApp support may be added in the future!" },
    { q: "What languages does support speak?", a: "Our team supports English and Hindi. We're expanding to more regional languages." },
    { q: "Can I request a website redesign?", a: "Yes! If you want a fresh look, just ask. Redesigns are included — unlimited revisions, remember!" },
    { q: "How do I delete my account?", a: "Go to Profile → Settings → Delete Account. But we'd love to know why — maybe we can fix the issue!" },
    { q: "Do you integrate with other tools?", a: "We integrate with Google Analytics, Search Console, and social platforms. More integrations (CRM, booking tools) coming soon!" },
    { q: "Can I export my website?", a: "Your website is managed on our platform. We can provide content exports if needed. The website is yours!" },
    { q: "How secure is my data?", a: "Bank-level encryption (SSL/TLS), secure cloud hosting, regular backups, and strict access controls. Your data is safe with us." },
    { q: "Will you send me spam?", a: "Never! We only send relevant updates about your website, SEO reports, and important service notifications. Unsubscribe anytime." },
    { q: "Can I downgrade my plan?", a: "Currently we have one plan. If you need to reduce features, let's discuss — we want to find a solution that works for you." },
    { q: "What happens when my subscription renews?", a: "Auto-renewal charges on the same date each month. You'll get a reminder notification 3 days before. Cancel anytime before renewal." },
    { q: "How do I access my invoices?", a: "Go to Profile → Payments to view and download all your invoices. Proper GST invoices for every transaction." },
  ],

  // ─── TRUST & CREDIBILITY (40 questions) ───
  trust: [
    { q: "Is ScalifyX a real company?", a: "Yes! ScalifyX is a registered Indian company building affordable digital solutions for small businesses. We use Razorpay for payments and follow all business regulations." },
    { q: "How long have you been around?", a: "ScalifyX was built by a team of experienced web developers and SEO specialists who've been in the industry for years. We created ScalifyX to make professional websites accessible to every Indian business." },
    { q: "Do you have customer reviews?", a: "We have happy customers across India! From restaurants to law firms, salons to coaching centers. Their websites rank on Google and bring real customers." },
    { q: "Can I see example websites?", a: "Ask me to show you sample websites for your business type! We have templates for restaurants, salons, doctors, shops, gyms, and more." },
    { q: "Is my payment information safe?", a: "100%! We use Razorpay — India's most trusted payment gateway, PCI-DSS compliant. We never see or store your card details." },
    { q: "What if ScalifyX shuts down?", a: "Your data and content are always yours. We provide export options. But we're funded and growing — we're here for the long run!" },
    { q: "Do you have a physical office?", a: "We're a modern, remote-first company with team members across India. This keeps our costs low so we can offer amazing prices!" },
    { q: "Why is it so cheap?", a: "AI and automation! Traditional agencies charge ₹50K because of manual work. Our AI handles 80% of the process, passing the savings to you." },
    { q: "Is the quality good at this price?", a: "Absolutely! Our AI-assisted approach doesn't mean lower quality — it means efficient process. Every website is professionally designed and SEO-optimized." },
    { q: "Can I trust AI to build my website?", a: "Our AI is powered by advanced technology and guided by experienced web designers. The AI handles routine work while our team ensures quality!" },
    { q: "What's the catch?", a: "No catch! Simple monthly subscription, no hidden fees. We make money when you stay subscribed because your website brings you customers." },
    { q: "How are you different from Wix/WordPress?", a: "Wix = DIY (you build it yourself). WordPress = Complex (need a developer). ScalifyX = Done-for-you (AI builds it + SEO included). Easiest option!" },
    { q: "Do you sign a contract?", a: "No long-term contracts. Month-to-month subscription. Stay because you see value, not because of a contract." },
    { q: "What guarantees do you offer?", a: "7-day satisfaction guarantee, 99.9% uptime, unlimited revisions, and monthly SEO reports showing real progress." },
    { q: "Who builds the websites?", a: "Our AI assistant guided by templates designed by professional web designers. Every site is reviewed for quality before going live." },
    { q: "Will my website look professional?", a: "Absolutely! Our designs are modern, clean, and on par with websites costing ₹25,000-50,000. See our templates for proof!" },
    { q: "How many customers do you have?", a: "We're growing rapidly with businesses across India — restaurants, clinics, salons, coaching centers, and many more industries." },
    { q: "Do big businesses use ScalifyX?", a: "We specialize in small and medium businesses. If you're a startup, freelancer, or local business, ScalifyX is perfect for you!" },
    { q: "Is this a new startup?", a: "We're a young, innovative company — which means we're hungry to prove ourselves and deliver excellent results for every customer!" },
    { q: "Why should I choose ScalifyX over hiring a developer?", a: "Speed: Website in minutes vs. weeks. Cost: ₹749/month vs. ₹25,000+ upfront. Support: 24/7 AI + human vs. chasing a freelancer. SEO: Included vs. ₹10K/month extra." },
    { q: "Can I see before and after results?", a: "We can share case studies showing how businesses improved their Google rankings and traffic after using ScalifyX!" },
    { q: "Do you have a blog?", a: "We're building our content library! In the app, you can always ask our AI for latest tips on website management and SEO." },
    { q: "Are your servers in India?", a: "Yes! Primary servers in India for fastest speeds. This also means compliance with Indian data regulations." },
    { q: "Do you follow Google's guidelines?", a: "Strictly! We only use Google-approved (white hat) SEO techniques. No shortcuts that risk penalties." },
    { q: "What technologies do you use?", a: "Modern web technologies stack — React, Node.js, and optimized hosting. Your site will be fast, secure, and modern." },
    { q: "Can other people see my business data?", a: "Absolutely not! Your data is private and only accessible to you and our team working on your website." },
    { q: "Do you sell customer data?", a: "Never! Your data is yours. We never sell, share, or misuse customer information. Privacy is a core value." },
    { q: "Is there a privacy policy?", a: "Yes! Our privacy policy is available in the app under Profile → Privacy Policy. We're fully transparent about data usage." },
    { q: "Can I talk to existing customers?", a: "We can share testimonials and case studies. For direct references, contact our support team and we'll arrange it." },
    { q: "What makes ScalifyX unique?", a: "AI-powered website creation + real SEO optimization + ₹749/month all-inclusive. No one else offers this combination at this price in India!" },
    { q: "Do you work with all types of businesses?", a: "Yes! Restaurants, salons, doctors, lawyers, gyms, tutors, photographers, real estate, NGOs, freelancers, shops — we serve all industries." },
    { q: "Is my website data backed up?", a: "Regular automated backups ensure your data is always safe. We can restore to any previous version if needed." },
    { q: "What if I have a technical problem?", a: "We handle ALL technical issues. Server problems, SSL renewals, software updates — it's all managed by us." },
    { q: "Do you have terms of service?", a: "Yes! Clear terms of service available under Profile → Terms. Fair terms with no hidden clauses." },
    { q: "Are you affiliated with Google?", a: "We're not affiliated with Google, but we're experts in Google SEO and use Google tools (Analytics, Search Console) for your benefit." },
    { q: "Is the 63% discount real?", a: "Yes! The regular price is ₹1,999/month. We're offering ₹749/month to early customers. This is a genuine limited-time discount." },
    { q: "How do I verify ScalifyX is legitimate?", a: "Check our app on the Play Store/App Store, our website, Razorpay payment gateway integration, and GST invoices. Everything is verifiable!" },
    { q: "Will my website have ads on it?", a: "Never! Your website is 100% yours with ZERO third-party ads or ScalifyX branding. It's a fully professional site." },
    { q: "Do you resell template websites?", a: "Every website is customized for your business. We use templates as starting points but personalize everything — content, colors, layout, features." },
    { q: "What happens to my content if I leave?", a: "Your content (text, images) is always yours. We can export it for you. Your website data is kept for 30 days after cancellation." },
  ],

  // ─── COMPARISONS (40 questions) ───
  comparisons: [
    { q: "ScalifyX vs Wix", a: "Wix: DIY builder, ₹250-700/month, NO SEO service, you build yourself. ScalifyX: Done-for-you, ₹749/month, FULL SEO included, AI builds it for you!" },
    { q: "ScalifyX vs WordPress", a: "WordPress: Need developer (₹15-50K), hosting extra (₹300-500/month), plugins break, no SEO. ScalifyX: Zero technical knowledge needed, everything managed, SEO included." },
    { q: "ScalifyX vs Squarespace", a: "Squarespace: International pricing (₹1,000-2,000/month), limited in India, no SEO service. ScalifyX: Made for Indian businesses, ₹749/month with full SEO!" },
    { q: "ScalifyX vs Shopify", a: "Shopify: E-commerce focused (₹2,000+/month), complex setup. ScalifyX: Service business focused, ₹749/month, simpler and more affordable for non-ecommerce!" },
    { q: "ScalifyX vs hiring a freelancer", a: "Freelancer: ₹15-50K upfront, weeks to deliver, unreliable for updates, no SEO. ScalifyX: ₹749/month, ready in minutes, unlimited updates, full SEO!" },
    { q: "ScalifyX vs digital agency", a: "Agency: ₹50K-2L for website + ₹10-25K/month for SEO. ScalifyX: ₹749/month for BOTH. Same quality, fraction of the cost!" },
    { q: "ScalifyX vs GoDaddy Website Builder", a: "GoDaddy: Basic builder + hosting ₹500/month, no SEO service. ScalifyX: Professional AI-built site + comprehensive SEO ₹749/month!" },
    { q: "ScalifyX vs Weebly", a: "Weebly: Outdated templates, limited features, no SEO. ScalifyX: Modern designs, full features, complete SEO — better value!" },
    { q: "Is ScalifyX better for Indian businesses?", a: "Absolutely! Made specifically for Indian businesses with UPI payment, Hindi content support, local SEO focus, and pricing in ₹. No international platform offers this!" },
    { q: "Can I switch from Wix to ScalifyX?", a: "Yes! We'll recreate your Wix site on ScalifyX, often with a better design and SEO. Many customers switch for the included SEO." },
    { q: "Can I switch from WordPress to ScalifyX?", a: "Absolutely! No more plugin updates, hosting hassles, or security worries. We migrate your content and set up proper redirects." },
    { q: "How is ScalifyX better than Canva websites?", a: "Canva: Basic one-page site, no SEO, no forms, limited features. ScalifyX: Multi-page website, full SEO, forms, WhatsApp, analytics!" },
    { q: "ScalifyX vs IndiaMart", a: "Different purposes! IndiaMart is a marketplace. ScalifyX gives you your OWN website that YOU own. Both can work together!" },
    { q: "ScalifyX vs Justdial", a: "Justdial is a directory listing. ScalifyX gives you a full professional website + SEO. Having both is ideal!" },
    { q: "Do I still need social media with ScalifyX?", a: "Yes! Social media + website + SEO = maximum online presence. We integrate everything together on your website." },
    { q: "ScalifyX vs Google Sites", a: "Google Sites: Free but extremely basic, no SEO tools, looks unprofessional. ScalifyX: Professional website + full SEO + support for ₹749." },
    { q: "ScalifyX vs Blogger", a: "Blogger: Blogging platform, limited design, not for business websites. ScalifyX: Full business website with blog capability + SEO!" },
    { q: "Why not just use Instagram as my website?", a: "Instagram is great for marketing but: not searchable on Google, no contact forms, no SEO, can't show detailed services. You need a website AS WELL as Instagram!" },
    { q: "ScalifyX vs Zoho Sites", a: "Zoho: Website builder ₹300-600/month, no SEO service included. ScalifyX: Done-for-you website + full SEO at ₹749/month — more value!" },
    { q: "Can a website directory listing replace a website?", a: "Directory listings are helpful but limited. A website lets you detail services, show portfolio, rank for more keywords, and build credibility. ScalifyX gives you a full professional website!" },
    { q: "ScalifyX vs Webflow", a: "Webflow: Powerful but complex, needs designer (₹30K+), no SEO service. ScalifyX: Easy, done-for-you, SEO included for ₹749/month." },
    { q: "Why not just use WhatsApp for business?", a: "WhatsApp is great for direct communication, but customers can't find you via Google search. A website + SEO brings NEW customers. Use WhatsApp for communication, website for discovery!" },
    { q: "ScalifyX vs coding my own website", a: "Unless you're a developer, coding takes months and costs more. ScalifyX: Professional site in minutes, managed hosting, SEO, support — all for ₹749/month!" },
    { q: "Do I need both ScalifyX and social media?", a: "Think of it: Website = your digital shop (always open). Social media = your marketing (reach people). SEO = your signboard (people find you). ScalifyX handles website + SEO!" },
    { q: "ScalifyX vs Dukaan/Instamojo", a: "Those are e-commerce focused. ScalifyX is for service businesses and complete websites with SEO. If you sell services, ScalifyX is better!" },
    { q: "Can my developer build a better site?", a: "Maybe — for ₹30-50K upfront. But will they include monthly SEO, hosting, SSL, updates, and 24/7 support? ScalifyX does ALL of that for ₹749/month." },
    { q: "Is a Facebook page enough?", a: "Facebook pages have limited reach now. Google is where people actively search for services. You need a website + SEO to capture that traffic!" },
    { q: "ScalifyX vs Jimdo", a: "Jimdo: European builder, limited India features, no SEO service. ScalifyX: Built for India, full SEO included, better value!" },
    { q: "What about free website builders?", a: "Free = ads on your site, their branding, ugly subdomains, no SEO, limited features, and looks unprofessional. ₹749/month for ScalifyX is worth every rupee!" },
    { q: "ScalifyX vs traditional web design company", a: "Traditional: ₹50K-2L upfront, weeks to deliver, charge for every change, SEO separate. ScalifyX: ₹749/month, ready in minutes, unlimited changes, SEO included!" },
    { q: "Do I need a website if I'm on Google Maps?", a: "Google Maps listing with a website ranks BETTER than without. Plus, your website provides detailed info that Maps can't show. Have both!" },
    { q: "ScalifyX vs no website at all", a: "Without a website: Invisible to 93% of people who search online. Losing customers to competitors who have websites. Missing out on ₹lakhs in potential revenue!" },
    { q: "Is DIY better than done-for-you?", a: "DIY saves money but costs time. Most business owners don't have 20-40 hours to learn web design. ScalifyX gives professional results in minutes!" },
    { q: "ScalifyX vs local web designer", a: "Local designer: ₹10-30K upfront, slow updates, no SEO, disappears after delivery. ScalifyX: ₹749/month, ongoing support, continuous SEO, always available!" },
    { q: "Why not just have a LinkedIn profile?", a: "LinkedIn is for professional networking, not for customer discovery. Your customers search Google, not LinkedIn, when looking for local services." },
    { q: "Is a website still relevant in 2026?", a: "More than ever! 97% of consumers search online for local businesses. Mobile searches for 'near me' have grown 500%. A website with SEO is the #1 way to be found." },
    { q: "ScalifyX vs Notion website", a: "Notion: Basic public pages, no real SEO, looks like notes. ScalifyX: Professional business website with full SEO optimization!" },
    { q: "Can an app replace a website?", a: "Apps are great for existing customers, but websites are how NEW customers find you through Google. You need both — start with a website!" },
    { q: "ScalifyX vs Tilda", a: "Tilda: Beautiful but international pricing, no SEO service, limited India support. ScalifyX: India-focused, SEO included, ₹749/month!" },
    { q: "Which is best for a startup?", a: "ScalifyX! Startups need to launch fast and be found online quickly. ₹749/month gets you live with a professional site + SEO immediately." },
  ],

  // ─── GENERAL & MISC (50 questions) ───
  general: [
    { q: "How does ScalifyX work?", a: "Simple! 1) Subscribe (₹749/month) 2) Chat with our AI about your business 3) Your website goes live in minutes 4) We optimize SEO monthly. That's it!" },
    { q: "How long does it take to build a website?", a: "Just 5-10 minutes! Chat with our AI, answer a few questions about your business, and your website is ready. No waiting weeks!" },
    { q: "Do I need technical knowledge?", a: "Zero! If you can chat on WhatsApp, you can use ScalifyX. Just answer questions about your business in simple language." },
    { q: "What information do I need to provide?", a: "Business name, type, phone, address, services/products, timings, photos (optional), and your preferred colors. That's it!" },
    { q: "Can I build the website myself?", a: "Our AI builds it for you! Just describe what you want in chat. No coding, no design skills needed at all." },
    { q: "When will my website be live?", a: "Within minutes of completing the chat! Your site goes live on yourname.scalifyx.in immediately." },
    { q: "How many visitors can my website handle?", a: "Thousands per month easily! Our hosting auto-scales for traffic spikes. No worries about traffic limits." },
    { q: "Can I have a website in Hindi?", a: "Yes! We support English and Hindi content. Just provide your content in Hindi and we'll set it up perfectly." },
    { q: "Is ScalifyX available across India?", a: "Yes! We serve businesses all over India — from metros to tier-2 and tier-3 cities. Online presence matters everywhere!" },
    { q: "Can I use ScalifyX outside India?", a: "Our primary market is India, but the platform works globally. International users can subscribe too!" },
    { q: "What makes a good website?", a: "Clear messaging, fast loading, mobile-friendly, easy navigation, strong calls-to-action, and SEO optimization. ScalifyX delivers all of these!" },
    { q: "How do websites bring customers?", a: "Someone searches 'best [your service] in [your city]' → Google shows your website → they call/visit you. SEO makes this happen automatically!" },
    { q: "What is a call-to-action?", a: "A button or prompt telling visitors what to do: 'Call Now', 'Book Appointment', 'WhatsApp Us'. We add strong CTAs that convert visitors to customers!" },
    { q: "What if I don't have photos?", a: "No problem! We use professional stock photos relevant to your business. You can always add your own photos later." },
    { q: "Can I edit content through the app?", a: "Yes! Just tell our AI what changes you want. 'Change the phone number', 'Add a new service', 'Update the about section' — done instantly!" },
    { q: "What is a responsive website?", a: "A website that automatically adjusts to screen size — phone, tablet, laptop. All ScalifyX websites are fully responsive!" },
    { q: "Do I need a computer to manage my website?", a: "Nope! The ScalifyX app works on your phone. Manage your entire website from your pocket!" },
    { q: "What is a good website speed?", a: "Under 3 seconds loading time. Google recommends this for best user experience and SEO. ScalifyX sites are optimized for speed!" },
    { q: "Can my website generate leads?", a: "Absolutely! Contact forms, WhatsApp buttons, click-to-call — all included. Every visitor is a potential lead!" },
    { q: "What information should I put on my website?", a: "Business name, services, pricing, contact info, address, timings, photos, testimonials, and a strong 'why choose us' section." },
    { q: "How do I promote my website?", a: "Share on WhatsApp, Instagram, and social media. Plus, our SEO brings organic Google traffic automatically!" },
    { q: "Can I share my website on WhatsApp?", a: "Of course! Your website link works perfectly when shared on WhatsApp, showing a nice preview with title and image." },
    { q: "What is a CTA button?", a: "Call-To-Action button like 'Book Now', 'Call Us', 'WhatsApp Chat'. These buttons drive visitors to take action. We place them strategically!" },
    { q: "How important is website design?", a: "First impressions matter! Visitors judge your business in 0.05 seconds. A professional ScalifyX website builds instant credibility." },
    { q: "What if my competitor has a website?", a: "Then you DEFINITELY need one! If they're getting customers from Google and you're not, you're losing business every day." },
    { q: "What if my industry is very niche?", a: "Niche is actually better for SEO! Less competition means faster rankings. We customize your website for any industry." },
    { q: "Can I have different pages for different services?", a: "Absolutely! Dedicated pages for each service with detailed descriptions. Great for user experience AND SEO!" },
    { q: "What is above-the-fold?", a: "The part of website visible without scrolling. We put your most important info — business name, what you do, and CTA — right there!" },
    { q: "How often should I update my website?", a: "Regular updates are good. Add new photos, update services, post blogs. Our AI makes updates instant — no waiting!" },
    { q: "What is conversion rate?", a: "Percentage of visitors who take action (call, WhatsApp, fill form). Our designs are optimized for high conversion rates!" },
    { q: "Can I add offers and discounts on my website?", a: "Yes! Promotional banners, discount codes, seasonal offers — easily added through chat." },
    { q: "What is UX design?", a: "User Experience design — how easy and pleasant your website is to use. ScalifyX sites are designed for intuitive navigation and clear information." },
    { q: "Do I need both a website and Instagram?", a: "Yes! Instagram for engaging followers, website for being found on Google. They complement each other. ScalifyX integrates both!" },
    { q: "What is a landing page?", a: "A focused single-page site designed to convert visitors for a specific campaign, offer, or product. Great for ads and promotions!" },
    { q: "How do I check if my website is working?", a: "Visit your website URL! You can also check analytics in your monthly report. Any issues? Just ask in chat." },
    { q: "What is website maintenance?", a: "Regular updates, security patches, backup checks, performance optimization, and content updates. All included in your ₹749/month plan!" },
    { q: "Can I add a QR code for my website?", a: "Great idea! We can generate a QR code that links to your website. Print it on business cards, flyers, or shop entrance!" },
    { q: "Is website important for a small business?", a: "Essential! 70% of customers research businesses online before visiting. Without a website, they don't know you exist." },
    { q: "What's the first thing I should do?", a: "Subscribe to ScalifyX Pro (₹749/month) and start chatting with our AI to build your website. It takes just 5-10 minutes!" },
    { q: "I'm not sure if I need this...", a: "If you have a business and want more customers, you need an online presence. A website + SEO is the most effective way to get found. Try it for a month — ₹749 is less than one restaurant meal!" },
    { q: "What results can I expect?", a: "Month 1: Professional website live. Month 2-3: Start appearing in Google searches. Month 4-6: Significant organic traffic. The ROI on ₹749/month is incredible!" },
    { q: "Can I use ScalifyX for a personal website?", a: "Absolutely! Portfolio sites, resume websites, personal blogs — ScalifyX works for any type of website." },
    { q: "What does 'going live' mean?", a: "It means your website is published on the internet and anyone can visit it. Accessible via your URL 24/7." },
    { q: "How do I get started?", a: "So easy! Go to the Plans tab → Subscribe for ₹749/month → Come back to AI Chat → Answer a few questions → Your website goes live! Takes 5 minutes ⚡" },
    { q: "What is branding?", a: "How your business is perceived — logo, colors, messaging. A ScalifyX website creates a consistent, professional brand identity online." },
    { q: "Should I invest in online presence?", a: "In 2026, it's not an option — it's a necessity. 97% of consumers search online. ₹749/month is the most affordable investment in your business's future." },
    { q: "Will this work for my type of business?", a: "We've built websites for 12+ business types: restaurants, salons, doctors, lawyers, gyms, tutors, shops, photographers, NGOs, freelancers, real estate, and more!" },
    { q: "I'm not tech-savvy, can I still use this?", a: "That's exactly who we built ScalifyX for! No technical knowledge needed. Just chat like you're talking to a friend, and we handle everything." },
    { q: "What if I already have a website?", a: "Great! We can rebuild it better with ScalifyX, add SEO, and bring in more traffic. Or keep your existing site and use us for SEO only — let's discuss!" },
    { q: "How is this so affordable?", a: "AI automation reduces manual work by 80%. We pass those savings to you. Traditional agencies charge for human hours — we use smart technology!" },
  ],

  // ─── INDUSTRY SPECIFIC (100 questions) ───
  industry: [
    // Restaurants (12)
    { q: "I have a restaurant, what can you do?", a: "We'll create a stunning website with your digital menu, photo gallery, online reservation option, Google Maps location, and WhatsApp ordering. Plus SEO so people searching 'best restaurant in [your city]' find you!" },
    { q: "Can I show my menu online?", a: "Beautiful digital menus with categories (starters, mains, desserts), photos, prices, and even dietary tags (veg/non-veg/jain). Customers love browsing menus before visiting!" },
    { q: "Will people find my restaurant on Google?", a: "That's exactly what our SEO does! We optimize for searches like 'best biryani near me', 'restaurants in [your area]', and your specific cuisine." },
    { q: "Can I take online orders?", a: "We add a 'Order Now' button linked to WhatsApp or your preferred platform. Full e-commerce ordering is coming soon!" },
    { q: "Should I list prices on menu?", a: "Yes! Customers prefer seeing prices online. It also helps with SEO and filters serious customers. We'll display them beautifully." },
    { q: "Can I add food photos?", a: "Absolutely! High-quality food photos increase orders significantly. Upload your dishes and we'll create a mouth-watering gallery." },
    { q: "Can I add special offers?", a: "Yes! Promotional banners for lunch deals, happy hours, festival specials. Easy to update anytime through chat." },
    { q: "Can I show Swiggy/Zomato links?", a: "Sure! We can add 'Order on Swiggy' and 'Order on Zomato' buttons alongside direct WhatsApp ordering." },
    { q: "I have a cafe, is this for me?", a: "Perfect for cafes! Show your menu, ambience photos, seating, events, and location. Rank for 'best cafe near me' searches!" },
    { q: "Can I have different menus (breakfast, lunch)?", a: "Yes! Separate menu sections with opening times. Show breakfast menu (7-11 AM), lunch (12-3 PM), dinner (7-11 PM)." },
    { q: "Can I add a reservation button?", a: "Yes! 'Book a Table' button linked to WhatsApp, phone, or your booking platform." },
    { q: "Will the menu work on phone?", a: "Perfectly! Scrollable, tap-to-expand menu categories on mobile. Customers love the ease of browsing on their phone." },

    // Salon & Spa (10)
    { q: "I have a salon, what do you offer?", a: "Gorgeous website with services menu, pricing, before/after gallery, booking button, stylist profiles, and timings. SEO for 'best salon in [your city]'!" },
    { q: "Can I show before/after photos?", a: "Yes! Interactive slider-style before/after photos. Amazing for showcasing transformations — customers love these!" },
    { q: "Can I list individual services and prices?", a: "Beautiful service cards with descriptions, prices, and booking buttons. Categories like Hair, Skin, Bridal, Spa make it easy to browse." },
    { q: "Can I add my team/stylists?", a: "Staff profiles with photos, specialties, and experience. Customers can even request specific stylists!" },
    { q: "Is website important for a salon?", a: "Hugely! 'Salon near me' is one of the most searched local terms. Without a website, you're missing hundreds of potential customers." },
    { q: "Can I add bridal packages?", a: "Yes! Dedicated bridal section with packages, pricing, and inquiry form. Perfect for wedding season marketing!" },
    { q: "Can customers book appointments online?", a: "'Book Now' button linked to WhatsApp or your preferred system. Integrated booking systems coming soon!" },
    { q: "Can I show products I sell?", a: "Yes! Product showcase section with images, descriptions, and 'Buy Now' buttons." },
    { q: "Can I run seasonal offers on the website?", a: "Absolutely! Festival offers, seasonal discounts, referral programs — all easily managed through chat." },
    { q: "What keywords will you target for my salon?", a: "We target: '[service] salon [city]', 'best salon near me', 'bridal makeup [city]', '[area] beauty parlour', and many more location-specific terms." },

    // Doctor & Clinic (12)
    { q: "I'm a doctor, can you build my website?", a: "Absolutely! Professional medical website with specialties, appointment booking, patient info, certifications, timings, and location. SEO for 'doctor/clinic in [your area]'." },
    { q: "Can I list my qualifications?", a: "Yes! Doctor profile with degrees, certifications, experience years, specializations, and professional memberships." },
    { q: "Can patients book appointments online?", a: "'Book Appointment' button with WhatsApp, phone, or linked to Practo/Lybrate. Easy for patients!" },
    { q: "Is HIPAA compliance needed?", a: "For Indian clinics, we follow IT Act guidelines. No patient data is stored on your website — it's a marketing site, not an EMR system." },
    { q: "Can I add health tips/blog?", a: "Great idea! Health blogs boost SEO massively. Write about common conditions, prevention tips, and your expertise." },
    { q: "Can I show my clinic photos?", a: "Yes! Clean, professional photos of your clinic build patient trust. Waiting area, equipment, staff — show it all!" },
    { q: "Can I list insurance accepted?", a: "Insurance list, cashless hospital tie-ups, TPA info — all can be featured prominently on your website." },
    { q: "What about emergency contact info?", a: "Emergency contact number prominently displayed with click-to-call. Available 24/7 section for urgent cases." },
    { q: "Can I add patient testimonials?", a: "Yes! Patient reviews and success stories build massive trust. We'll showcase them beautifully." },
    { q: "Can I have separate pages for each treatment?", a: "Individual treatment pages with descriptions, procedures, benefits, and FAQs. Excellent for SEO — each page can rank for specific conditions!" },
    { q: "My clinic is new, will SEO help?", a: "Especially for new clinics! SEO helps you get found from day one. 'New clinic [area]', '[specialty] near me' — we'll target these and more." },
    { q: "Can I add Google reviews to my clinic website?", a: "Yes! Displaying your Google reviews builds instant trust. We'll embed them on your website." },

    // Retail & Shops (8)
    { q: "I have a shop, do I need a website?", a: "Definitely! Even local shops benefit from 'near me' searches. Showcase your products, share your location, and let customers call/WhatsApp you." },
    { q: "Can I list my products with prices?", a: "Yes! Product catalog with images, descriptions, prices, and 'Enquire on WhatsApp' buttons." },
    { q: "Can I take orders online?", a: "Product inquiries via WhatsApp button work great! Full e-commerce with cart and checkout is coming soon." },
    { q: "Can I add offers and discounts?", a: "Promotional banners, clearance sales, festival offers — all easily managed through our AI chat." },
    { q: "I sell on Instagram, do I need a website too?", a: "Yes! Instagram doesn't rank on Google. A website with SEO brings new customers who are actively searching to buy." },
    { q: "Can I add product categories?", a: "Organized product sections with categories, filters, and search. Makes browsing easy for customers." },
    { q: "Is this good for a clothing store?", a: "Perfect! Gallery-style product showcase, size guides, new arrivals section, and 'Shop on WhatsApp' feature." },
    { q: "Can I add a 'New Arrivals' section?", a: "Yes! Dynamic sections for new arrivals, bestsellers, on sale, and featured products." },

    // Gym & Fitness (8)
    { q: "I own a gym, what do you offer?", a: "Powerful fitness website with membership plans, class schedules, trainer profiles, transformation gallery, and 'Join Now' CTA. SEO for 'gym near me'!" },
    { q: "Can I show membership plans?", a: "Beautiful pricing tables with different plans, features, and 'Sign Up' buttons." },
    { q: "Can I add class schedules?", a: "Yes! Weekly class timetable showing yoga, zumba, cardio, etc. with times and trainer info." },
    { q: "Can I show trainer profiles?", a: "Trainer cards with photos, certifications, specialties, and experience. Builds trust!" },
    { q: "Can I add transformation photos?", a: "Before/after transformation galleries are incredibly motivating. We'll showcase them prominently." },
    { q: "Can I add a BMI calculator?", a: "Interactive tools like BMI calculators are great for engagement. We can add these to your site!" },
    { q: "Is SEO important for a gym?", a: "'Gym near me' gets thousands of searches monthly. SEO is essential to capture these potential members!" },
    { q: "Can I add trial offer on the website?", a: "Free trial or discounted first month offers prominently displayed with sign-up form. Great for lead generation!" },

    // Education & Coaching (8)
    { q: "I run a coaching center, can you help?", a: "Complete education website with courses, batches, faculty, results, testimonials, and enrollment. SEO for '[subject] coaching [city]'!" },
    { q: "Can I list courses and fees?", a: "Detailed course pages with syllabus, duration, batch timings, fees, and 'Enroll Now' button." },
    { q: "Can I show student results?", a: "Results/achievements section with toppers, pass percentages, and success stories. Parents love seeing this!" },
    { q: "Can I add faculty profiles?", a: "Teacher profiles with qualifications, experience, teaching approach, and student reviews." },
    { q: "Can I have a demo class section?", a: "Free demo class registration form or YouTube video embed. Great way to attract new students!" },
    { q: "Is this good for online tutoring?", a: "Perfect! Showcase your expertise, course catalog, pricing, and booking — whether online or offline classes." },
    { q: "Can I add a study resources section?", a: "Download section for notes, sample papers, and study materials. Great for student engagement!" },
    { q: "Will parents find my coaching on Google?", a: "That's our goal! We target: '[subject] coaching [area]', 'best tuition near me', 'competitive exam preparation [city]' and similar searches." },

    // Real Estate (8)
    { q: "I'm in real estate, is this for me?", a: "Absolutely! Property listings with photos, details, pricing, virtual tours, and inquiry forms. SEO for 'property in [area]/[city]'!" },
    { q: "Can I list properties?", a: "Professional listings with images gallery, details (BHK, area, amenities), pricing, location map, and inquiry button." },
    { q: "Can I filter by property type?", a: "Filters for residential/commercial, buy/rent, BHK type, price range, and location." },
    { q: "Can I add virtual tours?", a: "Embed 360° virtual tour links or video walkthroughs. Give buyers an immersive experience!" },
    { q: "Can I add floor plans?", a: "Downloadable floor plans with room dimensions. Essential for serious buyers!" },
    { q: "Is SEO important for real estate?", a: "Extremely! 'Flats in [area]', '[BHK] for sale [city]' — these searches have massive volume. SEO = more leads!" },
    { q: "Can I add RERA details?", a: "RERA registration numbers and compliance info prominently displayed for trust and legal requirements." },
    { q: "Can I get leads from the website?", a: "Contact forms, WhatsApp buttons, and call buttons on every listing. Every visitor is a potential lead!" },

    // Freelancer & Photography (8)
    { q: "I'm a freelancer, do I need a website?", a: "Essential! A portfolio website showcases your work, builds credibility, and helps clients find you through Google. Way more professional than just social media!" },
    { q: "Can I show my portfolio?", a: "Beautiful filterable portfolio grid with project thumbnails, descriptions, and client testimonials." },
    { q: "I'm a photographer, what do you offer?", a: "Stunning gallery-focused website with portfolio, packages, client testimonials, booking, and about page. SEO for 'photographer in [city]'!" },
    { q: "Can I have different portfolio categories?", a: "Categories like Wedding, Portrait, Product, Event — with filtering. Clean, visual-first design." },
    { q: "Can I add a booking/inquiry form?", a: "Professional inquiry form with project details, budget, and timeline. Convert visitors into clients!" },
    { q: "Can I show my rates?", a: "Pricing packages beautifully displayed. Or keep it inquiry-based — 'Contact for price'. Your choice!" },
    { q: "Will people find me on Google?", a: "Yes! We target: '[skill] freelancer [city]', 'hire [profession] near me', '[profession] portfolio'. Get discovered by clients actively looking!" },
    { q: "Can I add client logos?", a: "Showcase brands and companies you've worked with. Builds instant credibility!" },

    // NGO & Trust (6)
    { q: "Can you build an NGO website?", a: "Meaningful website with your cause, impact stats, donation CTA, volunteer signup, events, and gallery. SEO to attract supporters!" },
    { q: "Can I add a donation button?", a: "Prominent donation CTA linked to your payment gateway or UPI. Make it easy for supporters to contribute!" },
    { q: "Can I show impact statistics?", a: "Beautiful impact counters — lives touched, funds raised, projects completed. Numbers tell powerful stories!" },
    { q: "Can I add event information?", a: "Upcoming events with details, venues, registration forms. Past events with galleries and reports." },
    { q: "Can I add volunteer signup?", a: "Volunteer registration form with interest areas and availability. Build your volunteer community!" },
    { q: "Is SEO useful for NGOs?", a: "Absolutely! People search for causes to support. SEO helps donors and volunteers find your organization." },

    // Lawyer/CA (6)
    { q: "I'm a lawyer/CA, do I need a website?", a: "Definitely! Professional website with practice areas, experience, client testimonials, and appointment booking. Builds authority and attracts clients!" },
    { q: "Can I list practice areas?", a: "Detailed pages for each practice area — criminal law, family law, property disputes, corporate law. Great for SEO!" },
    { q: "Can I add case studies?", a: "Success stories (without confidential details) demonstrate your expertise and build trust with potential clients." },
    { q: "Will potential clients find me?", a: "'Lawyer in [city]', 'CA near me', '[practice area] advocate [area]' — these searches bring high-value clients!" },
    { q: "Is a website professional for lawyers?", a: "It's expected! In 2026, potential clients Google lawyers before contacting them. No website = missed opportunities." },
    { q: "Can I add my bar council registration?", a: "Professional credentials, bar council number, years of practice — all displayed prominently for credibility." },

    // General Industry (14)
    { q: "I have a bakery, can you help?", a: "Delicious website with menu, order section, gallery of your creations, custom cake inquiry, and location. SEO for 'bakery near me'!" },
    { q: "I'm an interior designer", a: "Stunning portfolio website with project galleries, design approach, services, and client testimonials. SEO for 'interior designer [city]'!" },
    { q: "I run a pet shop/clinic", a: "Pet-friendly website with services, products, pet gallery, grooming packages, and vet profiles. SEO for 'pet clinic near me'!" },
    { q: "I have a travel agency", a: "Travel website with tour packages, destinations, itineraries, booking inquiries, and customer reviews. SEO for 'travel agent [city]'!" },
    { q: "I'm an event planner", a: "Event portfolio website with past events gallery, services, packages, and inquiry forms. SEO for 'event planner [city]'!" },
    { q: "I have a car garage/service center", a: "Auto service website with services list, pricing, brands serviced, customer reviews, and booking. SEO for 'car service near me'!" },
    { q: "I run a daycare/preschool", a: "Trustworthy website with programs, facilities, safety measures, staff profiles, and admission inquiry. SEO for 'daycare [area]'!" },
    { q: "I'm an astrologer/pandit", a: "Website with services, consultation booking, testimonials, and blog for predictions/tips. SEO for 'astrologer [city]'!" },
    { q: "I have a printing/stationery shop", a: "Product catalog with services (printing, custom gifts, stationery), prices, and order inquiry. SEO for 'printing shop near me'!" },
    { q: "I'm a musician/DJ", a: "Entertainment website with portfolio, music samples, booking, event gallery, and testimonials. SEO for 'DJ [city]'!" },
    { q: "I run a hostel/PG", a: "Property website with rooms, amenities, pricing, photos, location, and inquiry form. SEO for 'PG/hostel [area]'!" },
    { q: "I have a hardware store", a: "Product showcase with categories, brands stocked, delivery options, and contact. SEO for 'hardware shop near me'!" },
    { q: "I'm a makeup artist", a: "Beautiful portfolio with bridal looks, packages, booking, and testimonials. SEO for 'makeup artist [city]'!" },
    { q: "I run a cleaning service", a: "Service website with packages, pricing, booking, and customer reviews. SEO for 'cleaning service [city]'!" },
  ],
};

// Flatten all Q&As into searchable array
const ALL_QA = Object.values(KNOWLEDGE_BASE).flat();

/**
 * Search knowledge base for relevant answers
 * @param {string} query - User's question
 * @param {number} limit - Max results to return
 * @returns {Array} Matching Q&A pairs sorted by relevance
 */
function searchKnowledgeBase(query, limit = 5) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scored = ALL_QA.map(qa => {
    const qLower = qa.q.toLowerCase();
    const aLower = qa.a.toLowerCase();
    let score = 0;
    
    for (const word of queryWords) {
      if (qLower.includes(word)) score += 3;
      if (aLower.includes(word)) score += 1;
    }
    
    // Exact phrase match bonus
    if (qLower.includes(query.toLowerCase())) score += 10;
    
    return { ...qa, score };
  }).filter(qa => qa.score > 0);
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/**
 * Get random FAQs to show free users (10 diverse questions)
 */
function getStarterFAQs() {
  const categories = ['pricing', 'features', 'seo', 'trust', 'comparisons', 'general'];
  const faqs = [];
  
  // Pick curated FAQs that drive conversions
  const curatedIndices = {
    pricing: [0, 2, 30],     // cost, why pay, savings
    features: [0, 2, 17],    // what kind, mobile, how to update
    seo: [0, 1, 4],          // what is SEO, why need it, rank #1
    trust: [10, 19, 29],     // what's the catch, vs developer, unique
    comparisons: [0, 31],    // vs Wix, vs no website
    general: [0, 43],        // how it works, get started
  };
  
  for (const cat of categories) {
    const indices = curatedIndices[cat] || [0];
    for (const idx of indices) {
      if (KNOWLEDGE_BASE[cat][idx]) {
        faqs.push({
          category: cat,
          question: KNOWLEDGE_BASE[cat][idx].q,
          answer: KNOWLEDGE_BASE[cat][idx].a,
        });
      }
    }
  }
  
  // Return 10 most conversion-focused FAQs
  return faqs.slice(0, 10);
}

/**
 * Get total Q&A count
 */
function getKBStats() {
  const stats = {};
  let total = 0;
  for (const [cat, qas] of Object.entries(KNOWLEDGE_BASE)) {
    stats[cat] = qas.length;
    total += qas.length;
  }
  return { categories: stats, total };
}

module.exports = {
  KNOWLEDGE_BASE,
  ALL_QA,
  searchKnowledgeBase,
  getStarterFAQs,
  getKBStats,
};
