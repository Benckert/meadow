import { eventBus } from '$lib/stores/event-bus';
import { mapContinuousPitch } from './scales';
import type { NoteEvent } from '$lib/stores/types';
import type { VisualRenderer } from '$lib/engine/visual/renderer';

export class RippleInputHandler {
	private activePointers = new Map<number, { noteIndex: number; x: number; y: number }>();
	private canvas: HTMLCanvasElement | null = null;
	private renderer: VisualRenderer | null = null;
	private scaleName = 'C major pentatonic';

	bind(renderer: VisualRenderer): void {
		this.renderer = renderer;
		this.canvas = renderer.domElement;

		this.canvas.addEventListener('pointerdown', this.onPointerDown, { passive: false });
		this.canvas.addEventListener('pointermove', this.onPointerMove, { passive: false });
		this.canvas.addEventListener('pointerup', this.onPointerUp);
		this.canvas.addEventListener('pointercancel', this.onPointerUp);
		this.canvas.addEventListener('pointerleave', this.onPointerUp);
		this.canvas.style.touchAction = 'none';
	}

	setScale(scaleName: string): void {
		this.scaleName = scaleName;
	}

	private getNormalized(e: PointerEvent): { nx: number; ny: number } | null {
		if (!this.canvas) return null;
		const rect = this.canvas.getBoundingClientRect();
		const nx = (e.clientX - rect.left) / rect.width;
		const ny = (e.clientY - rect.top) / rect.height;
		if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
		return { nx, ny };
	}

	private triggerAtPosition(nx: number, ny: number, velocity: number = 0.7): { noteIndex: number } {
		// Y: top = high pitch, bottom = low pitch
		const pitchY = 1 - ny;
		const { note, noteIndex } = mapContinuousPitch(pitchY, this.scaleName);

		// X: left = pan left, right = pan right
		const pan = (nx - 0.5) * 2;

		// Convert to world position for visuals
		const worldPos = this.renderer?.screenToWorld(nx, ny);

		const event: NoteEvent = {
			note,
			velocity,
			duration: '8n',
			row: noteIndex,
			col: 0,
			x: nx,
			y: pitchY,
			pan,
			worldPos: worldPos ? { x: worldPos.x, y: worldPos.y, z: worldPos.z } : undefined
		};

		eventBus.emit('note:trigger', event);
		return { noteIndex };
	}

	private onPointerDown = (e: PointerEvent): void => {
		e.preventDefault();
		(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);

		const pos = this.getNormalized(e);
		if (!pos) return;

		const velocity = e.pressure > 0 && e.pressure < 1 ? 0.4 + e.pressure * 0.6 : 0.7;
		const { noteIndex } = this.triggerAtPosition(pos.nx, pos.ny, velocity);
		this.activePointers.set(e.pointerId, { noteIndex, x: pos.nx, y: pos.ny });
	};

	private onPointerMove = (e: PointerEvent): void => {
		const prev = this.activePointers.get(e.pointerId);
		if (!prev) return;
		e.preventDefault();

		const pos = this.getNormalized(e);
		if (!pos) return;

		// Check if we've crossed into a new note (glissando)
		const pitchY = 1 - pos.ny;
		const { noteIndex } = mapContinuousPitch(pitchY, this.scaleName);

		if (noteIndex !== prev.noteIndex) {
			// New note — trigger with lower velocity for smooth glissando
			const { noteIndex: newIdx } = this.triggerAtPosition(pos.nx, pos.ny, 0.45);
			this.activePointers.set(e.pointerId, { noteIndex: newIdx, x: pos.nx, y: pos.ny });
		}
	};

	private onPointerUp = (e: PointerEvent): void => {
		this.activePointers.delete(e.pointerId);
	};

	dispose(): void {
		if (this.canvas) {
			this.canvas.removeEventListener('pointerdown', this.onPointerDown);
			this.canvas.removeEventListener('pointermove', this.onPointerMove);
			this.canvas.removeEventListener('pointerup', this.onPointerUp);
			this.canvas.removeEventListener('pointercancel', this.onPointerUp);
			this.canvas.removeEventListener('pointerleave', this.onPointerUp);
		}
		this.activePointers.clear();
	}
}
