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

	constructor(notes: string[], temperature: number = 0.5) {
		this.notes = notes;
		this.currentIndex = Math.floor(notes.length / 2); // Start in the middle
		this.temperature = Math.max(0.1, Math.min(2.0, temperature));
	}

	nextNote(): string {
		const weights = this.transitionWeights.map(([offset, weight]) => {
			const targetIndex = this.currentIndex + offset;
			// Penalize out-of-range targets
			if (targetIndex < 0 || targetIndex >= this.notes.length) {
				return 0;
			}
			// Apply temperature: higher = more random, lower = more predictable
			return Math.pow(weight, 1 / this.temperature);
		});

		// Normalize weights
		const total = weights.reduce((a, b) => a + b, 0);
		if (total === 0) {
			// Fallback: pick a random note
			this.currentIndex = Math.floor(Math.random() * this.notes.length);
			return this.notes[this.currentIndex];
		}

		const normalized = weights.map((w) => w / total);

		// Weighted random selection
		let r = Math.random();
		for (let i = 0; i < normalized.length; i++) {
			r -= normalized[i];
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

	/**
	 * Influence the Markov chain state based on user input.
	 * Moves the current position closer to the played note.
	 */
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
