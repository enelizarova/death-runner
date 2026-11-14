import {
    ACTIVE_CHARACTER,
    CHASE,
    CONFIG,
    GAME_PHASE,
    getGroundY,
    getPlayerScale,
} from './config.js';

export function readBestScore(storage = globalThis.localStorage) {
    try {
        return Number.parseInt(storage.getItem(CONFIG.storageKey) ?? '0', 10) || 0;
    } catch {
        return 0;
    }
}

export function saveBestScore(score, storage = globalThis.localStorage) {
    try {
        storage.setItem(CONFIG.storageKey, String(Math.floor(score)));
    } catch {
        // Storage may be disabled; that should not make the game unplayable.
    }
}

export function createGameState(
    bestScore = readBestScore(),
    { now = () => performance.now(), random = Math.random, character = ACTIVE_CHARACTER } = {},
) {
    return {
        phase: GAME_PHASE.READY,
        readySince: now(),
        player: {
            y: getGroundY() - character.geometry.anchorHeight * getPlayerScale(),
            velocityY: 0,
            onGround: true,
            animationTime: 0,
            stumbleTimer: 0,
            jumpBufferTimer: 0,
            waitingSeed: random(),
        },
        obstacles: [],
        coins: [],
        impactParticles: [],
        impactStains: [],
        scenery: {
            grassOffset: 0,
            townOffset: 0,
            treeOffset: 0,
            buildingOffset: 0,
            cloudOffset: 0,
        },
        pursuer: {
            distance: CHASE.initialDistance,
        },
        score: 0,
        victoryReached: false,
        missedCoinStreak: 0,
        bestScore,
        speed: CONFIG.initialSpeed,
        spawnTimer: 72,
        coinSpawnTimer: 95,
        collisionTime: 0,
    };
}
