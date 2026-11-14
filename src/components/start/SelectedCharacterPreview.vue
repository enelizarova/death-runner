<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { getWaitingPose } from '../../game/animations/waiting.js';
import type { Character } from '../../types/game';

const props = defineProps<{
    character: Character;
}>();

const pose = ref(props.character.animations.waiting.restFrame);
const source = computed(() => props.character.assets[pose.value]);
const size = computed(() => props.character.sizes[pose.value]);
const shadowName = computed(() => props.character.shadows.byPose[pose.value]);
const shadowSource = computed(() =>
    shadowName.value ? props.character.assets[shadowName.value] : null,
);
const shadowWidth = computed(() => {
    const shadowSize = props.character.shadows.sizes[pose.value];
    return shadowSize ? `${(shadowSize.width / size.value.width) * 100}%` : undefined;
});

let animationFrameId = 0;
let animationStartedAt = 0;
let waitingSeed = Math.random();

function resetAnimation() {
    pose.value = props.character.animations.waiting.restFrame;
    animationStartedAt = performance.now();
    waitingSeed = Math.random();
}

function renderFrame(timestamp: number) {
    pose.value = getWaitingPose(
        props.character.animations.waiting,
        timestamp - animationStartedAt,
        waitingSeed,
    );
    animationFrameId = requestAnimationFrame(renderFrame);
}

watch(() => props.character.id, resetAnimation);

onMounted(() => {
    resetAnimation();
    animationFrameId = requestAnimationFrame(renderFrame);
});

onBeforeUnmount(() => cancelAnimationFrame(animationFrameId));
</script>

<template>
    <figure class="selected-character-preview">
        <img
            v-if="shadowSource"
            class="selected-character-preview__shadow"
            :src="shadowSource"
            :style="{ width: shadowWidth }"
            alt=""
        />
        <img
            class="selected-character-preview__image"
            :src="source"
            :width="size.width"
            :height="size.height"
            alt=""
        />
    </figure>
</template>
