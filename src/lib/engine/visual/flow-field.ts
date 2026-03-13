import { amplitude } from '$lib/stores/audio-state';

/**
 * 2D flow field using simplex-like noise for particle motion.
 * Audio amplitude modulates turbulence.
 */
export class FlowField {
	private resolution: number;
	private field: Float32Array; // 2 floats per cell (dx, dy)
	private time = 0;

	constructor(resolution: number = 32) {
		this.resolution = resolution;
		this.field = new Float32Array(resolution * resolution * 2);
		this.update(0);
	}

	update(deltaTime: number): void {
		this.time += deltaTime * 0.3;
		const amp = amplitude[0];
		const turbulence = 1.0 + amp * 5.0;

		for (let y = 0; y < this.resolution; y++) {
			for (let x = 0; x < this.resolution; x++) {
				const idx = (y * this.resolution + x) * 2;
				const nx = x / this.resolution;
				const ny = y / this.resolution;

				// Pseudo-noise using sin combinations (avoids importing noise library)
				const angle =
					Math.sin(nx * 4.0 + this.time) * 2.0 +
					Math.cos(ny * 3.0 + this.time * 0.7) * 2.0 +
					Math.sin((nx + ny) * 2.5 + this.time * 1.3) * turbulence;

				this.field[idx] = Math.cos(angle) * 0.5;
				this.field[idx + 1] = Math.sin(angle) * 0.5;
			}
		}
	}

	/**
	 * Sample the flow field at a normalized position (0-1 range).
	 * Returns [dx, dy] velocity influence.
	 */
	sample(nx: number, ny: number): [number, number] {
		const x = Math.floor(((nx + 1) * 0.5) * (this.resolution - 1));
		const y = Math.floor(((ny + 1) * 0.5) * (this.resolution - 1));
		const cx = Math.max(0, Math.min(this.resolution - 1, x));
		const cy = Math.max(0, Math.min(this.resolution - 1, y));
		const idx = (cy * this.resolution + cx) * 2;
		return [this.field[idx], this.field[idx + 1]];
	}
}
