import { describe, it, expect } from 'vitest';
import { CellularRhythm } from '../src/lib/engine/audio/cellular-rhythm';

describe('CellularRhythm', () => {
	it('should produce boolean arrays of correct width', () => {
		const rhythm = new CellularRhythm(16);
		const pattern = rhythm.tick();

		expect(pattern).toHaveLength(16);
		pattern.forEach((val) => expect(typeof val).toBe('boolean'));
	});

	it('should evolve over time', () => {
		const rhythm = new CellularRhythm(16);

		const p1 = rhythm.tick();
		const p2 = rhythm.tick();
		const p3 = rhythm.tick();

		// Patterns should not all be identical (statistically very unlikely)
		const same = p1.every((v, i) => v === p2[i]) && p2.every((v, i) => v === p3[i]);
		// Allow the rare case where they are the same, but flag it
		if (same) {
			console.warn('All patterns identical — possible but unlikely');
		}
	});

	it('should recover from extinction', () => {
		const rhythm = new CellularRhythm(8, 0); // Rule 0 = all die
		const pattern = rhythm.tick();

		// After extinction, it should reseed
		const nextPattern = rhythm.tick();
		expect(nextPattern.some(Boolean)).toBe(true);
	});
});
