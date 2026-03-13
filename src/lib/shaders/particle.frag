varying vec3 vColor;
varying float vLife;

void main() {
    // Soft circle with glow falloff
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Smooth circle edge
    float circle = 1.0 - smoothstep(0.3, 0.5, dist);

    // Glow effect: brighter at center
    float glow = exp(-dist * 4.0) * 0.5;

    float alpha = (circle + glow) * vLife;

    gl_FragColor = vec4(vColor, alpha);
}
