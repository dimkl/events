import { debounce } from "./utils";

const globalEventBus = new EventTarget();

type BaseParams = {
  eventName?: string;
  eventBus?: EventTarget;
};

type OnOptions = {
  once?: boolean;
  debounceMs?: number;
  errorHandler?: (err: Error) => void;
};

type OnParams = BaseParams & OnOptions;
type DispatchParams = BaseParams;

export class CustomEvent<TData = any> extends Event {
  data: TData;

  constructor(type: string, options?: any) {
    const { data, ...opts } = options || {};
    super(type, opts);
    this.data = data;
  }
}

export const dispatch = ({
  eventName,
  eventBus = globalEventBus,
}: DispatchParams = {}) => {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const namespace = target.constructor.name.toLowerCase();
    const event = eventName || `${namespace}:${propertyKey}`;

    return {
      get() {
        const wrapperFn = (...args: any[]): typeof propertyDescriptor.value => {
          const result = propertyDescriptor.value.apply(this, args);
          Promise.resolve(result).then((data) => {
            eventBus.dispatchEvent(new CustomEvent(event, { data }));
          });
          return result;
        };

        Object.defineProperty(this, propertyKey, {
          value: wrapperFn,
          configurable: true,
          writable: true,
        });

        return wrapperFn;
      },
    };
  };
};

export const on = ({
  eventName,
  eventBus = globalEventBus,
  errorHandler,
  once,
  debounceMs,
}: OnParams = {}) => {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const namespace = target.name.replace(/Handler/, "").toLowerCase();
    const event = eventName || `${namespace}:${propertyKey}`;

    let eventHandler = (evt: unknown) => {
      try {
        propertyDescriptor.value.apply(target, [evt]);
      } catch (err) {
        if (errorHandler) {
          errorHandler(err as Error);
        } else {
          throw err;
        }
      }
    };

    if (debounceMs) {
      eventHandler = debounce(eventHandler, debounceMs);
    }
    eventBus.addEventListener(event, eventHandler);

    if (once) {
      eventBus.addEventListener(event, () => {
        eventBus.removeEventListener(event, eventHandler);
      });
    }
  };
};

export const eventBus = globalEventBus;
