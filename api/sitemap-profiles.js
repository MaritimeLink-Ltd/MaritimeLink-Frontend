/**
 * Dynamic sitemap of opt-in public profiles (/sitemap-profiles.xml).
 *
 * The static public/sitemap.xml covers marketing pages; profiles change constantly and
 * cannot be hand-maintained, so they are served from the live API instead. Only profiles
 * with publicProfileEnabled are returned by that endpoint.
 */

const API_BASE_URL = (
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    'https://maritime-apis.onrender.com'
).replace(/\/+$/, '');

function escapeXml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function siteOrigin(req) {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.maritimelink.co';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    return `${proto}://${host}`;
}

export default async function handler(req, res) {
    const origin = siteOrigin(req);

    let profiles = [];
    try {
        const apiRes = await fetch(`${API_BASE_URL}/api/public/professionals?limit=20000`, {
            headers: { Accept: 'application/json' },
        });
        if (apiRes.ok) {
            const payload = await apiRes.json();
            profiles = payload?.data?.profiles || [];
        } else {
            console.error('Profile sitemap: API responded', apiRes.status);
        }
    } catch (error) {
        // Serve a valid (empty) sitemap rather than a 500 — a broken sitemap hurts SEO.
        console.error('Profile sitemap fetch failed:', error);
    }

    const urls = profiles
        .map((profile) => {
            const loc = `${origin}/in/${profile.slug}`;
            const lastmod = profile.updatedAt
                ? new Date(profile.updatedAt).toISOString().slice(0, 10)
                : null;
            return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
}
