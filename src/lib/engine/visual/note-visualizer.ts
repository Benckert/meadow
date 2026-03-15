import * as THREE from 'three';
import { eventBus } from '$lib/stores/event-bus';
import type { NoteEvent, ThemeId } from '$lib/stores/types';
import { getTheme } from '$lib/themes';
import { RippleSurface } from './ripple-surface';

interface ParticleBurst {
	points: THREE.Points;
	velocities: { vx: number; vy: number }[];
	origin: { x: number; y: number };
	life: number;
	maxLife: number;
}

const BURST_POOL_SIZE = 16;

export class NoteVisualizer {
	private scene: THREE.Scene;
	readonly rippleSurface: RippleSurface;
	private burstPool: ParticleBurst[] = [];
	private activeBursts: ParticleBurst[] = [];
	private themeColors: THREE.Color[];

	constructor(scene: THREE.Scene, themeId: ThemeId) {
		this.scene = scene;
		const theme = getTheme(themeId);
		this.themeColors = theme.colors.particleColors.map((c) => new THREE.Color(c));

		this.rippleSurface = new RippleSurface(themeId);
		this.scene.add(this.rippleSurface.mesh);

		this.initBurstPool();
		eventBus.on('note:trigger', this.onNoteTrigger);
	}

	private initBurstPool(): void {
		for (let i = 0; i < BURST_POOL_SIZE; i++) {
			const burst = this.createBurst();
			burst.points.visible = false;
			this.burstPool.push(burst);
		}
	}

	private createBurst(): ParticleBurst {
		const count = 8;
		const positions = new Float32Array(count * 3);
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		const mat = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 2.5,
			transparent: true,
			opacity: 1.0,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			sizeAttenuation: true
		});
		const points = new THREE.Points(geo, mat);
		this.scene.add(points);

		return {
			points,
			velocities: [],
			origin: { x: 0, y: 0 },
			life: 0,
			maxLife: 1.2
		};
	}

	private onNoteTrigger = (event: NoteEvent): void => {
		let wx: number, wy: number;

		if (event.worldPos) {
			wx = event.worldPos.x;
			wy = event.worldPos.y;
		} else {
			// Fallback for generative notes: map row to Y position
			wx = (Math.random() - 0.5) * 20;
			wy = ((event.row / 4) - 0.5) * 8;
		}

		// Add ripple to the water surface
		const amp = 0.4 + event.velocity * 0.8;
		this.rippleSurface.addRipple(wx, wy, amp);

		// Spawn subtle particle burst accent
		const burst = this.burstPool.pop();
		if (!burst) return;

		const color = this.themeColors[Math.floor(Math.random() * this.themeColors.length)];

		const positions = burst.points.geometry.attributes.position as THREE.BufferAttribute;
		const vels: { vx: number; vy: number }[] = [];
		for (let i = 0; i < positions.count; i++) {
			const angle = (i / positions.count) * Math.PI * 2 + Math.random() * 0.3;
			positions.setXYZ(i, wx, wy, 0);
			vels.push({
				vx: Math.cos(angle) * (1.5 + Math.random() * 1.5),
				vy: Math.sin(angle) * (1.5 + Math.random() * 1.5)
			});
		}
		positions.needsUpdate = true;
		burst.velocities = vels;
		burst.origin = { x: wx, y: wy };

		(burst.points.material as THREE.PointsMaterial).color.copy(color);
		(burst.points.material as THREE.PointsMaterial).opacity = 0.8;
		burst.points.visible = true;
		burst.life = burst.maxLife;
		this.activeBursts.push(burst);
	};

	update(deltaTime: number): void {
		this.rippleSurface.update(deltaTime);

		for (let i = this.activeBursts.length - 1; i >= 0; i--) {
			const burst = this.activeBursts[i];
			burst.life -= deltaTime;
			const t = 1 - burst.life / burst.maxLife;

			const positions = burst.points.geometry.attributes.position as THREE.BufferAttribute;
			for (let j = 0; j < positions.count; j++) {
				positions.setXYZ(
					j,
					burst.origin.x + burst.velocities[j].vx * t,
					burst.origin.y + burst.velocities[j].vy * t,
					0
				);
			}
			positions.needsUpdate = true;
			(burst.points.material as THREE.PointsMaterial).opacity = 0.8 * (1 - t);

			if (burst.life <= 0) {
				burst.points.visible = false;
				this.activeBursts.splice(i, 1);
				this.burstPool.push(burst);
			}
		}
	}

	setTheme(themeId: ThemeId): void {
		const theme = getTheme(themeId);
		this.themeColors = theme.colors.particleColors.map((c) => new THREE.Color(c));
		this.rippleSurface.setTheme(themeId);
	}

	dispose(): void {
		eventBus.off('note:trigger', this.onNoteTrigger);
		this.rippleSurface.dispose();
		this.scene.remove(this.rippleSurface.mesh);
		for (const burst of [...this.burstPool, ...this.activeBursts]) {
			burst.points.geometry.dispose();
			(burst.points.material as THREE.Material).dispose();
			this.scene.remove(burst.points);
		}
	}
}
