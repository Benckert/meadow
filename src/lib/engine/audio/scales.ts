import { Scale, Note } from 'tonal';

export interface ScaleMapping {
	name: string;
	root: string;
	notes: string[];
}

const SCALE_PRESETS: Record<string, { scale: string; root: string }> = {
	'C major pentatonic': { scale: 'major pentatonic', root: 'C' },
	'A minor pentatonic': { scale: 'minor pentatonic', root: 'A' },
	'C whole tone': { scale: 'whole tone', root: 'C' },
	'D dorian': { scale: 'dorian', root: 'D' }
};

export function getScale(name: string, root: string): string[] {
	const scaleNotes = Scale.get(`${root} ${name}`).notes;
	return scaleNotes;
}

export function getScalePreset(presetName: string): ScaleMapping {
	const preset = SCALE_PRESETS[presetName];
	if (!preset) {
		// Default to C major pentatonic
		return getScalePreset('C major pentatonic');
	}
	const notes = getScale(preset.scale, preset.root);
	return { name: presetName, root: preset.root, notes };
}

/**
 * Maps grid positions to notes. Columns map to time (beats),
 * rows map to pitch (bottom = low, top = high).
 * Returns a 2D array: gridNotes[row][col] = note string like "C4"
 */
export function mapGridToNotes(
	cols: number,
	rows: number,
	scaleName: string = 'C major pentatonic'
): string[][] {
	const preset = getScalePreset(scaleName);
	const scaleNotes = preset.notes;

	// Build note pool across octaves, enough to cover rows
	const notePool: string[] = [];
	const startOctave = 3;
	const octavesNeeded = Math.ceil(rows / scaleNotes.length) + 1;

	for (let oct = startOctave; oct < startOctave + octavesNeeded; oct++) {
		for (const n of scaleNotes) {
			notePool.push(`${n}${oct}`);
		}
	}

	// Build grid: each row gets one note, each column in that row uses the same note
	const grid: string[][] = [];
	for (let row = 0; row < rows; row++) {
		const noteIndex = row % notePool.length;
		const note = notePool[noteIndex];
		const rowNotes: string[] = [];
		for (let col = 0; col < cols; col++) {
			rowNotes.push(note);
		}
		grid.push(rowNotes);
	}

	return grid;
}

/**
 * Builds a flat array of all notes in a scale across the given octave range.
 * Returns notes ordered low to high.
 */
export function buildNotePool(
	scaleName: string = 'C major pentatonic',
	octaveRange: [number, number] = [3, 6]
): string[] {
	const preset = getScalePreset(scaleName);
	const scaleNotes = preset.notes;
	const pool: string[] = [];

	for (let oct = octaveRange[0]; oct <= octaveRange[1]; oct++) {
		for (const n of scaleNotes) {
			pool.push(`${n}${oct}`);
		}
	}

	return pool;
}

/**
 * Maps a continuous Y position (0 = bottom/low, 1 = top/high) to the
 * nearest note in the active scale.
 */
export function mapContinuousPitch(
	normalizedY: number,
	scaleName: string = 'C major pentatonic',
	octaveRange: [number, number] = [3, 6]
): { note: string; noteIndex: number } {
	const pool = buildNotePool(scaleName, octaveRange);
	const clamped = Math.max(0, Math.min(1, normalizedY));
	const noteIndex = Math.round(clamped * (pool.length - 1));
	return { note: pool[noteIndex], noteIndex };
}

export function getAvailableScales(): string[] {
	return Object.keys(SCALE_PRESETS);
}
