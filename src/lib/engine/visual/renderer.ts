import * as THREE from 'three';
import type { ThemeId } from '$lib/stores/types';
import { amplitude } from '$lib/stores/audio-state';
import { SceneManager } from './scene-manager';
import { PostProcessing } from './post-processing';

export class VisualRenderer {
	private renderer: THREE.WebGLRenderer;
	private camera: THREE.PerspectiveCamera;
	private sceneManager: SceneManager;
	private postProcessing: PostProcessing;
	private animationFrameId: number | null = null;
	private clock = new THREE.Clock();
	private container: HTMLElement | null = null;

	constructor(themeId: ThemeId = 'forest-dawn') {
		this.renderer = new THREE.WebGLRenderer({
			antialias: false,
			alpha: false,
			powerPreference: 'high-performance'
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;

		this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
		this.camera.position.set(0, 0, 15);
		this.camera.lookAt(0, 0, 0);

		this.sceneManager = new SceneManager(themeId);
		this.postProcessing = new PostProcessing(
			this.renderer,
			this.sceneManager.scene,
			this.camera
		);
	}

	mount(container: HTMLElement): void {
		this.container = container;
		container.appendChild(this.renderer.domElement);
		this.renderer.domElement.style.position = 'absolute';
		this.renderer.domElement.style.top = '0';
		this.renderer.domElement.style.left = '0';
		this.renderer.domElement.style.width = '100%';
		this.renderer.domElement.style.height = '100%';

		this.resize();
		window.addEventListener('resize', this.onResize);
		this.startRenderLoop();
	}

	private startRenderLoop(): void {
		this.clock.start();
		const render = () => {
			const deltaTime = this.clock.getDelta();
			const amp = amplitude[0];

			this.sceneManager.update(deltaTime);
			this.postProcessing.update(deltaTime, amp);
			this.postProcessing.composer.render();

			this.animationFrameId = requestAnimationFrame(render);
		};
		this.animationFrameId = requestAnimationFrame(render);
	}

	private resize(): void {
		if (!this.container) return;
		const width = this.container.clientWidth;
		const height = this.container.clientHeight;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
		this.postProcessing.resize(width, height);
	}

	private onResize = (): void => {
		this.resize();
	};

	setTheme(themeId: ThemeId): void {
		this.sceneManager.setTheme(themeId);
	}

	setQuality(level: 'high' | 'medium' | 'low'): void {
		this.postProcessing.setQuality(level);
		// Reduce pixel ratio on low quality
		const maxPixelRatio = level === 'low' ? 1 : level === 'medium' ? 1.5 : 2;
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
		this.resize();
	}

	get scene(): THREE.Scene {
		return this.sceneManager.scene;
	}

	get domElement(): HTMLCanvasElement {
		return this.renderer.domElement;
	}

	/**
	 * Convert screen coordinates (0-1 range) to 3D world position on the z=0 plane.
	 */
	screenToWorld(normalizedX: number, normalizedY: number): THREE.Vector3 {
		const ndc = new THREE.Vector3(
			normalizedX * 2 - 1,
			-(normalizedY * 2 - 1),
			0.5
		);
		ndc.unproject(this.camera);
		const dir = ndc.sub(this.camera.position).normalize();
		const distance = -this.camera.position.z / dir.z;
		return this.camera.position.clone().add(dir.multiplyScalar(distance));
	}

	dispose(): void {
		window.removeEventListener('resize', this.onResize);
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
		}
		this.sceneManager.dispose();
		this.postProcessing.dispose();
		this.renderer.dispose();
		if (this.container && this.renderer.domElement.parentElement) {
			this.container.removeChild(this.renderer.domElement);
		}
	}
}
