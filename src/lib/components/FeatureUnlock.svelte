<script lang="ts">
	import { eventBus } from '$lib/stores/event-bus';
	import { onMount, onDestroy } from 'svelte';

	let {
		onunlock
	}: {
		onunlock?: (feature: string) => void;
	} = $props();

	let notesPlayed = 0;
	let startTime = 0;
	let unlocked = $state(new Set<string>());
	let latestUnlock = $state('');

	const THRESHOLDS: [string, () => boolean][] = [
		['controls', () => notesPlayed >= 1],
		['scale-selector', () => notesPlayed >= 30],
		['generative', () => elapsed() >= 60],
		['nature-sounds', () => elapsed() >= 120]
	];

	function elapsed(): number {
		return (Date.now() - startTime) / 1000;
	}

	function checkUnlocks(): void {
		for (const [feature, condition] of THRESHOLDS) {
			if (!unlocked.has(feature) && condition()) {
				unlocked.add(feature);
				unlocked = new Set(unlocked);
				latestUnlock = feature;
				onunlock?.(feature);

				// Clear notification after a moment
				setTimeout(() => {
					if (latestUnlock === feature) latestUnlock = '';
				}, 2000);
			}
		}
	}

	function onNote(): void {
		notesPlayed++;
		checkUnlocks();
	}

	onMount(() => {
		startTime = Date.now();
		eventBus.on('note:trigger', onNote);

		// Check time-based unlocks periodically
		const interval = setInterval(checkUnlocks, 5000);

		return () => clearInterval(interval);
	});

	onDestroy(() => {
		eventBus.off('note:trigger', onNote);
	});

	export function isUnlocked(feature: string): boolean {
		return unlocked.has(feature);
	}
</script>

{#if latestUnlock}
	<div class="unlock-notification" role="status">
		<div class="unlock-glow"></div>
	</div>
{/if}

<style>
	.unlock-notification {
		position: fixed;
		top: var(--space-xl);
		right: var(--space-xl);
		z-index: 30;
		pointer-events: none;
		animation: fade-in-out 2s ease-in-out;
	}

	.unlock-glow {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-accent);
		box-shadow: 0 0 20px var(--color-accent);
	}

	@keyframes fade-in-out {
		0% { opacity: 0; transform: scale(0.5); }
		20% { opacity: 1; transform: scale(1); }
		80% { opacity: 1; }
		100% { opacity: 0; }
	}
</style>
