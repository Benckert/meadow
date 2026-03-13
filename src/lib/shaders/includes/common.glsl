float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * clamp((value - inMin) / (inMax - inMin), 0.0, 1.0);
}

float saturate(float x) {
    return clamp(x, 0.0, 1.0);
}

float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float hash(float p) {
    return fract(sin(p) * 43758.5453123);
}
