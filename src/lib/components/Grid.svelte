<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GridCell from './GridCell.svelte';
	import { InputHandler } from '$lib/engine/audio/input-handler';
	import { mapGridToNotes } from '$lib/engine/audio/scales';
	import { eventBus } from '$lib/stores/event-bus';
	import type { NoteEvent } from '$lib/stores/types';

	let {
		cols = 16,
		rows = 5,
		scaleName = 'C major pentatonic'
	}: {
		cols?: number;
		rows?: number;
		scaleName?: string;
	} = $props();

	let gridElement: HTMLElement;
	let inputHandler: InputHandler;
	let activeCells = $state(new Map<string, number>());

	const noteMap = $derived(mapGridToNotes(cols, rows, scaleName));

	function cellKey(row: number, col: number): string {
		return `${row},${col}`;
	}

	function onNoteTrigger(event: NoteEvent): void {
		const key = cellKey(event.row, event.col);
		// Set active, clear after a short delay
		activeCells.set(key, Date.now());
		activeCells = new Map(activeCells);

		setTimeout(() => {
			activeCells.delete(key);
			activeCells = new Map(activeCells);
		}, 350);
	}

	onMount(() => {
		inputHandler = new InputHandler();
		inputHandler.bind(gridElement, { cols, rows, noteMap });

		eventBus.on('note:trigger', onNoteTrigger);
	});

	onDestroy(() => {
		inputHandler?.dispose();
		eventBus.off('note:trigger', onNoteTrigger);
	});
</script>

<div
	class="grid-container"
	bind:this={gridElement}
	style:--grid-cols={cols}
	style:--grid-rows={rows}
>
	{#each { length: rows } as _, rowIdx}
		{@const displayRow = rows - 1 - rowIdx}
		{#each { length: cols } as _, col}
			<GridCell
				row={displayRow}
				{col}
				note={noteMap[displayRow]?.[col] ?? ''}
				isActive={activeCells.has(cellKey(displayRow, col))}
			/>
		{/each}
	{/each}
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: repeat(var(--grid-cols), 1fr);
		grid-template-rows: repeat(var(--grid-rows), 1fr);
		gap: 3px;
		width: 100%;
		height: 100%;
		padding: var(--space-lg);
		padding-bottom: 100px; /* Space for control panel */
		touch-action: none;
	}

	@media (max-width: 640px) {
		.grid-container {
			gap: 2px;
			padding: var(--space-sm);
			padding-bottom: 90px;
		}
	}
</style>
