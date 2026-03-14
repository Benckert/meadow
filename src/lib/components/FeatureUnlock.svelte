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

	const THRESHOLDS: [string, string, () => boolean][] = [
		['controls', 'Controls unlocked', () => notesPlayed >= 1],
		['scale-selector', 'Scales available', () => notesPlayed >= 30],
		['generative', 'Generative mode ready', () => elapsed() >= 60],
		['nature-sounds', 'Nature sounds ready', () => elapsed() >= 120]
	];

	function elapsed(): number {
		return (Date.now() - startTime) / 1000;
	}

	function checkUnlocks(): void {
		for (const [feature, label, condition] of THRESHOLDS) {
			if (!unlocked.has(feature) && condition()) {
				unlocked.add(feature);
				unlocked = new Set(unlocked);
				latestUnlock = label;
				onunlock?.(feature);

				setTimeout(() => {
					if (latestUnlock === label) latestUnlock = '';
				}, 2500);
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
	<div class="unlock-notification" role="status" aria-live="polite">
		<div class="unlock-glow"></div>
		<span class="unlock-text">{latestUnlock}</span>
	</div>
{/if}

<style>
	.unlock-notification {
		position: fixed;
		top: var(--space-xl);
		right: var(--space-xl);
		z-index: 30;
		pointer-events: none;
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		border: 1px solid var(--glass-border);
		border-radius: 12px;
		animation: unlock-appear 2.5s ease-in-out forwards;
	}

	.unlock-glow {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-accent);
		box-shadow: 0 0 12px var(--color-accent);
		flex-shrink: 0;
	}

	.unlock-text {
		font-size: 12px;
		color: var(--text-primary);
		white-space: nowrap;
	}

	@keyframes unlock-appear {
		0% { opacity: 0; transform: translateY(-8px); }
		15% { opacity: 1; transform: translateY(0); }
		75% { opacity: 1; }
		100% { opacity: 0; }
	}

	@media (prefers-reduced-motion: reduce) {
		.unlock-notification {
			animation: unlock-appear-simple 2.5s ease-in-out forwards;
		}

		@keyframes unlock-appear-simple {
			0% { opacity: 0; }
			15% { opacity: 1; }
			75% { opacity: 1; }
			100% { opacity: 0; }
		}
	}
</style>
