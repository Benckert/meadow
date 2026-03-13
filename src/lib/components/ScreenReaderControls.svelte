<script lang="ts">
	let {
		isPlaying = false,
		generativeActive = false,
		natureActive = false,
		bpm = 90,
		scaleName = '',
		onplayPause,
		onToggleGenerative,
		onToggleNature
	}: {
		isPlaying?: boolean;
		generativeActive?: boolean;
		natureActive?: boolean;
		bpm?: number;
		scaleName?: string;
		onplayPause?: () => void;
		onToggleGenerative?: () => void;
		onToggleNature?: () => void;
	} = $props();
</script>

<div class="sr-controls" role="toolbar" aria-label="Music controls">
	<button
		aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
		aria-pressed={isPlaying}
		onclick={onplayPause}
	>
		{isPlaying ? 'Pause' : 'Play'}
	</button>

	<button
		aria-label={generativeActive ? 'Stop generative mode' : 'Start generative mode'}
		aria-pressed={generativeActive}
		onclick={onToggleGenerative}
	>
		Generative
	</button>

	<button
		aria-label={natureActive ? 'Stop nature sounds' : 'Start nature sounds'}
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
		clip: rect(0, 0, 0, 0);
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
		clip: auto;
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

	button:focus {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
