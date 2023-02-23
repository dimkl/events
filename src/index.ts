import { debounce } from "./utils";

const globalEventBus = new EventTarget();

type AttachEventOptions = {
  once?: boolean;
  debounceMs?: number;
  errorHandler?: (err: Error) => void;
};

type AttachEventParams = {
  eventName?: string;
  eventBus?: EventTarget;
} & AttachEventOptions;

type DispatchEventParams = {
  eventName?: string;
  eventBus?: EventTarget;
};

export class CustomEvent<TData = any> extends Event {
  data: TData;

  constructor(type: string, options?: any) {
    const { data, ...opts } = options || {};
    super(type, opts);
    this.data = data;
  }
}

export const dispatchEventOn = ({
  eventName,
  eventBus = globalEventBus,
}: DispatchEventParams = {}) => {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const namespace = target.constructor.name.toLowerCase();
    const event = eventName || `${namespace}:${propertyKey}`;

    return {
      get() {
        const wrapperFn = (...args: any[]): any => {
          const result = propertyDescriptor.value.apply(this, args);
          Promise.resolve().then(() => {
            eventBus.dispatchEvent(new CustomEvent(event, { data: result }));
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

export const dispatchEventOnAsync = ({
  eventName,
  eventBus = globalEventBus,
}: DispatchEventParams = {}) => {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const namespace = target.constructor.name.toLowerCase();
    const event = eventName || `${namespace}:${propertyKey}`;

    return {
      get() {
        const wrapperFn = async (...args: any[]): Promise<any> => {
          const result = await propertyDescriptor.value.apply(this, args);
          Promise.resolve().then(() => {
            eventBus.dispatchEvent(new CustomEvent(event, { data: result }));
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

export const attachEventOn = ({
  eventName,
  eventBus = globalEventBus,
  errorHandler,
  once,
  debounceMs,
}: AttachEventParams = {}) => {
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
