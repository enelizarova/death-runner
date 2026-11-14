function loadImage(source) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image), { once: true });
        image.addEventListener('error', () => reject(new Error(`Не удалось загрузить ${source}`)), {
            once: true,
        });
        image.src = source;
    });
}

export async function loadAssets(sources) {
    const entries = await Promise.all(
        Object.entries(sources).map(async ([name, source]) => [name, await loadImage(source)]),
    );

    return Object.fromEntries(entries);
}
