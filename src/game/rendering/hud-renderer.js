import { CHASE } from '../config.js';

function formatScore(value) {
    return Math.floor(value).toString().padStart(5, '0');
}

function getRemainingLives(game) {
    const lostLives = Math.round(
        (CHASE.initialDistance - game.pursuer.distance) / CHASE.collisionPenalty,
    );
    return Math.max(0, CHASE.maxLives - lostLives);
}

export function createHudRenderer(onChange = () => {}) {
    let previousSnapshot = '';

    function updateHud(game) {
        const hud = {
            score: formatScore(game.score),
            bestScore: formatScore(game.bestScore),
            lives: getRemainingLives(game),
        };
        const snapshot = `${hud.score}:${hud.bestScore}:${hud.lives}`;
        if (snapshot === previousSnapshot) return;

        previousSnapshot = snapshot;
        onChange(hud);
    }

    function draw(game) {
        updateHud(game);
    }

    return Object.freeze({ draw });
}
