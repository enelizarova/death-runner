import assert from 'node:assert/strict';
import test from 'node:test';

import { designer } from '../src/game/characters/designer.js';
import { GAME_PHASE } from '../src/game/config.js';
import { Game } from '../src/game/game.js';

test('shows victory only once and then continues until defeat', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const shownResults = [];

    Object.defineProperties(globalThis, {
        localStorage: {
            configurable: true,
            value: {
                getItem() {
                    return null;
                },
                setItem() {},
            },
        },
        window: {
            configurable: true,
            value: {
                clearTimeout() {},
                setTimeout(callback) {
                    callback();
                    return 1;
                },
            },
        },
    });

    try {
        const game = new Game({
            character: designer,
            renderer: {},
            resultModal: {
                hide() {},
                show(result) {
                    shownResults.push(result);
                },
            },
            sceneRenderer: {},
            setStatus() {},
        });

        game.jump();
        game.update(3000);
        assert.equal(shownResults.length, 1);
        assert.equal(shownResults[0].outcome, 'victory');

        game.continueRun();
        game.update(3000);
        assert.equal(shownResults.length, 1);

        game.finish(GAME_PHASE.GAME_OVER);
        assert.equal(shownResults.length, 2);
        assert.equal(shownResults[1].outcome, 'defeat');
    } finally {
        if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
        else delete globalThis.window;
        if (originalLocalStorage) {
            Object.defineProperty(globalThis, 'localStorage', originalLocalStorage);
        } else {
            delete globalThis.localStorage;
        }
    }
});

test('reports ready and running phase changes', () => {
    const phases = [];
    const game = new Game({
        character: designer,
        renderer: {},
        resultModal: {
            hide() {},
        },
        sceneRenderer: {},
        setPhase(phase) {
            phases.push(phase);
        },
        setStatus() {},
    });

    game.restart();
    game.jump();

    assert.deepEqual(phases, ['ready', 'running']);
});

test('buffers a jump pressed shortly before landing', () => {
    const originalRequestAnimationFrame = Object.getOwnPropertyDescriptor(
        globalThis,
        'requestAnimationFrame',
    );
    let renderedState;

    Object.defineProperty(globalThis, 'requestAnimationFrame', {
        configurable: true,
        value() {
            return 1;
        },
    });

    try {
        const game = new Game({
            character: designer,
            renderer: {
                render(state) {
                    renderedState = state;
                },
            },
            resultModal: { hide() {} },
            sceneRenderer: { render() {} },
            setStatus() {},
        });

        game.jump();
        for (let frame = 0; frame < 33; frame += 1) game.update(1);
        game.jump();
        for (let frame = 0; frame < 6; frame += 1) game.update(1);
        game.loop(100);

        assert.equal(renderedState.player.onGround, false);
        assert.ok(renderedState.player.velocityY < 0);
    } finally {
        if (originalRequestAnimationFrame) {
            Object.defineProperty(
                globalThis,
                'requestAnimationFrame',
                originalRequestAnimationFrame,
            );
        } else {
            delete globalThis.requestAnimationFrame;
        }
    }
});

test('pauses rendering when the result opens and resumes after restart', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const originalRequestAnimationFrame = Object.getOwnPropertyDescriptor(
        globalThis,
        'requestAnimationFrame',
    );
    const originalCancelAnimationFrame = Object.getOwnPropertyDescriptor(
        globalThis,
        'cancelAnimationFrame',
    );
    let resultCallback = () => {};
    let requestCount = 0;
    const cancelledFrames = [];

    Object.defineProperties(globalThis, {
        cancelAnimationFrame: {
            configurable: true,
            value(frameId) {
                cancelledFrames.push(frameId);
            },
        },
        localStorage: {
            configurable: true,
            value: {
                getItem() {
                    return null;
                },
                setItem() {},
            },
        },
        requestAnimationFrame: {
            configurable: true,
            value() {
                requestCount += 1;
                return requestCount;
            },
        },
        window: {
            configurable: true,
            value: {
                clearTimeout() {},
                setTimeout(callback) {
                    resultCallback = callback;
                    return 1;
                },
            },
        },
    });

    try {
        const game = new Game({
            character: designer,
            renderer: {},
            resultModal: {
                hide() {},
                show() {},
            },
            sceneRenderer: {},
            setStatus() {},
        });

        game.start();
        assert.equal(requestCount, 1);

        game.finish(GAME_PHASE.GAME_OVER);
        resultCallback();
        assert.deepEqual(cancelledFrames, [1]);

        game.restart();
        assert.equal(requestCount, 2);
        game.stop();
    } finally {
        const restore = (name, descriptor) => {
            if (descriptor) Object.defineProperty(globalThis, name, descriptor);
            else delete globalThis[name];
        };

        restore('window', originalWindow);
        restore('localStorage', originalLocalStorage);
        restore('requestAnimationFrame', originalRequestAnimationFrame);
        restore('cancelAnimationFrame', originalCancelAnimationFrame);
    }
});
