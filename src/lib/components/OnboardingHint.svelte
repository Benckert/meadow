<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let visible = $state(false);

	const STORAGE_KEY = 'meadow-onboarded';

	onMount(() => {
		if (browser && !localStorage.getItem(STORAGE_KEY)) {
			visible = true;
		}
	});

	function dismiss(): void {
		visible = false;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, '1');
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
			e.preventDefault();
			dismiss();
		}
	}
</script>

{#if visible}
	<div
		class="onboarding-hint"
		role="button"
		tabindex="0"
		aria-label="Touch anywhere to create sounds. Press Enter or click to dismiss."
		onclick={dismiss}
		onkeydown={handleKeydown}
	>
		<div class="hint-ring"></div>
		<div class="hint-ring hint-ring-2"></div>
		<span class="hint-text">touch anywhere to play</span>
	</div>
{/if}

<style>
	.onboarding-hint {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 15;
		pointer-events: auto;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
	}

	.onboarding-hint:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 8px;
		border-radius: 8px;
	}

	.hint-ring {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		border: 2px solid var(--color-accent);
		animation: hint-pulse 2s ease-in-out infinite;
	}

	.hint-ring-2 {
		position: absolute;
		inset: -10px;
		width: 80px;
		height: 80px;
		animation-delay: 0.5s;
	}

	.hint-text {
		color: var(--text-secondary);
		font-size: 13px;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	@keyframes hint-pulse {
		0%, 100% { opacity: 0.6; transform: scale(1); }
		50% { opacity: 0.2; transform: scale(1.2); }
	}

	@media (prefers-reduced-motion: reduce) {
		.hint-ring {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
