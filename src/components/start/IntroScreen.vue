<script setup lang="ts">
defineEmits<{
    continue: [];
}>();

const evilSource = `${import.meta.env.BASE_URL}assets/characters/evil.svg`;
</script>

<template>
    <main class="intro-screen">
        <section
            class="intro-screen__panel"
            aria-labelledby="intro-title"
        >
            <h1
                id="intro-title"
                class="intro-screen__title title-gradient"
            >
                Нейросеть <br />
                или ты
            </h1>

            <p class="intro-screen__goal">
                <strong>Цель игры:</strong> убежать от навязчивой нейронки, которая хочет
                заместить тебя в работе и забрать твои задачи.
            </p>

            <div class="intro-screen__story">
                <p>
                    Но на пути у тебя будут сложности в виде офисного бездельника, которому
                    всё нипочём и его-то точно ничто не заменит, пропасти отчаяния и чего-то
                    ещё, что мы придумаем позже.
                </p>
                <p>
                    У тебя один союзник на этом пути — робот-доставщик сердечек, но спасёт
                    тебя он, только при прыжке на него.
                </p>
                <p>Не дай нейронке отобрать у тебя твои задачки!</p>
            </div>

            <img
                class="intro-screen__robot"
                :src="evilSource"
                alt=""
            />

            <button
                class="button button--primary intro-screen__continue"
                type="button"
                @click="$emit('continue')"
            >
                Начать игру
            </button>
        </section>
    </main>
</template>
