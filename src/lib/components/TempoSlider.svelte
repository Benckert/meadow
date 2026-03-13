<script lang="ts">
	import { uiState } from '$lib/stores/ui-state.svelte';

	let { onchange }: { onchange?: (bpm: number) => void } = $props();

	function handleInput(e: Event): void {
		const target = e.target as HTMLInputElement;
		const bpm = parseInt(target.value, 10);
		uiState.bpm = bpm;
		onchange?.(bpm);
	}
</script>

<div class="tempo-slider">
	<input
		type="range"
		min="60"
		max="140"
		value={uiState.bpm}
		oninput={handleInput}
		aria-label="Tempo"
		aria-valuemin={60}
		aria-valuemax={140}
		aria-valuenow={uiState.bpm}
		aria-valuetext="{uiState.bpm} BPM"
	/>
	<span class="tempo-display">{uiState.bpm}</span>
</div>

<style>
	.tempo-slider {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: 0 var(--space-sm);
	}

	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 100px;
		height: 4px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
		outline: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: none;
		box-shadow: 0 0 6px rgba(246, 230, 187, 0.3);
	}

	input[type="range"]::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: none;
	}

	.tempo-display {
		font-size: 12px;
		color: var(--text-secondary);
		min-width: 28px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}
</style>
