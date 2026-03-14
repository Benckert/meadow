import type { ThemeConfig } from '$lib/stores/types';

export const sunsetCanyon: ThemeConfig = {
	id: 'sunset-canyon',
	name: 'Sunset Canyon',
	colors: {
		background: ['#3F2312', '#2a1a0e'],
		panel: 'rgba(112, 64, 27, 0.6)',
		primary: '#70401B',
		secondary: '#D6A42F',
		accent: '#DEBE90',
		textPrimary: 'rgba(222, 190, 144, 0.9)',
		textSecondary: 'rgba(222, 190, 144, 0.6)',
		glassBorder: 'rgba(222, 190, 144, 0.12)',
		particleColors: ['#D6A42F', '#DEBE90', '#A76B26', '#E8C86A'],
		gridActive: 'rgba(214, 164, 47, 0.35)',
		gridInactive: 'rgba(112, 64, 27, 0.2)',
		glassTint: 'rgba(112, 64, 27, 0.35)'
	},
	particleConfig: {
		count: 3000,
		baseSize: 2.5,
		sizeVariance: 1.5,
		baseSpeed: 0.2,
		speedVariance: 0.15,
		lifespan: 6.0
	},
	shaderUniforms: {
		glowIntensity: 0.9,
		noiseScale: 1.5,
		flowSpeed: 0.4
	}
};
