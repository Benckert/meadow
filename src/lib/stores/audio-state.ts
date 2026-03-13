// Shared typed arrays for audio data — read by the visual renderer every frame.
// These bypass Svelte reactivity intentionally: 60fps updates of 256+ floats
// would cause unnecessary overhead through the reactivity system.

export const fftData = new Float32Array(256);
export const waveformData = new Float32Array(256);
export const amplitude = new Float32Array(1);
