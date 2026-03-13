import { describe, it, expect, vi } from 'vitest';
import { eventBus } from '../src/lib/stores/event-bus';

describe('EventBus', () => {
	it('should deliver events to subscribers', () => {
		const callback = vi.fn();
		eventBus.on('audio:amplitude', callback);

		eventBus.emit('audio:amplitude', 0.5);

		expect(callback).toHaveBeenCalledWith(0.5);
		eventBus.off('audio:amplitude', callback);
	});

	it('should not deliver events after unsubscribe', () => {
		const callback = vi.fn();
		eventBus.on('audio:amplitude', callback);
		eventBus.off('audio:amplitude', callback);

		eventBus.emit('audio:amplitude', 0.5);

		expect(callback).not.toHaveBeenCalled();
	});

	it('should support multiple subscribers', () => {
		const cb1 = vi.fn();
		const cb2 = vi.fn();
		eventBus.on('audio:amplitude', cb1);
		eventBus.on('audio:amplitude', cb2);

		eventBus.emit('audio:amplitude', 0.7);

		expect(cb1).toHaveBeenCalledWith(0.7);
		expect(cb2).toHaveBeenCalledWith(0.7);

		eventBus.off('audio:amplitude', cb1);
		eventBus.off('audio:amplitude', cb2);
	});

	it('should deliver typed note:trigger payloads', () => {
		const callback = vi.fn();
		eventBus.on('note:trigger', callback);

		const event = {
			note: 'C4',
			velocity: 0.8,
			duration: '8n',
			row: 2,
			col: 5
		};
		eventBus.emit('note:trigger', event);

		expect(callback).toHaveBeenCalledWith(event);
		expect(callback.mock.calls[0][0].note).toBe('C4');

		eventBus.off('note:trigger', callback);
	});

	it('should handle emitting events with no subscribers', () => {
		// Should not throw
		expect(() => {
			eventBus.emit('beat:tick', { beat: 1, time: 0 });
		}).not.toThrow();
	});
});
