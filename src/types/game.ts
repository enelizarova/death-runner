export type CharacterId = 'designer' | 'front' | 'developer';

export interface CharacterSize {
    readonly width: number;
    readonly height: number;
}

export interface CharacterHitbox extends CharacterSize {
    readonly offsetX: number;
    readonly offsetY: number;
}

export type CharacterRange = readonly [minimum: number, maximum: number];

export interface CharacterAssets extends Readonly<Record<string, string>> {
    readonly caught: string;
    readonly end: string;
    readonly jump: string;
}

export interface CharacterSizes extends Readonly<Record<string, CharacterSize>> {
    readonly caught: CharacterSize;
    readonly end: CharacterSize;
    readonly jump: CharacterSize;
}

export interface Character {
    readonly id: CharacterId;
    readonly presentation: {
        readonly name: string;
        readonly description: string;
        readonly preview: string;
        readonly success?: string;
    };
    readonly geometry: {
        readonly anchorHeight: number;
        readonly endOffsetX: number;
        readonly jumpShadowReferenceHeight: number;
        readonly hitbox: CharacterHitbox;
    };
    readonly assets: CharacterAssets;
    readonly sizes: CharacterSizes;
    readonly shadows: {
        readonly byPose: Readonly<Record<string, string>>;
        readonly sizes: Readonly<Record<string, CharacterSize>>;
    };
    readonly animations: {
        readonly run: {
            readonly frames: readonly string[];
            readonly frameDuration: number;
            readonly maximumPlaybackRate: number;
        };
        readonly waiting: {
            readonly delay: number;
            readonly frames: readonly string[];
            readonly frameDuration: number;
            readonly repetitionRange: CharacterRange;
            readonly restFrame: string;
            readonly pauseDuration: CharacterRange;
        };
    };
}

export interface GameResult {
    outcome: 'victory' | 'defeat';
    finalScore: number;
}

export interface HudState {
    score: string;
    bestScore: string;
    lives: number;
}
