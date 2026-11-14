import assert from 'node:assert/strict';
import test from 'node:test';

import { CONFIG, viewport } from '../src/game/config.js';
import { createSceneRenderer } from '../src/ui/scene-renderer.js';

test('renders scenery layers on independent tracks', () => {
    viewport.width = CONFIG.canvasWidth;
    const townTrack = { style: {} };
    const treeTrack = { style: {} };
    const buildingTrack = { style: {} };
    const cloudTrack = { style: {} };
    const grass = {
        style: {
            setProperty(name, value) {
                this[name] = value;
            },
        },
    };
    const renderer = createSceneRenderer({
        townTrack,
        treeTrack,
        buildingTrack,
        cloudTrack,
        grass,
    });

    renderer.render({
        scenery: {
            grassOffset: 360,
            townOffset: 120,
            treeOffset: 240,
            buildingOffset: 720,
            cloudOffset: 480,
        },
    });

    assert.equal(grass.style['--grass-far-x'], '-180px');
    assert.equal(townTrack.style.transform, 'translate3d(-5%, 0, 0)');
    assert.equal(treeTrack.style.transform, 'translate3d(-10%, 0, 0)');
    assert.equal(buildingTrack.style.transform, 'translate3d(-15%, 0, 0)');
    assert.equal(cloudTrack.style.transform, 'translate3d(-20%, 0, 0)');
    renderer.destroy();
});
