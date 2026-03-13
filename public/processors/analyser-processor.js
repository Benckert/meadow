/**
 * AudioWorklet processor for real-time audio analysis.
 * Computes RMS amplitude from audio input.
 */
class AnalyserProcessor extends AudioWorkletProcessor {
	process(inputs) {
		const input = inputs[0];
		if (input.length === 0) return true;

		const channel = input[0];
		let sum = 0;
		for (let i = 0; i < channel.length; i++) {
			sum += channel[i] * channel[i];
		}
		const rms = Math.sqrt(sum / channel.length);

		this.port.postMessage({ type: 'amplitude', value: rms });

		return true;
	}
}

registerProcessor('analyser-processor', AnalyserProcessor);
