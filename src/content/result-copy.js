// @ts-check

const resultCopy = Object.freeze({
    victory: Object.freeze([
        Object.freeze({
            title: 'Пока не заменили!',
            message:
                'Вы всё ещё быстрее алгоритмов. Можно остановиться или проверить себя ещё раз.',
        }),
        Object.freeze({
            title: 'Вы всё ещё нужны!',
            message: 'Навыки, реакция и немного удачи снова спасли вашу карьеру.',
        }),
        Object.freeze({
            title: 'ИИ не догнал!',
            message: 'Этот рубеж ваш. Продолжайте забег или поделитесь результатом.',
        }),
        Object.freeze({
            title: 'Человечность подтверждена!',
            message: 'Нейросеть осталась позади, а вы сохранили место в профессии.',
        }),
    ]),
    defeat: Object.freeze([
        Object.freeze({
            title: 'Нейросеть догнала',
            message: 'Забег закончен, но результатом всё ещё можно поделиться.',
        }),
        Object.freeze({
            title: 'Игра окончена',
            message: 'Автоматизация оказалась быстрее. Попробуйте ещё один забег.',
        }),
        Object.freeze({
            title: 'Добро пожаловать на склад',
            message: 'Нейросеть заняла ваше место, но реванш никто не отменял.',
        }),
        Object.freeze({
            title: 'Забег окончен',
            message: 'Сегодня победили алгоритмы. Завтра всё может быть иначе.',
        }),
    ]),
});

/**
 * @param {'victory' | 'defeat'} outcome
 * @param {() => number} [random]
 */
export function selectResultCopy(outcome, random = Math.random) {
    const variants = resultCopy[outcome];
    const index = Math.min(Math.floor(random() * variants.length), variants.length - 1);
    return variants[Math.max(0, index)];
}
