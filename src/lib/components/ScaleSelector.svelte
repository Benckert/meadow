<script lang="ts">
	import { uiState } from '$lib/stores/ui-state.svelte';
	import { getAvailableScales } from '$lib/engine/audio/scales';

	let { visible = false, onchange }: { visible?: boolean; onchange?: (scale: string) => void } = $props();

	const scales = getAvailableScales();

	function selectScale(scale: string): void {
		uiState.activeScale = scale;
		onchange?.(scale);
	}
</script>

{#if visible}
	<div class="scale-selector">
		{#each scales as scale}
			<button
				class="scale-option"
				class:selected={uiState.activeScale === scale}
				aria-label={scale}
				aria-pressed={uiState.activeScale === scale}
				onclick={() => selectScale(scale)}
			>
				<span class="scale-name">{scale}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.scale-selector {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-sm);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: 1px solid var(--glass-border);
		border-radius: 12px;
		min-width: 160px;
		max-height: 280px;
		overflow-y: auto;
	}

	.scale-option {
		display: flex;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		border: none;
		border-radius: 8px;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: 13px;
	}

	.scale-option:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary);
	}

	.scale-option.selected {
		background: rgba(255, 255, 255, 0.12);
		color: var(--color-accent);
	}

	.scale-option:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	.scale-name {
		pointer-events: none;
	}
</style>
