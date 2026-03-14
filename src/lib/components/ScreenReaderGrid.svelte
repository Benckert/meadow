<script lang="ts">
	import { eventBus } from '$lib/stores/event-bus';
	import type { NoteEvent } from '$lib/stores/types';

	let {
		cols = 16,
		rows = 5,
		noteMap = [] as string[][]
	}: {
		cols?: number;
		rows?: number;
		noteMap?: string[][];
	} = $props();

	let focusRow = $state(0);
	let focusCol = $state(0);

	function triggerNote(row: number, col: number): void {
		const note = noteMap[row]?.[col];
		if (!note) return;

		const event: NoteEvent = {
			note,
			velocity: 0.7,
			duration: '8n',
			row,
			col
		};
		eventBus.emit('note:trigger', event);
	}

	function handleKeydown(e: KeyboardEvent, row: number, col: number): void {
		switch (e.key) {
			case 'ArrowRight':
				e.preventDefault();
				focusCol = Math.min(col + 1, cols - 1);
				focusCell();
				break;
			case 'ArrowLeft':
				e.preventDefault();
				focusCol = Math.max(col - 1, 0);
				focusCell();
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusRow = Math.min(row + 1, rows - 1);
				focusCell();
				break;
			case 'ArrowDown':
				e.preventDefault();
				focusRow = Math.max(row - 1, 0);
				focusCell();
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				triggerNote(row, col);
				break;
		}
	}

	function focusCell(): void {
		const el = document.querySelector(
			`[data-sr-row="${focusRow}"][data-sr-col="${focusCol}"]`
		) as HTMLElement;
		el?.focus();
	}
</script>

<div
	class="sr-grid"
	role="grid"
	aria-label="Musical grid. {cols} columns by {rows} rows. Use arrow keys to navigate, Enter or Space to play a note."
>
	{#each { length: rows } as _, rowIdx}
		{@const row = rows - 1 - rowIdx}
		<div role="row">
			{#each { length: cols } as _, col}
				{@const note = noteMap[row]?.[col] ?? ''}
				<span
					role="gridcell"
					tabindex={row === focusRow && col === focusCol ? 0 : -1}
					aria-label="Note {note}, row {row + 1}, column {col + 1}"
					data-sr-row={row}
					data-sr-col={col}
					onkeydown={(e) => handleKeydown(e, row, col)}
					onclick={() => triggerNote(row, col)}
				></span>
			{/each}
		</div>
	{/each}
</div>

<style>
	.sr-grid {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	/* Make visible on focus for keyboard users */
	.sr-grid:focus-within {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		clip-path: none;
		z-index: 50;
		display: grid;
		place-items: center;
		background: rgba(0, 0, 0, 0.8);
	}

	[role="gridcell"]:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
		padding: 8px 12px;
		background: var(--glass-bg);
		border-radius: 4px;
	}
</style>
