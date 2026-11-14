<script setup lang="ts">
import type { Character } from '../../types/game';

defineProps<{
    character: Character;
    selected: boolean;
}>();

defineEmits<{
    select: [character: Character];
}>();
</script>

<template>
    <button
        class="character-card"
        :class="[`character-card--${character.id}`, { 'character-card--selected': selected }]"
        type="button"
        role="radio"
        :aria-checked="selected"
        @click="$emit('select', character)"
    >
        <span class="character-card__image-wrapper">
            <img
                class="character-card__image"
                :src="character.presentation.preview"
                alt=""
            />
        </span>
        <strong class="character-card__name">
            {{ character.presentation.name }}
        </strong>
    </button>
</template>
