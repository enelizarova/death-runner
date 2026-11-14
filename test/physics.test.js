import assert from 'node:assert/strict';
import test from 'node:test';

import {
    ACTIVE_CHARACTER,
    CHASE,
    COINS,
    CONFIG,
    OBSTACLES,
    SCENE,
    getCollisionBounceVelocity,
    getGravity,
    getGameObjectScale,
    getGroundY,
    getJumpVelocity,
    getObstacleScale,
    getPlayerScale,
    getPlayerX,
    getPursuerDistanceScale,
    getRobotBounceVelocity,
    getWorldSpeedScale,
    isCompactViewport,
    viewport,
} from '../src/game/config.js';
import { getObstacleType, obstacleTypes, selectObstacleType } from '../src/game/obstacles/index.js';
import { createPhysics } from '../src/game/physics.js';
import { createGameState } from '../src/game/state.js';

function createState() {
    viewport.width = CONFIG.canvasWidth;
    viewport.groundY = CONFIG.groundY;
    return createGameState(0, { now: () => 0, random: () => 0.5 });
}

function keepSpawnersIdle(game) {
    game.spawnTimer = Number.POSITIVE_INFINITY;
    game.coinSpawnTimer = Number.POSITIVE_INFINITY;
}

test('collects a coin using the configured character hitbox', () => {
    const game = createState();
    const hitbox = ACTIVE_CHARACTER.geometry.hitbox;
    keepSpawnersIdle(game);
    game.coins.push({
        x: getPlayerX() + hitbox.offsetX + hitbox.width / 2,
        y: game.player.y + hitbox.offsetY + hitbox.height / 2,
        radius: 10,
        value: 5,
        phase: 0,
    });

    const result = createPhysics({ random: () => 0.5 }).update(game, 0);

    assert.equal(result.collectedPoints, 5);
    assert.equal(game.score, 5);
    assert.equal(game.coins.length, 0);
});

test('recovers from a non-finite score before updating the game', () => {
    const game = createState();
    keepSpawnersIdle(game);
    game.score = Number.NaN;
    game.bestScore = Number.NaN;

    createPhysics({ random: () => 0.5 }).update(game, 0);

    assert.equal(game.score, 0);
    assert.equal(game.bestScore, 0);
});

test('moves foreground scenery faster than the town', () => {
    const game = createState();
    keepSpawnersIdle(game);

    createPhysics({ random: () => 0.5 }).update(game, 1);

    assert.equal(game.scenery.grassOffset, game.speed);
    assert.equal(game.scenery.townOffset, game.speed * SCENE.townSpeedFactor);
    assert.equal(game.scenery.treeOffset, game.speed * SCENE.treeSpeedFactor);
    assert.equal(game.scenery.buildingOffset, game.speed * SCENE.buildingSpeedFactor);
    assert.ok(game.scenery.treeOffset > game.scenery.townOffset);
    assert.ok(game.scenery.buildingOffset > game.scenery.treeOffset);
});

test('a manager collision costs a life without reducing the score', () => {
    const game = createState();
    const hitbox = ACTIVE_CHARACTER.geometry.hitbox;
    const manager = getObstacleType('manager');
    keepSpawnersIdle(game);
    game.score = 75;
    game.obstacles.push({
        type: manager.id,
        x: getPlayerX() + hitbox.offsetX - manager.hitbox.offsetX,
        y: game.player.y + hitbox.offsetY - manager.hitbox.offsetY,
        poseOffset: 0,
        opened: false,
    });

    const result = createPhysics({ random: () => 0.5 }).update(game, 0);

    assert.equal(result.hitObstacle, true);
    assert.equal(game.score, 75);
    assert.equal(game.pursuer.distance, CHASE.initialDistance - CHASE.collisionPenalty);
    assert.equal(game.obstacles.length, 0);
    assert.ok(game.impactParticles.length > 0);
    assert.ok(game.impactStains.length > 0);
});

test('penalizes the player after the configured number of missed coins', () => {
    const game = createState();
    keepSpawnersIdle(game);
    game.coins = Array.from({ length: CHASE.missedCoinLimit }, () => ({
        x: -30,
        y: 0,
        radius: 5,
        value: 1,
        phase: 0,
    }));

    const result = createPhysics({ random: () => 0.5 }).update(game, 0);

    assert.equal(result.missedCoinPenalty, 1);
    assert.equal(game.missedCoinStreak, 0);
    assert.equal(game.pursuer.distance, CHASE.initialDistance - CHASE.collisionPenalty);
});

