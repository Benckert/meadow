import * as THREE from 'three';
import type { ThemeId } from '$lib/stores/types';
import { getTheme } from '$lib/themes';
import rippleVert from '$shaders/ripple.vert';
import rippleFrag from '$shaders/ripple.frag';

const MAX_RIPPLES = 32;

interface Ripple {
	x: number;
	y: number;
	birthTime: number;
	amplitude: number;
}

export class RippleSurface {
	readonly mesh: THREE.Mesh;
	private material: THREE.ShaderMaterial;
	private ripples: Ripple[] = [];
	private time = 0;
	private uniformArray: Float32Array;

	constructor(themeId: ThemeId) {
		const theme = getTheme(themeId);

		this.uniformArray = new Float32Array(MAX_RIPPLES * 4);

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uRippleCount: { value: 0 },
				uRipples: { value: this.createRippleUniforms() },
				uColorBase: { value: new THREE.Color(theme.colors.primary).multiplyScalar(0.6) },
				uColorRipple: { value: new THREE.Color(theme.colors.secondary) },
				uColorHighlight: { value: new THREE.Color(theme.colors.accent) },
				uReducedMotion: { value: 0 }
			},
			vertexShader: rippleVert,
			fragmentShader: rippleFrag,
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending
		});

		// Large plane covering the visible area
		const geometry = new THREE.PlaneGeometry(60, 40, 1, 1);
		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.position.z = -1;

		// Check reduced motion preference
		if (typeof window !== 'undefined') {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			this.material.uniforms.uReducedMotion.value = mq.matches ? 1.0 : 0.0;
			mq.addEventListener('change', (e) => {
				this.material.uniforms.uReducedMotion.value = e.matches ? 1.0 : 0.0;
			});
		}
	}

	private createRippleUniforms(): THREE.Vector4[] {
		const arr: THREE.Vector4[] = [];
		for (let i = 0; i < MAX_RIPPLES; i++) {
			arr.push(new THREE.Vector4(0, 0, -100, 0));
		}
		return arr;
	}

	addRipple(worldX: number, worldY: number, amplitude: number = 1.0): void {
		const ripple: Ripple = {
			x: worldX,
			y: worldY,
			birthTime: this.time,
			amplitude
		};

		// If at capacity, replace oldest
		if (this.ripples.length >= MAX_RIPPLES) {
			this.ripples.shift();
		}
		this.ripples.push(ripple);
		this.syncUniforms();
	}

	private syncUniforms(): void {
		const uniforms = this.material.uniforms.uRipples.value as THREE.Vector4[];
		for (let i = 0; i < MAX_RIPPLES; i++) {
			if (i < this.ripples.length) {
				const r = this.ripples[i];
				uniforms[i].set(r.x, r.y, r.birthTime, r.amplitude);
			} else {
				uniforms[i].set(0, 0, -100, 0);
			}
		}
		this.material.uniforms.uRippleCount.value = this.ripples.length;
	}

	update(deltaTime: number): void {
		this.time += deltaTime;
		this.material.uniforms.uTime.value = this.time;

		// Prune expired ripples (older than 5 seconds)
		const cutoff = this.time - 5;
		const before = this.ripples.length;
		this.ripples = this.ripples.filter(r => r.birthTime > cutoff);
		if (this.ripples.length !== before) {
			this.syncUniforms();
		}
	}

	setTheme(themeId: ThemeId): void {
		const theme = getTheme(themeId);
		this.material.uniforms.uColorBase.value.set(theme.colors.primary).multiplyScalar(0.6);
		this.material.uniforms.uColorRipple.value.set(theme.colors.secondary);
		this.material.uniforms.uColorHighlight.value.set(theme.colors.accent);
	}

	dispose(): void {
		this.mesh.geometry.dispose();
		this.material.dispose();
	}
}
