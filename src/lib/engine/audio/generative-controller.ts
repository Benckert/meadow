import { Sequencer } from './sequencer';
import { MarkovMelody } from './markov-melody';
import { CellularRhythm } from './cellular-rhythm';
import { buildNotePool } from './scales';
import { eventBus } from '$lib/stores/event-bus';
import type { NoteEvent } from '$lib/stores/types';

/**
 * Orchestrates the generative music system.
 * Combines Markov melody with cellular rhythm using incommensurable
 * loop lengths so patterns never exactly repeat (Eno-style).
 */
export class GenerativeController {
	private sequencer: Sequencer;
	private markov: MarkovMelody;
	private rhythm: CellularRhythm;
	private notePool: string[] = [];
	private active = false;
	private density = 1; // 1-3 layers
	private barCount = 0;

	// Incommensurable beat lengths for phasing
	private readonly LOOP_LENGTHS = [7, 11, 13];

	constructor() {
		this.sequencer = new Sequencer();

		this.notePool = buildNotePool('C major pentatonic');

		this.markov = new MarkovMelody(this.notePool, 0.5);
		this.rhythm = new CellularRhythm(16);

		// Listen to user notes to influence the Markov chain
		eventBus.on('note:trigger', this.onUserNote);

		// Listen to beats for rhythm evolution
		eventBus.on('beat:tick', this.onBeat);
	}

	start(bpm: number = 90): void {
		if (this.active) return;
		this.active = true;
		this.barCount = 0;
		this.density = 1;

		this.sequencer.setTempo(bpm);
		this.buildLayers();
		this.sequencer.start();
	}

	stop(): void {
		this.active = false;
		this.sequencer.stop();
		this.sequencer.removeLoop('layer-1');
		this.sequencer.removeLoop('layer-2');
		this.sequencer.removeLoop('layer-3');
	}

	private buildLayers(): void {
		// Layer 1: Primary melody with cellular rhythm gating
		const pattern1 = this.generateMelodicPattern(this.LOOP_LENGTHS[0]);
		this.sequencer.addLoop('layer-1', pattern1, this.LOOP_LENGTHS[0], 0.5, '8n');

		if (this.density >= 2) {
			// Layer 2: Sparser, longer notes
			const pattern2 = this.generateMelodicPattern(this.LOOP_LENGTHS[1]);
			this.sequencer.addLoop('layer-2', pattern2, this.LOOP_LENGTHS[1], 0.3, '4n');
		}

		if (this.density >= 3) {
			// Layer 3: Very sparse, atmospheric
			const pattern3 = this.generateMelodicPattern(this.LOOP_LENGTHS[2]);
			this.sequencer.addLoop('layer-3', pattern3, this.LOOP_LENGTHS[2], 0.2, '2n');
		}
	}

	private generateMelodicPattern(length: number): string[] {
		const rhythmPattern = this.rhythm.tick();
		const notes: string[] = [];

		for (let i = 0; i < length; i++) {
			// Use cellular rhythm to gate note triggers
			if (rhythmPattern[i % rhythmPattern.length]) {
				notes.push(this.markov.nextNote());
			} else {
				// Rest — push empty string (sequencer skips nullish notes)
				notes.push('');
			}
		}

		return notes;
	}

	private onUserNote = (event: NoteEvent): void => {
		// User input influences the Markov chain state
		this.markov.influence(event.note);
	};

	private onBeat = (): void => {
		if (!this.active) return;
		this.barCount++;

		// Progressive density: add layers over time
		if (this.barCount === 16 && this.density < 2) {
			this.density = 2;
			this.rebuildLayers();
		} else if (this.barCount === 32 && this.density < 3) {
			this.density = 3;
			this.rebuildLayers();
		}

		// Regenerate patterns periodically for evolution
		if (this.barCount % 16 === 0) {
			this.rebuildLayers();
		}
	};

	private rebuildLayers(): void {
		// Rebuild without stopping transport for seamless transition
		this.buildLayers();
	}

	setScale(scaleName: string): void {
		this.notePool = buildNotePool(scaleName);
		this.markov.setNotes(this.notePool);
	}

	setTempo(bpm: number): void {
		this.sequencer.setTempo(bpm);
	}

	get isPlaying(): boolean {
		return this.active;
	}

	dispose(): void {
		this.stop();
		eventBus.off('note:trigger', this.onUserNote);
		eventBus.off('beat:tick', this.onBeat);
		this.sequencer.dispose();
	}
}
