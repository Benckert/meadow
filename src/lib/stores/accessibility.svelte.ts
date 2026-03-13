import { browser } from '$app/environment';

class AccessibilityState {
	reducedMotion = $state(false);
	prefersColorScheme: 'light' | 'dark' = $state('dark');
	highContrast = $state(false);

	constructor() {
		if (browser) {
			// Detect prefers-reduced-motion
			const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			this.reducedMotion = motionQuery.matches;
			motionQuery.addEventListener('change', (e) => {
				this.reducedMotion = e.matches;
			});

			// Detect color scheme
			const schemeQuery = window.matchMedia('(prefers-color-scheme: light)');
			this.prefersColorScheme = schemeQuery.matches ? 'light' : 'dark';
			schemeQuery.addEventListener('change', (e) => {
				this.prefersColorScheme = e.matches ? 'light' : 'dark';
			});

			// Detect high contrast
			const contrastQuery = window.matchMedia('(prefers-contrast: more)');
			this.highContrast = contrastQuery.matches;
			contrastQuery.addEventListener('change', (e) => {
				this.highContrast = e.matches;
			});
		}
	}
}

export const a11yState = new AccessibilityState();
