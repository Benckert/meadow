<script lang="ts">
	import { icons, type IconName } from './icons';

	let {
		icon,
		active = false,
		label = '',
		onclick
	}: {
		icon: IconName;
		active?: boolean;
		label?: string;
		onclick?: () => void;
	} = $props();

	const path = $derived(icons[icon]);
</script>

<button
	class="icon-button"
	class:active
	aria-label={label}
	aria-pressed={active}
	title={label}
	{onclick}
>
	<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
		<path d={path} />
	</svg>
	<span class="ripple"></span>
</button>

<style>
	.icon-button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: 1px solid var(--glass-border);
		border-radius: 12px;
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		overflow: hidden;
		-webkit-tap-highlight-color: transparent;
	}

	.icon-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.icon-button:active {
		transform: scale(0.95);
	}

	.icon-button.active {
		background: rgba(255, 255, 255, 0.15);
		color: var(--color-accent);
		border-color: var(--color-accent);
		box-shadow: 0 0 12px color-mix(in srgb, var(--color-accent) 25%, transparent);
	}

	.icon-button:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.icon-button:active .ripple {
		animation: ripple-effect 0.4s ease-out;
	}

	.ripple {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
	}

	@keyframes ripple-effect {
		0% {
			background: rgba(255, 255, 255, 0.2);
			transform: scale(0.8);
		}
		100% {
			background: transparent;
			transform: scale(1.2);
		}
	}

	svg {
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.icon-button:active .ripple {
			animation: none;
		}
	}
</style>
