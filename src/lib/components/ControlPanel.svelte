<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import IconButton from './IconButton.svelte';
	import ThemePicker from './ThemePicker.svelte';
	import TempoSlider from './TempoSlider.svelte';
	import ScaleSelector from './ScaleSelector.svelte';
	import VolumeControl from './VolumeControl.svelte';

	let {
		isPlaying = false,
		natureActive = false,
		onplayPause,
		onToggleNature,
		onTempoChange,
		onScaleChange,
		onVolumeChange
	}: {
		isPlaying?: boolean;
		natureActive?: boolean;
		onplayPause?: () => void;
		onToggleNature?: () => void;
		onTempoChange?: (bpm: number) => void;
		onScaleChange?: (scale: string) => void;
		onVolumeChange?: (vol: number) => void;
	} = $props();

	let showThemes = $state(false);
	let showScales = $state(false);
	let panelElement: HTMLElement;

	function toggleThemes(): void {
		showThemes = !showThemes;
		showScales = false;
	}

	function toggleScales(): void {
		showScales = !showScales;
		showThemes = false;
	}

	function handleClickOutside(e: MouseEvent): void {
		if (panelElement && !panelElement.contains(e.target as Node)) {
			showThemes = false;
			showScales = false;
		}
	}

	onMount(() => {
		document.addEventListener('pointerdown', handleClickOutside);
	});

	onDestroy(() => {
		document.removeEventListener('pointerdown', handleClickOutside);
	});
</script>

<div class="control-panel" bind:this={panelElement}>
	<div class="controls-row">
		<IconButton
			icon={isPlaying ? 'pause' : 'play'}
			active={isPlaying}
			label={isPlaying ? 'Pause generative music' : 'Play generative music'}
			onclick={onplayPause}
		/>
		<IconButton
			icon="nature"
			active={natureActive}
			label={natureActive ? 'Disable nature sounds' : 'Enable nature sounds'}
			onclick={onToggleNature}
		/>
		<div class="separator"></div>
		<TempoSlider onchange={onTempoChange} />
		<VolumeControl onchange={onVolumeChange} />
		<div class="separator"></div>
		<IconButton
			icon="palette"
			active={showThemes}
			label="Choose theme"
			onclick={toggleThemes}
		/>
		<IconButton
			icon="scale"
			active={showScales}
			label="Choose scale"
			onclick={toggleScales}
		/>
	</div>

	{#if showThemes || showScales}
		<div class="popover">
			{#if showThemes}
				<ThemePicker visible={true} />
			{/if}
			{#if showScales}
				<ScaleSelector visible={true} onchange={(s) => { onScaleChange?.(s); showScales = false; }} />
			{/if}
		</div>
	{/if}
</div>

<style>
	.control-panel {
		position: fixed;
		bottom: var(--space-xl);
		left: 50%;
		transform: translateX(-50%);
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		animation: slide-up 400ms ease-out;
	}

	.controls-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: 1px solid var(--glass-border);
		border-radius: 16px;
		box-shadow: var(--glass-shadow);
	}

	.separator {
		width: 1px;
		height: 24px;
		background: var(--glass-border);
		margin: 0 var(--space-xs);
	}

	.popover {
		position: absolute;
		bottom: calc(100% + var(--space-md));
		left: 50%;
		transform: translateX(-50%);
		animation: fade-in 200ms ease-out;
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateX(-50%) translateY(4px); }
		to { opacity: 1; transform: translateX(-50%) translateY(0); }
	}

	@media (max-width: 640px) {
		.controls-row {
			flex-wrap: wrap;
			justify-content: center;
			max-width: 90vw;
		}

		.separator {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.control-panel {
			animation: none;
		}

		.popover {
			animation: none;
		}
	}
</style>
