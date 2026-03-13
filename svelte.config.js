import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
		alias: {
			$engine: 'src/lib/engine',
			$shaders: 'src/lib/shaders'
		}
	}
};

export default config;
