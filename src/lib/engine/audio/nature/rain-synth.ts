import * as Tone from 'tone';

/**
 * Rain synthesis using filtered noise bursts with Poisson-distributed timing.
 * Each drop is a very short white noise burst with high-pass filter and random stereo panning.
 */
export class RainSynth {
	private destination: Tone.InputNode;
	private active = false;
	private intensity = 0.5; // 0-1, controls drop density
	private drops: RainDrop[] = [];
	private pendingTimeout: ReturnType<typeof setTimeout> | null = null;
	private readonly MAX_DROPS = 8;

	constructor(destination: Tone.InputNode) {
		this.destination = destination;

		// Pre-create drop pool
		for (let i = 0; i < this.MAX_DROPS; i++) {
			this.drops.push(new RainDrop(destination));
		}
	}

	start(): void {
		if (this.active) return;
		this.active = true;
		this.scheduleDrops();
	}

	stop(): void {
		this.active = false;
		if (this.pendingTimeout !== null) {
			clearTimeout(this.pendingTimeout);
			this.pendingTimeout = null;
		}
	}

	private scheduleDrops(): void {
		const scheduleDrop = () => {
			if (!this.active) return;

			// Find an available drop
			const drop = this.drops.find((d) => !d.playing);
			if (drop) {
				drop.trigger();
			}

			// Poisson-distributed timing based on intensity
			const meanInterval = 0.05 + (1 - this.intensity) * 0.4; // 50ms-450ms
			const delay = -Math.log(Math.random()) * meanInterval;
			this.pendingTimeout = setTimeout(scheduleDrop, delay * 1000);
		};

		scheduleDrop();
	}

	setIntensity(intensity: number): void {
		this.intensity = Math.max(0, Math.min(1, intensity));
	}

	get isActive(): boolean {
		return this.active;
	}

	dispose(): void {
		this.stop();
		for (const drop of this.drops) {
			drop.dispose();
		}
	}
}

class RainDrop {
	private noise: Tone.Noise;
	private filter: Tone.Filter;
	private panner: Tone.Panner;
	private envelope: Tone.AmplitudeEnvelope;
	playing = false;

	constructor(destination: Tone.InputNode) {
		this.noise = new Tone.Noise('white');
		this.filter = new Tone.Filter({
			frequency: 3000 + Math.random() * 5000,
			type: 'highpass'
		});
		this.panner = new Tone.Panner(0);
		this.envelope = new Tone.AmplitudeEnvelope({
			attack: 0.001,
			decay: 0.03 + Math.random() * 0.04,
			sustain: 0,
			release: 0.02
		});

		this.noise.connect(this.filter);
		this.filter.connect(this.envelope);
		this.envelope.connect(this.panner);
		this.panner.connect(destination as unknown as Tone.InputNode);

		this.noise.start();
	}

	trigger(): void {
		this.playing = true;

		// Randomize each drop
		this.panner.pan.value = Math.random() * 2 - 1;
		this.filter.frequency.value = 3000 + Math.random() * 5000;
		this.envelope.decay = 0.02 + Math.random() * 0.04;

		this.envelope.triggerAttackRelease(0.02 + Math.random() * 0.03);

		setTimeout(() => {
			this.playing = false;
		}, 100);
	}

	dispose(): void {
		this.noise.stop();
		this.noise.dispose();
		this.filter.dispose();
		this.panner.dispose();
		this.envelope.dispose();
	}
}
