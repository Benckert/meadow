<script lang="ts">
	import ScreenReaderGrid from './ScreenReaderGrid.svelte';
	import ScreenReaderControls from './ScreenReaderControls.svelte';

	let {
		cols = 16,
		rows = 5,
		noteMap = [] as string[][],
		isPlaying = false,
		natureActive = false,
		bpm = 90,
		scaleName = '',
		onplayPause,
		onToggleNature
	}: {
		cols?: number;
		rows?: number;
		noteMap?: string[][];
		isPlaying?: boolean;
		natureActive?: boolean;
		bpm?: number;
		scaleName?: string;
		onplayPause?: () => void;
		onToggleNature?: () => void;
	} = $props();
</script>

<div role="application" aria-label="Meadow — Interactive Music Generator">
	<ScreenReaderControls
		{isPlaying}
		{natureActive}
		{bpm}
		{scaleName}
		{onplayPause}
		{onToggleNature}
	/>
	<ScreenReaderGrid {cols} {rows} {noteMap} />
</div>
