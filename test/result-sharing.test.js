import assert from 'node:assert/strict';
import test from 'node:test';

import { shareOrCopyResult } from '../src/services/result-sharing.js';

const shareData = {
    title: 'Нейросеть или ты',
    text: 'Результат',
    url: 'https://runner.example/api/result?score=42',
};

test('copies only the result link on desktop even when Web Share exists', async () => {
    const calls = [];
    const result = await shareOrCopyResult(shareData, {
        navigatorObject: {
            maxTouchPoints: 0,
            share: async () => calls.push('share'),
            clipboard: {
                writeText: async (value) => calls.push(value),
            },
        },
        matchMedia: () => ({ matches: false }),
        isSecureContext: true,
    });

    assert.equal(result, 'copied');
    assert.deepEqual(calls, [shareData.url]);
});

test('opens native sharing on a touch device', async () => {
    const calls = [];
    const result = await shareOrCopyResult(shareData, {
        navigatorObject: {
            maxTouchPoints: 1,
            canShare: () => true,
            share: async (value) => calls.push(value),
        },
        matchMedia: () => ({ matches: true }),
        isSecureContext: true,
    });

    assert.equal(result, 'shared');
    assert.deepEqual(calls, [shareData]);
});

test('uses selection copying when Clipboard API is unavailable', async () => {
    let copiedText = '';
    const textarea = {
        value: '',
        style: {},
        focus() {},
        select() {},
        setSelectionRange() {},
        setAttribute() {},
        remove() {},
    };
    const result = await shareOrCopyResult(shareData, {
        navigatorObject: { maxTouchPoints: 0 },
        documentObject: {
            body: { appendChild() {} },
            createElement: () => textarea,
            execCommand: () => {
                copiedText = textarea.value;
                return true;
            },
        },
        matchMedia: () => ({ matches: false }),
        isSecureContext: false,
    });

    assert.equal(result, 'copied');
    assert.equal(copiedText, shareData.url);
});
