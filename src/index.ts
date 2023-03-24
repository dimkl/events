import { CustomEvent as _CustomEvent } from "./customEvent";
export { on, dispatch } from "./core";
export { globalEventBus as eventBus } from "./eventBus";

export type CustomEvent = typeof _CustomEvent;
