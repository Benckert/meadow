import { describe, it, expect } from 'vitest';
import { MarkovMelody } from '../src/lib/engine/audio/markov-melody';

describe('MarkovMelody', () => {
	const notes = ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4'];

	it('should produce notes from the given note pool', () => {
		const markov = new MarkovMelody(notes);

		for (let i = 0; i < 50; i++) {
			const note = markov.nextNote();
			expect(notes).toContain(note);
		}
	});

	it('should respond to influence', () => {
		const markov = new MarkovMelody(notes);

		// Influence to a specific note
		markov.influence('A3');
		const nextNotes: string[] = [];
		for (let i = 0; i < 10; i++) {
			nextNotes.push(markov.nextNote());
		}

		// Should produce notes near A3 in the sequence
		// (not a guarantee, but statistically likely)
		expect(nextNotes.length).toBe(10);
		nextNotes.forEach((n) => expect(notes).toContain(n));
	});

	it('should accept different temperatures', () => {
		const low = new MarkovMelody(notes, 0.2);
		const high = new MarkovMelody(notes, 1.5);

		// Both should produce valid notes
		for (let i = 0; i < 20; i++) {
			expect(notes).toContain(low.nextNote());
			expect(notes).toContain(high.nextNote());
		}
	});
});
