import * as Tone from 'tone';
import type { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import type { MasterChain } from './master-chain';

export type SynthPreset = 'pad' | 'pluck' | 'bell';

const PRESETS: Record<SynthPreset, RecursivePartial<Tone.SynthOptions>> = {
	pad: {
		oscillator: { type: 'sine' },
		envelope: {
			attack: 0.8,
			decay: 1.0,
			sustain: 0.6,
			release: 2.0
		}
	},
	pluck: {
		oscillator: { type: 'triangle' },
		envelope: {
			attack: 0.005,
			decay: 0.3,
			sustain: 0.1,
			release: 0.8
		}
	},
	bell: {
		oscillator: { type: 'fmsine' },
		envelope: {
			attack: 0.001,
			decay: 1.5,
			sustain: 0.0,
			release: 1.5
		}
	}
};

export class Synthesizer {
	private synth: Tone.PolySynth;
	private currentPreset: SynthPreset;

	constructor(masterChain: MasterChain, preset: SynthPreset = 'pluck') {
		this.currentPreset = preset;
		this.synth = new Tone.PolySynth(Tone.Synth, PRESETS[preset]);
		this.synth.maxPolyphony = 8;
		this.synth.connect(masterChain.input);
	}

	triggerNote(note: string, duration: string = '8n', velocity: number = 0.7): void {
		this.synth.triggerAttackRelease(note, duration, undefined, velocity);
	}

	setPreset(preset: SynthPreset): void {
		if (preset === this.currentPreset) return;
		this.currentPreset = preset;
		this.synth.set(PRESETS[preset]);
	}

	dispose(): void {
		this.synth.dispose();
	}
}
