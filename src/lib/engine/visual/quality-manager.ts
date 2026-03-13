import type { QualityLevel } from '$lib/stores/types';
import { eventBus } from '$lib/stores/event-bus';
import { detectInitialQuality } from './device-detect';

/**
 * Monitors frame times and automatically adjusts quality tier.
 * Uses hysteresis to prevent rapid oscillation between tiers.
 */
export class QualityManager {
	private frameTimes: number[] = [];
	private readonly WINDOW_SIZE = 60;
	private readonly FRAME_BUDGET = 16.67; // 60fps target
	private readonly DOWNGRADE_THRESHOLD = 120; // consecutive slow frames to trigger downgrade
	private readonly UPGRADE_THRESHOLD = 300; // consecutive fast frames to trigger upgrade
	private slowFrameCount = 0;
	private fastFrameCount = 0;

	currentLevel: QualityLevel;

	private static readonly LEVELS: QualityLevel[] = ['high', 'medium', 'low'];

	constructor() {
		this.currentLevel = detectInitialQuality();
	}

	/** Call once per frame with the frame's delta time in ms */
	recordFrame(deltaTimeMs: number): void {
		this.frameTimes.push(deltaTimeMs);
		if (this.frameTimes.length > this.WINDOW_SIZE) {
			this.frameTimes.shift();
		}

		if (this.frameTimes.length < this.WINDOW_SIZE) return;

		const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

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
			this.frameTimes = [];
			eventBus.emit('quality:change', this.currentLevel);
		}
	}

	private upgrade(): void {
		const idx = QualityManager.LEVELS.indexOf(this.currentLevel);
		if (idx > 0) {
			this.currentLevel = QualityManager.LEVELS[idx - 1];
			this.frameTimes = [];
			eventBus.emit('quality:change', this.currentLevel);
		}
	}

	setLevel(level: QualityLevel): void {
		if (level !== this.currentLevel) {
			this.currentLevel = level;
			this.frameTimes = [];
			this.slowFrameCount = 0;
			this.fastFrameCount = 0;
			eventBus.emit('quality:change', this.currentLevel);
		}
	}
}
