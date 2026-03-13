import * as Tone from 'tone';
import { WindSynth } from './wind-synth';
import { RainSynth } from './rain-synth';
import { BirdSynth } from './bird-synth';
import type { ThemeId } from '$lib/stores/types';

interface NatureMix {
	wind: number;
	rain: number;
	birds: number;
}

const THEME_MIXES: Record<ThemeId, NatureMix> = {
	'forest-dawn': { wind: 0.3, rain: 0.0, birds: 0.8 },
	'ocean-depths': { wind: 0.7, rain: 0.5, birds: 0.0 },
	'sunset-canyon': { wind: 0.5, rain: 0.0, birds: 0.3 }
};

/**
 * Manages all nature synths. Theme-aware mixing:
 * Forest = birds + light wind, Ocean = waves + rain, Canyon = dry wind + sparse birds.
 */
export class NatureController {
	private wind: WindSynth;
	private rain: RainSynth;
	private birds: BirdSynth;
	private masterGain: Tone.Gain;
	private active = false;
	private currentTheme: ThemeId;
	private gustInterval: ReturnType<typeof setInterval> | null = null;

	constructor(destination: Tone.InputNode, theme: ThemeId = 'forest-dawn') {
		this.currentTheme = theme;
		this.masterGain = new Tone.Gain(0.6);
		this.masterGain.connect(destination as unknown as Tone.InputNode);

		this.wind = new WindSynth(this.masterGain as unknown as Tone.InputNode);
		this.rain = new RainSynth(this.masterGain as unknown as Tone.InputNode);
		this.birds = new BirdSynth(this.masterGain as unknown as Tone.InputNode);

		this.applyThemeMix(theme);
	}

	start(): void {
		if (this.active) return;
		this.active = true;

		const mix = THEME_MIXES[this.currentTheme];

		if (mix.wind > 0) this.wind.start();
		if (mix.rain > 0) this.rain.start();
		if (mix.birds > 0) this.birds.start();

		// Schedule occasional gusts
		this.gustInterval = setInterval(() => {
			if (this.active && this.wind.isActive && Math.random() > 0.6) {
				this.wind.gust();
			}
		}, 5000);
	}

	stop(): void {
		this.active = false;
		this.wind.stop();
		this.rain.stop();
		this.birds.stop();
		if (this.gustInterval) {
			clearInterval(this.gustInterval);
			this.gustInterval = null;
		}
	}

	setTheme(theme: ThemeId): void {
		this.currentTheme = theme;
		this.applyThemeMix(theme);

		if (this.active) {
			// Restart with new mix
			this.stop();
			this.start();
		}
	}

	private applyThemeMix(theme: ThemeId): void {
		const mix = THEME_MIXES[theme];
		this.wind.setVolume(mix.wind);
		this.rain.setIntensity(mix.rain);
		this.birds.setVolume(mix.birds);
	}

	setMasterVolume(vol: number): void {
		this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
	}

	get isActive(): boolean {
		return this.active;
	}

	dispose(): void {
		this.stop();
		this.wind.dispose();
		this.rain.dispose();
		this.birds.dispose();
		this.masterGain.dispose();
	}
}
