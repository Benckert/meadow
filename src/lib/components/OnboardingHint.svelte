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
</script>

{#if visible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="onboarding-hint" onclick={dismiss}>
		<div class="hint-ring"></div>
		<div class="hint-ring hint-ring-2"></div>
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

	@keyframes hint-pulse {
		0%, 100% { opacity: 0.6; transform: scale(1); }
		50% { opacity: 0.2; transform: scale(1.2); }
	}
</style>
