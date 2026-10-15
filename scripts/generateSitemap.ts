/**
 * ECEForge — SEO Sitemap Generator Script
 * Generates an XML sitemap for search engines covering static and scheme-wise routes.
 *
 * Usage:
 *   npx tsx scripts/generateSitemap.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://eceforge.web.app';

const STATIC_ROUTES = [
  '',
  '/browse',
  '/schemes',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/submit-resource',
];

const SCHEMES = ['vtu-2022', 'vtu-2025'];
const SEMESTERS = [3, 4, 5, 6, 7];

function generateSitemap() {
  const urls: { loc: string; changefreq: string; priority: string }[] = [];

  // Static routes
  STATIC_ROUTES.forEach(route => {
    urls.push({
      loc: `${BASE_URL}${route}`,
      changefreq: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? '1.0' : '0.8',
    });
  });

  // Schemes & Semester routes
  SCHEMES.forEach(scheme => {
    urls.push({
      loc: `${BASE_URL}/schemes/${scheme}`,
      changefreq: 'weekly',
      priority: '0.9',
    });

    SEMESTERS.forEach(sem => {
      urls.push({
        loc: `${BASE_URL}/schemes/${scheme}/semester/${sem}`,
        changefreq: 'weekly',
        priority: '0.8',
      });
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  console.log(`✅ Sitemap successfully generated at ${sitemapPath} with ${urls.length} URLs.`);
}

generateSitemap();