test('does not restore a life at a score threshold', () => {
    const game = createState();
    keepSpawnersIdle(game);
    game.score = 100;
    game.pursuer.distance = CHASE.initialDistance - CHASE.collisionPenalty;

    const result = createPhysics({ random: () => 0.5 }).update(game, 0);

    assert.equal(result.recoveredLife, false);
    assert.equal(game.pursuer.distance, CHASE.initialDistance - CHASE.collisionPenalty);
});

test('opens a robot and restores one life when the player lands on it', () => {
    const game = createState();
    const playerHitbox = ACTIVE_CHARACTER.geometry.hitbox;
    const robot = getObstacleType('robot');
    keepSpawnersIdle(game);
    game.pursuer.distance = CHASE.initialDistance - CHASE.collisionPenalty;
    const robotY = getGroundY() - robot.size.height;
    const robotHitboxTop = robotY + robot.hitbox.offsetY;
    game.player.y = robotHitboxTop - playerHitbox.offsetY - playerHitbox.height;
    game.player.velocityY = 1;
    game.player.onGround = false;
    game.obstacles.push({
        type: robot.id,
        x: getPlayerX() + playerHitbox.offsetX - robot.hitbox.offsetX,
        y: robotY,
        poseOffset: 0,
        opened: false,
    });

    const result = createPhysics({ random: () => 0.5 }).update(game, 2);

    assert.equal(result.openedRobot, true);
    assert.equal(result.recoveredLife, true);
    assert.equal(result.hitObstacle, false);
    assert.equal(game.pursuer.distance, CHASE.initialDistance);
    assert.equal(game.obstacles[0].opened, true);
    assert.equal(game.player.velocityY, CHASE.robotBounceVelocity);
});

test('forgives a slightly missed robot stomp near its edge', () => {
    const game = createState();
    const playerHitbox = ACTIVE_CHARACTER.geometry.hitbox;
    const robot = getObstacleType('robot');
    keepSpawnersIdle(game);
    const robotY = getGroundY() - robot.size.height;
    const robotHitboxTop = robotY + robot.hitbox.offsetY;
    game.player.y = robotHitboxTop - playerHitbox.offsetY - playerHitbox.height;
    game.player.velocityY = 1;
    game.player.onGround = false;
    game.obstacles.push({
        type: robot.id,
        x: getPlayerX() + playerHitbox.offsetX + playerHitbox.width + 6 - robot.hitbox.offsetX,
        y: robotY,
        poseOffset: 0,
        opened: false,
    });

    const result = createPhysics({ random: () => 0.5 }).update(game, 2);

    assert.equal(result.openedRobot, true);
    assert.equal(result.hitObstacle, false);
});

test('a side collision with a robot applies damage', () => {
    const game = createState();
    const hitbox = ACTIVE_CHARACTER.geometry.hitbox;
    const robot = getObstacleType('robot');
    keepSpawnersIdle(game);
    game.score = 75;
    game.obstacles.push({
        type: robot.id,
        x: getPlayerX() + hitbox.offsetX - robot.hitbox.offsetX,
        y: game.player.y + hitbox.offsetY - robot.hitbox.offsetY,
        poseOffset: 0,
        opened: false,
    });

    const result = createPhysics({ random: () => 0.5 }).update(game, 0);

    assert.equal(result.hitObstacle, true);
    assert.equal(result.openedRobot, false);
    assert.equal(game.score, 75);
    assert.equal(game.pursuer.distance, CHASE.initialDistance - CHASE.collisionPenalty);
    assert.equal(game.obstacles.length, 0);
    assert.equal(game.impactParticles.length, 0);
    assert.equal(game.impactStains.length, 0);
});

test('uses the injected random source when spawning obstacles', () => {
    const game = createState();
    game.spawnTimer = 0;
    game.coinSpawnTimer = Number.POSITIVE_INFINITY;

    createPhysics({ random: () => 0 }).update(game, 0);

    assert.equal(game.obstacles.length, 1);
    assert.equal(game.obstacles[0].type, 'manager');
    assert.equal(game.obstacles[0].y, getGroundY() - getObstacleType('manager').size.height);
    assert.equal(game.spawnTimer, 46);
});

