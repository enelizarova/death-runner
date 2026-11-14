import assert from 'node:assert/strict';
import test from 'node:test';

import { selectResultCopy } from '../src/content/result-copy.js';

test('selects deterministic result copy from separate outcome sets', () => {
    const firstVictory = selectResultCopy('victory', () => 0);
    const lastVictory = selectResultCopy('victory', () => 0.999);
    const firstDefeat = selectResultCopy('defeat', () => 0);

    assert.notDeepEqual(firstVictory, lastVictory);
    assert.notDeepEqual(firstVictory, firstDefeat);
    assert.ok(firstVictory.title);
    assert.ok(firstVictory.message);
});
