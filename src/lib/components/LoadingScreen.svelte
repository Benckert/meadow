<script lang="ts">
	let { visible = true }: { visible?: boolean } = $props();
</script>

{#if visible}
	<div class="loading-screen">
		<svg viewBox="0 0 100 100" class="loading-plant" aria-hidden="true">
			<!-- Stem -->
			<line
				x1="50" y1="90" x2="50" y2="40"
				stroke="#41915B" stroke-width="2" stroke-linecap="round"
				class="stem"
			/>
			<!-- Leaves -->
			<path
				d="M50 65 Q35 55 40 40 Q50 50 50 65"
				fill="#155435" class="leaf leaf-left"
			/>
			<path
				d="M50 55 Q65 45 60 30 Q50 40 50 55"
				fill="#41915B" class="leaf leaf-right"
			/>
			<!-- Glow -->
			<circle cx="50" cy="35" r="4" fill="#F6E6BB" class="glow">
				<animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
			</circle>
		</svg>
	</div>
{/if}

<style>
	.loading-screen {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #102C26;
		animation: fade-out 0.5s ease-out 2s forwards;
	}

	.loading-plant {
		width: 120px;
		height: 120px;
	}

	.stem {
		stroke-dasharray: 50;
		stroke-dashoffset: 50;
		animation: draw-stem 1s ease-out 0.2s forwards;
	}

	.leaf {
		opacity: 0;
		transform-origin: 50px 65px;
	}

	.leaf-left {
		animation: grow-leaf 0.6s ease-out 0.8s forwards;
	}

	.leaf-right {
		animation: grow-leaf 0.6s ease-out 1.1s forwards;
	}

	@keyframes draw-stem {
		to { stroke-dashoffset: 0; }
	}

	@keyframes grow-leaf {
		from { opacity: 0; transform: scale(0); }
		to { opacity: 1; transform: scale(1); }
	}

	@keyframes fade-out {
		to { opacity: 0; pointer-events: none; }
	}
</style>