test('keeps a safe obstacle gap on the mobile viewport', () => {
    const game = createState();
    viewport.width = CONFIG.mobileCanvasWidth;
    game.spawnTimer = 0;
    game.coinSpawnTimer = Number.POSITIVE_INFINITY;

    createPhysics({ random: () => 0 }).update(game, 0);

    const horizontalSpeed = game.speed * getWorldSpeedScale();
    const maximumObstacleWidth = Math.max(
        ...obstacleTypes.map((type) => type.size.width * getObstacleScale(type.kind)),
    );
    const spawnDistance = horizontalSpeed * game.spawnTimer;
    const jumpDuration = (-2 * getJumpVelocity()) / getGravity();
    const jumpDistance = horizontalSpeed * jumpDuration;
    const objectScale = getGameObjectScale();

    assert.ok(spawnDistance >= maximumObstacleWidth + OBSTACLES.minimumGap * objectScale);
    assert.ok(spawnDistance >= jumpDistance + OBSTACLES.mobileLandingClearance * objectScale);
    assert.equal(
        game.obstacles[0].y,
        getGroundY() - getObstacleType('manager').size.height * objectScale,
    );
    assert.ok(game.spawnTimer > 46);
});

test('keeps landing room between mobile obstacles at maximum speed', () => {
    const game = createState();
    viewport.width = CONFIG.mobileCanvasWidth;
    game.speed = CONFIG.maxSpeed;
    game.spawnTimer = 0;
    game.coinSpawnTimer = Number.POSITIVE_INFINITY;

    createPhysics({ random: () => 0 }).update(game, 0);

    const horizontalSpeed = game.speed * getWorldSpeedScale();
    const jumpDuration = (-2 * getJumpVelocity()) / getGravity();
    const spawnDistance = horizontalSpeed * game.spawnTimer;

    assert.ok(
        spawnDistance >=
            horizontalSpeed * jumpDuration +
                OBSTACLES.mobileLandingClearance * getGameObjectScale(),
    );
});

test('scales mobile coins together with the rest of the game world', () => {
    const game = createState();
    viewport.width = CONFIG.mobileCanvasWidth;
    game.spawnTimer = Number.POSITIVE_INFINITY;
    game.coinSpawnTimer = 0;

    createPhysics({ random: () => 0 }).update(game, 0);

    assert.equal(game.coins.length, 1);
    assert.equal(game.coins[0].radius, COINS.fivePointRadius * getGameObjectScale());
    assert.equal(game.coins[0].y, getGroundY() - COINS.jumpHeight * getGameObjectScale());
});

test('uses a longer jump and a safer pursuer offset on mobile', () => {
    viewport.width = CONFIG.canvasWidth;
    const desktopFlightDuration = (-2 * getJumpVelocity()) / getGravity();
    const desktopJumpHeight = getJumpVelocity() ** 2 / (2 * getGravity());
    const desktopJumpDistance = desktopFlightDuration * CONFIG.initialSpeed * getWorldSpeedScale();
    const desktopPursuerScale = getPursuerDistanceScale();

    viewport.width = CONFIG.mobileCanvasWidth;
    const mobileFlightDuration = (-2 * getJumpVelocity()) / getGravity();
    const mobileJumpHeight = getJumpVelocity() ** 2 / (2 * getGravity());
    const mobileJumpDistance = mobileFlightDuration * CONFIG.initialSpeed * getWorldSpeedScale();

    assert.ok(mobileFlightDuration > desktopFlightDuration * 1.25);
    assert.ok(mobileJumpHeight < desktopJumpHeight);
    assert.ok(mobileJumpDistance > desktopJumpDistance * 0.7);
    assert.ok(mobileJumpDistance < desktopJumpDistance * 0.85);
    assert.equal(desktopPursuerScale, 1);
    assert.equal(getPursuerDistanceScale(), CONFIG.mobilePursuerDistanceScale);
});

test('uses the compact mobile physics profile in phone landscape mode', () => {
    viewport.width = CONFIG.mobileLandscapeCanvasWidth;

    assert.equal(isCompactViewport(), true);
    assert.equal(getPlayerX(), CONFIG.mobileLandscapePlayerX);
    assert.equal(getPlayerScale(), CONFIG.mobileObjectScale);
    assert.equal(getGameObjectScale(), CONFIG.mobileObjectScale);
    assert.equal(getGravity(), CONFIG.mobileLandscapeGravity);
    assert.equal(getJumpVelocity(), CONFIG.mobileLandscapeJumpVelocity);
    assert.equal(getWorldSpeedScale(), CONFIG.mobileLandscapeWorldSpeedScale);
    assert.equal(getPursuerDistanceScale(), CONFIG.mobileLandscapeCanvasWidth / CONFIG.canvasWidth);
});

