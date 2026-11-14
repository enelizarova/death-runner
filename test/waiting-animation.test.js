import assert from 'node:assert/strict';
import test from 'node:test';

import { designer } from '../src/game/characters/designer.js';
import { getWaitingPose } from '../src/game/animations/waiting.js';

test('plays the configured waiting frames after the initial delay', () => {
    const animation = designer.animations.waiting;

    assert.equal(getWaitingPose(animation, animation.delay - 1, 0.5), animation.restFrame);
    assert.equal(getWaitingPose(animation, animation.delay, 0.5), animation.frames[0]);
    assert.equal(
        getWaitingPose(animation, animation.delay + animation.frameDuration, 0.5),
        animation.frames[1],
    );
});
