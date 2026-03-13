import type { QualityLevel } from '$lib/stores/types';

export interface QualityPreset {
	particleCount: number;
	enableBloom: boolean;
	enableFilmGrain: boolean;
	enableChromaticAberration: boolean;
	postProcessingScale: number; // render scale, 1.0 = full res
}

export const QUALITY_PRESETS: Record<QualityLevel, QualityPreset> = {
	high: {
		particleCount: 5000,
		enableBloom: true,
		enableFilmGrain: true,
		enableChromaticAberration: true,
		postProcessingScale: 1.0
	},
	medium: {
		particleCount: 2000,
		enableBloom: true,
		enableFilmGrain: false,
		enableChromaticAberration: false,
		postProcessingScale: 0.75
	},
	low: {
		particleCount: 1000,
		enableBloom: false,
		enableFilmGrain: false,
		enableChromaticAberration: false,
		postProcessingScale: 0.5
	}
};
