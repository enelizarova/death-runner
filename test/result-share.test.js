import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildOgImagePath,
    buildResultPath,
    normalizeSharedResult,
} from '../shared/result-share.js';

test('builds stable result and OG image paths', () => {
    const input = { score: 321.9, character: 'developer', outcome: 'victory' };

    assert.equal(
        buildResultPath(input),
        '/api/result?score=321&character=developer&outcome=victory',
    );
    assert.equal(buildOgImagePath(input), '/api/og?score=321&character=developer&outcome=victory');
});

test('normalizes untrusted shared result parameters', () => {
    const result = normalizeSharedResult({
        score: 'not-a-number',
        character: '<script>',
        outcome: 'unknown',
    });

    assert.equal(result.score, 0);
    assert.equal(result.character.id, 'designer');
    assert.equal(result.outcome, 'defeat');
});
