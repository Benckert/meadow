import * as THREE from 'three';
import type { ThemeConfig, ThemeId } from '$lib/stores/types';
import { getTheme } from '$lib/themes';
import { ParticleSystem } from './particle-system';

export class SceneManager {
	readonly scene: THREE.Scene;
	readonly particleSystem: ParticleSystem;
	private backgroundMesh: THREE.Mesh;
	private currentTheme: ThemeConfig;

	constructor(themeId: ThemeId) {
		this.scene = new THREE.Scene();
		this.currentTheme = getTheme(themeId);

		// Background gradient mesh (large plane behind everything)
		const bgGeo = new THREE.PlaneGeometry(100, 60);
		const bgMat = new THREE.ShaderMaterial({
			uniforms: {
				uColor1: { value: new THREE.Color(this.currentTheme.colors.background[0]) },
				uColor2: { value: new THREE.Color(this.currentTheme.colors.background[1]) }
			},
			vertexShader: `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform vec3 uColor1;
				uniform vec3 uColor2;
				varying vec2 vUv;
				void main() {
					vec3 color = mix(uColor1, uColor2, vUv.y);
					gl_FragColor = vec4(color, 1.0);
				}
			`,
			depthWrite: false
		});
		this.backgroundMesh = new THREE.Mesh(bgGeo, bgMat);
		this.backgroundMesh.position.z = -20;
		this.scene.add(this.backgroundMesh);

		// Fog
		this.scene.fog = new THREE.FogExp2(this.currentTheme.colors.background[0], 0.02);

		// Particles
		this.particleSystem = new ParticleSystem(this.currentTheme);
		this.scene.add(this.particleSystem.points);
	}

	update(deltaTime: number): void {
		this.particleSystem.update(deltaTime, this.currentTheme);
	}

	setTheme(themeId: ThemeId): void {
		const newTheme = getTheme(themeId);
		this.currentTheme = newTheme;

		// Update background colors
		const bgMat = this.backgroundMesh.material as THREE.ShaderMaterial;
		bgMat.uniforms.uColor1.value.set(newTheme.colors.background[0]);
		bgMat.uniforms.uColor2.value.set(newTheme.colors.background[1]);

		// Update fog
		if (this.scene.fog instanceof THREE.FogExp2) {
			this.scene.fog.color.set(newTheme.colors.background[0]);
		}

		// Update particles
		this.particleSystem.setTheme(newTheme);
	}

	dispose(): void {
		this.particleSystem.dispose();
		this.backgroundMesh.geometry.dispose();
		(this.backgroundMesh.material as THREE.ShaderMaterial).dispose();
	}
}
