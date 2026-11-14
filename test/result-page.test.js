import assert from 'node:assert/strict';
import test from 'node:test';

import { renderResultPage } from '../api/result.js';

test('renders server-side Open Graph metadata for a shared result', () => {
    const html = renderResultPage(
        'https://runner.example/api/result?score=456&character=front&outcome=victory',
    );

    assert.match(html, /<meta property="og:title" content="456 очков — Нейросеть или ты">/);
    assert.match(html, /Фронт набрал 456 очков/);
    assert.match(
        html,
        /https:\/\/runner\.example\/api\/og\?score=456&amp;character=front&amp;outcome=victory/,
    );
    assert.match(html, />ИИ не догнал!</);
});
