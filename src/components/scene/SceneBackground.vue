<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{ static?: boolean }>(), {
    static: false,
});

const townTrack = ref<HTMLElement | null>(null);
const treeTrack = ref<HTMLElement | null>(null);
const buildingTrack = ref<HTMLElement | null>(null);
const cloudTrack = ref<HTMLElement | null>(null);
const roadUpper = ref<HTMLElement | null>(null);
const grass = ref<HTMLElement | null>(null);
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

defineExpose({ townTrack, treeTrack, buildingTrack, cloudTrack, roadUpper, grass });
</script>

<template>
    <div
        class="scene"
        :class="{ 'scene--static': props.static }"
        aria-hidden="true"
    >
        <div
            ref="cloudTrack"
            class="scene__cloud-track"
        >
            <div
                v-for="field in 2"
                :key="field"
                class="scene__cloud-field"
            >
                <img
                    class="scene__cloud scene__cloud--left"
                    :src="assetUrl('cloud.svg')"
                    alt=""
                />
                <img
                    class="scene__cloud scene__cloud--center"
                    :src="assetUrl('cloud.svg')"
                    alt=""
                />
                <img
                    class="scene__cloud scene__cloud--right"
                    :src="assetUrl('cloud.svg')"
                    alt=""
                />
            </div>
        </div>
        <div
            ref="townTrack"
            class="scene__town-track"
        >
            <div
                v-for="field in 2"
                :key="field"
                class="scene__town-field"
            >
                <img
                    class="scene__town"
                    :src="assetUrl('city-pattern.svg')"
                    alt=""
                />
            </div>
        </div>
        <div
            ref="treeTrack"
            class="scene__tree-track"
        >
            <div
                v-for="field in 2"
                :key="field"
                class="scene__tree-field"
            >
                <img
                    class="scene__tree scene__tree--right"
                    :src="assetUrl('bush-pattern-2.svg')"
                    alt=""
                />
                <img
                    class="scene__tree scene__tree--left"
                    :src="assetUrl('bush-pattern-1.svg')"
                    alt=""
                />
            </div>
        </div>
        <div
            ref="buildingTrack"
            class="scene__building-track"
        >
            <div
                v-for="field in 4"
                :key="field"
                class="scene__building-field"
            >
                <img
                    class="scene__building scene__building--left"
                    :class="{ 'max-lg:hidden': !props.static && field % 2 === 0 }"
                    :src="assetUrl('building-left.svg')"
                    alt=""
                />
                <img
                    class="scene__building scene__building--right"
                    :class="{ 'max-lg:hidden': !props.static && field % 2 !== 0 }"
                    :src="assetUrl('building-right.svg')"
                    alt=""
                />
            </div>
        </div>
        <div class="scene__bushes">
            <img
                class="scene__bush scene__bush--left"
                :src="assetUrl('bush1.svg')"
                alt=""
            />
            <img
                class="scene__bush scene__bush--right"
                :src="assetUrl('bush2.svg')"
                alt=""
            />
        </div>
        <div class="scene__road">
            <div
                ref="roadUpper"
                class="scene__road-upper"
            ></div>
            <div class="scene__road-lower"></div>
        </div>
        <div
            ref="grass"
            class="scene__grass"
        ></div>
    </div>
</template>
