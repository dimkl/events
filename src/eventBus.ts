import type { IEvent } from './customEvent';

interface EventHandler {
    (event: unknown): void
}

export interface IEventBus {
    addEventListener(event: string, handler: EventHandler): void
    removeEventListener(event: string, handler: EventHandler): void
    dispatchEvent(event: IEvent): void
}

export class EventBus implements IEventBus {
    #listeners: Record<string, Map<EventHandler, any>> = {};

    addEventListener(event: string, handler: EventHandler) {
        this.#listeners[event] ||= new Map();
        this.#listeners[event].set(handler, null);
    }

    removeEventListener(event: string, handler: EventHandler) {
        this.#listeners[event].delete(handler);
    }

    dispatchEvent(event: IEvent) {
        this.#listeners[event.type]?.forEach((_, handler) => handler(event));
    }
}

export const globalEventBus = new EventBus();
