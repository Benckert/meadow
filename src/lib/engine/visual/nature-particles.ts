import * as THREE from 'three';
import type { ThemeId } from '$lib/stores/types';

/**
 * Visual nature effects: rain drops, wind streaks.
 * Spawned based on nature synth activity.
 */
export class NatureParticles {
	private scene: THREE.Scene;
	private rainDrops: THREE.Points | null = null;
	private windStreaks: THREE.Points | null = null;
	private rainPositions: Float32Array | null = null;
	private windPositions: Float32Array | null = null;
	private rainVelocities: Float32Array | null = null;
	private showRain = false;
	private showWind = false;
	private bounds = { x: 20, y: 12, z: 10 };

	constructor(scene: THREE.Scene) {
		this.scene = scene;
	}

	enableRain(enabled: boolean): void {
		if (enabled && !this.rainDrops) {
			this.createRainSystem();
		}
		this.showRain = enabled;
		if (this.rainDrops) this.rainDrops.visible = enabled;
	}

	enableWind(enabled: boolean): void {
		if (enabled && !this.windStreaks) {
			this.createWindSystem();
		}
		this.showWind = enabled;
		if (this.windStreaks) this.windStreaks.visible = enabled;
	}

	private createRainSystem(): void {
		const count = 500;
		this.rainPositions = new Float32Array(count * 3);
		this.rainVelocities = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			this.resetRainDrop(i);
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

		const mat = new THREE.PointsMaterial({
			color: 0x89b4bb,
			size: 1.5,
			transparent: true,
			opacity: 0.4,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			sizeAttenuation: true
		});

		this.rainDrops = new THREE.Points(geo, mat);
		this.rainDrops.visible = false;
		this.scene.add(this.rainDrops);
	}

	private resetRainDrop(i: number): void {
		if (!this.rainPositions || !this.rainVelocities) return;
		const i3 = i * 3;
		this.rainPositions[i3] = (Math.random() - 0.5) * this.bounds.x * 2;
		this.rainPositions[i3 + 1] = Math.random() * this.bounds.y * 2;
		this.rainPositions[i3 + 2] = (Math.random() - 0.5) * this.bounds.z;
		this.rainVelocities[i] = 8 + Math.random() * 12;
	}

	private createWindSystem(): void {
		const count = 200;
		this.windPositions = new Float32Array(count * 3);

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;
			this.windPositions[i3] = (Math.random() - 0.5) * this.bounds.x * 2;
			this.windPositions[i3 + 1] = (Math.random() - 0.5) * this.bounds.y * 2;
			this.windPositions[i3 + 2] = (Math.random() - 0.5) * this.bounds.z;
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(this.windPositions, 3));

		const mat = new THREE.PointsMaterial({
			color: 0xdebe90,
			size: 1.0,
			transparent: true,
			opacity: 0.2,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			sizeAttenuation: true
		});

		this.windStreaks = new THREE.Points(geo, mat);
		this.windStreaks.visible = false;
		this.scene.add(this.windStreaks);
	}

	update(deltaTime: number): void {
		// Rain: fall downward
		if (this.showRain && this.rainPositions && this.rainVelocities && this.rainDrops) {
			const count = this.rainPositions.length / 3;
			for (let i = 0; i < count; i++) {
				const i3 = i * 3;
				this.rainPositions[i3 + 1] -= this.rainVelocities[i] * deltaTime;

				// Slight horizontal drift
				this.rainPositions[i3] += Math.sin(i * 0.1) * 0.02;

				if (this.rainPositions[i3 + 1] < -this.bounds.y) {
					this.resetRainDrop(i);
				}
			}
			this.rainDrops.geometry.attributes.position.needsUpdate = true;
		}

		// Wind: horizontal movement
		if (this.showWind && this.windPositions && this.windStreaks) {
			const count = this.windPositions.length / 3;
			for (let i = 0; i < count; i++) {
				const i3 = i * 3;
				this.windPositions[i3] += (3 + Math.sin(i * 0.3) * 2) * deltaTime;
				this.windPositions[i3 + 1] += Math.sin(this.windPositions[i3] * 0.2) * 0.3 * deltaTime;

				if (this.windPositions[i3] > this.bounds.x) {
					this.windPositions[i3] = -this.bounds.x;
					this.windPositions[i3 + 1] = (Math.random() - 0.5) * this.bounds.y * 2;
				}
			}
			this.windStreaks.geometry.attributes.position.needsUpdate = true;
		}
	}

	dispose(): void {
		if (this.rainDrops) {
			this.rainDrops.geometry.dispose();
			(this.rainDrops.material as THREE.Material).dispose();
			this.scene.remove(this.rainDrops);
		}
		if (this.windStreaks) {
			this.windStreaks.geometry.dispose();
			(this.windStreaks.material as THREE.Material).dispose();
			this.scene.remove(this.windStreaks);
		}
	}
}
