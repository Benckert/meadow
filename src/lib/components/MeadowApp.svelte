<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import Grid from './Grid.svelte';
	import { AudioEngine } from '$lib/engine/audio/audio-engine';
	import { VisualRenderer } from '$lib/engine/visual/renderer';
	import { NoteVisualizer } from '$lib/engine/visual/note-visualizer';
	import { eventBus } from '$lib/stores/event-bus';
	import { uiState } from '$lib/stores/ui-state.svelte';
	import type { NoteEvent } from '$lib/stores/types';

	let canvasContainer: HTMLElement;
	let audioEngine: AudioEngine;
	let visualRenderer: VisualRenderer;
	let noteVisualizer: NoteVisualizer;
	let running = false;

	async function initAudio(): Promise<void> {
		if (uiState.audioInitialized) return;
		await audioEngine.init();
		uiState.audioInitialized = true;
	}

	function onNoteTrigger(event: NoteEvent): void {
		audioEngine.triggerNote(event.note, event.duration, event.velocity);
	}

	function onFirstInteraction(): void {
		initAudio();
	}

	onMount(() => {
		audioEngine = new AudioEngine();
		visualRenderer = new VisualRenderer(uiState.currentTheme);
		visualRenderer.mount(canvasContainer);

		noteVisualizer = new NoteVisualizer(
			visualRenderer.scene,
			uiState.currentTheme
		);

		// Start animation loop for note visualizer
		running = true;
		let lastTime = performance.now();
		function animate(): void {
			if (!running) return;
			const now = performance.now();
			const dt = (now - lastTime) / 1000;
			lastTime = now;
			noteVisualizer.update(dt);
			requestAnimationFrame(animate);
		}
		requestAnimationFrame(animate);

		eventBus.on('note:trigger', onNoteTrigger);

		// Init audio on first user gesture
		document.addEventListener('pointerdown', onFirstInteraction, { once: true });
		document.addEventListener('keydown', onFirstInteraction, { once: true });
	});

	onDestroy(() => {
		running = false;
		eventBus.off('note:trigger', onNoteTrigger);
		if (browser) {
			document.removeEventListener('pointerdown', onFirstInteraction);
			document.removeEventListener('keydown', onFirstInteraction);
		}
		noteVisualizer?.dispose();
		visualRenderer?.dispose();
		audioEngine?.dispose();
	});
</script>

<div class="meadow-app">
	<div class="canvas-layer" bind:this={canvasContainer}></div>
	<div class="grid-layer">
		<Grid
			cols={uiState.gridSize[0]}
			rows={uiState.gridSize[1]}
			scaleName={uiState.activeScale}
		/>
	</div>
	{#if !uiState.audioInitialized}
		<div class="tap-hint">
			<div class="tap-circle"></div>
		</div>
	{/if}
</div>

<style>
	.meadow-app {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: var(--bg-primary);
	}

	.canvas-layer {
		position: absolute;
		inset: 0;
	}

	.grid-layer {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.tap-hint {
		position: absolute;
		inset: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.tap-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 2px solid var(--color-accent);
		opacity: 0.6;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 0.6;
		}
		50% {
			transform: scale(1.3);
			opacity: 0.2;
		}
	}
</style>
