import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), glsl()],
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp'
		}
	},
	worker: {
		format: 'es'
	}
});
