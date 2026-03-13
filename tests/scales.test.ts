import { describe, it, expect } from 'vitest';
import { getScalePreset, mapGridToNotes, getAvailableScales } from '../src/lib/engine/audio/scales';

describe('Scales', () => {
	it('should return pentatonic notes for C major pentatonic', () => {
		const scale = getScalePreset('C major pentatonic');
		expect(scale.notes).toContain('C');
		expect(scale.notes).toContain('D');
		expect(scale.notes).toContain('E');
		expect(scale.notes).toContain('G');
		expect(scale.notes).toContain('A');
		expect(scale.notes).toHaveLength(5);
	});

	it('should map grid to notes correctly for 16x5', () => {
		const grid = mapGridToNotes(16, 5, 'C major pentatonic');
		expect(grid).toHaveLength(5);
		expect(grid[0]).toHaveLength(16);

		// Each row should have the same note repeated
		const firstRowNote = grid[0][0];
		for (const note of grid[0]) {
			expect(note).toBe(firstRowNote);
		}

		// Different rows should have different notes
		const uniqueNotes = new Set(grid.map((row) => row[0]));
		expect(uniqueNotes.size).toBe(5);
	});

	it('should fall back to pentatonic for unknown scale', () => {
		const scale = getScalePreset('nonexistent');
		expect(scale.notes).toHaveLength(5);
		expect(scale.name).toBe('C major pentatonic');
	});

	it('should list available scales', () => {
		const scales = getAvailableScales();
		expect(scales.length).toBeGreaterThan(0);
		expect(scales).toContain('C major pentatonic');
	});
});
