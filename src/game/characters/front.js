// @ts-check

const assetPath = './assets/characters/front';

/** @type {import('../../types/game.js').Character} */
export const front = Object.freeze({
    id: 'front',
    presentation: Object.freeze({
        name: 'Фронт',
        description: 'Перепрыгивает баги и горящие дедлайны',
        preview: './assets/characters/start/front.svg',
    }),
    geometry: Object.freeze({
        anchorHeight: 113,
        endOffsetX: -39,
        jumpShadowReferenceHeight: 130,
        hitbox: Object.freeze({
            offsetX: 9,
            offsetY: 8,
            width: 38,
            height: 99,
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
        runShadow: `${assetPath}/run1-shadow.svg`,
        jumpShadow: `${assetPath}/jump-shadow.svg`,
        caughtShadow: `${assetPath}/caught-shadow.svg`,
    }),
    sizes: Object.freeze({
        waiting1: { width: 55, height: 121 },
        waiting2: { width: 55, height: 120 },
        run1: { width: 68, height: 119 },
        run2: { width: 70, height: 119 },
        run3: { width: 70, height: 119 },
        run4: { width: 70, height: 119 },
        jump: { width: 70, height: 95 },
        caught: { width: 73, height: 106 },
        end: { width: 133, height: 52 },
    }),
    shadows: Object.freeze({
        byPose: Object.freeze({
            waiting1: 'runShadow',
            waiting2: 'runShadow',
            run1: 'runShadow',
            run2: 'runShadow',
            run3: 'runShadow',
            run4: 'runShadow',
            jump: 'jumpShadow',
            caught: 'caughtShadow',
        }),
        sizes: Object.freeze({
            waiting1: { width: 44, height: 9 },
            waiting2: { width: 44, height: 9 },
            run1: { width: 44, height: 9 },
            run2: { width: 44, height: 9 },
            run3: { width: 44, height: 9 },
            run4: { width: 44, height: 9 },
            jump: { width: 44, height: 9 },
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
