import * as Tone from 'tone';
import { eventBus } from '$lib/stores/event-bus';

export interface LoopTrack {
	id: string;
	notes: string[];
	lengthInBeats: number;
	velocity: number;
	duration: string;
	loop: Tone.Loop | null;
}

export class Sequencer {
	private tracks = new Map<string, LoopTrack>();
	private beatCount = 0;
	private started = false;

	constructor() {
		// Main beat clock
		Tone.getTransport().scheduleRepeat((time) => {
			this.beatCount++;
			eventBus.emit('beat:tick', { beat: this.beatCount, time });
		}, '4n');
	}

	addLoop(
		id: string,
		notes: string[],
		lengthInBeats: number,
		velocity: number = 0.5,
		duration: string = '8n'
	): void {
		this.removeLoop(id);

		let step = 0;
		const loop = new Tone.Loop((time) => {
			const note = notes[step % notes.length];
			if (note) {
				eventBus.emit('note:trigger', {
					note,
					velocity,
					duration,
					row: 0,
					col: step % 16
				});
			}
			step++;
		}, `${lengthInBeats * 4}n`);

		const track: LoopTrack = { id, notes, lengthInBeats, velocity, duration, loop };
		this.tracks.set(id, track);

		if (this.started) {
			loop.start(0);
		}
	}

	removeLoop(id: string): void {
		const track = this.tracks.get(id);
		if (track?.loop) {
			track.loop.stop();
			track.loop.dispose();
		}
		this.tracks.delete(id);
	}

	setTempo(bpm: number): void {
		Tone.getTransport().bpm.value = bpm;
	}

	start(): void {
		this.started = true;
		Tone.getTransport().start();
		for (const track of this.tracks.values()) {
			track.loop?.start(0);
		}
		eventBus.emit('transport:state', { playing: true });
	}

	stop(): void {
		this.started = false;
		Tone.getTransport().stop();
		for (const track of this.tracks.values()) {
			track.loop?.stop();
		}
		this.beatCount = 0;
		eventBus.emit('transport:state', { playing: false });
	}

	get isPlaying(): boolean {
		return this.started;
	}

	dispose(): void {
		this.stop();
		for (const track of this.tracks.values()) {
			track.loop?.dispose();
		}
		this.tracks.clear();
		Tone.getTransport().cancel();
	}
}
