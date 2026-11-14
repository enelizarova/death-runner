<script setup lang="ts">
import { reactive, ref, shallowRef } from 'vue';

import Header from './components/app/Header.vue';
import GameScreen from './components/game/GameScreen.vue';
import IntroScreen from './components/start/IntroScreen.vue';
import StartScreen from './components/start/StartScreen.vue';
import { CHARACTERS, CHASE } from './game/config.js';
import { readBestScore } from './game/state.js';
import type { Character, HudState } from './types/game';

const screen = ref<'intro' | 'start' | 'game'>('intro');
const selectedCharacter = shallowRef<Character | null>(null);
const characters = Object.values(CHARACTERS);
const hud = reactive<HudState>({
    score: '00000',
    bestScore: formatScore(readBestScore()),
    lives: CHASE.maxLives,
});

function startGame(character: Character) {
    selectedCharacter.value = character;
    screen.value = 'game';
}

function updateHud(nextHud: HudState) {
    Object.assign(hud, nextHud);
}

function showCharacterSelection() {
    selectedCharacter.value = null;
    screen.value = 'start';
    hud.score = '00000';
    hud.bestScore = formatScore(readBestScore());
    hud.lives = CHASE.maxLives;
}

function formatScore(value: number) {
    return Math.floor(value).toString().padStart(5, '0');
}
</script>

<template>
    <IntroScreen
        v-if="screen === 'intro'"
        @continue="screen = 'start'"
    />
    <Header
        v-if="screen === 'game'"
        :hud="hud"
    />
    <StartScreen
        v-if="screen === 'start'"
        :characters="characters"
        @start="startGame"
    />
    <GameScreen
        v-else-if="selectedCharacter"
        :character="selectedCharacter"
        @hud-change="updateHud"
        @select-character="showCharacterSelection"
    />
</template>
