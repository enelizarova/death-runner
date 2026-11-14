<script setup lang="ts">
import { computed, shallowRef } from 'vue';

import type { Character } from '../../types/game';
import SceneBackground from '../scene/SceneBackground.vue';
import CharacterPicker from './CharacterPicker.vue';
import SelectedCharacterPreview from './SelectedCharacterPreview.vue';
import StartControlsHint from './StartControlsHint.vue';

const props = defineProps<{
    characters: Character[];
}>();

const emit = defineEmits<{
    start: [character: Character];
}>();

const selectedCharacter = shallowRef<Character | null>(props.characters[0] ?? null);
const selectedId = computed(() => selectedCharacter.value?.id ?? '');

function start() {
    if (selectedCharacter.value) emit('start', selectedCharacter.value);
}
</script>

<template>
    <main class="start-screen">
        <SceneBackground static />
        <section
            class="start-screen__panel"
            aria-labelledby="start-title"
        >
            <h1
                id="start-title"
                class="start-screen__title title-gradient"
            >
                Нейросеть <br />
                или ты
            </h1>
            <CharacterPicker
                :characters="characters"
                :selected-id="selectedId"
                @select="selectedCharacter = $event"
            />
            <StartControlsHint />
            <SelectedCharacterPreview
                v-if="selectedCharacter"
                class="start-screen__hero"
                :character="selectedCharacter"
            />
            <button
                class="button button--primary start-screen__play"
                type="button"
                :disabled="!selectedCharacter"
                @click="start"
            >
                Побежали
            </button>
        </section>
    </main>
</template>
