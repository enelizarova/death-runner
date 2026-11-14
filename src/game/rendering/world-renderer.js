import {
    CONFIG,
    getGameObjectScale,
    getGroundY,
    getObstacleScale,
    getPlayerX,
    getPursuerDistanceScale,
} from '../config.js';
import { getObstacleType } from '../obstacles/index.js';

const impactColors = Object.freeze(['#8E1520', '#B8202C', '#D43A3D']);

const evilSize = Object.freeze({
    height: 141,
    scale: 0.84,
    width: 104,
});
const pursuerTransitionDuration = 900;

function easeInOutCubic(progress) {
    return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function seededUnit(seed, index) {
    const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
    return value - Math.floor(value);
}

function traceIrregularDrop(context, radiusX, radiusY, seed, pointCount = 8) {
    context.beginPath();
    for (let index = 0; index < pointCount; index += 1) {
        const baseAngle = (index / pointCount) * Math.PI * 2;
        const angleJitter = (seededUnit(seed, index + 100) - 0.5) * (Math.PI / pointCount);
        const angle = baseAngle + angleJitter;
        const radius = 0.68 + seededUnit(seed, index + 120) * 0.52;
        const x = Math.cos(angle) * radiusX * radius;
        const y = Math.sin(angle) * radiusY * radius;

        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
    }
    context.closePath();
}

function drawEvilArm(context, x, y, width, height, offset, fillStyle) {
    context.fillStyle = fillStyle;
    context.fillRect(x, y + offset, width, height);
}

function drawEvilBody(context, timestamp, reduceMotion) {
    const armOffset = reduceMotion ? 0 : Math.sin(timestamp * 0.003) * 2;
    const blinkPhase = timestamp % 6400;
    const isBlinking = !reduceMotion && blinkPhase >= 6000 && blinkPhase < 6250;
    const bodyGradient = context.createLinearGradient(0, 26.6, 0, 64.6);
    bodyGradient.addColorStop(0, '#69CAD0');
    bodyGradient.addColorStop(1, '#1FADFF');

    drawEvilArm(context, 20.6, 34.6, 7.625, 7.8533, armOffset, bodyGradient);
    drawEvilArm(context, 73.9699, 34.2416, 7.6301, 7.8584, -armOffset, bodyGradient);

    context.fillStyle = bodyGradient;
    context.beginPath();
    context.moveTo(28.225, 26.6);
    context.lineTo(73.9699, 26.6);
    context.lineTo(73.975, 57.2001);
    context.lineTo(70.1955, 57.2001);
    context.lineTo(70.1955, 64.6);
    context.lineTo(66.35, 64.6);
    context.lineTo(66.35, 57.2001);
    context.lineTo(62.5705, 57.2001);
    context.lineTo(62.5705, 64.6);
    context.lineTo(58.725, 64.6);
    context.lineTo(58.725, 57.2001);
    context.lineTo(43.475, 57.2001);
    context.lineTo(43.475, 64.6);
    context.lineTo(39.632, 64.6);
    context.lineTo(39.632, 57.2001);
    context.lineTo(35.85, 57.2001);
    context.lineTo(35.85, 64.6);
    context.lineTo(32.0044, 64.6);
    context.lineTo(32.0044, 57.2001);
    context.lineTo(28.225, 57.2001);
    context.closePath();
    context.fill();

    context.fillStyle = '#302637';
    context.fillRect(35.85, isBlinking ? 40 : 34.4584, 3.782, isBlinking ? 1.5 : 7.2124);
    context.fillRect(62.5629, isBlinking ? 40 : 34.4584, 3.7871, isBlinking ? 1.5 : 7.2124);
}

export function createWorldRenderer(context, images = {}) {
    const evilImage = images.evil;
    const reduceMotion =
        globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const pursuerMotion = {
        from: null,
        startedAt: 0,
        to: null,
    };

    function getRenderedPursuerDistance(targetDistance, timestamp) {
        if (reduceMotion || pursuerMotion.to === null || pursuerMotion.from === null) {
            pursuerMotion.from = targetDistance;
            pursuerMotion.to = targetDistance;
            pursuerMotion.startedAt = timestamp;
            return targetDistance;
        }

        const elapsed = timestamp - pursuerMotion.startedAt;
        const progress = Math.min(Math.max(elapsed / pursuerTransitionDuration, 0), 1);
        const currentDistance =
            pursuerMotion.from + (pursuerMotion.to - pursuerMotion.from) * easeInOutCubic(progress);

        if (targetDistance !== pursuerMotion.to) {
            pursuerMotion.from = currentDistance;
            pursuerMotion.to = targetDistance;
            pursuerMotion.startedAt = timestamp;
            return currentDistance;
        }

        return currentDistance;
    }

    function drawObstacle(obstacle) {
        const obstacleType = getObstacleType(obstacle.type);
        const obstacleScale = getObstacleScale(obstacleType.kind);
        let assetKey = obstacleType.assetKey;
        let drawY = obstacle.y;
        let drawSize = obstacleType.size;

        if (obstacleType.kind === 'manager') {
            const frameIndex =
                Math.floor(obstacle.poseOffset / obstacleType.frameDuration) %
                obstacleType.frameKeys.length;
            assetKey = obstacleType.frameKeys[frameIndex];
        } else if (obstacle.opened) {
            const openingProgress = Math.min(obstacle.poseOffset / 10, 1);
            const closedImage = images[obstacleType.assetKey];
            const openImage = images[obstacleType.openAssetKey];
            if (!closedImage || !openImage) return;

            context.save();
            context.globalAlpha = 1 - openingProgress;
            context.drawImage(
                closedImage,
                obstacle.x,
                obstacle.y +
                    (obstacleType.size.height - obstacleType.closedSize.height) * obstacleScale,
                obstacleType.closedSize.width * obstacleScale,
                obstacleType.closedSize.height * obstacleScale,
            );
            context.globalAlpha = openingProgress;
            context.drawImage(
                openImage,
                obstacle.x,
                obstacle.y,
                obstacleType.size.width * obstacleScale,
                obstacleType.size.height * obstacleScale,
            );
            context.restore();
            return;
        } else {
            drawSize = obstacleType.closedSize;
            drawY += (obstacleType.size.height - obstacleType.closedSize.height) * obstacleScale;
        }

        const obstacleImage = images[assetKey];
        if (!obstacleImage) return;

        context.drawImage(
            obstacleImage,
            obstacle.x,
            drawY,
            drawSize.width * obstacleScale,
            drawSize.height * obstacleScale,
        );
    }

    function drawImpactStain(stain) {
        const fade = Math.min(1, stain.life / 80);

        context.save();
        context.translate(stain.x, stain.y);
        context.rotate(stain.seed * 0.18);
        context.scale(stain.scale, stain.scale);
        context.globalAlpha = fade * 0.94;

        for (let index = 0; index < 10; index += 1) {
            const angle = seededUnit(stain.seed, index + 20) * Math.PI * 2;
            const distance = 4 + seededUnit(stain.seed, index + 30) * 38;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance * 0.65;
            const radius = 1 + seededUnit(stain.seed, index + 50) * 2.4;

            context.save();
            context.translate(x, y);
            context.rotate((seededUnit(stain.seed, index + 60) - 0.5) * 1.2);
            context.scale(
                0.85 + seededUnit(stain.seed, index + 70) * 0.65,
                0.8 + seededUnit(stain.seed, index + 80) * 0.35,
            );
            context.fillStyle = index % 3 === 0 ? '#D94A46' : '#83151E';
            traceIrregularDrop(context, radius, radius, stain.seed + index * 0.73, 6 + (index % 3));
            context.fill();
            context.restore();
        }
        context.restore();
    }

    function drawImpactParticle(particle) {
        const opacity = Math.min(1, particle.life / 10);
        const speed = Math.hypot(particle.velocityX, particle.velocityY);
        const length = particle.radius * (1 + Math.min(speed / 24, 0.25));
        const width = particle.radius * (0.82 + seededUnit(particle.seed, 1) * 0.16);

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(Math.atan2(particle.velocityY, particle.velocityX));
        context.globalAlpha = opacity;
        context.fillStyle = impactColors[particle.colorIndex];
        traceIrregularDrop(context, length, width, particle.seed, 7);
        context.fill();
        context.restore();
    }

    function drawPursuer(game, timestamp = 0) {
        const objectScale = getGameObjectScale();
        const renderedDistance = getRenderedPursuerDistance(game.pursuer.distance, timestamp);
        const x = getPlayerX() - renderedDistance * getPursuerDistanceScale();
        const bobOffset = reduceMotion ? 0 : Math.sin(timestamp * 0.002) * 4;
        const hueRotation = reduceMotion ? 0 : (timestamp * 0.0125) % 360;
        const renderedScale = evilSize.scale * objectScale;
        const width = evilSize.width * renderedScale;

        context.save();
        context.translate(x + width / 2, getGroundY() + 5 + bobOffset);
        context.scale(renderedScale, renderedScale);
        context.translate(-evilSize.width / 2, -evilSize.height);

        if (evilImage) {
            context.filter = `hue-rotate(${hueRotation}deg)`;
            context.drawImage(evilImage, 0, 0, evilSize.width, evilSize.height);
            context.filter = 'none';

            context.fillStyle = '#302637';
            context.fillRect(18, 23, 67, 44);
        }

        context.filter = `hue-rotate(${hueRotation}deg)`;
        drawEvilBody(context, timestamp, reduceMotion);
        context.restore();
    }

    function drawCoin(coin) {
        const objectScale = getGameObjectScale();
        const spinScale = 0.25 + Math.abs(Math.cos(coin.phase)) * 0.75;
        const outerColor = coin.value === 5 ? '#FFCA3A' : '#F1B82D';
        const innerColor = coin.value === 5 ? '#FFF0A6' : '#FFDC73';

        context.save();
        context.translate(coin.x, coin.y);
        context.scale(spinScale, 1);
        context.beginPath();
        context.arc(0, 0, coin.radius, 0, Math.PI * 2);
        context.fillStyle = outerColor;
        context.fill();
        context.lineWidth = 2 * objectScale;
        context.strokeStyle = '#9C6812';
        context.stroke();
        context.beginPath();
        context.arc(0, 0, coin.radius - 4 * objectScale, 0, Math.PI * 2);
        context.fillStyle = innerColor;
        context.fill();
        context.fillStyle = '#704707';
        const fontSize = ((coin.value === 5 ? 15 : 13) * objectScale) / 16;
        context.font = `700 ${fontSize}rem 'Anonymous Pro', monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(String(coin.value), 0, 0.5);
        context.restore();
    }

    return Object.freeze({
        drawCoin,
        drawImpactParticle,
        drawImpactStain,
        drawObstacle,
        drawPursuer,
    });
}
