const MAX_SHARED_SCORE = 999_999_999;

export const sharedCharacters = Object.freeze({
    designer: Object.freeze({
        id: 'designer',
        name: 'Дизайнер',
        image: '/assets/characters/start/designer.svg',
    }),
    developer: Object.freeze({
        id: 'developer',
        name: 'Разраб',
        image: '/assets/characters/start/developer.svg',
    }),
    front: Object.freeze({
        id: 'front',
        name: 'Фронт',
        image: '/assets/characters/start/front.svg',
    }),
});

/** @param {{ score?: unknown, character?: unknown, outcome?: unknown }} input */
export function normalizeSharedResult(input) {
    const numericScore = Number(input.score);
    const score = Number.isFinite(numericScore)
        ? Math.min(MAX_SHARED_SCORE, Math.max(0, Math.floor(numericScore)))
        : 0;
    const characterId =
        typeof input.character === 'string' && input.character in sharedCharacters
            ? input.character
            : 'designer';

    return Object.freeze({
        score,
        character: sharedCharacters[characterId],
        outcome: input.outcome === 'victory' ? 'victory' : 'defeat',
    });
}

/** @param {URLSearchParams} searchParams */
export function parseSharedResult(searchParams) {
    return normalizeSharedResult({
        score: searchParams.get('score'),
        character: searchParams.get('character'),
        outcome: searchParams.get('outcome'),
    });
}

/** @param {{ score?: unknown, character?: unknown, outcome?: unknown }} input */
export function createResultSearchParams(input) {
    const result = normalizeSharedResult(input);
    return new URLSearchParams({
        score: String(result.score),
        character: result.character.id,
        outcome: result.outcome,
    });
}

/** @param {{ score?: unknown, character?: unknown, outcome?: unknown }} input */
export function buildResultPath(input) {
    return `/api/result?${createResultSearchParams(input)}`;
}

/** @param {{ score?: unknown, character?: unknown, outcome?: unknown }} input */
export function buildOgImagePath(input) {
    return `/api/og?${createResultSearchParams(input)}`;
}
