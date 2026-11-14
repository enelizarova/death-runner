import { viewport } from '../config.js';
import { createHudRenderer } from './hud-renderer.js';
import { createPlayerRenderer } from './player-renderer.js';
import { createWorldRenderer } from './world-renderer.js';

export function createRenderer(context, images, onHudChange, character) {
    const hud = createHudRenderer(onHudChange);
    const player = createPlayerRenderer(context, images, character);
    const world = createWorldRenderer(context, images);

    function render(game, timestamp) {
        context.clearRect(0, 0, viewport.width, viewport.height);
        game.impactStains.forEach(world.drawImpactStain);
        game.coins.forEach(world.drawCoin);
        world.drawPursuer(game, timestamp);
        game.obstacles.forEach(world.drawObstacle);
        game.impactParticles.forEach(world.drawImpactParticle);
        player.draw(game, timestamp);
        hud.draw(game);
    }

    function renderStartupError() {
        context.clearRect(0, 0, viewport.width, viewport.height);
        context.fillStyle = '#273548';
        context.font = "700 1.125rem 'Anonymous Pro', monospace";
        context.textAlign = 'center';
        context.fillText('Не удалось запустить игру', viewport.width / 2, viewport.height / 2);
    }

    return Object.freeze({ render, renderStartupError });
}
