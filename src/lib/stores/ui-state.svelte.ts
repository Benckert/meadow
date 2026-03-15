import type { ThemeId, QualityLevel } from './types';

class UIState {
	isPlaying = $state(false);
	currentTheme: ThemeId = $state('forest-dawn');
	bpm = $state(90);
	activeScale = $state('C major pentatonic');
	uiVisible = $state(true);
	qualityLevel: QualityLevel = $state('high');
	audioInitialized = $state(false);
}

export const uiState = new UIState();
