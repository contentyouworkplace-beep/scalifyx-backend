const { v4: uuidv4 } = require('uuid');
const { generateWebsiteContent } = require('./aiAgent');
const fs = require('fs');
const path = require('path');

const SITES_DIR = path.join(__dirname, '..', '..', 'generated-sites');

/**
 * Generate a Next.js project from business data
 */
async function generateWebsite(businessData) {
  // 1. Generate AI content
  const content = await generateWebsiteContent(businessData);

  // 2. Create project directory
  const subdomain = businessData.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);

  const siteId = uuidv4();
  const siteDir = path.join(SITES_DIR, siteId);

  if (!fs.existsSync(SITES_DIR)) {
    fs.mkdirSync(SITES_DIR, { recursive: true });
  }
  fs.mkdirSync(siteDir, { recursive: true });

  // 3. Generate all Next.js files
  const files = generateNextJSFiles(businessData, content);

  // 4. Write files to disk
  for (const [filePath, fileContent] of Object.entries(files)) {
    const fullPath = path.join(siteDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, fileContent, 'utf-8');
  }

  const url = `https://${subdomain}.${process.env.SITE_DOMAIN || 'goplnr.com'}`;

  return {
    siteId,
    subdomain,
    url,
    html: files['app/page.tsx'],
    content,
    files,
    fileList: Object.keys(files),
    siteDir,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Escape special characters for JSX template strings
 */
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/`/g, '\\`');
}

/**
 * Extract city name from address string
 */
function extractCity(address) {
  if (!address) return 'Your City';
  const parts = address.split(',').map(p => p.trim());
  return parts.length >= 2 ? parts[parts.length - 2] || parts[parts.length - 1] : parts[0];
}

/**
 * Adjust hex color brightness
 */
