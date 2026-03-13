import type { QualityLevel } from '$lib/stores/types';
import { eventBus } from '$lib/stores/event-bus';
import { detectInitialQuality } from './device-detect';

/**
 * Monitors frame times and automatically adjusts quality tier.
 * Uses hysteresis to prevent rapid oscillation between tiers.
 */
export class QualityManager {
	private frameTimes: Float32Array;
	private writeIndex = 0;
	private frameCount = 0;
	private readonly WINDOW_SIZE = 60;
	private readonly FRAME_BUDGET = 16.67; // 60fps target
	private readonly DOWNGRADE_THRESHOLD = 120;
	private readonly UPGRADE_THRESHOLD = 300;
	private slowFrameCount = 0;
	private fastFrameCount = 0;

	currentLevel: QualityLevel;

	private static readonly LEVELS: QualityLevel[] = ['high', 'medium', 'low'];

	constructor() {
		this.frameTimes = new Float32Array(this.WINDOW_SIZE);
		this.currentLevel = detectInitialQuality();
	}

	/** Call once per frame with the frame's delta time in ms */
	recordFrame(deltaTimeMs: number): void {
		this.frameTimes[this.writeIndex] = deltaTimeMs;
		this.writeIndex = (this.writeIndex + 1) % this.WINDOW_SIZE;
		this.frameCount++;

		if (this.frameCount < this.WINDOW_SIZE) return;

		let sum = 0;
		for (let i = 0; i < this.WINDOW_SIZE; i++) {
			sum += this.frameTimes[i];
		}
		const avg = sum / this.WINDOW_SIZE;

		if (avg > this.FRAME_BUDGET * 1.2) {
			this.slowFrameCount++;
			this.fastFrameCount = 0;

			if (this.slowFrameCount >= this.DOWNGRADE_THRESHOLD) {
				this.downgrade();
				this.slowFrameCount = 0;
			}
		} else if (avg < this.FRAME_BUDGET * 0.8) {
			this.fastFrameCount++;
			this.slowFrameCount = 0;

			if (this.fastFrameCount >= this.UPGRADE_THRESHOLD) {
				this.upgrade();
				this.fastFrameCount = 0;
			}
		} else {
			this.slowFrameCount = 0;
			this.fastFrameCount = 0;
		}
	}

	private downgrade(): void {
		const idx = QualityManager.LEVELS.indexOf(this.currentLevel);
		if (idx < QualityManager.LEVELS.length - 1) {
			this.currentLevel = QualityManager.LEVELS[idx + 1];
			this.resetFrameData();
			eventBus.emit('quality:change', this.currentLevel);
		}
	}

	private upgrade(): void {
		const idx = QualityManager.LEVELS.indexOf(this.currentLevel);
		if (idx > 0) {
			this.currentLevel = QualityManager.LEVELS[idx - 1];
			this.resetFrameData();
			eventBus.emit('quality:change', this.currentLevel);
		}
	}

	private resetFrameData(): void {
		this.frameTimes.fill(0);
		this.writeIndex = 0;
		this.frameCount = 0;
	}

	setLevel(level: QualityLevel): void {
		if (level !== this.currentLevel) {
			this.currentLevel = level;
			this.resetFrameData();
			this.slowFrameCount = 0;
			this.fastFrameCount = 0;
			eventBus.emit('quality:change', this.currentLevel);
		}
	}
}
