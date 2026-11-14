// @ts-check

const assetPath = './assets/characters/developer';

/** @type {import('../../types/game.js').Character} */
export const developer = Object.freeze({
    id: 'developer',
    presentation: Object.freeze({
        name: 'Разраб',
        description: 'Убегает от легаси и бесконечных созвонов',
        preview: './assets/characters/start/developer.svg',
        success: `${assetPath}/success.svg`,
    }),
    geometry: Object.freeze({
        anchorHeight: 104,
        endOffsetX: -23,
        jumpShadowReferenceHeight: 130,
        hitbox: Object.freeze({
            offsetX: 8,
            offsetY: 6,
            width: 37,
            height: 92,
        }),
    }),
    assets: Object.freeze({
        waiting1: `${assetPath}/waiting-1.svg`,
        waiting2: `${assetPath}/waiting-2.svg`,
        run1: `${assetPath}/run-1.svg`,
        run2: `${assetPath}/run-2.svg`,
        run3: `${assetPath}/run-3.svg`,
        run4: `${assetPath}/run-4.svg`,
        jump: `${assetPath}/jump.svg`,
        caught: `${assetPath}/caught.svg`,
        end: `${assetPath}/end.svg`,
    }),
    sizes: Object.freeze({
        waiting1: { width: 53, height: 120 },
        waiting2: { width: 53, height: 120 },
        run1: { width: 67, height: 104 },
        run2: { width: 67, height: 104 },
        run3: { width: 66, height: 104 },
        run4: { width: 67, height: 104 },
        jump: { width: 67, height: 90 },
        caught: { width: 62, height: 96 },
        end: { width: 98, height: 44 },
    }),
    shadows: Object.freeze({
        byPose: Object.freeze({}),
        sizes: Object.freeze({}),
    }),
    animations: Object.freeze({
        run: Object.freeze({
            frames: Object.freeze(['run1', 'run2', 'run3', 'run4']),
            frameDuration: 8,
            maximumPlaybackRate: 1.18,
        }),
        waiting: Object.freeze({
            delay: 500,
            frames: Object.freeze(['waiting1', 'waiting2']),
            frameDuration: 180,
            repetitionRange: Object.freeze(/** @type {const} */ ([2, 5])),
            restFrame: 'waiting1',
            pauseDuration: Object.freeze(/** @type {const} */ ([1800, 3200])),
        }),
    }),
});
