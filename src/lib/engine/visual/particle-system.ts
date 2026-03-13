import * as THREE from 'three';
import type { ThemeConfig } from '$lib/stores/types';
import { amplitude } from '$lib/stores/audio-state';
import particleVertexShader from '$shaders/particle.vert';
import particleFragmentShader from '$shaders/particle.frag';

export class ParticleSystem {
	readonly points: THREE.Points;
	private geometry: THREE.BufferGeometry;
	private material: THREE.ShaderMaterial;
	private count: number;

	// Per-particle data
	private positions: Float32Array;
	private velocities: Float32Array;
	private sizes: Float32Array;
	private lives: Float32Array;
	private maxLives: Float32Array;
	private colors: Float32Array;

	private bounds = { x: 20, y: 12, z: 15 };
	private themeColors: THREE.Color[] = [];
	private time = 0;

	constructor(theme: ThemeConfig) {
		this.count = theme.particleConfig.count;
		this.positions = new Float32Array(this.count * 3);
		this.velocities = new Float32Array(this.count * 3);
		this.sizes = new Float32Array(this.count);
		this.lives = new Float32Array(this.count);
		this.maxLives = new Float32Array(this.count);
		this.colors = new Float32Array(this.count * 3);

		this.parseThemeColors(theme);
		this.initParticles(theme);

		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
		this.geometry.setAttribute('aLife', new THREE.BufferAttribute(this.lives, 1));
		this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));

		this.material = new THREE.ShaderMaterial({
			vertexShader: particleVertexShader,
			fragmentShader: particleFragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uAmplitude: { value: 0 },
				uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
			},
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		});

		this.points = new THREE.Points(this.geometry, this.material);
	}

	private parseThemeColors(theme: ThemeConfig): void {
		this.themeColors = theme.colors.particleColors.map(
			(c) => new THREE.Color(c)
		);
	}

	private initParticles(theme: ThemeConfig): void {
		const config = theme.particleConfig;
		for (let i = 0; i < this.count; i++) {
			this.resetParticle(i, config, true);
		}
	}

	private resetParticle(
		i: number,
		config: ThemeConfig['particleConfig'],
		randomLife: boolean = false
	): void {
		const i3 = i * 3;

		// Random position within bounds
		this.positions[i3] = (Math.random() - 0.5) * this.bounds.x * 2;
		this.positions[i3 + 1] = (Math.random() - 0.5) * this.bounds.y * 2;
		this.positions[i3 + 2] = (Math.random() - 0.5) * this.bounds.z * 2;

		// Random velocity
		this.velocities[i3] = (Math.random() - 0.5) * config.baseSpeed;
		this.velocities[i3 + 1] = (Math.random() - 0.3) * config.baseSpeed; // slight upward bias
		this.velocities[i3 + 2] = (Math.random() - 0.5) * config.baseSpeed * 0.5;

		// Size with variance
		this.sizes[i] = config.baseSize + (Math.random() - 0.5) * config.sizeVariance;

		// Life
		const lifespan = config.lifespan + (Math.random() - 0.5) * config.lifespan * 0.5;
		this.maxLives[i] = lifespan;
		this.lives[i] = randomLife ? Math.random() : 1.0;

		// Random color from theme palette
		const color = this.themeColors[Math.floor(Math.random() * this.themeColors.length)];
		this.colors[i3] = color.r;
		this.colors[i3 + 1] = color.g;
		this.colors[i3 + 2] = color.b;
	}

	update(deltaTime: number, theme: ThemeConfig): void {
		this.time += deltaTime;
		const amp = amplitude[0];
		const config = theme.particleConfig;

		this.material.uniforms.uTime.value = this.time;
		this.material.uniforms.uAmplitude.value = amp;

		for (let i = 0; i < this.count; i++) {
			const i3 = i * 3;

			// Decrease life
			this.lives[i] -= deltaTime / this.maxLives[i];

			if (this.lives[i] <= 0) {
				this.resetParticle(i, config);
				continue;
			}

			// Audio-reactive velocity boost
			const speedMult = 1.0 + amp * 5.0;

			// Update position
			this.positions[i3] += this.velocities[i3] * speedMult * deltaTime;
			this.positions[i3 + 1] += this.velocities[i3 + 1] * speedMult * deltaTime;
			this.positions[i3 + 2] += this.velocities[i3 + 2] * speedMult * deltaTime;

			// Simple noise-like drift
			const px = this.positions[i3];
			const py = this.positions[i3 + 1];
			this.velocities[i3] += Math.sin(py * 0.5 + this.time * 0.3) * 0.001;
			this.velocities[i3 + 1] += Math.cos(px * 0.5 + this.time * 0.2) * 0.001;

			// Wrap around bounds
			if (Math.abs(this.positions[i3]) > this.bounds.x) {
				this.positions[i3] *= -0.9;
			}
			if (Math.abs(this.positions[i3 + 1]) > this.bounds.y) {
				this.positions[i3 + 1] *= -0.9;
			}
			if (Math.abs(this.positions[i3 + 2]) > this.bounds.z) {
				this.positions[i3 + 2] *= -0.9;
			}
		}

		// Mark attributes as needing update
		this.geometry.attributes.position.needsUpdate = true;
		(this.geometry.attributes.aLife as THREE.BufferAttribute).needsUpdate = true;
	}

	setTheme(theme: ThemeConfig): void {
		this.parseThemeColors(theme);
	}

	dispose(): void {
		this.geometry.dispose();
		this.material.dispose();
	}
}
