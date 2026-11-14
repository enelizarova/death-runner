import { ACTIVE_CHARACTER, GAME_PHASE, getGroundY, getPlayerScale, getPlayerX } from '../config.js';
import { getWaitingPose } from '../animations/waiting.js';

function getPlayerPose(game, timestamp, character) {
    if (game.phase === GAME_PHASE.GAME_OVER) {
        return timestamp - game.collisionTime < 420 ? 'caught' : 'end';
    }
    if (game.phase === GAME_PHASE.VICTORY) {
        return character.animations.waiting.restFrame;
    }
    if (game.player.stumbleTimer > 0) return 'caught';
    if (!game.player.onGround) return 'jump';
    if (game.phase === GAME_PHASE.READY) {
        return getWaitingPose(
            character.animations.waiting,
            timestamp - game.readySince,
            game.player.waitingSeed,
        );
    }

    const animation = character.animations.run;
    const frameIndex =
        Math.floor(game.player.animationTime / animation.frameDuration) % animation.frames.length;
    return animation.frames[frameIndex];
}

function measureBottomInset(image, size) {
    if (typeof document === 'undefined') return 0;

    const width = Math.ceil(size.width);
    const height = Math.ceil(size.height);
    const measurementCanvas = document.createElement('canvas');
    measurementCanvas.width = width;
    measurementCanvas.height = height;

    const measurementContext = measurementCanvas.getContext('2d', {
        willReadFrequently: true,
    });
    if (!measurementContext) return 0;

    try {
        measurementContext.drawImage(image, 0, 0, width, height);
        const pixels = measurementContext.getImageData(0, 0, width, height).data;

        for (let y = height - 1; y >= 0; y -= 1) {
            for (let x = 0; x < width; x += 1) {
                const alpha = pixels[(y * width + x) * 4 + 3];
                if (alpha > 8) return height - 1 - y;
            }
        }
    } catch {
        return 0;
    }

    return 0;
}

export function createPlayerRenderer(context, images, character = ACTIVE_CHARACTER) {
    const bottomInsets = Object.fromEntries(
        Object.entries(character.sizes).map(([pose, size]) => [
            pose,
            measureBottomInset(images[pose], size),
        ]),
    );

    function drawShadow(game, pose) {
        const shadowName = character.shadows.byPose[pose];
        if (!shadowName) return;

        const shadowSize = character.shadows.sizes[pose];
        const playerSize = character.sizes[pose];
        const geometry = character.geometry;
        const playerScale = getPlayerScale();
        const groundY = getGroundY();
        const jumpHeight = Math.max(
            0,
            groundY - geometry.anchorHeight * playerScale - game.player.y,
        );
        const heightProgress =
            pose === 'jump' ? Math.min(jumpHeight / geometry.jumpShadowReferenceHeight, 1) : 0;
        const scale = 1 - heightProgress * 0.35;
        const width = shadowSize.width * scale * playerScale;
        const height = shadowSize.height * scale * playerScale;
        const playerCenterX = getPlayerX() + (playerSize.width * playerScale) / 2;

        context.save();
        context.globalAlpha = 1 - heightProgress * 0.35;
        context.drawImage(
            images[shadowName],
            playerCenterX - width / 2,
            groundY - height,
            width,
            height,
        );
        context.restore();
    }

    function drawPlayer(game, pose) {
        const size = character.sizes[pose];
        const geometry = character.geometry;
        const playerScale = getPlayerScale();
        const x = getPlayerX() + (pose === 'end' ? geometry.endOffsetX * playerScale : 0);
        const groundedPlayerY = getGroundY() - geometry.anchorHeight * playerScale;
        const playerY = game.player.onGround ? groundedPlayerY : game.player.y;
        const y =
            pose === 'end'
                ? getGroundY() - size.height * playerScale
                : playerY + (geometry.anchorHeight - size.height) * playerScale;

        context.drawImage(
            images[pose],
            x,
            y + (bottomInsets[pose] ?? 0) * playerScale,
            size.width * playerScale,
            size.height * playerScale,
        );
    }

    function draw(game, timestamp) {
        const pose = getPlayerPose(game, timestamp, character);
        drawShadow(game, pose);
        drawPlayer(game, pose);
    }

    return Object.freeze({ draw });
}
