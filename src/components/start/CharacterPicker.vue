<script setup lang="ts">
import type { Character } from '../../types/game';
import CharacterCard from './CharacterCard.vue';

defineProps<{
    characters: Character[];
    selectedId: string;
}>();

defineEmits<{
    select: [character: Character];
}>();
</script>

<template>
    <section
        class="character-picker"
        role="radiogroup"
        aria-label="Выбор героя"
    >
        <p>Кто ты пока?</p>
        <div class="character-picker__wrapper">
            <CharacterCard
                v-for="character in characters"
                :key="character.id"
                :character="character"
                :selected="character.id === selectedId"
                @select="$emit('select', $event)"
            />
        </div>
    </section>
</template>
