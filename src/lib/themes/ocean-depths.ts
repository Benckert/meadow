import type { ThemeConfig } from '$lib/stores/types';

export const oceanDepths: ThemeConfig = {
	id: 'ocean-depths',
	name: 'Ocean Depths',
	colors: {
		background: ['#0B1818', '#0f2830'],
		panel: 'rgba(26, 72, 79, 0.6)',
		primary: '#1A484F',
		secondary: '#0587AA',
		accent: '#89B4BB',
		particleColors: ['#0587AA', '#89B4BB', '#3C6955', '#557265'],
		gridActive: 'rgba(5, 135, 170, 0.35)',
		gridInactive: 'rgba(26, 72, 79, 0.2)',
		glassTint: 'rgba(26, 72, 79, 0.35)'
	},
	particleConfig: {
		count: 3000,
		baseSize: 4.0,
		sizeVariance: 3.0,
		baseSpeed: 0.08,
		speedVariance: 0.06,
		lifespan: 12.0
	},
	shaderUniforms: {
		glowIntensity: 0.8,
		noiseScale: 0.8,
		flowSpeed: 0.15
	}
};
