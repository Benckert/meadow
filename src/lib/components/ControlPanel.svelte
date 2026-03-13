<script lang="ts">
	import IconButton from './IconButton.svelte';
	import ThemePicker from './ThemePicker.svelte';
	import TempoSlider from './TempoSlider.svelte';
	import ScaleSelector from './ScaleSelector.svelte';
	import VolumeControl from './VolumeControl.svelte';

	let {
		isPlaying = false,
		generativeActive = false,
		natureActive = false,
		onplayPause,
		onToggleGenerative,
		onToggleNature,
		onTempoChange,
		onScaleChange,
		onVolumeChange
	}: {
		isPlaying?: boolean;
		generativeActive?: boolean;
		natureActive?: boolean;
		onplayPause?: () => void;
		onToggleGenerative?: () => void;
		onToggleNature?: () => void;
		onTempoChange?: (bpm: number) => void;
		onScaleChange?: (scale: string) => void;
		onVolumeChange?: (vol: number) => void;
	} = $props();

	let showThemes = $state(false);
	let showScales = $state(false);

	function toggleThemes(): void {
		showThemes = !showThemes;
		showScales = false;
	}

	function toggleScales(): void {
		showScales = !showScales;
		showThemes = false;
	}
</script>

<div class="control-panel">
	<div class="controls-row">
		<IconButton
			icon={isPlaying ? 'pause' : 'play'}
			active={isPlaying}
			label={isPlaying ? 'Pause' : 'Play'}
			onclick={onplayPause}
		/>
		<IconButton
			icon="generative"
			active={generativeActive}
			label="Generative mode"
			onclick={onToggleGenerative}
		/>
		<IconButton
			icon="nature"
			active={natureActive}
			label="Nature sounds"
			onclick={onToggleNature}
		/>
		<div class="separator"></div>
		<TempoSlider onchange={onTempoChange} />
		<VolumeControl onchange={onVolumeChange} />
		<div class="separator"></div>
		<IconButton
			icon="palette"
			active={showThemes}
			label="Theme"
			onclick={toggleThemes}
		/>
		<IconButton
			icon="scale"
			active={showScales}
			label="Scale"
			onclick={toggleScales}
		/>
	</div>

	<div class="popover-area">
		{#if showThemes}
			<div class="popover">
				<ThemePicker visible={true} />
			</div>
		{/if}
		{#if showScales}
			<div class="popover">
				<ScaleSelector visible={true} onchange={(s) => { onScaleChange?.(s); showScales = false; }} />
			</div>
		{/if}
	</div>
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

	.popover-area {
		position: relative;
	}

	.popover {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: var(--space-md);
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
</style>
