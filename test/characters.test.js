import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { characters } from '../src/game/characters/index.js';

function readAssetSize(source) {
    const filePath = resolve('public', source.replace(/^\.\//, ''));
    const markup = readFileSync(filePath, 'utf8');
    const width = Number(markup.match(/<svg[^>]*\bwidth="([\d.]+)"/)?.[1]);
    const height = Number(markup.match(/<svg[^>]*\bheight="([\d.]+)"/)?.[1]);

    assert.ok(width > 0, `${source}: intrinsic width`);
    assert.ok(height > 0, `${source}: intrinsic height`);
    return { width, height };
}

test('registers every playable character with complete pose assets', () => {
    assert.deepEqual(Object.keys(characters), ['designer', 'front', 'developer']);

    for (const character of Object.values(characters)) {
        const poses = new Set([
            ...character.animations.waiting.frames,
            ...character.animations.run.frames,
            'jump',
            'caught',
            'end',
        ]);

        for (const pose of poses) {
            assert.equal(typeof character.assets[pose], 'string', `${character.id}: ${pose} asset`);
            assert.ok(character.sizes[pose].width > 0, `${character.id}: ${pose} width`);
            assert.ok(character.sizes[pose].height > 0, `${character.id}: ${pose} height`);
            assert.deepEqual(
                character.sizes[pose],
                readAssetSize(character.assets[pose]),
                `${character.id}: ${pose} configured size`,
            );
        }

        for (const [pose, shadowName] of Object.entries(character.shadows.byPose)) {
            assert.deepEqual(
                character.shadows.sizes[pose],
                readAssetSize(character.assets[shadowName]),
                `${character.id}: ${pose} shadow size`,
            );
        }

        readAssetSize(character.presentation.preview);
        if (character.presentation.success) readAssetSize(character.presentation.success);
    }
});
