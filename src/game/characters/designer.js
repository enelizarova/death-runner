// @ts-check

const assetPath = './assets/characters/designer';

/** @type {import('../../types/game.js').Character} */
export const designer = Object.freeze({
    id: 'designer',
    presentation: Object.freeze({
        name: 'Дизайнер',
        description: 'Быстро бежит от бесконечных правок',
        preview: './assets/characters/start/designer.svg',
        success: `${assetPath}/success.svg`,
    }),
    geometry: Object.freeze({
        anchorHeight: 98,
        endOffsetX: -22,
        jumpShadowReferenceHeight: 130,
        hitbox: Object.freeze({
            offsetX: 12,
            offsetY: 7,
            width: 37,
            height: 81,
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
        runAShadow: `${assetPath}/run-shadow.svg`,
        runBShadow: `${assetPath}/run1-shadow.svg`,
        jumpShadow: `${assetPath}/jump-shadow.svg`,
        caughtShadow: `${assetPath}/caught-shadow.svg`,
    }),
    sizes: Object.freeze({
        waiting1: { width: 65, height: 120 },
        waiting2: { width: 65, height: 120 },
        run1: { width: 69, height: 103 },
        run2: { width: 61, height: 103 },
        run3: { width: 66, height: 103 },
        run4: { width: 61, height: 103 },
        jump: { width: 66, height: 100 },
        caught: { width: 76, height: 89 },
        end: { width: 112, height: 52 },
    }),
    shadows: Object.freeze({
        byPose: Object.freeze({
            waiting1: 'runAShadow',
            waiting2: 'runAShadow',
            run1: 'runAShadow',
            run2: 'runAShadow',
            run3: 'runBShadow',
            run4: 'runBShadow',
            jump: 'jumpShadow',
            caught: 'caughtShadow',
        }),
        sizes: Object.freeze({
            waiting1: { width: 51, height: 3 },
            waiting2: { width: 51, height: 3 },
            run1: { width: 51, height: 3 },
            run2: { width: 51, height: 3 },
            run3: { width: 51, height: 9 },
            run4: { width: 51, height: 9 },
            jump: { width: 35, height: 9 },
            caught: { width: 35, height: 9 },
        }),
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
