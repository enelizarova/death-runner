export function getWaitingPose(animation, elapsed, seed) {
    const activeElapsed = elapsed - animation.delay;
    if (activeElapsed < 0) return animation.restFrame;

    const cycleDuration = animation.frames.length * animation.frameDuration;
    const getRandomValue = (salt) => {
        const value = Math.sin(seed * 78.233 + salt) * 43758.5453;
        return value - Math.floor(value);
    };
    const [minimumRepetitions, maximumRepetitions] = animation.repetitionRange;
    const repetitions =
        minimumRepetitions +
        Math.floor(getRandomValue(17.17) * (maximumRepetitions - minimumRepetitions + 1));
    const burstDuration = cycleDuration * repetitions;
    const [minimumPause, maximumPause] = animation.pauseDuration;
    const pauseDuration = minimumPause + getRandomValue(43.31) * (maximumPause - minimumPause);
    const cyclePosition = activeElapsed % (burstDuration + pauseDuration);

    if (cyclePosition >= burstDuration) return animation.restFrame;

    const frameIndex =
        Math.floor(cyclePosition / animation.frameDuration) % animation.frames.length;
    return animation.frames[frameIndex];
}
