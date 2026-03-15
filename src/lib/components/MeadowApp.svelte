<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import ControlPanel from './ControlPanel.svelte';
	import FeatureUnlock from './FeatureUnlock.svelte';
	import AccessibilityLayer from './AccessibilityLayer.svelte';
	import { AudioEngine } from '$lib/engine/audio/audio-engine';
	import { VisualRenderer } from '$lib/engine/visual/renderer';
	import { NoteVisualizer } from '$lib/engine/visual/note-visualizer';
	import { RippleInputHandler } from '$lib/engine/audio/ripple-input-handler';
	import { GenerativeController } from '$lib/engine/audio/generative-controller';
	import { NatureController } from '$lib/engine/audio/nature/nature-controller';
	import { NatureParticles } from '$lib/engine/visual/nature-particles';
	import { QualityManager } from '$lib/engine/visual/quality-manager';
	import { buildNotePool } from '$lib/engine/audio/scales';
	import { eventBus } from '$lib/stores/event-bus';
	import { uiState } from '$lib/stores/ui-state.svelte';
	import type { NoteEvent, ThemeId, QualityLevel } from '$lib/stores/types';
	import { getTheme } from '$lib/themes';
	import * as Tone from 'tone';

	let canvasContainer: HTMLElement;
	let audioEngine: AudioEngine;
	let visualRenderer: VisualRenderer;
	let noteVisualizer: NoteVisualizer;
	let rippleInput: RippleInputHandler;
	let generativeController: GenerativeController;
	let natureController: NatureController | null = null;
	let natureParticles: NatureParticles | null = null;
	let qualityManager: QualityManager;
	let running = false;
	let showControls = $state(false);
	let natureActive = $state(false);

	const scaleNotes = $derived(buildNotePool(uiState.activeScale));

	async function initAudio(): Promise<void> {
		if (uiState.audioInitialized) return;
		await audioEngine.init();
		uiState.audioInitialized = true;

		natureController = new NatureController(
			Tone.getDestination() as unknown as Tone.InputNode,
			uiState.currentTheme
		);
	}

	function onNoteTrigger(event: NoteEvent): void {
		audioEngine.triggerNote(event.note, event.duration, event.velocity, event.pan);
	}

	function onFirstInteraction(): void {
		initAudio();
	}

	function handlePlayPause(): void {
		if (uiState.isPlaying) {
			generativeController.stop();
			uiState.isPlaying = false;
		} else {
			generativeController.start(uiState.bpm);
			uiState.isPlaying = true;
		}
	}

	function handleToggleNature(): void {
		if (!natureController) return;
		if (natureActive) {
			natureController.stop();
			natureParticles?.enableRain(false);
			natureParticles?.enableWind(false);
			natureActive = false;
		} else {
			natureController.start();
			natureParticles?.enableWind(true);
			if (uiState.currentTheme === 'ocean-depths') {
				natureParticles?.enableRain(true);
			}
			natureActive = true;
		}
	}

	function handleTempoChange(bpm: number): void {
		generativeController?.setTempo(bpm);
	}

	function handleScaleChange(scale: string): void {
		generativeController?.setScale(scale);
		rippleInput?.setScale(scale);
	}

	function handleVolumeChange(vol: number): void {
		Tone.getDestination().volume.value = vol === 0 ? -Infinity : 20 * Math.log10(vol);
	}

	function handleFeatureUnlock(feature: string): void {
		if (feature === 'controls') {
			showControls = true;
		}
	}

	function handleQualityChange(level: QualityLevel): void {
		visualRenderer?.setQuality(level);
	}

	function handleThemeChange(themeId: ThemeId): void {
		visualRenderer?.setTheme(themeId);
		noteVisualizer?.setTheme(themeId);
		natureController?.setTheme(themeId);

		if (browser) {
			const theme = getTheme(themeId);
			const root = document.documentElement;
			root.style.setProperty('--bg-primary', theme.colors.background[0]);
			root.style.setProperty('--bg-panel', theme.colors.panel);
			root.style.setProperty('--color-primary', theme.colors.primary);
			root.style.setProperty('--color-secondary', theme.colors.secondary);
			root.style.setProperty('--color-accent', theme.colors.accent);
			root.style.setProperty('--text-primary', theme.colors.textPrimary);
			root.style.setProperty('--text-secondary', theme.colors.textSecondary);
			root.style.setProperty('--glass-bg', theme.colors.glassTint);
			root.style.setProperty('--glass-border', theme.colors.glassBorder);
		}
	}

	onMount(() => {
		audioEngine = new AudioEngine();
		visualRenderer = new VisualRenderer(uiState.currentTheme);
		visualRenderer.mount(canvasContainer);

		noteVisualizer = new NoteVisualizer(
			visualRenderer.scene,
			uiState.currentTheme
		);

		rippleInput = new RippleInputHandler();
		rippleInput.bind(visualRenderer);
		rippleInput.setScale(uiState.activeScale);

		generativeController = new GenerativeController();
		qualityManager = new QualityManager();

		natureParticles = new NatureParticles(visualRenderer.scene);

		running = true;
		let lastTime = performance.now();
		function animate(): void {
			if (!running) return;
			const now = performance.now();
			const dtMs = now - lastTime;
			const dt = dtMs / 1000;
			lastTime = now;

			qualityManager.recordFrame(dtMs);
			noteVisualizer.update(dt);
			natureParticles?.update(dt);
			requestAnimationFrame(animate);
		}
		requestAnimationFrame(animate);

		eventBus.on('note:trigger', onNoteTrigger);
		eventBus.on('theme:change', handleThemeChange);
		eventBus.on('quality:change', handleQualityChange);

		document.addEventListener('pointerdown', onFirstInteraction, { once: true });
		document.addEventListener('keydown', onFirstInteraction, { once: true });
	});

	onDestroy(() => {
		running = false;
		eventBus.off('note:trigger', onNoteTrigger);
		eventBus.off('theme:change', handleThemeChange);
		eventBus.off('quality:change', handleQualityChange);
		if (browser) {
			document.removeEventListener('pointerdown', onFirstInteraction);
			document.removeEventListener('keydown', onFirstInteraction);
		}
		rippleInput?.dispose();
		natureParticles?.dispose();
		natureController?.dispose();
		generativeController?.dispose();
		noteVisualizer?.dispose();
		visualRenderer?.dispose();
		audioEngine?.dispose();
	});
