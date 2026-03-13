import * as Tone from 'tone';

/**
 * Wind synthesis from filtered pink noise with slowly modulated
 * bandpass filter and occasional gusts.
 */
export class WindSynth {
	private noise: Tone.Noise;
	private filter: Tone.Filter;
	private gain: Tone.Gain;
	private filterLFO: Tone.LFO;
	private volumeLFO: Tone.LFO;
	private active = false;

	constructor(destination: Tone.InputNode) {
		this.noise = new Tone.Noise('pink');

		this.filter = new Tone.Filter({
			frequency: 400,
			type: 'bandpass',
			Q: 2
		});

		this.gain = new Tone.Gain(0);

		// Slow modulation of filter center frequency (breathing wind)
		this.filterLFO = new Tone.LFO({
			frequency: 0.08,
			min: 200,
			max: 800,
			type: 'sine'
		});
		this.filterLFO.connect(this.filter.frequency);

		// Volume swells
		this.volumeLFO = new Tone.LFO({
			frequency: 0.05,
			min: 0.05,
			max: 0.25,
			type: 'sine'
		});
		this.volumeLFO.connect(this.gain.gain);

		this.noise.connect(this.filter);
		this.filter.connect(this.gain);
		this.gain.connect(destination as unknown as Tone.InputNode);
	}

	start(): void {
		if (this.active) return;
		this.active = true;
		this.noise.start();
		this.filterLFO.start();
		this.volumeLFO.start();
	}

	stop(): void {
		if (!this.active) return;
		this.active = false;
		this.noise.stop();
		this.filterLFO.stop();
		this.volumeLFO.stop();
	}

	/** Trigger a gust — rapid filter sweep */
	gust(): void {
		if (!this.active) return;
		const now = Tone.now();
		this.filter.frequency.cancelScheduledValues(now);
		this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
		this.filter.frequency.linearRampToValueAtTime(1200, now + 0.3);
		this.filter.frequency.linearRampToValueAtTime(400, now + 2.0);

		this.gain.gain.cancelScheduledValues(now);
		this.gain.gain.setValueAtTime(this.gain.gain.value, now);
		this.gain.gain.linearRampToValueAtTime(0.4, now + 0.2);
		this.gain.gain.linearRampToValueAtTime(0.1, now + 2.5);
	}

	setVolume(vol: number): void {
		this.volumeLFO.max = vol;
		this.volumeLFO.min = vol * 0.2;
	}

	get isActive(): boolean {
		return this.active;
	}

	dispose(): void {
		this.stop();
		this.noise.dispose();
		this.filter.dispose();
		this.gain.dispose();
		this.filterLFO.dispose();
		this.volumeLFO.dispose();
	}
}
