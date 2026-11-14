import { buildOgImagePath, parseSharedResult } from '../shared/result-share.js';

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function renderResultPage(requestUrl) {
    const url = new URL(requestUrl);
    const result = parseSharedResult(url.searchParams);
    const resultUrl = url.href;
    const imageUrl = new URL(
        buildOgImagePath({
            score: result.score,
            character: result.character.id,
            outcome: result.outcome,
        }),
        url.origin,
    ).href;
    const gameUrl = new URL('/', url.origin).href;
    const characterImageUrl = new URL(result.character.image, url.origin).href;
    const title = `${result.score} очков — Нейросеть или ты`;
    const heading = result.outcome === 'victory' ? 'ИИ не догнал!' : 'Игра окончена';
    const description = `${result.character.name} набрал ${result.score} очков в игре «Нейросеть или ты».`;

    return `<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <meta name="theme-color" content="#abc4d4">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(resultUrl)}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:site_name" content="Нейросеть или ты">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(resultUrl)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(description)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <style>
        @font-face { font-family: "Anonymous Pro"; src: url("/fonts/AnonymousPro-Bold.woff") format("woff"); font-weight: 700; font-display: swap; }
        * { box-sizing: border-box; }
        html { min-width: 20rem; min-height: 100%; background: #abc4d4; color: #252d42; font-family: "Anonymous Pro", monospace; }
        body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 1.5rem; background: linear-gradient(#abc4d4 0 76%, #80a87c 76% 82%, #7f8296 82%); }
        main { width: min(47.5rem, 100%); display: grid; grid-template-columns: minmax(0, 1fr) minmax(9.375rem, 16.25rem); align-items: center; gap: 2rem; padding: clamp(1.75rem, 6vw, 4rem); border: .5rem solid rgb(48 38 55 / 23%); border-radius: 1.75rem; background: rgb(255 255 255 / 70%); box-shadow: 0 1.5rem 4.375rem rgb(37 45 66 / 18%); }
        .eyebrow { margin: 0 0 .625rem; color: #00687b; font-size: clamp(1.125rem, 3vw, 1.5rem); }
        h1 { margin: 0; color: ${result.outcome === 'victory' ? '#00687b' : '#ce3f36'}; font-size: clamp(2.5rem, 8vw, 4.5rem); line-height: .9; }
        .score { margin: 1.25rem 0 .5rem; font-size: clamp(3.25rem, 12vw, 6rem); line-height: 1; }
        .description { margin: 0; font-size: clamp(1.125rem, 3vw, 1.5rem); }
        .character { display: block; width: 100%; max-height: 17.5rem; object-fit: contain; }
        .button { display: inline-block; margin-top: 1.75rem; padding: .9375rem 1.5rem; border-radius: .875rem; background: #00687b; color: white; font-size: 1.125rem; text-decoration: none; }
        @media (max-width: 36.25rem) { main { grid-template-columns: 1fr; text-align: center; } .character { grid-row: 1; max-height: 11.25rem; } }
    </style>
</head>
<body>
    <main>
        <section>
            <p class="eyebrow">${escapeHtml(result.character.name)}</p>
            <h1>${escapeHtml(heading)}</h1>
            <p class="score">${result.score}</p>
            <p class="description">очков в забеге</p>
            <a class="button" href="${escapeHtml(gameUrl)}">Сыграть самому</a>
        </section>
        <img class="character" src="${escapeHtml(characterImageUrl)}" alt="${escapeHtml(result.character.name)}">
    </main>
</body>
</html>`;
}

export default function handler(request) {
    if (request.method && request.method !== 'GET') {
        return new Response('Method Not Allowed', {
            status: 405,
            headers: { Allow: 'GET' },
        });
    }

    return new Response(renderResultPage(request.url), {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=31536000, immutable',
            'X-Robots-Tag': 'noindex, follow',
        },
    });
}
