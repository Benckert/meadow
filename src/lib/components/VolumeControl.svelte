<script lang="ts">
	import { icons } from './icons';

	let {
		volume = 0.7,
		onchange
	}: {
		volume?: number;
		onchange?: (vol: number) => void;
	} = $props();

	const iconPath = $derived(
		volume === 0 ? icons.volumeMute :
		volume < 0.5 ? icons.volumeLow :
		icons.volumeHigh
	);

	function handleInput(e: Event): void {
		const target = e.target as HTMLInputElement;
		volume = parseFloat(target.value);
		onchange?.(volume);
	}
</script>

<div class="volume-control">
	<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" class="volume-icon">
		<path d={iconPath} />
	</svg>
	<input
		type="range"
		min="0"
		max="1"
		step="0.01"
		value={volume}
		oninput={handleInput}
		aria-label="Volume"
		aria-valuemin={0}
		aria-valuemax={1}
		aria-valuenow={volume}
		aria-valuetext="{Math.round(volume * 100)}%"
	/>
</div>

<style>
	.volume-control {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.volume-icon {
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		width: 70px;
		height: 4px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 2px;
		outline: none;
	}

	input[type="range"]:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 4px;
		border-radius: 2px;
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
	}

	input[type="range"]::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: none;
	}
</style>
