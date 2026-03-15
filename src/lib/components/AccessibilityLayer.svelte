<script lang="ts">
	import ScreenReaderPitchLadder from './ScreenReaderPitchLadder.svelte';
	import ScreenReaderControls from './ScreenReaderControls.svelte';

	let {
		scaleNotes = [] as string[],
		isPlaying = false,
		natureActive = false,
		bpm = 90,
		scaleName = '',
		onplayPause,
		onToggleNature
	}: {
		scaleNotes?: string[];
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
	<ScreenReaderPitchLadder {scaleNotes} />
</div>
