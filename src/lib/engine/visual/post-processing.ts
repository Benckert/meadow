import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import filmGrainFrag from '$shaders/film-grain.frag';
import chromaticAberrationFrag from '$shaders/chromatic-aberration.frag';

const fullscreenVert = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export class PostProcessing {
	readonly composer: EffectComposer;
	private bloomPass: UnrealBloomPass;
	private filmGrainPass: ShaderPass;
	private chromaticPass: ShaderPass;
	private time = 0;

	constructor(
		renderer: THREE.WebGLRenderer,
		scene: THREE.Scene,
		camera: THREE.PerspectiveCamera
	) {
		this.composer = new EffectComposer(renderer);

		// Render pass
		const renderPass = new RenderPass(scene, camera);
		this.composer.addPass(renderPass);

		// Bloom
		const resolution = new THREE.Vector2(
			renderer.domElement.width,
			renderer.domElement.height
		);
		this.bloomPass = new UnrealBloomPass(resolution, 0.8, 0.4, 0.85);
		this.composer.addPass(this.bloomPass);

		// Film grain
		this.filmGrainPass = new ShaderPass({
			uniforms: {
				tDiffuse: { value: null },
				uTime: { value: 0 },
				uIntensity: { value: 0.3 }
			},
			vertexShader: fullscreenVert,
			fragmentShader: filmGrainFrag
		});
		this.composer.addPass(this.filmGrainPass);

		// Chromatic aberration
		this.chromaticPass = new ShaderPass({
			uniforms: {
				tDiffuse: { value: null },
				uOffset: { value: 0.002 }
			},
			vertexShader: fullscreenVert,
			fragmentShader: chromaticAberrationFrag
		});
		this.composer.addPass(this.chromaticPass);

		// Output
		this.composer.addPass(new OutputPass());
	}

	update(deltaTime: number, audioAmplitude: number): void {
		this.time += deltaTime;

		// Audio-reactive bloom
		this.bloomPass.strength = 0.6 + audioAmplitude * 4.0;

		// Film grain
		this.filmGrainPass.uniforms.uTime.value = this.time;
		this.filmGrainPass.uniforms.uIntensity.value = 0.2 + audioAmplitude * 0.5;

		// Chromatic aberration on peaks
		this.chromaticPass.uniforms.uOffset.value = 0.001 + audioAmplitude * 0.01;
	}

	resize(width: number, height: number): void {
		this.composer.setSize(width, height);
		this.bloomPass.resolution.set(width, height);
	}

	dispose(): void {
		this.composer.dispose();
	}
}
