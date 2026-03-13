import * as THREE from 'three';
import { eventBus } from '$lib/stores/event-bus';
import type { NoteEvent, ThemeConfig } from '$lib/stores/types';
import { getTheme } from '$lib/themes';
import type { ThemeId } from '$lib/stores/types';

interface RingBurst {
	ring: THREE.Mesh;
	particles: THREE.Points;
	life: number;
	maxLife: number;
}

const POOL_SIZE = 20;

export class NoteVisualizer {
	private scene: THREE.Scene;
	private pool: RingBurst[] = [];
	private active: RingBurst[] = [];
	private themeColors: THREE.Color[];

	constructor(scene: THREE.Scene, themeId: ThemeId) {
		this.scene = scene;
		const theme = getTheme(themeId);
		this.themeColors = theme.colors.particleColors.map((c) => new THREE.Color(c));
		this.initPool();

		eventBus.on('note:trigger', this.onNoteTrigger);
	}

	private initPool(): void {
		for (let i = 0; i < POOL_SIZE; i++) {
			const burst = this.createBurst();
			burst.ring.visible = false;
			burst.particles.visible = false;
			this.pool.push(burst);
		}
	}

	private createBurst(): RingBurst {
		// Ring
		const ringGeo = new THREE.RingGeometry(0.1, 0.15, 32);
		const ringMat = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 1.0,
			side: THREE.DoubleSide,
			depthWrite: false
		});
		const ring = new THREE.Mesh(ringGeo, ringMat);
		this.scene.add(ring);

		// Burst particles
		const count = 12;
		const positions = new Float32Array(count * 3);
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		const mat = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 3,
			transparent: true,
			opacity: 1.0,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			sizeAttenuation: true
		});
		const particles = new THREE.Points(geo, mat);
		this.scene.add(particles);

		return { ring, particles, life: 0, maxLife: 0.8 };
	}

	private onNoteTrigger = (event: NoteEvent): void => {
		const burst = this.pool.pop();
		if (!burst) return;

		// Map grid position to 3D space
		// Grid is 16x5, map to roughly -12..12 x, -5..5 y
		const x = ((event.col / 15) - 0.5) * 24;
		const y = ((event.row / 4) - 0.5) * 10;

		const color = this.themeColors[Math.floor(Math.random() * this.themeColors.length)];

		// Position ring
		burst.ring.position.set(x, y, 0);
		burst.ring.scale.set(1, 1, 1);
		(burst.ring.material as THREE.MeshBasicMaterial).color.copy(color);
		(burst.ring.material as THREE.MeshBasicMaterial).opacity = 1.0;
		burst.ring.visible = true;

		// Set burst particle positions
		const positions = burst.particles.geometry.attributes.position as THREE.BufferAttribute;
		for (let i = 0; i < positions.count; i++) {
			const angle = (i / positions.count) * Math.PI * 2;
			positions.setXYZ(i, x, y, 0);
		}
		positions.needsUpdate = true;
		burst.particles.position.set(0, 0, 0);
		(burst.particles.material as THREE.PointsMaterial).color.copy(color);
		(burst.particles.material as THREE.PointsMaterial).opacity = 1.0;
		burst.particles.visible = true;

		// Store initial position and velocity in userData
		burst.ring.userData = { originX: x, originY: y };
		const vels: { vx: number; vy: number }[] = [];
		for (let i = 0; i < positions.count; i++) {
			const angle = (i / positions.count) * Math.PI * 2;
			vels.push({
				vx: Math.cos(angle) * (2 + Math.random() * 2),
				vy: Math.sin(angle) * (2 + Math.random() * 2)
			});
		}
		burst.particles.userData = { velocities: vels };

		burst.life = burst.maxLife;
		this.active.push(burst);
	};

	update(deltaTime: number): void {
		for (let i = this.active.length - 1; i >= 0; i--) {
			const burst = this.active[i];
			burst.life -= deltaTime;

			const t = 1 - burst.life / burst.maxLife; // 0 to 1

			// Expand ring
			const scale = 1 + t * 4;
			burst.ring.scale.set(scale, scale, 1);
			(burst.ring.material as THREE.MeshBasicMaterial).opacity = 1 - t;

			// Expand burst particles
			const positions = burst.particles.geometry.attributes.position as THREE.BufferAttribute;
			const vels = burst.particles.userData.velocities as { vx: number; vy: number }[];
			const ox = burst.ring.userData.originX;
			const oy = burst.ring.userData.originY;
			for (let j = 0; j < positions.count; j++) {
				positions.setXYZ(
					j,
					ox + vels[j].vx * t,
					oy + vels[j].vy * t,
					0
				);
			}
			positions.needsUpdate = true;
			(burst.particles.material as THREE.PointsMaterial).opacity = 1 - t;

			if (burst.life <= 0) {
				burst.ring.visible = false;
				burst.particles.visible = false;
				this.active.splice(i, 1);
				this.pool.push(burst);
			}
		}
	}

	setTheme(themeId: ThemeId): void {
		const theme = getTheme(themeId);
		this.themeColors = theme.colors.particleColors.map((c) => new THREE.Color(c));
	}

	dispose(): void {
		eventBus.off('note:trigger', this.onNoteTrigger);
		for (const burst of [...this.pool, ...this.active]) {
			burst.ring.geometry.dispose();
			(burst.ring.material as THREE.Material).dispose();
			burst.particles.geometry.dispose();
			(burst.particles.material as THREE.Material).dispose();
			this.scene.remove(burst.ring);
			this.scene.remove(burst.particles);
		}
	}
}
