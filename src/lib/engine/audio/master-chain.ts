import * as Tone from 'tone';

export class MasterChain {
	readonly compressor: Tone.Compressor;
	readonly reverb: Tone.Reverb;
	readonly delay: Tone.FeedbackDelay;
	readonly limiter: Tone.Limiter;
	readonly analyser: Tone.Analyser;
	readonly input: Tone.Gain;

	constructor() {
		this.input = new Tone.Gain(0.8);
		this.compressor = new Tone.Compressor({
			threshold: -20,
			ratio: 4,
			attack: 0.01,
			release: 0.1
		});
		this.reverb = new Tone.Reverb({
			decay: 4,
			wet: 0.3,
			preDelay: 0.05
		});
		this.delay = new Tone.FeedbackDelay({
			delayTime: '8n.',
			feedback: 0.25,
			wet: 0.15
		});
		this.limiter = new Tone.Limiter(-1);
		this.analyser = new Tone.Analyser('fft', 256);

		// Signal chain: input -> compressor -> reverb(send) -> delay(send) -> limiter -> analyser -> destination
		this.input.connect(this.compressor);
		this.compressor.connect(this.reverb);
		this.reverb.connect(this.delay);
		this.delay.connect(this.limiter);
		this.limiter.connect(this.analyser);
		this.analyser.toDestination();
	}

	dispose(): void {
		this.input.dispose();
		this.compressor.dispose();
		this.reverb.dispose();
		this.delay.dispose();
		this.limiter.dispose();
		this.analyser.dispose();
	}
}
