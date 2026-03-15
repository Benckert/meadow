export interface NoteEvent {
	note: string;
	velocity: number;
	duration: string;
	row: number;
	col: number;
	x?: number;
	y?: number;
	pan?: number;
	worldPos?: { x: number; y: number; z: number };
}

export interface BeatEvent {
	beat: number;
	time: number;
}

export interface ThemeColors {
	background: [string, string]; // gradient stops
	panel: string;
	primary: string;
	secondary: string;
	accent: string;
	textPrimary: string;
	textSecondary: string;
	glassBorder: string;
	particleColors: string[];
	gridActive: string;
	gridInactive: string;
	glassTint: string;
}

export interface ParticleConfig {
	count: number;
	baseSize: number;
	sizeVariance: number;
	baseSpeed: number;
	speedVariance: number;
	lifespan: number;
}

export interface ThemeConfig {
	id: string;
	name: string;
	colors: ThemeColors;
	particleConfig: ParticleConfig;
	shaderUniforms: Record<string, number>;
}

export interface GridCell {
	row: number;
	col: number;
	note: string;
	isActive: boolean;
}

export interface ScaleConfig {
	name: string;
	root: string;
	notes: string[];
}

export type QualityLevel = 'high' | 'medium' | 'low';

export type ThemeId = 'forest-dawn' | 'ocean-depths' | 'sunset-canyon';

export interface EventMap {
	'note:trigger': NoteEvent;
	'note:release': { note: string };
	'beat:tick': BeatEvent;
	'audio:fft': Float32Array;
	'audio:waveform': Float32Array;
	'audio:amplitude': number;
	'transport:state': { playing: boolean };
	'quality:change': QualityLevel;
	'theme:change': ThemeId;
}
