varying vec2 vUv;
varying vec2 vWorldPos;

void main() {
	vUv = uv;
	vec4 worldPosition = modelMatrix * vec4(position, 1.0);
	vWorldPos = worldPosition.xy;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
