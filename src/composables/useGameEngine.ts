import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import { Game } from '../game/game.js';
import { CONFIG, GAME_PHASE, viewport } from '../game/config.js';
import { obstacleAssets } from '../game/obstacles/index.js';
import { createRenderer } from '../game/rendering/renderer.js';
import { loadAssets } from '../infrastructure/image-loader.js';
import { createSceneRenderer } from '../ui/scene-renderer.js';
import type { Character, GameResult, HudState } from '../types/game';

interface SceneHandle {
    townTrack: HTMLElement | null;
    treeTrack: HTMLElement | null;
    buildingTrack: HTMLElement | null;
    cloudTrack: HTMLElement | null;
    roadUpper: HTMLElement | null;
    grass: HTMLElement | null;
}

interface UseGameEngineOptions {
    character: Character;
    canvas: Ref<HTMLCanvasElement | null>;
    onHudChange: (hud: HudState) => void;
    scene: Ref<SceneHandle | null>;
    stage: Ref<HTMLElement | null>;
}

const enemyAssets = Object.freeze({
    evil: './assets/characters/evil.svg',
});
const maxCanvasPixels = 4_000_000;

type GamePhase = (typeof GAME_PHASE)[keyof typeof GAME_PHASE];

export function useGameEngine({
    character,
    canvas,
    onHudChange,
    scene,
    stage,
}: UseGameEngineOptions) {
    const result = ref<GameResult | null>(null);
    const phase = ref<GamePhase>(GAME_PHASE.READY);
    const status = ref('Игра готова');
    let game: Game | null = null;
    let stopObservingResolution = () => {};
    let stopRenderingScene = () => {};
    let disposed = false;

    function jump() {
        game?.jump();
    }

    function restart() {
        game?.restart();
    }

    function continueRun() {
        game?.continueRun();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (result.value) return;

        if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
            event.preventDefault();
            if (!event.repeat) jump();
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) game?.pause();
        else game?.resume();
    }

    watch(result, (value) => {
        document.body.classList.toggle('modal-open', value !== null);
    });

    onMounted(async () => {
        const canvasElement = canvas.value;
        const stageElement = stage.value;
        const townTrack = scene.value?.townTrack;
        const treeTrack = scene.value?.treeTrack;
        const buildingTrack = scene.value?.buildingTrack;
        const cloudTrack = scene.value?.cloudTrack;
        const roadUpper = scene.value?.roadUpper;
        const grass = scene.value?.grass;
        if (
            !canvasElement ||
            !stageElement ||
            !townTrack ||
            !treeTrack ||
            !buildingTrack ||
            !cloudTrack ||
            !roadUpper ||
            !grass
        ) {
            throw new Error('Не удалось инициализировать игровой экран.');
        }

        const context = canvasElement.getContext('2d');
        if (!context) throw new Error('Браузер не поддерживает Canvas 2D.');

        stopObservingResolution = observeCanvasResolution(canvasElement, context, {
            grass,
            roadUpper,
        });
        window.addEventListener('keydown', handleKeydown);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        try {
            const images = await loadAssets({
                ...character.assets,
                ...enemyAssets,
                ...obstacleAssets,
            });
            if (disposed) return;

            const renderer = createRenderer(context, images, onHudChange, character);
            const sceneRenderer = createSceneRenderer({
                townTrack,
                treeTrack,
                buildingTrack,
                cloudTrack,
                grass,
            });
            stopRenderingScene = sceneRenderer.destroy;
            const resultModal = {
                hide: () => {
                    result.value = null;
                },
                show: (nextResult: GameResult) => {
                    result.value = nextResult;
                },
            };
            game = new Game({
                character,
                renderer,
                resultModal,
                sceneRenderer,
                setPhase: (nextPhase: GamePhase) => {
                    phase.value = nextPhase;
                },
                setStatus: (message: string) => {
                    status.value = message;
                },
            });
            game.start();
        } catch (error) {
            console.error(error);
            status.value = 'Не удалось запустить игру.';
            createRenderer(context, {}, () => {}, character).renderStartupError();
        }
    });

    onBeforeUnmount(() => {
        disposed = true;
        game?.stop();
        stopObservingResolution();
        stopRenderingScene();
        window.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.body.classList.remove('modal-open');
    });

    return { continueRun, jump, phase, restart, result, status };
}

function observeCanvasResolution(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    scene: Pick<SceneHandle, 'grass' | 'roadUpper'>,
) {
    const mutableViewport = viewport as { width: number; height: number; groundY: number };
    const sync = () => {
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const roadUpperBounds = scene.roadUpper?.getBoundingClientRect();
        if (!roadUpperBounds) return;

        const isMobileLandscape = window.matchMedia(CONFIG.mobileLandscapeMediaQuery).matches;
        const profileWidth = isMobileLandscape
            ? CONFIG.mobileLandscapeCanvasWidth
            : window.matchMedia(CONFIG.mobileMediaQuery).matches
              ? CONFIG.mobileCanvasWidth
              : CONFIG.canvasWidth;
        const logicalWidth =
            profileWidth === CONFIG.canvasWidth
                ? Math.max(CONFIG.canvasWidth, bounds.width)
                : profileWidth;
        const logicalScale = bounds.width / logicalWidth;
        mutableViewport.width = logicalWidth;
        mutableViewport.height = bounds.height / logicalScale;
        const groundScreenY = roadUpperBounds.top + roadUpperBounds.height / 2 - bounds.top;
        mutableViewport.groundY =
            (Math.max(0, Math.min(bounds.height, groundScreenY)) / bounds.height) *
            mutableViewport.height;
        const pixelBudgetRatio = Math.sqrt(maxCanvasPixels / (bounds.width * bounds.height));
        const pixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2, pixelBudgetRatio));
        const pixelWidth = Math.round(bounds.width * pixelRatio);
        const pixelHeight = Math.round(bounds.height * pixelRatio);

        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
        }
        const renderScale = pixelWidth / mutableViewport.width;
        context.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
    };

    sync();
    if ('ResizeObserver' in globalThis) {
        const observer = new ResizeObserver(sync);
        observer.observe(canvas);
        if (scene.grass) observer.observe(scene.grass);
        if (scene.roadUpper) observer.observe(scene.roadUpper);
        return () => observer.disconnect();
    }

    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
}
