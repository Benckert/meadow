import * as Tone from 'tone';
import { MasterChain } from './master-chain';
import { Synthesizer } from './synthesizer';
import { eventBus } from '$lib/stores/event-bus';
import { fftData, waveformData, amplitude } from '$lib/stores/audio-state';

export class AudioEngine {
	private masterChain: MasterChain | null = null;
	private synthesizer: Synthesizer | null = null;
	private animationFrameId: number | null = null;
	private waveformAnalyser: Tone.Analyser | null = null;
	private initialized = false;

	async init(): Promise<void> {
		if (this.initialized) return;

		// Start Tone.js context — handles iOS Safari resume requirement
		await Tone.start();

		this.masterChain = new MasterChain();
		this.synthesizer = new Synthesizer(this.masterChain);

		// Create a separate waveform analyser
		this.waveformAnalyser = new Tone.Analyser('waveform', 256);
		this.masterChain.limiter.connect(this.waveformAnalyser);

		this.initialized = true;
		this.startAnalysis();
	}

	private startAnalysis(): void {
		const pump = () => {
			if (!this.masterChain || !this.waveformAnalyser) return;

			// Read FFT data
			const fft = this.masterChain.analyser.getValue();
			if (fft instanceof Float32Array) {
				fftData.set(fft);
			}

			// Read waveform data
			const wave = this.waveformAnalyser.getValue();
			if (wave instanceof Float32Array) {
				waveformData.set(wave);
			}

			// Compute RMS amplitude
			let sum = 0;
			for (let i = 0; i < waveformData.length; i++) {
				sum += waveformData[i] * waveformData[i];
			}
			const rms = Math.sqrt(sum / waveformData.length);
			amplitude[0] = rms;

			eventBus.emit('audio:amplitude', rms);

			this.animationFrameId = requestAnimationFrame(pump);
		};
		this.animationFrameId = requestAnimationFrame(pump);
	}

	triggerNote(note: string, duration: string = '8n', velocity: number = 0.7): void {
		this.synthesizer?.triggerNote(note, duration, velocity);
	}

	get isInitialized(): boolean {
		return this.initialized;
	}

	dispose(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
		}
		this.waveformAnalyser?.dispose();
		this.synthesizer?.dispose();
		this.masterChain?.dispose();
		this.initialized = false;
	}
}
