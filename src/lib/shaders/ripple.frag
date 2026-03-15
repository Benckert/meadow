#include "includes/noise.glsl"

uniform float uTime;
uniform int uRippleCount;
uniform vec4 uRipples[32]; // xy = world position, z = birth time, w = amplitude
uniform vec3 uColorBase;
uniform vec3 uColorRipple;
uniform vec3 uColorHighlight;
uniform float uReducedMotion;

varying vec2 vUv;
varying vec2 vWorldPos;

const float FREQUENCY = 3.0;
const float SPEED = 6.0;
const float DECAY_RATE = 1.8;
const float SPATIAL_DECAY = 0.15;

void main() {
	float height = 0.0;

	for (int i = 0; i < 32; i++) {
		if (i >= uRippleCount) break;

		vec2 origin = uRipples[i].xy;
		float birthTime = uRipples[i].z;
		float amp = uRipples[i].w;
		float age = uTime - birthTime;

		if (age < 0.0 || age > 5.0) continue;

		float dist = distance(vWorldPos, origin);

		// Wave propagation with interference
		float speed = SPEED * (1.0 - uReducedMotion);
		float wave = sin(dist * FREQUENCY - age * speed) * amp;

		// Temporal and spatial decay
		float decay = exp(-age * DECAY_RATE) * exp(-dist * SPATIAL_DECAY);

		height += wave * decay;
	}

	// Subtle organic motion from noise
	float noiseVal = snoise(vec3(vWorldPos * 0.3, uTime * 0.15)) * 0.03;
	height += noiseVal;

	// Map height to color
	float absHeight = abs(height);
	vec3 color = uColorBase;

	// Positive heights glow with ripple color, negative with subtle complement
	if (height > 0.0) {
		color = mix(uColorBase, uColorRipple, smoothstep(0.0, 0.3, height));
		color = mix(color, uColorHighlight, smoothstep(0.3, 0.8, height));
	} else {
		color = mix(uColorBase, uColorRipple * 0.5, smoothstep(0.0, 0.3, -height));
	}

	// Alpha based on height — base surface is mostly transparent
	float alpha = 0.02 + smoothstep(0.0, 0.05, absHeight) * 0.6;
	alpha = min(alpha, 0.85);

	gl_FragColor = vec4(color, alpha);
}