test('keeps game objects full size on desktop and scales all mobile layouts', () => {
    viewport.width = CONFIG.canvasWidth;
    assert.equal(getPlayerScale(), 1);
    assert.equal(getGameObjectScale(), 1);
    assert.equal(getCollisionBounceVelocity(), CHASE.collisionBounceVelocity);
    assert.equal(getRobotBounceVelocity(), CHASE.robotBounceVelocity);

    viewport.width = CONFIG.canvasWidth * 1.6;
    assert.equal(isCompactViewport(), false);
    assert.equal(
        getPlayerX(),
        CONFIG.playerX + (CONFIG.canvasWidth * 1.6 - CONFIG.canvasWidth) / 2,
    );
    assert.equal(getPlayerScale(), 1);
    assert.equal(getGameObjectScale(), 1);
    assert.equal(getWorldSpeedScale(), 1);
    assert.equal(getPursuerDistanceScale(), 1);

    viewport.width = CONFIG.mobileCanvasWidth;
    assert.equal(getPlayerScale(), CONFIG.mobileObjectScale);
    assert.equal(getGameObjectScale(), CONFIG.mobileObjectScale);
    assert.equal(getObstacleScale('manager'), CONFIG.mobileObjectScale);
    assert.equal(getObstacleScale('robot'), CONFIG.mobileRobotScale);
    assert.equal(getCollisionBounceVelocity(), CHASE.mobileCollisionBounceVelocity);
    assert.equal(getRobotBounceVelocity(), CHASE.mobileRobotBounceVelocity);

    viewport.width = CONFIG.mobileLandscapeCanvasWidth;
    assert.equal(getPlayerScale(), CONFIG.mobileObjectScale);
    assert.equal(getGameObjectScale(), CONFIG.mobileObjectScale);
    assert.equal(getObstacleScale('manager'), CONFIG.mobileObjectScale);
    assert.equal(getObstacleScale('robot'), CONFIG.mobileRobotScale);
    assert.equal(getCollisionBounceVelocity(), CHASE.mobileCollisionBounceVelocity);
    assert.equal(getRobotBounceVelocity(), CHASE.mobileRobotBounceVelocity);
});

test('keeps the landscape jump distance while lowering its arc', () => {
    viewport.width = CONFIG.mobileCanvasWidth;
    const portraitDuration = (-2 * getJumpVelocity()) / getGravity();
    const portraitHeight = getJumpVelocity() ** 2 / (2 * getGravity());

    viewport.width = CONFIG.mobileLandscapeCanvasWidth;
    const landscapeDuration = (-2 * getJumpVelocity()) / getGravity();
    const landscapeHeight = getJumpVelocity() ** 2 / (2 * getGravity());

    assert.ok(Math.abs(landscapeDuration - portraitDuration) < 1e-9);
    assert.ok(landscapeHeight < portraitHeight * 0.85);
});

test('keeps a safe obstacle gap on a landscape phone', () => {
    const game = createState();
    viewport.width = CONFIG.mobileLandscapeCanvasWidth;
    game.spawnTimer = 0;
    game.coinSpawnTimer = Number.POSITIVE_INFINITY;

    createPhysics({ random: () => 0 }).update(game, 0);

    const horizontalSpeed = game.speed * getWorldSpeedScale();
    const jumpDuration = (-2 * getJumpVelocity()) / getGravity();
    const spawnDistance = horizontalSpeed * game.spawnTimer;

    assert.ok(
        spawnDistance >=
            horizontalSpeed * jumpDuration +
                OBSTACLES.mobileLandingClearance * getGameObjectScale(),
    );
});

test('takes one life after four consecutively missed coins', () => {
    assert.equal(CHASE.missedCoinLimit, 4);
});

test('spawns robots in the rare tenth of the obstacle distribution', () => {
    assert.equal(selectObstacleType(() => 0.89).id, 'manager');
    assert.equal(selectObstacleType(() => 0.91).id, 'robot');
});
