import * as THREE from 'three';
import type { ThemeConfig } from '$lib/stores/types';

/**
 * Smooth theme transition helper.
 * Lerps all colors and shader uniforms over a specified duration.
 */
export class ThemeTransition {
	private startColors: Map<string, THREE.Color> = new Map();
	private targetColors: Map<string, THREE.Color> = new Map();
	private progress = 1; // 1 = complete
	private duration: number;

	constructor(duration: number = 2.0) {
		this.duration = duration;
	}

	start(from: ThemeConfig, to: ThemeConfig): void {
		this.progress = 0;
		this.startColors.clear();
		this.targetColors.clear();

		// Map color pairs
		const colorKeys = ['background_0', 'background_1', 'primary', 'secondary', 'accent'];
		const fromColors = [
			from.colors.background[0], from.colors.background[1],
			from.colors.primary, from.colors.secondary, from.colors.accent
		];
		const toColors = [
			to.colors.background[0], to.colors.background[1],
			to.colors.primary, to.colors.secondary, to.colors.accent
		];

		for (let i = 0; i < colorKeys.length; i++) {
			this.startColors.set(colorKeys[i], new THREE.Color(fromColors[i]));
			this.targetColors.set(colorKeys[i], new THREE.Color(toColors[i]));
		}
	}

	update(deltaTime: number): boolean {
		if (this.progress >= 1) return false;

		this.progress = Math.min(1, this.progress + deltaTime / this.duration);
		return true;
	}

	/** Get interpolated color. Returns null if transition is complete. */
	getColor(key: string): THREE.Color | null {
		if (this.progress >= 1) return null;

		const start = this.startColors.get(key);
		const target = this.targetColors.get(key);
		if (!start || !target) return null;

		const color = new THREE.Color();
		color.lerpColors(start, target, this.easeInOut(this.progress));
		return color;
	}

	private easeInOut(t: number): number {
		return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
	}

	get isActive(): boolean {
		return this.progress < 1;
	}
}
