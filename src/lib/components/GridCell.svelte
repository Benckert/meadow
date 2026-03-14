<script lang="ts">
	let {
		row,
		col,
		note,
		isActive = false
	}: {
		row: number;
		col: number;
		note: string;
		isActive: boolean;
	} = $props();
</script>

<div
	class="grid-cell"
	class:active={isActive}
	data-row={row}
	data-col={col}
	data-note={note}
>
	<div class="cell-glow"></div>
</div>

<style>
	.grid-cell {
		position: relative;
		border: 1px solid var(--glass-border);
		border-radius: 4px;
		background: var(--glass-bg);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		transition: background var(--transition-fast), box-shadow var(--transition-fast);
		cursor: pointer;
		overflow: hidden;
	}

	.grid-cell:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.grid-cell:active {
		background: rgba(255, 255, 255, 0.15);
		transform: scale(0.95);
	}

	.grid-cell.active {
		background: var(--color-accent);
		box-shadow: 0 0 20px var(--color-accent), inset 0 0 10px rgba(255, 255, 255, 0.2);
	}

	.cell-glow {
		position: absolute;
		inset: 0;
		opacity: 0;
		background: radial-gradient(circle at center, var(--color-accent) 0%, transparent 70%);
		transition: opacity var(--transition-fast);
		pointer-events: none;
	}

	.grid-cell.active .cell-glow {
		opacity: 0.6;
	}
</style>
