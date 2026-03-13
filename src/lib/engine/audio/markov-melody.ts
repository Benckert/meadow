/**
 * Markov chain melody generator trained on pentatonic intervals.
 * Produces consonant, musical note sequences by weighting transitions
 * toward stepwise motion over leaps.
 */
export class MarkovMelody {
	private notes: string[];
	private currentIndex: number;
	private temperature: number;

	// Transition weights: index offset -> weight
	// Favors small intervals (steps) over large ones (leaps)
	private readonly transitionWeights: [number, number][] = [
		[0, 0.05],  // repeat same note (rare)
		[1, 0.30],  // step up
		[-1, 0.30], // step down
		[2, 0.12],  // skip up
		[-2, 0.12], // skip down
		[3, 0.05],  // leap up
		[-3, 0.05], // leap down
		[4, 0.005], // big leap up (rare)
		[-4, 0.005] // big leap down (rare)
	];

	// Pre-allocated scratch arrays to avoid per-call allocation
	private readonly weightsBuf: number[];

	constructor(notes: string[], temperature: number = 0.5) {
		this.notes = notes;
		this.currentIndex = Math.floor(notes.length / 2);
		this.temperature = Math.max(0.1, Math.min(2.0, temperature));
		this.weightsBuf = new Array(this.transitionWeights.length);
	}

	nextNote(): string {
		const len = this.transitionWeights.length;
		let total = 0;

		for (let i = 0; i < len; i++) {
			const [offset, weight] = this.transitionWeights[i];
			const targetIndex = this.currentIndex + offset;
			if (targetIndex < 0 || targetIndex >= this.notes.length) {
				this.weightsBuf[i] = 0;
			} else {
				const w = Math.pow(weight, 1 / this.temperature);
				this.weightsBuf[i] = w;
				total += w;
			}
		}

		if (total === 0) {
			this.currentIndex = Math.floor(Math.random() * this.notes.length);
			return this.notes[this.currentIndex];
		}

		// Weighted random selection (inline normalization)
		let r = Math.random() * total;
		for (let i = 0; i < len; i++) {
			r -= this.weightsBuf[i];
			if (r <= 0) {
				const offset = this.transitionWeights[i][0];
				this.currentIndex = Math.max(
					0,
					Math.min(this.notes.length - 1, this.currentIndex + offset)
				);
				return this.notes[this.currentIndex];
			}
		}

		return this.notes[this.currentIndex];
	}

	influence(note: string): void {
		const idx = this.notes.indexOf(note);
		if (idx !== -1) {
			this.currentIndex = idx;
		}
	}

	setTemperature(temp: number): void {
		this.temperature = Math.max(0.1, Math.min(2.0, temp));
	}

	setNotes(notes: string[]): void {
		this.notes = notes;
		this.currentIndex = Math.min(this.currentIndex, notes.length - 1);
	}
}
