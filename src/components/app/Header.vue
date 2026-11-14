<script setup lang="ts">
import { CHASE } from '../../game/config.js';
import type { HudState } from '../../types/game.js';
import LifeIcon from '../icons/Life.vue';

defineProps<{
    hud: HudState;
}>();

const coinSource = `${import.meta.env.BASE_URL}assets/coins/coin-clear.svg`;
</script>

<template>
    <header class="header">
        <div class="container">
            <div
                class="header__lives"
                :aria-label="`Жизни: ${hud.lives} из ${CHASE.maxLives}`"
            >
                <LifeIcon
                    v-for="life in CHASE.maxLives"
                    :key="life"
                    class="header__life"
                    :class="{ 'header__life--lost': life > hud.lives }"
                    aria-hidden="true"
                />
            </div>
            <p class="header__hint">
                Нажми на любую клавишу, чтобы начать <br />
                Пробел, клик или касание - прыжок
            </p>
            <div class="header__score">
                <img
                    class="header__score-coin"
                    :src="coinSource"
                    alt="Счёт"
                />
                <strong class="header__score-value">{{ hud.score }}</strong>
            </div>
        </div>
    </header>
</template>
