import type { ThemeConfig, ThemeId } from '$lib/stores/types';
import { forestDawn } from './forest-dawn';
import { oceanDepths } from './ocean-depths';
import { sunsetCanyon } from './sunset-canyon';

const themes: Record<ThemeId, ThemeConfig> = {
	'forest-dawn': forestDawn,
	'ocean-depths': oceanDepths,
	'sunset-canyon': sunsetCanyon
};

export function getTheme(id: ThemeId): ThemeConfig {
	return themes[id];
}

export function getAllThemes(): ThemeConfig[] {
	return Object.values(themes);
}

export { forestDawn, oceanDepths, sunsetCanyon };
