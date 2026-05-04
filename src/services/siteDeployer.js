/**
 * Site Deployer — Deploys Next.js websites to Vercel + Cloudflare DNS
 *
 * Flow:
 * 1. Upload all Next.js project files to Vercel
 * 2. Vercel builds the Next.js project (output: 'export' = static)
 * 3. Add CNAME record in Cloudflare (subdomain.goplnr.com → cname.vercel-dns.com)
 * 4. Add custom domain to Vercel project
 * 5. Return live URL
 */

const crypto = require('crypto');

const VERCEL_API = 'https://api.vercel.com';
const CF_API = 'https://api.cloudflare.com/client/v4';

const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'scalifyapp.com';

/**
 * Deploy a Next.js site end-to-end
 * @param {string} subdomain - e.g. "rahulsalon"
 * @param {Object} files - { 'path/file.ext': 'content', ... } from generateNextJSFiles()
 * @param {string} siteId - UUID for the site
 * @returns {{ url: string, vercelUrl: string, projectId: string }}
 */
async function deploySite(subdomain, files, siteId) {
  const customDomain = `${subdomain}.${SITE_DOMAIN}`;
  const projectName = `sx-${subdomain}-${siteId.slice(0, 8)}`.slice(0, 52);

  console.log(`[Deploy] Starting deployment for ${customDomain}...`);

  // Step 1: Upload all files & deploy to Vercel
  const deployment = await deployToVercel(projectName, files);
  console.log(`[Deploy] Vercel deployment created: ${deployment.url}`);

  // Step 2: Add CNAME in Cloudflare
  await addCloudflareCNAME(subdomain);
  console.log(`[Deploy] Cloudflare CNAME added: ${customDomain} → cname.vercel-dns.com`);

  // Step 3: Add custom domain to Vercel project
  await addVercelDomain(deployment.projectId, customDomain);
  console.log(`[Deploy] Custom domain added to Vercel: ${customDomain}`);

  const liveUrl = `https://${customDomain}`;
  console.log(`[Deploy] Site is live at: ${liveUrl}`);

  return {
    url: liveUrl,
    vercelUrl: `https://${deployment.url}`,
    projectId: deployment.projectId,
  };
}

/**
 * Upload all files and create a Vercel deployment
 */
async function deployToVercel(projectName, files) {
  const fileEntries = [];

  for (const [filePath, content] of Object.entries(files)) {
    const fileBuffer = Buffer.from(content, 'utf-8');
    const sha = crypto.createHash('sha1').update(fileBuffer).digest('hex');
    const size = fileBuffer.length;

    // Upload file to Vercel
    const uploadRes = await fetch(`${VERCEL_API}/v2/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(size),
        'x-vercel-digest': sha,
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok && uploadRes.status !== 409) {
      const errText = await uploadRes.text();
      console.warn(`[Deploy] File upload warning for ${filePath}: ${errText}`);
    }

    fileEntries.push({ file: filePath, sha, size });
  }

  console.log(`[Deploy] Uploaded ${fileEntries.length} files to Vercel`);

  // Create deployment with all files
  const deployRes = await fetch(`${VERCEL_API}/v13/deployments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: fileEntries,
      projectSettings: {
        framework: 'nextjs',
        buildCommand: 'next build',
        outputDirectory: 'out',
        installCommand: 'npm install',
        nodeVersion: '20.x',
      },
      target: 'production',
    }),
  });

  const deployData = await deployRes.json();

  if (deployData.error) {
    throw new Error(`Vercel deploy failed: ${deployData.error.message}`);
  }

  return {
    url: deployData.url,
    deploymentId: deployData.id,
    projectId: deployData.projectId,
  };
}

/**
 * Add CNAME record in Cloudflare DNS
 */
async function addCloudflareCNAME(subdomain) {
  const fullName = `${subdomain}.${SITE_DOMAIN}`;

  // Check if record already exists
  const listRes = await fetch(
    `${CF_API}/zones/${CF_ZONE_ID}/dns_records?type=CNAME&name=${fullName}`,
    { headers: { Authorization: `Bearer ${CF_TOKEN}` } }
  );
  const listData = await listRes.json();

  const record = {
    type: 'CNAME',
    name: subdomain,
    content: 'cname.vercel-dns.com',
    ttl: 1,
    proxied: false, // Must be false for Vercel SSL
  };

  if (listData.result && listData.result.length > 0) {
    // Update existing
    const recordId = listData.result[0].id;
    const res = await fetch(`${CF_API}/zones/${CF_ZONE_ID}/dns_records/${recordId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Cloudflare DNS update failed: ${JSON.stringify(data.errors)}`);
    return data.result;
  }

  // Create new
  const res = await fetch(`${CF_API}/zones/${CF_ZONE_ID}/dns_records`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Cloudflare DNS create failed: ${JSON.stringify(data.errors)}`);
  return data.result;
}

/**
 * Add custom domain to Vercel project
 */
async function addVercelDomain(projectId, domain) {
  const res = await fetch(`${VERCEL_API}/v10/projects/${projectId}/domains`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: domain }),
  });
  const data = await res.json();
  if (data.error && data.error.code !== 'domain_already_in_use') {
    console.warn(`[Deploy] Domain add warning: ${data.error.message}`);
  }
  return data;
}

module.exports = { deploySite };
