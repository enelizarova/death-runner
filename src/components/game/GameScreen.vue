<script setup lang="ts">
import { ref } from 'vue';

import { useGameEngine } from '../../composables/useGameEngine';
import type { Character, HudState } from '../../types/game';
import SceneBackground from '../scene/SceneBackground.vue';
import ResultScreen from './ResultScreen.vue';

interface SceneHandle {
    townTrack: HTMLElement | null;
    treeTrack: HTMLElement | null;
    buildingTrack: HTMLElement | null;
    cloudTrack: HTMLElement | null;
    roadUpper: HTMLElement | null;
    grass: HTMLElement | null;
}

const props = defineProps<{
    character: Character;
}>();

const emit = defineEmits<{
    hudChange: [hud: HudState];
    selectCharacter: [];
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const scene = ref<SceneHandle | null>(null);
const stage = ref<HTMLElement | null>(null);
const { continueRun, jump, restart, result, status } = useGameEngine({
    character: props.character,
    canvas,
    onHudChange: (hud) => emit('hudChange', hud),
    scene,
    stage,
});
</script>

<template>
    <main class="game-screen">
        <section
            ref="stage"
            class="game-screen__stage"
            @pointerdown="jump"
            aria-label="Игра-бегалка"
        >
            <SceneBackground ref="scene" />
            <div class="game-screen__viewport">
                <canvas
                    ref="canvas"
                    class="game-screen__canvas"
                    width="1200"
                    height="700"
                >
                    Ваш браузер не поддерживает Canvas.
                </canvas>
            </div>
            <p
                class="sr-only"
                aria-live="polite"
            >
                {{ status }}
            </p>
        </section>

        <div class="game-screen__controls">
            <button
                class="button button--primary"
                type="button"
                @click="jump"
            >
                Прыжок <span aria-hidden="true">↑</span>
            </button>
            <button
                class="button button--secondary"
                type="button"
                @click="restart"
            >
                Заново <span aria-hidden="true">↻</span>
            </button>
            <button
                class="button button--secondary"
                type="button"
                @click="emit('selectCharacter')"
            >
                Сменить героя
            </button>
        </div>

        <ResultScreen
            v-if="result"
            :character="character"
            :result="result"
            @continue="continueRun"
            @restart="restart"
            @select-character="emit('selectCharacter')"
        />
    </main>
</template>
