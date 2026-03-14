<script lang="ts">
	let {
		isPlaying = false,
		natureActive = false,
		bpm = 90,
		scaleName = '',
		onplayPause,
		onToggleNature
	}: {
		isPlaying?: boolean;
		natureActive?: boolean;
		bpm?: number;
		scaleName?: string;
		onplayPause?: () => void;
		onToggleNature?: () => void;
	} = $props();
</script>

<div class="sr-controls" role="toolbar" aria-label="Music controls">
	<button
		aria-label={isPlaying ? 'Pause generative music' : 'Play generative music'}
		aria-pressed={isPlaying}
		onclick={onplayPause}
	>
		{isPlaying ? 'Pause' : 'Play'}
	</button>

	<button
		aria-label={natureActive ? 'Disable nature sounds' : 'Enable nature sounds'}
		aria-pressed={natureActive}
		onclick={onToggleNature}
	>
		Nature
	</button>

	<span role="status" aria-live="polite">
		Tempo: {bpm} BPM. Scale: {scaleName}.
	</span>
</div>

<style>
	.sr-controls {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.sr-controls:focus-within {
		position: fixed;
		top: var(--space-xl);
		left: 50%;
		transform: translateX(-50%);
		width: auto;
		height: auto;
		clip-path: none;
		z-index: 50;
		display: flex;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		border: 1px solid var(--glass-border);
		border-radius: 12px;
	}

	button {
		padding: var(--space-md) var(--space-lg);
		background: var(--glass-bg);
		border: 1px solid var(--glass-border);
		border-radius: 8px;
		color: var(--text-primary);
		cursor: pointer;
	}

	button:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
