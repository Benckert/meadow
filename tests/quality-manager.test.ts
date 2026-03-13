import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock browser APIs before importing
vi.stubGlobal('navigator', {
	userAgent: 'test',
	hardwareConcurrency: 8,
	deviceMemory: 8
});
vi.stubGlobal('document', {
	createElement: () => ({
		getContext: () => null
	})
});

import { QualityManager } from '../src/lib/engine/visual/quality-manager';
import { eventBus } from '../src/lib/stores/event-bus';

describe('QualityManager', () => {
	let qm: QualityManager;

	beforeEach(() => {
		qm = new QualityManager();
		qm.setLevel('high');
	});

	it('should start at high quality for powerful devices', () => {
		expect(qm.currentLevel).toBe('high');
	});

	it('should downgrade after sustained slow frames', () => {
		const callback = vi.fn();
		eventBus.on('quality:change', callback);

		// Fill the window first (60 frames)
		for (let i = 0; i < 60; i++) {
			qm.recordFrame(10); // fast frames to fill window
		}

		// Now send slow frames
		for (let i = 0; i < 200; i++) {
			qm.recordFrame(25); // over budget
		}

		expect(callback).toHaveBeenCalled();
		expect(qm.currentLevel).not.toBe('high');

		eventBus.off('quality:change', callback);
	});

	it('should allow manual level setting', () => {
		qm.setLevel('low');
		expect(qm.currentLevel).toBe('low');

		qm.setLevel('medium');
		expect(qm.currentLevel).toBe('medium');
	});
});
