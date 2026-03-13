import type { EventMap } from './types';

type EventCallback<K extends keyof EventMap> = (data: EventMap[K]) => void;

class EventBus {
	private listeners = new Map<string, Set<EventCallback<never>>>();

	on<K extends keyof EventMap>(event: K, callback: EventCallback<K>): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(callback as EventCallback<never>);
	}

	off<K extends keyof EventMap>(event: K, callback: EventCallback<K>): void {
		this.listeners.get(event)?.delete(callback as EventCallback<never>);
	}

	emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			for (const cb of callbacks) {
				(cb as EventCallback<K>)(data);
			}
		}
	}
}

export const eventBus = new EventBus();
