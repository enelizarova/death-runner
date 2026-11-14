import { SCENE, viewport } from '../game/config.js';

export function createSceneRenderer({ townTrack, treeTrack, buildingTrack, cloudTrack, grass }) {
    function getTranslation(offset) {
        const progress = (offset % viewport.width) / viewport.width;
        return progress * 50;
    }

    function getBuildingTranslation(offset) {
        const loopWidth = viewport.width * 2;
        const progress = (offset % loopWidth) / loopWidth;
        return progress * 50;
    }

    function render(game) {
        const townX = getTranslation(game.scenery.townOffset);
        const treeX = getTranslation(game.scenery.treeOffset);
        const buildingX = getBuildingTranslation(game.scenery.buildingOffset);
        const cloudX = getTranslation(game.scenery.cloudOffset);

        grass.style.setProperty(
            '--grass-far-x',
            `-${game.scenery.grassOffset * SCENE.grassFarSpeedFactor}px`,
        );
        townTrack.style.transform = `translate3d(-${townX}%, 0, 0)`;
        treeTrack.style.transform = `translate3d(-${treeX}%, 0, 0)`;
        buildingTrack.style.transform = `translate3d(-${buildingX}%, 0, 0)`;
        cloudTrack.style.transform = `translate3d(-${cloudX}%, 0, 0)`;
    }

    return Object.freeze({ destroy: () => {}, render });
}