</script>

<div class="meadow-app">
	<div class="canvas-layer" bind:this={canvasContainer}></div>

	{#if showControls}
		<ControlPanel
			isPlaying={uiState.isPlaying}
			{natureActive}
			onplayPause={handlePlayPause}
			onToggleNature={handleToggleNature}
			onTempoChange={handleTempoChange}
			onScaleChange={handleScaleChange}
			onVolumeChange={handleVolumeChange}
		/>
	{/if}

	<FeatureUnlock onunlock={handleFeatureUnlock} />

	<AccessibilityLayer
		{scaleNotes}
		isPlaying={uiState.isPlaying}
		{natureActive}
		bpm={uiState.bpm}
		scaleName={uiState.activeScale}
		onplayPause={handlePlayPause}
		onToggleNature={handleToggleNature}
	/>

	{#if !uiState.audioInitialized}
		<div class="tap-hint" role="status" aria-label="Tap anywhere to start">
			<div class="tap-circle"></div>
			<span class="tap-text">touch the surface</span>
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

	.tap-hint {
		position: absolute;
		inset: 0;
		z-index: 10;
		display: flex;
		flex-direction: column;
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

	.tap-text {
		margin-top: var(--space-lg);
		color: var(--text-secondary);
		font-size: 13px;
		letter-spacing: 0.05em;
		text-transform: lowercase;
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

	@media (prefers-reduced-motion: reduce) {
		.tap-circle, .tap-text {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
