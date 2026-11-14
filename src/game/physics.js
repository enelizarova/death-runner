import {
    ACTIVE_CHARACTER,
    CHASE,
    COINS,
    CONFIG,
    IMPACT,
    OBSTACLES,
    SCENE,
    getGravity,
    getGameObjectScale,
    getCollisionBounceVelocity,
    getGroundY,
    getJumpVelocity,
    getObstacleScale,
    getPlayerScale,
    getPlayerX,
    getRobotBounceVelocity,
    getWorldSpeedScale,
    isCompactViewport,
    viewport,
} from './config.js';
import { getObstacleType, obstacleTypes, selectObstacleType } from './obstacles/index.js';

export function createPhysics({ random = Math.random, character = ACTIVE_CHARACTER } = {}) {
    function getHorizontalSpeed(game) {
        return game.speed * getWorldSpeedScale();
    }

    function randomBetween([minimum, maximum]) {
        return minimum + random() * (maximum - minimum);
    }

    function getNextObstacleDelay(game) {
        const objectScale = getGameObjectScale();
        const roll = random();
        let range = OBSTACLES.mediumDelay;

        if (roll < OBSTACLES.shortChance) {
            range = OBSTACLES.shortDelay;
        } else if (roll > 1 - OBSTACLES.longChance) {
            range = OBSTACLES.longDelay;
        }

        const difficultyProgress =
            (game.speed - CONFIG.initialSpeed) / (CONFIG.maxSpeed - CONFIG.initialSpeed);
        const difficultyMultiplier =
            1 - Math.max(0, difficultyProgress) * OBSTACLES.maxDifficultyReduction;

        const difficultyDelay = randomBetween(range) * difficultyMultiplier;
        const maximumObstacleWidth = Math.max(
            ...obstacleTypes.map((type) => type.size.width * getObstacleScale(type.kind)),
        );
        let minimumSafeDistance = maximumObstacleWidth + OBSTACLES.minimumGap * objectScale;

        if (isCompactViewport()) {
            const jumpDuration = (-2 * getJumpVelocity()) / getGravity();
            const jumpDistance = getHorizontalSpeed(game) * jumpDuration;
            minimumSafeDistance = Math.max(
                minimumSafeDistance,
                jumpDistance + OBSTACLES.mobileLandingClearance * objectScale,
            );
        }

        const minimumSafeDelay = minimumSafeDistance / getHorizontalSpeed(game);

        return Math.max(difficultyDelay, minimumSafeDelay);
    }

    function spawnObstacle(game) {
        const obstacleType = selectObstacleType(random);
        const groundY = getGroundY();
        const objectScale = getGameObjectScale();
        const obstacleScale = getObstacleScale(obstacleType.kind);

        game.obstacles.push({
            type: obstacleType.id,
            x: viewport.width + 16 * objectScale,
            y: groundY - obstacleType.size.height * obstacleScale,
            poseOffset: random() * Math.PI * 2,
            opened: false,
        });

        game.spawnTimer = getNextObstacleDelay(game);
    }

    function spawnCoin(game) {
        const objectScale = getGameObjectScale();
        const value = random() < COINS.fivePointChance ? 5 : 1;
        const radius = (value === 5 ? COINS.fivePointRadius : COINS.onePointRadius) * objectScale;
        const height = (random() < 0.58 ? COINS.jumpHeight : COINS.groundHeight) * objectScale;

        game.coins.push({
            x: viewport.width + radius,
            y: getGroundY() - height,
            radius,
            value,
            phase: random() * Math.PI * 2,
        });

        game.coinSpawnTimer =
            COINS.minSpawnDelay + random() * (COINS.maxSpawnDelay - COINS.minSpawnDelay);
    }

    function updateObstacles(game, delta) {
        const horizontalSpeed = getHorizontalSpeed(game);
        game.spawnTimer -= delta;
        if (game.spawnTimer <= 0) spawnObstacle(game);

        game.obstacles.forEach((obstacle) => {
            obstacle.x -= horizontalSpeed * delta;
            obstacle.poseOffset += delta;
        });
        game.obstacles = game.obstacles.filter((obstacle) => {
            const obstacleType = getObstacleType(obstacle.type);
            return obstacle.x + obstacleType.size.width * getObstacleScale(obstacleType.kind) > -12;
        });
    }

    function createObstacleImpact(game, obstacle) {
        const objectScale = getGameObjectScale();
        const obstacleHitbox = getObstacleHitbox(obstacle);
        const impactX = obstacleHitbox.x + obstacleHitbox.width / 2;
        const impactY = obstacleHitbox.y + obstacleHitbox.height * 0.55;

        game.impactStains.push({
            x: impactX,
            y: getGroundY() + 4,
            scale: (0.8 + random() * 0.45) * objectScale,
            seed: random() * Math.PI * 2,
            life: IMPACT.stainLifetime,
        });

        for (let index = 0; index < IMPACT.particleCount; index += 1) {
            const angle = -Math.PI + random() * Math.PI;
            const force = (2.8 + random() * 5.2) * objectScale;

            game.impactParticles.push({
                x: impactX,
                y: impactY,
                velocityX: Math.cos(angle) * force,
                velocityY: Math.sin(angle) * force - 1.5,
                radius: (2.5 + random() * 4) * objectScale,
                seed: random() * Math.PI * 2,
                life: IMPACT.particleLifetime * (0.65 + random() * 0.35),
                maxLife: IMPACT.particleLifetime,
                colorIndex: index % 3,
            });
        }
    }

    function updateObstacleImpacts(game, delta) {
        const horizontalSpeed = getHorizontalSpeed(game);

        game.impactStains.forEach((stain) => {
            stain.x -= horizontalSpeed * delta;
            stain.life -= delta;
        });
        game.impactStains = game.impactStains.filter((stain) => stain.life > 0 && stain.x > -70);

        game.impactParticles.forEach((particle) => {
            particle.x += (particle.velocityX - horizontalSpeed * 0.25) * delta;
            particle.y += particle.velocityY * delta;
            particle.velocityY += IMPACT.gravity * delta;
            particle.life -= delta;
        });
        game.impactParticles = game.impactParticles.filter(
            (particle) => particle.life > 0 && particle.y < getGroundY() + 25,
        );
    }

    function circleOverlapsRectangle(circle, rectangle) {
        const nearestX = Math.max(rectangle.x, Math.min(circle.x, rectangle.x + rectangle.width));
        const nearestY = Math.max(rectangle.y, Math.min(circle.y, rectangle.y + rectangle.height));
        const distanceX = circle.x - nearestX;
        const distanceY = circle.y - nearestY;

        return distanceX * distanceX + distanceY * distanceY <= circle.radius * circle.radius;
    }

    function updateCoins(game, delta) {
        const horizontalSpeed = getHorizontalSpeed(game);
        game.coinSpawnTimer -= delta;
        if (game.coinSpawnTimer <= 0) spawnCoin(game);

        game.coins.forEach((coin) => {
            coin.x -= horizontalSpeed * delta;
            coin.phase += 0.09 * delta;
        });

        const playerHitbox = getPlayerHitbox(game);
        let collectedPoints = 0;
        let missedCoins = 0;

        game.coins = game.coins.filter((coin) => {
            if (circleOverlapsRectangle(coin, playerHitbox)) {
                collectedPoints += coin.value;
                return false;
            }

            const isVisible = coin.x + coin.radius > -12;
            if (!isVisible) missedCoins += 1;
            return isVisible;
        });

        return { collectedPoints, missedCoins };
    }

    function updateMissedCoinStreak(game, { collectedPoints, missedCoins }) {
        if (collectedPoints > 0) {
            game.missedCoinStreak = 0;
            return 0;
        }

        game.missedCoinStreak += missedCoins;
        let penaltyCount = 0;

        while (game.missedCoinStreak >= CHASE.missedCoinLimit) {
            game.missedCoinStreak -= CHASE.missedCoinLimit;
            game.pursuer.distance = Math.max(
                CHASE.catchDistance,
                game.pursuer.distance - CHASE.collisionPenalty,
            );
            penaltyCount += 1;
        }

        return penaltyCount;
    }

    function updatePlayer(game, delta) {
        const { player } = game;
        const playerScale = getPlayerScale();
        const speedProgress = Math.max(
            0,
            Math.min(
                1,
                (game.speed - CONFIG.initialSpeed) / (CONFIG.maxSpeed - CONFIG.initialSpeed),
            ),
        );
        const animationRate =
            1 + speedProgress * (character.animations.run.maximumPlaybackRate - 1);

        const groundPlayerY = getGroundY() - character.geometry.anchorHeight * playerScale;
        if (player.onGround) player.y = groundPlayerY;

        player.velocityY += getGravity() * delta;
        player.y += player.velocityY * delta;
        player.animationTime += delta * animationRate;
        player.stumbleTimer = Math.max(0, player.stumbleTimer - delta);

        if (player.y >= groundPlayerY) {
            player.y = groundPlayerY;
            player.velocityY = 0;
            player.onGround = true;
        }
    }

    function updateScenery(game, delta) {
        const horizontalSpeed = getHorizontalSpeed(game);
        game.scenery.grassOffset += horizontalSpeed * delta;
        game.scenery.townOffset += horizontalSpeed * SCENE.townSpeedFactor * delta;
        game.scenery.treeOffset += horizontalSpeed * SCENE.treeSpeedFactor * delta;
        game.scenery.buildingOffset += horizontalSpeed * SCENE.buildingSpeedFactor * delta;
        game.scenery.cloudOffset += horizontalSpeed * SCENE.cloudSpeedFactor * delta;
    }

    function getPlayerHitbox(game) {
        const hitbox = character.geometry.hitbox;
        const playerScale = getPlayerScale();
        return {
            x: getPlayerX() + hitbox.offsetX * playerScale,
            y: game.player.y + hitbox.offsetY * playerScale,
            width: hitbox.width * playerScale,
            height: hitbox.height * playerScale,
        };
    }

    function rectanglesOverlap(first, second) {
        const padding = 4;

        return (
            first.x < second.x + second.width - padding &&
            first.x + first.width > second.x + padding &&
            first.y < second.y + second.height &&
            first.y + first.height > second.y + padding
        );
    }

    function getObstacleHitbox(obstacle) {
        const obstacleType = getObstacleType(obstacle.type);
        const hitbox = obstacleType.hitbox;
        const obstacleScale = getObstacleScale(obstacleType.kind);

        return {
            x: obstacle.x + hitbox.offsetX * obstacleScale,
            y: obstacle.y + hitbox.offsetY * obstacleScale,
            width: hitbox.width * obstacleScale,
            height: hitbox.height * obstacleScale,
        };
    }

    function restoreLife(game) {
        const previousDistance = game.pursuer.distance;
        game.pursuer.distance = Math.min(
            CHASE.initialDistance,
            game.pursuer.distance + CHASE.collisionPenalty,
        );
        return game.pursuer.distance > previousDistance;
    }

    function canStompRobot(game, playerHitbox, obstacleHitbox, previousPlayerBottom) {
        if (game.player.velocityY <= 0) return false;

        const robotScale = getObstacleScale('robot');
        const horizontalPadding = CHASE.robotStompHorizontalPadding * robotScale;
        const currentPlayerBottom = playerHitbox.y + playerHitbox.height;
        const overlapsExpandedTop =
            playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width + horizontalPadding &&
            playerHitbox.x + playerHitbox.width > obstacleHitbox.x - horizontalPadding;

        return (
            overlapsExpandedTop &&
            currentPlayerBottom >= obstacleHitbox.y &&
            previousPlayerBottom <= obstacleHitbox.y + CHASE.robotStompTolerance * robotScale
        );
    }

    function resolveObstacleCollision(game, previousPlayerBottom) {
        const playerHitbox = getPlayerHitbox(game);
        const obstacleIndex = game.obstacles.findIndex((obstacle) => {
            if (obstacle.opened) return false;

            const obstacleHitbox = getObstacleHitbox(obstacle);
            const obstacleType = getObstacleType(obstacle.type);
            return (
                rectanglesOverlap(playerHitbox, obstacleHitbox) ||
                (obstacleType.kind === 'robot' &&
                    canStompRobot(game, playerHitbox, obstacleHitbox, previousPlayerBottom))
            );
        });
        if (obstacleIndex < 0) {
            return { hitObstacle: false, openedRobot: false, recoveredLife: false };
        }

        const obstacle = game.obstacles[obstacleIndex];
        const obstacleType = getObstacleType(obstacle.type);
        const obstacleHitbox = getObstacleHitbox(obstacle);
        const isRobotStomp =
            obstacleType.kind === 'robot' &&
            canStompRobot(game, playerHitbox, obstacleHitbox, previousPlayerBottom);

        if (isRobotStomp) {
            const playerScale = getPlayerScale();
            obstacle.opened = true;
            obstacle.poseOffset = 0;
            game.player.y =
                obstacleHitbox.y -
                character.geometry.hitbox.offsetY * playerScale -
                character.geometry.hitbox.height * playerScale;
            game.player.velocityY = getRobotBounceVelocity();
            game.player.onGround = false;
            return {
                hitObstacle: false,
                openedRobot: true,
                recoveredLife: restoreLife(game),
            };
        }

        game.obstacles.splice(obstacleIndex, 1);
        if (obstacleType.kind !== 'robot') createObstacleImpact(game, obstacle);
        game.pursuer.distance = Math.max(
            CHASE.catchDistance,
            game.pursuer.distance - CHASE.collisionPenalty,
        );
        game.player.stumbleTimer = CHASE.stumbleDuration;
        game.player.velocityY = getCollisionBounceVelocity();
        game.player.onGround = false;
        return { hitObstacle: true, openedRobot: false, recoveredLife: false };
    }

    function update(game, delta) {
        if (!Number.isFinite(game.score)) game.score = 0;
        if (!Number.isFinite(game.bestScore)) game.bestScore = 0;

        game.speed = Math.min(CONFIG.maxSpeed, game.speed + CONFIG.speedIncrease * delta);
        game.score += CONFIG.scoreRate * delta * (game.speed / CONFIG.initialSpeed);
        updateScenery(game, delta);
        updateObstacles(game, delta);
        updateObstacleImpacts(game, delta);
        const playerHitboxBeforeUpdate = getPlayerHitbox(game);
        const previousPlayerBottom = playerHitboxBeforeUpdate.y + playerHitboxBeforeUpdate.height;
        updatePlayer(game, delta);
        const coinResult = updateCoins(game, delta);
        const { collectedPoints } = coinResult;
        game.score += collectedPoints;
        game.bestScore = Math.max(game.bestScore, game.score);
        const collisionResult = resolveObstacleCollision(game, previousPlayerBottom);
        const missedCoinPenalty = updateMissedCoinStreak(game, coinResult);

        return {
            caught: game.pursuer.distance <= CHASE.catchDistance,
            ...collisionResult,
            collectedPoints,
            missedCoinPenalty,
        };
    }

    return Object.freeze({ update });
}

export const physics = createPhysics();
