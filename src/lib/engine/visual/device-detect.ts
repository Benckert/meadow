import type { QualityLevel } from '$lib/stores/types';

/**
 * Detect device capabilities and suggest an initial quality tier.
 * Mobile devices default to medium, low-end to low.
 */
export function detectInitialQuality(): QualityLevel {
	const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);

	const cores = navigator.hardwareConcurrency ?? 4;
	const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;

	// Try to read GPU info
	let gpuTier: 'high' | 'medium' | 'low' = 'high';
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl');
		if (gl) {
			const ext = gl.getExtension('WEBGL_debug_renderer_info');
			if (ext) {
				const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).toLowerCase();
				if (
					renderer.includes('mali') ||
					renderer.includes('adreno 5') ||
					renderer.includes('intel hd') ||
					renderer.includes('powervr')
				) {
					gpuTier = 'low';
				} else if (
					renderer.includes('adreno 6') ||
					renderer.includes('apple gpu') ||
					renderer.includes('intel iris')
				) {
					gpuTier = 'medium';
				}
			}
		}
	} catch {
		// Ignore GPU detection failures
	}

	if (gpuTier === 'low' || cores <= 2 || memory <= 2) {
		return 'low';
	}

	if (isMobile || gpuTier === 'medium' || cores <= 4 || memory <= 4) {
		return 'medium';
	}

	return 'high';
}
