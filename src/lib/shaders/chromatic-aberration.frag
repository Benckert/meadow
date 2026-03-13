uniform sampler2D tDiffuse;
uniform float uOffset;

varying vec2 vUv;

void main() {
    vec2 dir = vUv - vec2(0.5);
    float dist = length(dir);
    vec2 offset = dir * dist * uOffset;

    float r = texture2D(tDiffuse, vUv + offset).r;
    float g = texture2D(tDiffuse, vUv).g;
    float b = texture2D(tDiffuse, vUv - offset).b;
    float a = texture2D(tDiffuse, vUv).a;

    gl_FragColor = vec4(r, g, b, a);
}
