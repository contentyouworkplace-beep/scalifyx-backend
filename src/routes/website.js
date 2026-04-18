const express = require('express');
const router = express.Router();
const { generateWebsite } = require('../services/websiteGenerator');
const { deploySite } = require('../services/siteDeployer');
const { analyzeScreenshot, analyzeURLReference } = require('../services/aiAgent');
const { supabaseAdmin } = require('../lib/supabase');
const { authMiddleware } = require('../middleware/auth');

// POST /api/website/generate — Generate website from business data
router.post('/generate', authMiddleware, async (req, res) => {
  const { businessData } = req.body;
  const userId = req.user.id;

  if (!businessData || !businessData.businessName) {
    return res.status(400).json({ error: 'Business data with businessName required' });
  }

  try {
    const website = await generateWebsite(businessData);

    // Deploy to Vercel + Cloudflare DNS
    let deployResult = null;
    let liveUrl = website.url;
    try {
      deployResult = await deploySite(website.subdomain, website.files, website.siteId);
      liveUrl = deployResult.url;
      console.log(`[Website] Deployed: ${liveUrl}`);
    } catch (deployErr) {
      console.error('[Website] Deployment failed (site saved but not live):', deployErr.message);
    }

    // Save to database
    const { data: savedSite, error } = await supabaseAdmin
      .from('websites')
      .insert({
        user_id: userId,
        site_id: website.siteId,
        subdomain: website.subdomain,
        business_name: businessData.businessName,
        business_type: businessData.businessType,
        description: businessData.description,
        html_content: website.html,
        theme_color: businessData.colorTheme || '#10B981',
        services: businessData.services || [],
        contact: { phone: businessData.phone, whatsapp: businessData.whatsapp, address: businessData.address },
        template: 'nextjs',
        status: deployResult ? 'live' : 'generated',
        deployed_url: liveUrl,
        vercel_project_id: deployResult?.projectId || null,
        vercel_url: deployResult?.vercelUrl || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update user's profile with website URL
    await supabaseAdmin
      .from('profiles')
      .update({
        business_name: businessData.businessName,
        business_type: businessData.businessType,
        website_url: liveUrl,
      })
      .eq('id', userId);

    res.json({
      success: true,
      website: {
        id: savedSite.id,
        siteId: website.siteId,
        url: liveUrl,
        vercelUrl: deployResult?.vercelUrl || null,
        subdomain: website.subdomain,
        status: deployResult ? 'live' : 'generated',
        createdAt: savedSite.created_at,
      },
    });
  } catch (error) {
    console.error('Website generation error:', error);
    res.status(500).json({ error: 'Failed to generate website' });
  }
});

// POST /api/website/analyze-screenshot — Analyze a reference screenshot
router.post('/analyze-screenshot', authMiddleware, async (req, res) => {
  const { imageBase64, notes } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 required' });
  }

  try {
    const analysis = await analyzeScreenshot(imageBase64, notes);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Screenshot analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze screenshot' });
  }
});

// POST /api/website/analyze-url — Analyze a reference URL
router.post('/analyze-url', authMiddleware, async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url required' });
  }

  try {
    const analysis = await analyzeURLReference(url);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('URL analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze URL' });
  }
});

// GET /api/website/:siteId — Get website details
router.get('/:siteId', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('websites')
      .select('*')
      .eq('site_id', req.params.siteId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

// PUT /api/website/:siteId — Update website
router.put('/:siteId', authMiddleware, async (req, res) => {
  const { changes } = req.body;

  try {
    const updates = {};
    if (changes.businessName) updates.business_name = changes.businessName;
    if (changes.themeColor) updates.theme_color = changes.themeColor;
    if (changes.services) updates.services = changes.services;
    if (changes.contact) updates.contact = changes.contact;
    if (changes.htmlContent) updates.html_content = changes.htmlContent;
    if (changes.template) updates.template = changes.template;

    const { data, error } = await supabaseAdmin
      .from('websites')
      .update(updates)
      .eq('site_id', req.params.siteId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, website: data });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({ error: 'Failed to update website' });
  }
});

// POST /api/website/:siteId/track — Track a website visit (public)
router.post('/:siteId/track', async (req, res) => {
  const { page, referrer } = req.body;

  try {
    const { data: website } = await supabaseAdmin
      .from('websites')
      .select('id')
      .eq('site_id', req.params.siteId)
      .single();

    if (website) {
      await supabaseAdmin.from('analytics').insert({
        website_id: website.id,
        page: page || '/',
        visitor_ip: req.ip,
        user_agent: req.headers['user-agent'],
        referrer: referrer || req.headers.referer,
      });

      // Increment visitor count
      await supabaseAdmin.rpc('increment_visitors', { site_id: website.id }).catch(() => {
        // If RPC doesn't exist, do manual update
        supabaseAdmin.from('websites').update({ visitors: website.visitors + 1 }).eq('id', website.id);
      });
    }

    res.json({ ok: true });
  } catch (error) {
    res.json({ ok: true }); // Don't fail tracking
  }
});

module.exports = router;
