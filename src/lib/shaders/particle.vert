uniform float uTime;
uniform float uAmplitude;
uniform float uPixelRatio;

attribute float aSize;
attribute float aLife;
attribute vec3 aColor;

varying vec3 vColor;
varying float vLife;

void main() {
    vColor = aColor;
    vLife = aLife;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Audio-reactive size: base size + amplitude boost
    float audioSize = 1.0 + uAmplitude * 3.0;
    float size = aSize * audioSize * uPixelRatio;

    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
