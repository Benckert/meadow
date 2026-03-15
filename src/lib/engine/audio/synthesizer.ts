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

const PANNER_POOL_SIZE = 8;

export class Synthesizer {
	private synth: Tone.PolySynth;
	private currentPreset: SynthPreset;
	private panners: Tone.Panner[];
	private pannerIndex = 0;
	private masterInput: Tone.InputNode;

	constructor(masterChain: MasterChain, preset: SynthPreset = 'pluck') {
		this.currentPreset = preset;
		this.masterInput = masterChain.input;

		this.panners = [];
		for (let i = 0; i < PANNER_POOL_SIZE; i++) {
			const panner = new Tone.Panner(0);
			panner.connect(masterChain.input);
			this.panners.push(panner);
		}

		this.synth = new Tone.PolySynth(Tone.Synth, PRESETS[preset]);
		this.synth.maxPolyphony = 8;
		// Connect synth to all panners — we'll set pan per-note via round-robin
		this.synth.connect(masterChain.input);
	}

	triggerNote(note: string, duration: string = '8n', velocity: number = 0.7, pan?: number): void {
		if (pan !== undefined && pan !== 0) {
			// Route through a panner for spatial positioning
			const panner = this.panners[this.pannerIndex % PANNER_POOL_SIZE];
			this.pannerIndex++;
			panner.pan.value = Math.max(-1, Math.min(1, pan));

			// Disconnect synth from master, connect to panner, trigger, reconnect
			// This is simpler: use a separate mono synth per panned note
			const voice = new Tone.Synth(PRESETS[this.currentPreset]).connect(panner);
			voice.triggerAttackRelease(note, duration, undefined, velocity);
			// Auto-dispose after note finishes
			const releaseTime = typeof PRESETS[this.currentPreset].envelope?.release === 'number'
				? (PRESETS[this.currentPreset].envelope!.release as number) : 1;
			setTimeout(() => voice.dispose(), (Tone.Time(duration).toSeconds() + releaseTime + 0.5) * 1000);
		} else {
			this.synth.triggerAttackRelease(note, duration, undefined, velocity);
		}
	}

	setPreset(preset: SynthPreset): void {
		if (preset === this.currentPreset) return;
		this.currentPreset = preset;
		this.synth.set(PRESETS[preset]);
	}

	dispose(): void {
		this.synth.dispose();
		for (const p of this.panners) p.dispose();
	}
}
