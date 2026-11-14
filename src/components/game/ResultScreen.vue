<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { buildResultPath } from '../../../shared/result-share.js';
import { selectResultCopy } from '../../content/result-copy.js';
import { shareOrCopyResult } from '../../services/result-sharing.js';
import type { Character, GameResult } from '../../types/game';
import ChangeIcon from '../icons/Change.vue';
import ShareIcon from '../icons/Share.vue';

const props = defineProps<{
    character: Character;
    result: GameResult;
}>();

const emit = defineEmits<{
    continue: [];
    restart: [];
    selectCharacter: [];
}>();

const primaryButton = ref<HTMLButtonElement | null>(null);
const shareStatus = ref('');
const isSharing = ref(false);
const isVictory = props.result.outcome === 'victory';
const finalScore = computed(() =>
    Number.isFinite(props.result.finalScore) ? Math.max(0, Math.floor(props.result.finalScore)) : 0,
);
const copy = selectResultCopy(props.result.outcome);
const characterSource = isVictory
    ? (props.character.presentation.success ??
      props.character.assets[props.character.animations.waiting.restFrame])
    : props.character.assets.end;

const coinSource = `${import.meta.env.BASE_URL}assets/coins/coin-clear.svg`;

onMounted(() => primaryButton.value?.focus({ preventScroll: true }));

function handlePrimaryAction() {
    if (isVictory) emit('continue');
    else emit('restart');
}

async function shareResult() {
    const text = `Мой результат в «Нейросеть или ты» — ${finalScore.value} очков!`;
    const url = new URL(
        buildResultPath({
            score: finalScore.value,
            character: props.character.id,
            outcome: props.result.outcome,
        }),
        window.location.origin,
    ).href;
    const shareData = {
        title: 'Нейросеть или ты',
        text,
        url,
    };
    isSharing.value = true;
    shareStatus.value = '';

    try {
        const result = await shareOrCopyResult(shareData);
        if (result === 'copied') shareStatus.value = 'Ссылка скопирована.';
        if (result === 'shared') shareStatus.value = 'Результат отправлен.';
        if (result === 'failed') shareStatus.value = 'Не удалось скопировать ссылку.';
    } finally {
        isSharing.value = false;
    }
}
</script>

<template>
    <div
        class="result-modal"
        :data-outcome="result.outcome"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-title"
        aria-describedby="result-message"
    >
        <div class="result-modal__card">
            <img
                class="result-modal__character"
                :src="characterSource"
                :alt="
                    isVictory
                        ? 'Герой празднует успешный забег'
                        : 'Проигравший герой лежит на земле'
                "
            />
            <h2
                id="result-title"
                class="result-modal__title"
            >
                Игра окончена
            </h2>
            <p class="result-modal__score"><img :src="coinSource" />{{ finalScore }}</p>
            <p
                id="result-message"
                class="result-modal__message"
            >
                {{ copy.message }}
            </p>

            <a
                v-if="!isVictory"
                class="result-modal__link"
                href="https://hh.ru/vacancies/operator_sklada"
                target="_blank"
                rel="noopener noreferrer"
            >
                Найти вакансию оператора склада
            </a>

            <div class="result-modal__actions">
                <button
                    ref="primaryButton"
                    class="button button--primary result-modal__button result-modal__primary-action"
                    type="button"
                    @click="handlePrimaryAction"
                >
                    {{ isVictory ? 'Продолжить бежать' : 'Войти в IT ещё раз' }}
                </button>
                <div class="result-modal__icon-actions">
                    <button
                        class="button result-modal__icon-button result-modal__icon-button--share"
                        type="button"
                        aria-label="Поделиться результатом"
                        :disabled="isSharing"
                        @click="shareResult"
                    >
                        <ShareIcon aria-hidden="true" />
                    </button>
                    <button
                        class="button result-modal__icon-button result-modal__icon-button--change"
                        type="button"
                        aria-label="Сменить героя"
                        @click="emit('selectCharacter')"
                    >
                        <ChangeIcon aria-hidden="true" />
                    </button>
                </div>
            </div>
            <p
                class="result-modal__share-status"
                aria-live="polite"
            >
                {{ shareStatus }}
            </p>
        </div>
    </div>
</template>
