/**
 * 1D cellular automaton for rhythm pattern generation.
 * Uses Rule 110 variant — produces complex, evolving but structured patterns.
 * Each generation = one bar. Alive cells = trigger, dead = rest.
 */
export class CellularRhythm {
	private width: number;
	private cells: boolean[];
	private rule: number;

	constructor(width: number = 16, rule: number = 110) {
		this.width = width;
		this.rule = rule;
		this.cells = new Array(width).fill(false);
		this.seed();
	}

	/** Seed with a single cell or sparse random pattern */
	private seed(): void {
		this.cells.fill(false);
		// Start with a single cell in the center for classic CA behavior
		this.cells[Math.floor(this.width / 2)] = true;
		// Add a couple of random cells for variation
		this.cells[Math.floor(Math.random() * this.width)] = true;
	}

	/**
	 * Advance one generation and return the trigger pattern.
	 * true = trigger a note, false = rest.
	 */
	tick(): boolean[] {
		const result = [...this.cells];
		const next = new Array(this.width).fill(false);

		for (let i = 0; i < this.width; i++) {
			const left = this.cells[(i - 1 + this.width) % this.width] ? 1 : 0;
			const center = this.cells[i] ? 1 : 0;
			const right = this.cells[(i + 1) % this.width] ? 1 : 0;
			const neighborhood = (left << 2) | (center << 1) | right;
			next[i] = ((this.rule >> neighborhood) & 1) === 1;
		}

		this.cells = next;

		// Prevent extinction: if all dead, reseed
		if (!this.cells.some(Boolean)) {
			this.seed();
		}

		return result;
	}

	/** Reset with a new seed */
	reset(): void {
		this.seed();
	}

	setRule(rule: number): void {
		this.rule = rule & 0xff; // Clamp to 8-bit
	}
}
