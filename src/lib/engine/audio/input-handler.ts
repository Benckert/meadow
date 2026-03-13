import { eventBus } from '$lib/stores/event-bus';
import type { NoteEvent } from '$lib/stores/types';

export interface GridInfo {
	cols: number;
	rows: number;
	noteMap: string[][];
}

export class InputHandler {
	private activePointers = new Map<number, { row: number; col: number }>();
	private gridElement: HTMLElement | null = null;
	private gridInfo: GridInfo | null = null;

	bind(element: HTMLElement, gridInfo: GridInfo): void {
		this.gridElement = element;
		this.gridInfo = gridInfo;

		element.addEventListener('pointerdown', this.onPointerDown, { passive: false });
		element.addEventListener('pointermove', this.onPointerMove, { passive: false });
		element.addEventListener('pointerup', this.onPointerUp);
		element.addEventListener('pointercancel', this.onPointerUp);
		element.addEventListener('pointerleave', this.onPointerUp);
	}

	updateGridInfo(gridInfo: GridInfo): void {
		this.gridInfo = gridInfo;
	}

	private getGridCell(e: PointerEvent): { row: number; col: number } | null {
		if (!this.gridElement || !this.gridInfo) return null;

		const rect = this.gridElement.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width;
		const y = (e.clientY - rect.top) / rect.height;

		if (x < 0 || x > 1 || y < 0 || y > 1) return null;

		const col = Math.floor(x * this.gridInfo.cols);
		// Invert Y: top row = highest pitch
		const row = this.gridInfo.rows - 1 - Math.floor(y * this.gridInfo.rows);

		return {
			col: Math.min(col, this.gridInfo.cols - 1),
			row: Math.min(row, this.gridInfo.rows - 1)
		};
	}

	private triggerCell(row: number, col: number, velocity: number = 0.7): void {
		if (!this.gridInfo) return;

		const note = this.gridInfo.noteMap[row]?.[col];
		if (!note) return;

		const event: NoteEvent = {
			note,
			velocity,
			duration: '8n',
			row,
			col
		};

		eventBus.emit('note:trigger', event);
	}

	private onPointerDown = (e: PointerEvent): void => {
		e.preventDefault();
		(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);

		const cell = this.getGridCell(e);
		if (!cell) return;

		this.activePointers.set(e.pointerId, cell);
		this.triggerCell(cell.row, cell.col);
	};

	private onPointerMove = (e: PointerEvent): void => {
		if (!this.activePointers.has(e.pointerId)) return;
		e.preventDefault();

		const cell = this.getGridCell(e);
		if (!cell) return;

		const prev = this.activePointers.get(e.pointerId)!;
		if (prev.row !== cell.row || prev.col !== cell.col) {
			this.activePointers.set(e.pointerId, cell);
			this.triggerCell(cell.row, cell.col, 0.5); // glissando at lower velocity
		}
	};

	private onPointerUp = (e: PointerEvent): void => {
		this.activePointers.delete(e.pointerId);
	};

	dispose(): void {
		if (this.gridElement) {
			this.gridElement.removeEventListener('pointerdown', this.onPointerDown);
			this.gridElement.removeEventListener('pointermove', this.onPointerMove);
			this.gridElement.removeEventListener('pointerup', this.onPointerUp);
			this.gridElement.removeEventListener('pointercancel', this.onPointerUp);
			this.gridElement.removeEventListener('pointerleave', this.onPointerUp);
		}
		this.activePointers.clear();
	}
}
