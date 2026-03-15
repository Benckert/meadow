<script lang="ts">
	import { eventBus } from '$lib/stores/event-bus';
	import type { NoteEvent } from '$lib/stores/types';

	let {
		scaleNotes = [] as string[]
	}: {
		scaleNotes?: string[];
	} = $props();

	let currentIndex = $state(0);

	function triggerNote(index: number): void {
		const note = scaleNotes[index];
		if (!note) return;

		const normalizedY = scaleNotes.length > 1 ? index / (scaleNotes.length - 1) : 0.5;

		const event: NoteEvent = {
			note,
			velocity: 0.7,
			duration: '8n',
			row: index,
			col: 0,
			x: 0.5,
			y: normalizedY,
			pan: 0
		};
		eventBus.emit('note:trigger', event);
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'ArrowUp' && currentIndex < scaleNotes.length - 1) {
			e.preventDefault();
			currentIndex++;
			triggerNote(currentIndex);
		} else if (e.key === 'ArrowDown' && currentIndex > 0) {
			e.preventDefault();
			currentIndex--;
			triggerNote(currentIndex);
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			triggerNote(currentIndex);
		}
	}
</script>

<div
	class="sr-pitch-ladder"
	role="slider"
	aria-label="Pitch selector — use arrow keys to change pitch, Enter to play"
	aria-orientation="vertical"
	aria-valuemin={0}
	aria-valuemax={scaleNotes.length - 1}
	aria-valuenow={currentIndex}
	aria-valuetext={scaleNotes[currentIndex] ?? ''}
	tabindex="0"
	onkeydown={handleKeydown}
>
	Pitch: {scaleNotes[currentIndex] ?? ''}
</div>

<style>
	.sr-pitch-ladder {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.sr-pitch-ladder:focus-visible {
		position: fixed;
		top: var(--space-xl);
		left: 50%;
		transform: translateX(-50%);
		width: auto;
		height: auto;
		clip-path: none;
		z-index: 50;
		padding: var(--space-md) var(--space-lg);
		background: var(--bg-panel);
		border: 1px solid var(--glass-border);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 14px;
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
