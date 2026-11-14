import { activeCharacter, characters } from './characters/index.js';

export const GAME_PHASE = Object.freeze({
    READY: 'ready',
    RUNNING: 'running',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory',
});

export const CONFIG = Object.freeze({
    canvasWidth: 1200,
    canvasHeight: 700,
    mobileCanvasWidth: 430,
    mobileLandscapeCanvasWidth: 780,
    mobileMediaQuery: '(max-width: 42.5rem)',
    mobileLandscapeMediaQuery:
        '(orientation: landscape) and (max-width: 59.375rem) and (max-height: 31.25rem)',
    groundY: 590,
    playerX: 270,
    mobilePlayerX: 129,
    mobileLandscapePlayerX: 210,
    mobileObjectScale: 0.82,
    mobileRobotScale: 1.08,
    gravity: 0.72,
    jumpVelocity: -14.2,
    mobileGravity: 0.39525,
    mobileJumpVelocity: -10.2,
    mobileLandscapeGravity: 0.31775,
    mobileLandscapeJumpVelocity: -8.2,
    mobileWorldSpeedScale: 0.58,
    mobileLandscapeWorldSpeedScale: 0.65,
    mobilePursuerDistanceScale: 0.65,
    initialSpeed: 6,
    maxSpeed: 13,
    speedIncrease: 0.0032,
    scoreRate: 0.12,
    jumpBufferDuration: 8,
    victoryScore: 600,
    resultModalDelay: 1000,
    storageKey: 'offline-runner-best-score',
});

export const viewport = {
    width: CONFIG.canvasWidth,
    height: CONFIG.canvasHeight,
    groundY: CONFIG.groundY,
};

export function isCompactViewport() {
    return viewport.width < CONFIG.canvasWidth;
}

export function getPlayerX() {
    if (viewport.width === CONFIG.mobileCanvasWidth) return CONFIG.mobilePlayerX;
    if (viewport.width === CONFIG.mobileLandscapeCanvasWidth) {
        return CONFIG.mobileLandscapePlayerX;
    }
    const extraDesktopWidth = Math.max(0, viewport.width - CONFIG.canvasWidth);
    return CONFIG.playerX + extraDesktopWidth / 2;
}

export function getPlayerScale() {
    return getGameObjectScale();
}

export function getGameObjectScale() {
    return isCompactViewport() ? CONFIG.mobileObjectScale : 1;
}

export function getObstacleScale(obstacleKind) {
    if (obstacleKind === 'robot' && isCompactViewport()) return CONFIG.mobileRobotScale;
    return getGameObjectScale();
}

export function getGroundY() {
    return viewport.groundY;
}

export function getGravity() {
    if (viewport.width === CONFIG.mobileLandscapeCanvasWidth) {
        return CONFIG.mobileLandscapeGravity;
    }
    return isCompactViewport() ? CONFIG.mobileGravity : CONFIG.gravity;
}

export function getJumpVelocity() {
    if (viewport.width === CONFIG.mobileLandscapeCanvasWidth) {
        return CONFIG.mobileLandscapeJumpVelocity;
    }
    return isCompactViewport() ? CONFIG.mobileJumpVelocity : CONFIG.jumpVelocity;
}

export function getCollisionBounceVelocity() {
    return isCompactViewport()
        ? CHASE.mobileCollisionBounceVelocity
        : CHASE.collisionBounceVelocity;
}

export function getRobotBounceVelocity() {
    return isCompactViewport() ? CHASE.mobileRobotBounceVelocity : CHASE.robotBounceVelocity;
}

export function getPursuerDistanceScale() {
    if (!isCompactViewport()) return 1;

    const worldScale = viewport.width / CONFIG.canvasWidth;
    return Math.max(worldScale, CONFIG.mobilePursuerDistanceScale);
}

export function getWorldSpeedScale() {
    if (!isCompactViewport()) return 1;

    const worldScale = viewport.width / CONFIG.canvasWidth;
    if (viewport.width === CONFIG.mobileLandscapeCanvasWidth) {
        return Math.max(worldScale, CONFIG.mobileLandscapeWorldSpeedScale);
    }
    return Math.max(worldScale, CONFIG.mobileWorldSpeedScale);
}

export const SCENE = Object.freeze({
    townOffsetY: 18,
    grassFarSpeedFactor: 0.5,
    townSpeedFactor: 0.035,
    treeSpeedFactor: 0.045,
    buildingSpeedFactor: 0.065,
    cloudSpeedFactor: 0.11,
    roadHeight: 70,
    roadColor: '#7F8296',
    grassColor: '#80A87C',
});

export const COINS = Object.freeze({
    fivePointChance: 0.16,
    minSpawnDelay: 72,
    maxSpawnDelay: 132,
    groundHeight: 58,
    jumpHeight: 128,
    onePointRadius: 13,
    fivePointRadius: 16,
});

export const OBSTACLES = Object.freeze({
    shortDelay: Object.freeze([46, 64]),
    mediumDelay: Object.freeze([78, 112]),
    longDelay: Object.freeze([138, 182]),
    shortChance: 0.3,
    longChance: 0.2,
    maxDifficultyReduction: 0.18,
    minimumGap: 170,
    mobileLandingClearance: 110,
});

export const IMPACT = Object.freeze({
    particleCount: 14,
    particleLifetime: 34,
    stainLifetime: 520,
    gravity: 0.38,
});

export const CHASE = Object.freeze({
    maxLives: 3,
    initialDistance: 210,
    collisionPenalty: 58,
    catchDistance: 50,
    stumbleDuration: 24,
    collisionBounceVelocity: -6.5,
    mobileCollisionBounceVelocity: -3.5,
    robotBounceVelocity: -7,
    mobileRobotBounceVelocity: -5.5,
    robotStompTolerance: 24,
    robotStompHorizontalPadding: 14,
    missedCoinLimit: 4,
});

export const CHARACTERS = characters;
export const ACTIVE_CHARACTER = activeCharacter;
