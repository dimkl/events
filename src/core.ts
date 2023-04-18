import { debounce } from "./utils";
import { globalEventBus } from "./eventBus";
import { CustomEvent } from "./customEvent";

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

export const dispatch = ({
  eventName,
  eventBus = globalEventBus,
}: DispatchParams = {}) => {

  const dispatcher = (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const isInstanceMethod = !target.prototype;
    const namespace = (
      isInstanceMethod ? target.constructor : target
    ).name.toLowerCase();
    const generatedEventName = [namespace, propertyKey]
      .filter(Boolean)
      .join(":");
    const event = eventName || generatedEventName;

    const wrapperFn = (...args: any[]): typeof propertyDescriptor.value => {
      // When static method use null and when instance method use this
      const applyTarget = isInstanceMethod ? this : null;
      const result = propertyDescriptor.value.apply(applyTarget, args);
      Promise.resolve(result).then((data) => {
        eventBus.dispatchEvent(new CustomEvent(event, { data }));
      });
      return result;
    };

    // When static method use target and when instance method use this
    const propertyTarget = isInstanceMethod ? this : target;
    Object.defineProperty(propertyTarget, propertyKey, {
      value: wrapperFn,
      configurable: true,
      writable: true,
    });

    return wrapperFn;
  };

  const dispatchMethod = (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    return {
      get() {
        return dispatcher(target, propertyKey, propertyDescriptor);
      }
    }
  };

  const dispatchClass = (constructor: any) => {
    const staticMethodNames = Object.getOwnPropertyNames(constructor).filter(
      (m) => !["constructor", "length", "name", "prototype"].includes(m)
    );

    updateDescriptors(staticMethodNames, constructor, dispatcher);

    const instanceMethodNames = Object.getOwnPropertyNames(
      constructor.prototype
    ).filter((m) => !["constructor"].includes(m));
    updateDescriptors(
      instanceMethodNames,
      constructor.prototype,
      dispatcher
    );

    return constructor;
  };

  return (
    target: any,
    propertyKey?: string,
    propertyDescriptor?: PropertyDescriptor
  ) => {
    if (propertyKey && propertyDescriptor) {
      return dispatchMethod(target, propertyKey, propertyDescriptor);
    }

    return dispatchClass(target);
  };
};

export const on = ({
  eventName,
  eventBus = globalEventBus,
  errorHandler,
  once,
  debounceMs,
}: OnParams = {}) => {
  const onClass = (constructor: any) => {
    const staticMethodNames = Object.getOwnPropertyNames(constructor).filter(
      (m) => !["constructor", "length", "name", "prototype"].includes(m)
    );
    updateDescriptors(staticMethodNames, constructor, onMethod);

    const instanceMethodNames = Object.getOwnPropertyNames(
      constructor.prototype
    ).filter((m) => !["constructor"].includes(m));
    updateDescriptors(instanceMethodNames, constructor.prototype, onMethod);
  };

  const onMethod = (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const isInstanceMethod = !target.prototype;
    const namespace = (isInstanceMethod ? target.constructor : target).name
      .replace(/Handler/, "")
      .toLowerCase();
    const event = eventName || `${namespace}:${propertyKey}`;

    let eventHandler = (evt: unknown) => {
      try {
        // When static method use null and when instance method use this
        const applyTarget = isInstanceMethod ? this : null;
        propertyDescriptor.value.apply(applyTarget, [evt]);
      } catch (err) {
        if (errorHandler) {
          errorHandler(err as Error);
        } else {
          eventBus.dispatchEvent(new CustomEvent("error", { data: err }));
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

  return (
    target: any,
    propertyKey?: string,
    propertyDescriptor?: PropertyDescriptor
  ) => {
    if (propertyKey && propertyDescriptor) {
      return onMethod(target, propertyKey, propertyDescriptor);
    }

    return onClass(target);
  };
};

const updateDescriptors = (
  methodNames: string[],
  target: any,
  handler: (t: any, m: string, p: PropertyDescriptor) => unknown
) => {
  methodNames.forEach((methodName) => {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      target,
      methodName
    );
    /* istanbul ignore next */
    if (!propertyDescriptor) return;

    target[methodName] = handler(target, methodName, propertyDescriptor);
  });
};
