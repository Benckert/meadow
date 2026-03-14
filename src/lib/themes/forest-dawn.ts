import type { ThemeConfig } from '$lib/stores/types';

export const forestDawn: ThemeConfig = {
	id: 'forest-dawn',
	name: 'Forest at Dawn',
	colors: {
		background: ['#102C26', '#1a3d30'],
		panel: 'rgba(18, 68, 56, 0.6)',
		primary: '#155435',
		secondary: '#41915B',
		accent: '#F6E6BB',
		textPrimary: 'rgba(246, 230, 187, 0.9)',
		textSecondary: 'rgba(246, 230, 187, 0.6)',
		glassBorder: 'rgba(246, 230, 187, 0.12)',
		particleColors: ['#41915B', '#6BBF7A', '#F6E6BB', '#C8D9A0'],
		gridActive: 'rgba(246, 230, 187, 0.35)',
		gridInactive: 'rgba(21, 84, 53, 0.2)',
		glassTint: 'rgba(18, 68, 56, 0.35)'
	},
	particleConfig: {
		count: 3000,
		baseSize: 3.0,
		sizeVariance: 2.0,
		baseSpeed: 0.15,
		speedVariance: 0.1,
		lifespan: 8.0
	},
	shaderUniforms: {
		glowIntensity: 0.6,
		noiseScale: 1.2,
		flowSpeed: 0.3
	}
};
