<script lang="ts">
	import '../app.css';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import OnboardingHint from '$lib/components/OnboardingHint.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let loaded = $state(false);

	onMount(() => {
		// Hide loading screen after a short delay
		setTimeout(() => {
			loaded = true;
		}, 2500);
	});
</script>

<LoadingScreen visible={!loaded} />
<OnboardingHint />
{@render children()}
