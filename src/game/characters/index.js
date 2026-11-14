import { designer } from './designer.js';
import { developer } from './developer.js';
import { front } from './front.js';

export const characters = Object.freeze({ designer, front, developer });

export const activeCharacter = characters.designer;
