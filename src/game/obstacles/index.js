// @ts-check

const assetPath = './assets/characters/barrier';

const manager = Object.freeze({
    id: 'manager',
    kind: 'manager',
    frameKeys: Object.freeze([
        'obstacleManager1',
        'obstacleManager2',
        'obstacleManager3',
        'obstacleManager4',
    ]),
    frameDuration: 8,
    assets: Object.freeze({
        obstacleManager1: `${assetPath}/manager-1.svg`,
        obstacleManager2: `${assetPath}/manager-2.svg`,
        obstacleManager3: `${assetPath}/manager-3.svg`,
        obstacleManager4: `${assetPath}/manager-4.svg`,
    }),
    weight: 9,
    size: Object.freeze({
        width: 63,
        height: 103,
    }),
    hitbox: Object.freeze({
        offsetX: 8,
        offsetY: 8,
        width: 47,
        height: 86,
    }),
});

const robot = Object.freeze({
    id: 'robot',
    kind: 'robot',
    assetKey: 'obstacleRobot',
    openAssetKey: 'obstacleRobotOpen',
    assets: Object.freeze({
        obstacleRobot: `${assetPath}/robot.svg`,
        obstacleRobotOpen: `${assetPath}/robot-open.svg`,
    }),
    weight: 1,
    size: Object.freeze({
        width: 67,
        height: 67,
    }),
    closedSize: Object.freeze({
        width: 67,
        height: 64,
    }),
    hitbox: Object.freeze({
        offsetX: 4,
        offsetY: 19,
        width: 59,
        height: 45,
    }),
});

export const obstacleTypes = Object.freeze([manager, robot]);

export const obstacleAssets = Object.freeze(
    Object.assign({}, ...obstacleTypes.map((type) => type.assets)),
);

/** @param {string} typeId */
export function getObstacleType(typeId) {
    return obstacleTypes.find((type) => type.id === typeId) ?? manager;
}

export function selectObstacleType(random = Math.random) {
    const totalWeight = obstacleTypes.reduce((total, type) => total + type.weight, 0);
    let roll = random() * totalWeight;

    for (const type of obstacleTypes) {
        roll -= type.weight;
        if (roll <= 0) return type;
    }

    return obstacleTypes.at(-1) ?? manager;
}
