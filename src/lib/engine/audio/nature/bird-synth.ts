import * as Tone from 'tone';

interface BirdSpecies {
	minFreq: number;
	maxFreq: number;
	chirpDuration: number;
	phrasePause: number;
	chirpsPerPhrase: number;
	modDepth: number;
}

const SPECIES: BirdSpecies[] = [
	// Songbird: high, fast chirps
	{ minFreq: 2000, maxFreq: 4000, chirpDuration: 0.06, phrasePause: 3, chirpsPerPhrase: 5, modDepth: 300 },
	// Warbler: mid-range, medium pace
	{ minFreq: 1200, maxFreq: 2500, chirpDuration: 0.1, phrasePause: 5, chirpsPerPhrase: 3, modDepth: 500 },
	// Dove: low, slow coos
	{ minFreq: 400, maxFreq: 800, chirpDuration: 0.3, phrasePause: 8, chirpsPerPhrase: 2, modDepth: 100 }
];

/**
 * Birdsong synthesis using FM synthesis chirps with randomized call patterns.
 * Multiple "species" with different pitch ranges and rhythms.
 */
export class BirdSynth {
	private birds: BirdVoice[] = [];
	private active = false;

	constructor(destination: Tone.InputNode) {
		for (const species of SPECIES) {
			this.birds.push(new BirdVoice(species, destination));
		}
	}

	start(): void {
		if (this.active) return;
		this.active = true;
		for (const bird of this.birds) {
			bird.start();
		}
	}

	stop(): void {
		this.active = false;
		for (const bird of this.birds) {
			bird.stop();
		}
	}

	setVolume(vol: number): void {
		for (const bird of this.birds) {
			bird.setVolume(vol);
		}
	}

	get isActive(): boolean {
		return this.active;
	}

	dispose(): void {
		this.stop();
		for (const bird of this.birds) {
			bird.dispose();
		}
	}
}

class BirdVoice {
	private species: BirdSpecies;
	private carrier: Tone.Oscillator;
	private modulator: Tone.Oscillator;
	private modGain: Tone.Gain;
	private envelope: Tone.AmplitudeEnvelope;
	private output: Tone.Gain;
	private active = false;
	private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

	constructor(species: BirdSpecies, destination: Tone.InputNode) {
		this.species = species;

		this.carrier = new Tone.Oscillator({
			frequency: species.minFreq,
			type: 'sine'
		});

		this.modulator = new Tone.Oscillator({
			frequency: 30,
			type: 'sine'
		});

		this.modGain = new Tone.Gain(species.modDepth);
		this.modulator.connect(this.modGain);
		this.modGain.connect(this.carrier.frequency);

		this.envelope = new Tone.AmplitudeEnvelope({
			attack: 0.005,
			decay: species.chirpDuration,
			sustain: 0,
			release: species.chirpDuration * 0.5
		});

		this.output = new Tone.Gain(0.08);

		this.carrier.connect(this.envelope);
		this.envelope.connect(this.output);
		this.output.connect(destination as unknown as Tone.InputNode);

		this.carrier.start();
		this.modulator.start();
	}

	start(): void {
		this.active = true;
		this.schedulePhrase();
	}

	stop(): void {
		this.active = false;
		for (const id of this.pendingTimeouts) {
			clearTimeout(id);
		}
		this.pendingTimeouts.length = 0;
	}

	private schedulePhrase(): void {
		if (!this.active) return;

		const pause = this.species.phrasePause + (Math.random() - 0.5) * this.species.phrasePause;

		this.pendingTimeouts.push(setTimeout(() => {
			this.playPhrase();
		}, pause * 1000));
	}

	private playPhrase(): void {
		if (!this.active) return;

		const chirpCount = Math.floor(
			this.species.chirpsPerPhrase + (Math.random() - 0.5) * 2
		);

		let delay = 0;
		for (let i = 0; i < Math.max(1, chirpCount); i++) {
			this.pendingTimeouts.push(setTimeout(() => {
				if (!this.active) return;
				this.chirp();
			}, delay * 1000));
			delay += this.species.chirpDuration + 0.05 + Math.random() * 0.08;
		}

		// Schedule next phrase after this one finishes
		this.pendingTimeouts.push(setTimeout(() => {
			this.schedulePhrase();
		}, (delay + 0.5) * 1000));
	}

	private chirp(): void {
		const freq =
			this.species.minFreq +
			Math.random() * (this.species.maxFreq - this.species.minFreq);

		this.carrier.frequency.setValueAtTime(freq, Tone.now());
		// Rapid frequency sweep for natural chirp sound
		this.carrier.frequency.linearRampToValueAtTime(
			freq * (0.7 + Math.random() * 0.6),
			Tone.now() + this.species.chirpDuration
		);

		this.modulator.frequency.value = 20 + Math.random() * 40;
		this.envelope.triggerAttackRelease(this.species.chirpDuration);
	}

	setVolume(vol: number): void {
		this.output.gain.value = vol * 0.08;
	}

	dispose(): void {
		this.stop();
		this.carrier.stop();
		this.modulator.stop();
		this.carrier.dispose();
		this.modulator.dispose();
		this.modGain.dispose();
		this.envelope.dispose();
		this.output.dispose();
	}
}
