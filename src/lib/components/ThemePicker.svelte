<script lang="ts">
	import { getAllThemes } from '$lib/themes';
	import { eventBus } from '$lib/stores/event-bus';
	import { uiState } from '$lib/stores/ui-state.svelte';
	import type { ThemeId } from '$lib/stores/types';

	let { visible = false }: { visible?: boolean } = $props();

	const themes = getAllThemes();

	function selectTheme(id: ThemeId): void {
		uiState.currentTheme = id;
		eventBus.emit('theme:change', id);
	}
</script>

{#if visible}
	<div class="theme-picker">
		{#each themes as theme}
			<button
				class="theme-swatch"
				class:selected={uiState.currentTheme === theme.id}
				style:--swatch-color={theme.colors.secondary}
				style:--swatch-accent={theme.colors.accent}
				aria-label={theme.name}
				aria-pressed={uiState.currentTheme === theme.id}
				onclick={() => selectTheme(theme.id as ThemeId)}
			>
				<div class="swatch-inner"></div>
			</button>
		{/each}
	</div>
{/if}

<style>
	.theme-picker {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: 1px solid var(--glass-border);
		border-radius: 16px;
	}

	.theme-swatch {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid transparent;
		background: none;
		cursor: pointer;
		padding: 3px;
		transition: all var(--transition-fast);
	}

	.theme-swatch.selected {
		border-color: var(--swatch-accent);
		box-shadow: 0 0 8px var(--swatch-accent);
	}

	.swatch-inner {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: var(--swatch-color);
	}

	.theme-swatch:hover {
		transform: scale(1.15);
	}

	.theme-swatch:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
