<script lang="ts">
	import ScreenReaderGrid from './ScreenReaderGrid.svelte';
	import ScreenReaderControls from './ScreenReaderControls.svelte';

	let {
		cols = 16,
		rows = 5,
		noteMap = [] as string[][],
		isPlaying = false,
		generativeActive = false,
		natureActive = false,
		bpm = 90,
		scaleName = '',
		onplayPause,
		onToggleGenerative,
		onToggleNature
	}: {
		cols?: number;
		rows?: number;
		noteMap?: string[][];
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

<div role="application" aria-label="Meadow — Interactive Music Generator">
	<ScreenReaderControls
		{isPlaying}
		{generativeActive}
		{natureActive}
		{bpm}
		{scaleName}
		{onplayPause}
		{onToggleGenerative}
		{onToggleNature}
	/>
	<ScreenReaderGrid {cols} {rows} {noteMap} />
</div>
