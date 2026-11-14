import {
    CHASE,
    CONFIG,
    GAME_PHASE,
    getGroundY,
    getJumpVelocity,
    getPlayerScale,
} from './config.js';
import { createPhysics } from './physics.js';
import { createGameState, saveBestScore } from './state.js';

export class Game {
    #animationFrameId = null;
    #previousTime = 0;
    #character;
    #physics;
    #renderer;
    #resultModal;
    #resultTimeoutId = null;
    #sceneRenderer;
    #setPhase;
    #setStatus;
    #state;

    constructor({
        character,
        renderer,
        resultModal,
        sceneRenderer,
        setPhase = (_phase) => {},
        setStatus,
    }) {
        this.#character = character;
        this.#physics = createPhysics({ character });
        this.#renderer = renderer;
        this.#resultModal = resultModal;
        this.#sceneRenderer = sceneRenderer;
        this.#setPhase = setPhase;
        this.#setStatus = setStatus;
        this.#state = createGameState(undefined, { character: this.#character });

        this.jump = this.jump.bind(this);
        this.continueRun = this.continueRun.bind(this);
        this.restart = this.restart.bind(this);
        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.#animationFrameId !== null) return;

        this.restart();
    }

    pause() {
        if (this.#animationFrameId === null) return;

        cancelAnimationFrame(this.#animationFrameId);
        this.#animationFrameId = null;
        this.#previousTime = 0;
    }

    resume() {
        if (
            this.#animationFrameId !== null ||
            [GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY].includes(this.#state.phase) ||
            typeof requestAnimationFrame !== 'function'
        ) {
            return;
        }

        this.#previousTime = 0;
        this.#animationFrameId = requestAnimationFrame(this.loop);
    }

    stop() {
        this.pause();
        this.#clearResultTimeout();
    }

    restart(options = {}) {
        if (
            options.gameOverOnly &&
            ![GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY].includes(this.#state.phase)
        ) {
            return;
        }

        this.#state = createGameState(this.#state.bestScore, {
            character: this.#character,
        });
        this.#previousTime = 0;
        this.#clearResultTimeout();
        this.#resultModal.hide();
        this.#setPhase(this.#state.phase);
        this.#setStatus('Игра готова. Нажмите пробел или кнопку прыжка, чтобы начать.');
        this.resume();
    }

    jump() {
        if ([GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY].includes(this.#state.phase)) {
            return;
        }

        if (this.#state.phase === GAME_PHASE.READY) {
            this.#state.phase = GAME_PHASE.RUNNING;
            this.#setPhase(this.#state.phase);
            this.#setStatus('Игра началась');
        }

        if (!this.#state.player.onGround) {
            this.#state.player.jumpBufferTimer = CONFIG.jumpBufferDuration;
            return;
        }

        this.#state.player.jumpBufferTimer = 0;
        this.#state.player.y =
            getGroundY() - this.#character.geometry.anchorHeight * getPlayerScale();
        this.#state.player.velocityY = getJumpVelocity();
        this.#state.player.onGround = false;
    }

    continueRun() {
        if (this.#state.phase !== GAME_PHASE.VICTORY) return;

        this.#state.phase = GAME_PHASE.RUNNING;
        this.#setPhase(this.#state.phase);
        this.#previousTime = 0;
        this.#clearResultTimeout();
        this.#resultModal.hide();
        this.#setStatus('Победа позади. Теперь забег продолжается до поражения.');
        this.resume();
    }

    finish(outcome) {
        this.#state.phase = outcome;
        this.#setPhase(this.#state.phase);
        this.#state.collisionTime = performance.now();
        this.#state.score = Number.isFinite(this.#state.score) ? Math.max(0, this.#state.score) : 0;
        saveBestScore(this.#state.bestScore);
        const isVictory = outcome === GAME_PHASE.VICTORY;
        const result = {
            outcome: isVictory ? 'victory' : 'defeat',
            finalScore: this.#state.score,
        };
        this.#clearResultTimeout();
        this.#resultTimeoutId = window.setTimeout(() => {
            this.#resultTimeoutId = null;
            this.#resultModal.show(result);
            this.pause();
        }, CONFIG.resultModalDelay);
        this.#setStatus(
            isVictory
                ? `Победа. Счёт: ${Math.floor(this.#state.score)}.`
                : `Игра окончена. Счёт: ${Math.floor(this.#state.score)}.`,
        );
    }

    update(delta) {
        if (this.#state.phase !== GAME_PHASE.RUNNING) return;

        const result = this.#physics.update(this.#state, delta);
        if (result.collectedPoints > 0) {
            this.#setStatus(
                `Монета: +${result.collectedPoints}. Счёт: ${Math.floor(this.#state.score)}.`,
            );
        }
        if (result.hitObstacle && !result.caught) {
            this.#setStatus('Столкновение! Потеряно одно сердце.');
        }
        if (result.missedCoinPenalty > 0 && !result.caught) {
            this.#setStatus(
                `${CHASE.missedCoinLimit} монеты пропущено подряд — смерть стала ближе.`,
            );
        }
        if (result.openedRobot) {
            this.#setStatus(
                result.recoveredLife
                    ? 'Робот открыт! Одно сердце восстановлено.'
                    : 'Робот открыт! Здоровье уже на максимуме.',
            );
        }
        if (result.caught) {
            this.finish(GAME_PHASE.GAME_OVER);
            return;
        }
        if (!this.#state.victoryReached && this.#state.score >= CONFIG.victoryScore) {
            this.#state.victoryReached = true;
            this.finish(GAME_PHASE.VICTORY);
            return;
        }

        this.#consumeJumpBuffer(delta);
    }

    loop(timestamp) {
        const delta = this.#previousTime
            ? Math.min((timestamp - this.#previousTime) / 16.67, 2)
            : 1;
        this.#previousTime = timestamp;

        this.update(delta);
        this.#sceneRenderer.render(this.#state);
        this.#renderer.render(this.#state, timestamp);
        this.#animationFrameId = requestAnimationFrame(this.loop);
    }

    resetFrameClock() {
        this.#previousTime = 0;
    }

    #clearResultTimeout() {
        if (this.#resultTimeoutId === null) return;

        window.clearTimeout(this.#resultTimeoutId);
        this.#resultTimeoutId = null;
    }

    #consumeJumpBuffer(delta) {
        const player = this.#state.player;
        if (player.jumpBufferTimer <= 0) return;

        if (player.onGround) {
            player.jumpBufferTimer = 0;
            this.jump();
            return;
        }

        player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - delta);
    }
}
