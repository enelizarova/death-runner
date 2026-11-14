import assert from 'node:assert/strict';
import test from 'node:test';

import { createGameState } from '../src/game/state.js';

test('creates state with the default clock', () => {
    const state = createGameState(0, { random: () => 0.5 });

    assert.equal(typeof state.readySince, 'number');
    assert.ok(Number.isFinite(state.readySince));
});

test('uses an injected clock', () => {
    const state = createGameState(0, {
        now: () => 123,
        random: () => 0.5,
    });

    assert.equal(state.readySince, 123);
});

test('uses the selected character geometry', () => {
    const character = { geometry: { anchorHeight: 40 } };
    const state = createGameState(0, {
        character,
        now: () => 0,
        random: () => 0.5,
    });

    assert.equal(state.player.y, 550);
    assert.equal(state.player.jumpBufferTimer, 0);
});
