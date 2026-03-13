import type { ThemeColors, ThemeId } from '$lib/stores/types';

export type ColorblindMode = 'deuteranopia' | 'protanopia' | 'tritanopia';

/**
 * Okabe-Ito inspired colorblind-safe palette overrides.
 * Uses luminance contrast as primary differentiator rather than hue.
 */
const overrides: Record<ColorblindMode, Record<ThemeId, Partial<ThemeColors>>> = {
	deuteranopia: {
		'forest-dawn': {
			secondary: '#4A90D9',   // Blue instead of green
			accent: '#F5C542',
			particleColors: ['#4A90D9', '#F5C542', '#E8E8E8', '#7AB8CC'],
			gridActive: 'rgba(74, 144, 217, 0.35)'
		},
		'ocean-depths': {
			secondary: '#D55E00',
			accent: '#E8E8E8',
			particleColors: ['#D55E00', '#E8E8E8', '#56B4E9', '#CC79A7'],
			gridActive: 'rgba(213, 94, 0, 0.35)'
		},
		'sunset-canyon': {
			secondary: '#56B4E9',
			accent: '#E8E8E8',
			particleColors: ['#56B4E9', '#E8E8E8', '#D55E00', '#CC79A7'],
			gridActive: 'rgba(86, 180, 233, 0.35)'
		}
	},
	protanopia: {
		'forest-dawn': {
			secondary: '#56B4E9',
			accent: '#F0E442',
			particleColors: ['#56B4E9', '#F0E442', '#E8E8E8', '#009E73'],
			gridActive: 'rgba(86, 180, 233, 0.35)'
		},
		'ocean-depths': {
			secondary: '#E69F00',
			accent: '#E8E8E8',
			particleColors: ['#E69F00', '#56B4E9', '#E8E8E8', '#0072B2'],
			gridActive: 'rgba(230, 159, 0, 0.35)'
		},
		'sunset-canyon': {
			secondary: '#0072B2',
			accent: '#F0E442',
			particleColors: ['#0072B2', '#F0E442', '#E8E8E8', '#E69F00'],
			gridActive: 'rgba(0, 114, 178, 0.35)'
		}
	},
	tritanopia: {
		'forest-dawn': {
			secondary: '#CC79A7',
			accent: '#E8E8E8',
			particleColors: ['#CC79A7', '#E8E8E8', '#D55E00', '#009E73'],
			gridActive: 'rgba(204, 121, 167, 0.35)'
		},
		'ocean-depths': {
			secondary: '#D55E00',
			accent: '#E8E8E8',
			particleColors: ['#D55E00', '#E8E8E8', '#CC79A7', '#009E73'],
			gridActive: 'rgba(213, 94, 0, 0.35)'
		},
		'sunset-canyon': {
			secondary: '#CC79A7',
			accent: '#E8E8E8',
			particleColors: ['#CC79A7', '#E8E8E8', '#D55E00', '#009E73'],
			gridActive: 'rgba(204, 121, 167, 0.35)'
		}
	}
};

export function getColorblindOverrides(
	mode: ColorblindMode,
	themeId: ThemeId
): Partial<ThemeColors> {
	return overrides[mode]?.[themeId] ?? {};
}