function adjustColor(hex, amount) {
  hex = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex to RGB string for CSS rgba()
 */
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

/**
 * Generate all files for a Next.js project
 */
function generateNextJSFiles(businessData, content) {
  const {
    businessName, phone, whatsapp, address, timings,
    colorTheme = '#10B981', description, services, socialLinks,
    businessType,
  } = businessData;

  const {
    heroHeadline, heroSubheadline, heroCTA, heroSecondCTA, heroImage,
    aboutTitle, aboutText, aboutHighlights, whyChooseUs,
    servicesWithDescriptions, testimonials, faqItems, galleryImages,
    metaTitle, metaDescription, ogDescription, footerTagline,
    trustBadges, ctaBanner,
  } = content;

  const wa = whatsapp || phone;

  return {
    // ── package.json ──
    'package.json': JSON.stringify({
      name: `scalifyx-${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      version: '1.0.0',
      private: true,
      scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
      dependencies: { next: '^14.2.0', react: '^18.3.0', 'react-dom': '^18.3.0' },
      devDependencies: {
        '@types/node': '^20', '@types/react': '^18', typescript: '^5',
        tailwindcss: '^3.4.0', postcss: '^8', autoprefixer: '^10',
      },
    }, null, 2),

    // ── next.config.js ──
    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = { output: 'export', images: { unoptimized: true } };
module.exports = nextConfig;
`,

    // ── tsconfig.json ──
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'es5', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true,
        strict: true, noEmit: true, esModuleInterop: true, module: 'esnext',
        moduleResolution: 'bundler', resolveJsonModule: true, isolatedModules: true,
        jsx: 'preserve', incremental: true, plugins: [{ name: 'next' }],
        paths: { '@/*': ['./*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }, null, 2),

    // ── tailwind.config.ts ──
    'tailwind.config.ts': `import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '${colorTheme}',
        'primary-light': '${colorTheme}15',
        'primary-dark': '${adjustColor(colorTheme, -20)}',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
`,

    // ── postcss.config.js ──
    'postcss.config.js': `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
`,

    // ── app/globals.css ──
    'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap');

:root {
  --primary: ${colorTheme};
  --primary-rgb: ${hexToRgb(colorTheme)};
}

html { scroll-behavior: smooth; }
body { font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
section { scroll-margin-top: 80px; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f8f9fa; }
::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }

/* Animations */
@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}
.whatsapp-float { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes countUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.animate-fade-up { animation: fadeInUp 0.7s ease-out both; }
.animate-fade-left { animation: fadeInLeft 0.7s ease-out both; }
.animate-fade-right { animation: fadeInRight 0.7s ease-out both; }
.animate-scale { animation: scaleIn 0.6s ease-out both; }
.animate-float { animation: float 3s ease-in-out infinite; }
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }

/* Scroll animations */
.reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.reveal.active { opacity: 1; transform: translateY(0); }
.reveal-left { opacity: 0; transform: translateX(-40px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.reveal-left.active { opacity: 1; transform: translateX(0); }
.reveal-right { opacity: 0; transform: translateX(40px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.reveal-right.active { opacity: 1; transform: translateX(0); }
.reveal-scale { opacity: 0; transform: scale(0.9); transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
.reveal-scale.active { opacity: 1; transform: scale(1); }

/* Glass morphism */
.glass { background: rgba(255,255,255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.glass-dark { background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

/* Gradient text */
.gradient-text { background: linear-gradient(135deg, var(--primary), ${adjustColor(colorTheme, 40)}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

/* Card hover effects */
.card-hover { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -12px rgba(var(--primary-rgb), 0.15); }

/* FAQ */
details summary { cursor: pointer; list-style: none; }
details summary::-webkit-details-marker { display: none; }
details[open] summary .faq-icon { transform: rotate(45deg); }

/* Marquee */
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.marquee-track { animation: marquee 20s linear infinite; }
`,

    // ── app/layout.tsx ──
    'app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata: Metadata = {
  title: '${esc(metaTitle || businessName)}',
  description: '${esc(metaDescription || description)}',
  openGraph: {
    title: '${esc(metaTitle || businessName)}',
    description: '${esc(ogDescription || metaDescription || description)}',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}<ScrollReveal /></body>
    </html>
  );
}
`,

    // ── app/page.tsx ──
    'app/page.tsx': `import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import About from '@/components/About';
import WhyChooseUs from '@/components/WhyChooseUs';
import Services from '@/components/Services';
import Gallery from '@/components/Gallery';
import CTABanner from '@/components/CTABanner';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <TrustBar />
      <About />
      <WhyChooseUs />
      <Services />
      <Gallery />
      <CTABanner />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
`,

    // ── components/Header.tsx ──
    'components/Header.tsx': `'use client';
import { useState, useEffect } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={\`sticky top-0 z-50 transition-all duration-300 \${scrolled ? 'glass shadow-lg shadow-gray-200/50' : 'bg-transparent'}\`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, 30)})' }}>
            ${esc(businessName?.charAt(0) || 'S')}
          </div>
          <span className="text-lg font-extrabold text-gray-900 group-hover:text-gray-700 transition">${esc(businessName)}</span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {['About', 'Services', 'Gallery', 'Reviews', 'Contact'].map((item) => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 transition-all">{item}</a>
          ))}
          <a href="tel:${phone}" className="ml-3 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, 20)})' }}>
            📞 Call Now
          </a>
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition" aria-label="Menu">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>
      {menuOpen && (
        <nav className="md:hidden px-4 pb-5 pt-2 glass border-t border-gray-100/50 space-y-1 animate-fade-up">
          {['About', 'Services', 'Gallery', 'Reviews', 'Contact'].map((item) => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">{item}</a>
          ))}
          <a href="tel:${phone}" className="block text-center px-4 py-3 rounded-xl text-white text-sm font-semibold mt-2" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, 20)})' }}>
            📞 Call Now
          </a>
        </nav>
      )}
    </header>
  );
}
`,

    // ── components/Hero.tsx ──
    'components/Hero.tsx': `export default function Hero() {
  const heroImg = 'https://source.unsplash.com/1600x900/?${encodeURIComponent(content.heroImage || businessType || 'business')}';
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(${hexToRgb(colorTheme)}, 0.85), rgba(0,0,0,0.7))' }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float" style={{ background: '${colorTheme}' }}></div>
      <div className="absolute bottom-20 left-10 w-56 h-56 rounded-full opacity-15 blur-3xl animate-float delay-300" style={{ background: '${adjustColor(colorTheme, 40)}' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-up glass-dark text-white/90 border border-white/10">
            ✨ ${esc(businessType || 'Professional Services')} in ${esc(extractCity(address))}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] animate-fade-up delay-100" style={{ fontFamily: "'Playfair Display', serif" }}>
            ${esc(heroHeadline || businessName)}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed animate-fade-up delay-200">
            ${esc(heroSubheadline || description)}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
            <a href="tel:${phone}" className="group px-8 py-4 rounded-2xl text-white font-semibold text-base shadow-2xl transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, 30)})' }}>
              ${esc(heroCTA || 'Contact Us')}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#services" className="px-8 py-4 rounded-2xl font-semibold text-base glass-dark text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] text-center">
              ${esc(heroSecondCTA || 'Our Services')}
            </a>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-14 flex flex-wrap items-center gap-6 sm:gap-8 animate-fade-up delay-400">
          <div className="flex items-center gap-2 text-white/70">
            <div className="flex -space-x-2">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, 40)})' }}>
                  {'⭐'}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium">Trusted by 100s of customers</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/70">
            <span className="text-lg">📍</span>
            <span className="text-sm font-medium">${esc(extractCity(address))}</span>
          </div>
          ${timings ? `<div className="hidden sm:flex items-center gap-2 text-white/70"><span className="text-lg">⏰</span><span className="text-sm font-medium">${esc(timings)}</span></div>` : ''}
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/TrustBar.tsx ──
    'components/TrustBar.tsx': `export default function TrustBar() {
  const badges = ${JSON.stringify(trustBadges || [
    { icon: '✅', text: 'Verified Business' },
    { icon: '⭐', text: '5-Star Rated' },
    { icon: '🛡️', text: 'Trusted & Reliable' },
    { icon: '📞', text: '24/7 Support' },
  ])};
  return (
    <section className="relative -mt-8 z-20 pb-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="glass rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 px-6 py-5 reveal">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {badges.map((b: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5 text-gray-700">
                <span className="text-xl">{b.icon}</span>
                <span className="text-sm font-semibold whitespace-nowrap">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/About.tsx ──
    'components/About.tsx': `export default function About() {
  const highlights = ${JSON.stringify(aboutHighlights || [
    { number: '500+', label: 'Happy Customers' },
    { number: '5+', label: 'Years Experience' },
    { number: '4.8', label: 'Google Rating' },
    { number: '100%', label: 'Satisfaction' },
  ])};

  return (
    <section id="about" className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <div className="reveal-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: '${colorTheme}12', color: '${colorTheme}' }}>
              Our Story
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              ${esc(aboutTitle || 'About Us')}
            </h2>
            <div className="w-16 h-1.5 rounded-full mt-4 mb-6" style={{ background: 'linear-gradient(90deg, ${colorTheme}, ${adjustColor(colorTheme, 40)})' }}></div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              ${esc(aboutText || description)}
            </p>
            ${timings ? `<div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100"><span className="text-lg">⏰</span><span className="text-sm font-semibold text-gray-700">${esc(timings)}</span></div>` : ''}
          </div>

          {/* Right — Stats Grid */}
          <div className="reveal-right">
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((h: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 card-hover">
                  <div className="text-3xl sm:text-4xl font-black gradient-text">{h.number}</div>
                  <div className="text-sm text-gray-500 mt-2 font-medium">{h.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/WhyChooseUs.tsx ──
    'components/WhyChooseUs.tsx': `export default function WhyChooseUs() {
  const reasons = ${JSON.stringify(whyChooseUs || [
    { title: 'Expert Team', description: 'Our experienced professionals deliver exceptional results every time.', icon: '🏆' },
    { title: 'Quality First', description: 'We never compromise on quality, using only the best materials and practices.', icon: '✨' },
    { title: 'Affordable Pricing', description: 'Premium services at prices that respect your budget.', icon: '💰' },
    { title: 'Customer Focus', description: 'Your satisfaction is our top priority from start to finish.', icon: '❤️' },
  ])};

  return (
    <section className="py-20 sm:py-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, ${colorTheme}05, ${colorTheme}10, ${colorTheme}05)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: '${colorTheme}15', color: '${colorTheme}' }}>
            Why Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Why Choose ${esc(businessName)}?</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">What sets us apart from the rest — and why our customers keep coming back.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r: any, i: number) => (
            <div key={i} className="reveal-scale bg-white rounded-2xl p-6 border border-gray-100 card-hover text-center group" style={{ animationDelay: \`\${i * 0.1}s\` }}>
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ background: '${colorTheme}10' }}>
                {r.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{r.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/Services.tsx ──
    'components/Services.tsx': `export default function Services() {
  const services = ${JSON.stringify(servicesWithDescriptions || services?.map((s) => ({ name: s, description: '', icon: '✅', highlight: '', image: '' })) || [])};

  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: '${colorTheme}15', color: '${colorTheme}' }}>
            What We Offer
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Our Services</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Comprehensive solutions tailored to your needs — explore what we can do for you.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s: any, i: number) => (
            <div key={i} className="reveal-scale group relative bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover" style={{ animationDelay: \`\${i * 0.08}s\` }}>
              {s.image && (
                <div className="h-44 overflow-hidden">
                  <img src={\`https://source.unsplash.com/600x400/?\${encodeURIComponent(s.image)}\`} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{s.icon || '✨'}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{s.name}</h3>
                    {s.highlight && <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: '${colorTheme}15', color: '${colorTheme}' }}>{s.highlight}</span>}
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, ${colorTheme}, ${adjustColor(colorTheme, 40)})' }}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/Gallery.tsx ──
    'components/Gallery.tsx': `export default function Gallery() {
  const images = ${JSON.stringify(galleryImages || [
    { query: businessType + ' interior', caption: 'Our Space' },
    { query: businessType + ' professional', caption: 'Our Team' },
    { query: businessType + ' service', caption: 'At Work' },
    { query: businessType + ' quality', caption: 'Quality Service' },
    { query: businessType + ' modern', caption: 'Modern Setup' },
    { query: businessType + ' customer', caption: 'Happy Customers' },
  ])};

  return (
    <section id="gallery" className="py-20 sm:py-28" style={{ background: 'linear-gradient(180deg, #f8fafc, #ffffff)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: '${colorTheme}15', color: '${colorTheme}' }}>
            Gallery
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">See Our Work</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">A glimpse into what we do and the experience we create.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {images.map((img: any, i: number) => (
            <div key={i} className={\`reveal-scale group relative overflow-hidden rounded-2xl \${i === 0 ? 'row-span-2 col-span-1' : ''}\`} style={{ animationDelay: \`\${i * 0.08}s\` }}>
              <img
                src={\`https://source.unsplash.com/600x\${i === 0 ? '800' : '400'}/?\${encodeURIComponent(img.query)}\`}
                alt={img.caption}
                className={\`w-full \${i === 0 ? 'h-full min-h-[300px]' : 'h-48 sm:h-56'} object-cover group-hover:scale-110 transition-transform duration-700\`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-sm font-semibold">{img.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/CTABanner.tsx ──
    'components/CTABanner.tsx': `export default function CTABanner() {
  return (
    <section className="py-16 sm:py-20 reveal">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, -30)})' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: '${adjustColor(colorTheme, 60)}' }}></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 blur-3xl" style={{ background: '${adjustColor(colorTheme, 40)}' }}></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              ${esc(ctaBanner?.headline || 'Ready to Experience the Difference?')}
            </h2>
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              ${esc(ctaBanner?.subtext || 'Join hundreds of satisfied customers. Get in touch today.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:${phone}" className="px-8 py-4 rounded-2xl bg-white font-bold text-base transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]" style={{ color: '${colorTheme}' }}>
                📞 ${esc(ctaBanner?.buttonText || 'Call Us Now')}
              </a>
              <a href="https://wa.me/91${wa}" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-2xl font-bold text-base text-white border-2 border-white/30 hover:bg-white/10 transition-all">
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/Testimonials.tsx ──
    'components/Testimonials.tsx': `export default function Testimonials() {
  const testimonials = ${JSON.stringify(testimonials || [
    { name: 'Happy Customer', text: 'Great service and very professional!', rating: 5, service: 'General' },
    { name: 'Satisfied Client', text: 'Highly recommend to everyone.', rating: 5, service: 'General' },
    { name: 'Regular Visitor', text: 'Best in the city, always consistent quality.', rating: 4, service: 'General' },
    { name: 'Loyal Patron', text: 'Exceptional experience every single time!', rating: 5, service: 'General' },
  ])};

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: '${colorTheme}15', color: '${colorTheme}' }}>
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Real reviews from real people — see why they chose us.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="reveal-scale bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 card-hover relative" style={{ animationDelay: \`\${i * 0.1}s\` }}>
              <div className="absolute top-6 right-6 text-5xl opacity-10 font-serif" style={{ color: '${colorTheme}' }}>&ldquo;</div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating || 5 }, (_, j) => (
                  <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, 30)})' }}>
                  {t.name?.[0] || 'C'}
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-900">{t.name}</span>
                  {t.service && <span className="text-xs text-gray-400">{t.service}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/FAQ.tsx ──
    'components/FAQ.tsx': `'use client';

export default function FAQ() {
  const faqs = ${JSON.stringify(faqItems || [
    { question: 'What are your business hours?', answer: timings || 'Please call us for current hours.' },
    { question: 'Where are you located?', answer: address || 'Please contact us for directions.' },
    { question: 'How can I book an appointment?', answer: `You can call us at ${phone} or message us on WhatsApp.` },
  ])};

  return (
    <section className="py-20 sm:py-28" style={{ background: 'linear-gradient(180deg, #f8fafc, #ffffff)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: '${colorTheme}15', color: '${colorTheme}' }}>
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Common Questions</h2>
          <p className="text-gray-500 mt-3">Quick answers to the questions we hear most often.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq: any, i: number) => (
            <details key={i} className="reveal-scale bg-white rounded-2xl border border-gray-100 group shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: \`\${i * 0.05}s\` }}>
              <summary className="flex items-center justify-between p-5 sm:p-6 font-semibold text-gray-800 text-sm sm:text-base">
                {faq.question}
                <span className="faq-icon text-xl transition-transform duration-200 flex-shrink-0 ml-3" style={{ color: '${colorTheme}' }}>+</span>
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-500 text-sm leading-relaxed -mt-2">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    // ── components/Contact.tsx ──
    'components/Contact.tsx': `export default function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ background: '${colorTheme}15', color: '${colorTheme}' }}>
            Contact
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get In Touch</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">We&apos;re here to help. Reach out through any of these channels.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
          <a href="tel:${phone}" className="reveal-scale bg-gray-50 rounded-2xl p-6 text-center card-hover border border-gray-100 block group">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110" style={{ background: '${colorTheme}10' }}>📞</div>
            <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone</h4>
            <p className="font-bold text-gray-800 mt-1">${phone}</p>
          </a>
          <a href="https://wa.me/91${wa}" target="_blank" rel="noopener noreferrer" className="reveal-scale bg-gray-50 rounded-2xl p-6 text-center card-hover border border-gray-100 block group" style={{ animationDelay: '0.1s' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110" style={{ background: '#25D36610' }}>💬</div>
            <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">WhatsApp</h4>
            <p className="font-bold text-gray-800 mt-1">Chat with us</p>
          </a>
          <div className="reveal-scale bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 group" style={{ animationDelay: '0.2s' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3" style={{ background: '${colorTheme}10' }}>📍</div>
            <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Address</h4>
            <p className="font-bold text-gray-800 mt-1 text-sm leading-snug">${esc(address)}</p>
          </div>
          ${timings ? `<div className="reveal-scale bg-gray-50 rounded-2xl p-6 text-center border border-gray-100" style={{ animationDelay: '0.3s' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3" style={{ background: '${colorTheme}10' }}>⏰</div>
            <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hours</h4>
            <p className="font-bold text-gray-800 mt-1 text-sm">${esc(timings)}</p>
          </div>` : ''}
        </div>
        ${address ? `<div className="mt-10 reveal rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-w-4xl mx-auto"><iframe src="https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed" className="w-full h-64 sm:h-80" loading="lazy" style={{ border: 0 }} allowFullScreen></iframe></div>` : ''}
      </div>
    </section>
  );
}
`,

    // ── components/Footer.tsx ──
    'components/Footer.tsx': `export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: 'linear-gradient(135deg, ${colorTheme}, ${adjustColor(colorTheme, 30)})' }}>${esc(businessName?.charAt(0) || 'S')}</div>
              <span className="text-lg font-extrabold">${esc(businessName)}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">${esc(footerTagline || description)}</p>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 text-white/80 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {['About', 'Services', 'Gallery', 'Reviews', 'Contact'].map(link => (
                <li key={link}><a href={\`#\${link.toLowerCase()}\`} className="text-gray-400 hover:text-white text-sm transition">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 text-white/80 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="tel:${phone}" className="hover:text-white transition">📞 ${phone}</a></li>
              <li><a href="https://wa.me/91${wa}" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">💬 WhatsApp</a></li>
              <li>📍 ${esc(extractCity(address))}</li>
              ${timings ? `<li>⏰ ${esc(timings)}</li>` : ''}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 text-white/80 uppercase tracking-wider">Follow Us</h4>
            <div className="flex gap-3">
              ${socialLinks?.instagram ? `<a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition" title="Instagram">📷</a>` : ''}
              ${socialLinks?.facebook ? `<a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition" title="Facebook">👍</a>` : ''}
              <a href="tel:${phone}" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition" title="Call">📞</a>
              <a href="https://wa.me/91${wa}" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition" title="WhatsApp">💬</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-gray-500 text-xs">&copy; ${new Date().getFullYear()} ${esc(businessName)}. All rights reserved.</p>
          <p className="text-gray-600 text-xs flex items-center gap-1">Made with <span className="text-red-500">❤️</span> by <a href="https://scalifyx.in" className="hover:text-gray-400 transition font-medium">ScalifyX</a></p>
        </div>
      </div>
    </footer>
  );
}
`,

    // ── components/WhatsAppFloat.tsx ──
    'components/WhatsAppFloat.tsx': `export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/91${wa}"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float fixed bottom-5 right-5 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center z-50 shadow-2xl text-white text-2xl sm:text-3xl transition-transform hover:scale-110 active:scale-95 group"
      style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 sm:w-8 sm:h-8"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  );
}
`,

    // ── components/ScrollReveal.tsx ──
    'components/ScrollReveal.tsx': `'use client';
import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
`,
  };
}

module.exports = { generateWebsite, generateNextJSFiles };

