/**
 * Server-rendered public profile pages (/in/:slug).
 *
 * The app is a client-rendered SPA, which is a problem for discoverability: Google
 * indexes JS-rendered pages slowly, and social crawlers (LinkedIn, WhatsApp, Slack,
 * Twitter/X, Facebook) do not execute JavaScript at all. This function returns real
 * HTML — correct <title>, meta description, Open Graph/Twitter cards, canonical URL
 * and schema.org JSON-LD — then boots the normal SPA on top for human visitors.
 *
 * Requires the API_BASE_URL environment variable in Vercel (falls back to production).
 */

const API_BASE_URL = (
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    'https://maritime-apis.onrender.com'
).replace(/\/+$/, '');

const SITE_NAME = 'MaritimeLink';

/** Escape for use in HTML text nodes and double-quoted attributes. */
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Escape for embedding inside a <script type="application/ld+json"> block. */
function escapeJsonLd(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

function siteOrigin(req) {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.maritimelink.co';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    return `${proto}://${host}`;
}

function buildDescription(profile) {
    const bits = [
        profile.rank,
        profile.seaTimeLabel ? `${profile.seaTimeLabel} sea time` : null,
    ]
        .filter(Boolean)
        .join(' · ');
    const where = profile.country ? ` Based in ${profile.country}.` : '';
    const vessels = Array.isArray(profile.vesselTypes) && profile.vesselTypes.length
        ? ` Experience on ${profile.vesselTypes.slice(0, 4).join(', ')}.`
        : '';
    const availability = profile.availableForWork
        ? ' Currently available for work.'
        : ' Currently employed / on contract.';
    return `${profile.name}${bits ? ` — ${bits}.` : '.'}${where}${vessels}${availability} View the full maritime career profile on ${SITE_NAME}.`
        .replace(/\s+/g, ' ')
        .trim();
}

/** Crawler-readable body copy, replaced by React once the SPA hydrates. */
function buildNoScriptContent(profile, canonical) {
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    const vessels = Array.isArray(profile.vesselTypes) ? profile.vesselTypes : [];
    const experience = Array.isArray(profile.experienceLines) ? profile.experienceLines : [];

    return `
    <main>
      <h1>${escapeHtml(profile.name)}</h1>
      ${profile.rank ? `<h2>${escapeHtml(profile.rank)}</h2>` : ''}
      <ul>
        ${profile.country ? `<li>Location: ${escapeHtml(profile.country)}</li>` : ''}
        ${profile.seaTimeLabel ? `<li>Total sea time: ${escapeHtml(profile.seaTimeLabel)}</li>` : ''}
        ${vessels.length ? `<li>Vessel types: ${escapeHtml(vessels.join(', '))}</li>` : ''}
        <li>Availability: ${profile.availableForWork ? 'Available for job' : 'Currently employed / on contract'}</li>
      </ul>
      ${
          profile.summary
              ? `<h3>Profile summary</h3><p>${escapeHtml(profile.summary)}</p>`
              : ''
      }
      ${
          experience.length
              ? `<h3>Experience summary</h3><ul>${experience
                    .map((line) => `<li>${escapeHtml(line)}</li>`)
                    .join('')}</ul>`
              : ''
      }
      ${
          skills.length
              ? `<h3>Key skills &amp; competencies</h3><ul>${skills
                    .map((skill) => `<li>${escapeHtml(skill.skillName)}</li>`)
                    .join('')}</ul>`
              : ''
      }
      <p>The full resume, verified document wallet and direct messaging for this professional are available to ${SITE_NAME} members.</p>
      <p><a href="${escapeHtml(canonical)}">${escapeHtml(profile.name)} on ${SITE_NAME}</a></p>
    </main>`.trim();
}

function buildHead(profile, canonical) {
    const title = `${profile.name}${profile.rank ? ` — ${profile.rank}` : ''} | ${SITE_NAME}`;
    const description = buildDescription(profile);
    const image = profile.profilePhotoUrl || '';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            '@type': 'Person',
            name: profile.name,
            ...(profile.rank ? { jobTitle: profile.rank } : {}),
            ...(image ? { image } : {}),
            ...(profile.country ? { address: { '@type': 'PostalAddress', addressCountry: profile.country } } : {}),
            ...(Array.isArray(profile.skills) && profile.skills.length
                ? { knowsAbout: profile.skills.map((skill) => skill.skillName).filter(Boolean) }
                : {}),
            url: canonical,
            worksFor: { '@type': 'Organization', name: SITE_NAME },
        },
    };

    return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
    <script type="application/ld+json">${escapeJsonLd(jsonLd)}</script>`.trim();
}

/**
 * Pull the built index.html so the SPA's hashed asset URLs stay correct across deploys,
 * then splice our SEO tags into <head> and the crawler copy into #root.
 */
async function loadShell(origin) {
    const res = await fetch(`${origin}/index.html`, {
        headers: { 'x-maritimelink-ssr': '1' },
    });
    if (!res.ok) throw new Error(`Could not load app shell (${res.status})`);
    return res.text();
}

function renderNotFound(canonical) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Profile not available | ${SITE_NAME}</title>
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
</head>
<body>
<main>
<h1>Profile not available</h1>
<p>This profile is either private or no longer available.</p>
<p><a href="/">Go to ${SITE_NAME}</a></p>
</main>
</body>
</html>`;
}

export default async function handler(req, res) {
    const slug = String(req.query.slug || '').trim();
    const origin = siteOrigin(req);
    const canonical = `${origin}/in/${slug}`;

    if (!slug) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(404).send(renderNotFound(canonical));
    }

    try {
        const apiRes = await fetch(
            `${API_BASE_URL}/api/public/professionals/${encodeURIComponent(slug)}`,
            { headers: { Accept: 'application/json' } },
        );

        if (!apiRes.ok) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
            return res.status(apiRes.status === 404 ? 404 : 200).send(renderNotFound(canonical));
        }

        const payload = await apiRes.json();
        const profile = payload?.data?.profile;
        if (!profile) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(404).send(renderNotFound(canonical));
        }

        const shell = await loadShell(origin);
        const head = buildHead(profile, canonical);
        const body = buildNoScriptContent(profile, canonical);

        const html = shell
            // Drop the shell's static title so ours is the only one.
            .replace(/<title>[\s\S]*?<\/title>/i, '')
            .replace('</head>', `${head}\n</head>`)
            .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        // Cache at the edge so crawler traffic doesn't hammer the API.
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
        return res.status(200).send(html);
    } catch (error) {
        console.error('Public profile SSR failed:', error);
        // Fall back to the plain SPA rather than showing an error page.
        try {
            const shell = await loadShell(origin);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(shell);
        } catch {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(500).send(renderNotFound(canonical));
        }
    }
}
