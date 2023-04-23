import { debounce } from "./utils";
import { globalEventBus } from "./eventBus";
import { CustomEvent } from "./customEvent";

type DecoratorType = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => any;

type DecoratorReturnFnType = (
  target: any,
  propertyKey?: string,
  descriptor?: PropertyDescriptor
) => any;

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

  const dispatcher: DecoratorType = (target, propertyKey, descriptor) => {
    const event = eventName || generateEventName(target, propertyKey, "");

    function wrapperFn(...args: any[]): typeof descriptor.value {
      // When static method use null and when instance method use this
      // @ts-ignore
      const applyTarget = isInstanceMethod(target) ? this : null;
      const result = descriptor.value.apply(applyTarget, args);
      Promise.resolve(result).then((data) => {
        eventBus.dispatchEvent(new CustomEvent(event, { data }));
      });
      return result;
    };

    Object.defineProperty(target, propertyKey, {
      value: wrapperFn,
      configurable: true,
      writable: true,
    });

    return wrapperFn;
  };

  const dispatchMethod: DecoratorType = (...args) => {
    return {
      get() {
        return dispatcher(...args);
      }
    }
  };

  const dispatchClass = (constructor: any) => {
    decorateFnToAllMethods(constructor, dispatcher);
    return constructor;
  };

  const returnFn: DecoratorReturnFnType = (target, propertyKey, descriptor) => {
    return propertyKey && descriptor
      ? dispatchMethod(target, propertyKey, descriptor)
      : dispatchClass(target);
  };

  return returnFn;
};

export const on = ({
  eventName,
  eventBus = globalEventBus,
  errorHandler,
  once,
  debounceMs,
}: OnParams = {}) => {
  const onClass = (constructor: any) => {
    decorateFnToAllMethods(constructor, onMethod);
    return constructor;
  };

  const onMethod: DecoratorType = (target, propertyKey, descriptor) => {
    const event = eventName || generateEventName(target, propertyKey, "Handler");

    let eventHandler = (evt: unknown) => {
      try {
        // When static method use null and when instance method use this
        const applyTarget = isInstanceMethod(target) ? this : null;
        descriptor.value.apply(applyTarget, [evt]);
      } catch (err) {
        if (errorHandler) {
          errorHandler(err as Error);
        } else {
          eventBus.dispatchEvent(new CustomEvent("error", { data: err }));
        }
      }

      if (once) {
        eventBus.removeEventListener(event, eventHandler);
      }
    };

    if (debounceMs) {
      eventHandler = debounce(eventHandler, debounceMs);
    }
    eventBus.addEventListener(event, eventHandler);
  };

  const returnFn: DecoratorReturnFnType = (target, propertyKey, descriptor) => {
    return propertyKey && descriptor
      ? onMethod(target, propertyKey, descriptor)
      : onClass(target);
  };

  return returnFn;
};

type DecorateHandlerType = (t: any, m: string, p: PropertyDescriptor) => unknown;

const decorateMethod = (target: any, methodName: string, handler: DecorateHandlerType) => {
  const propertyDescriptor = Object.getOwnPropertyDescriptor(target, methodName);
  /* istanbul ignore next */
  if (!propertyDescriptor) return;

  target[methodName] = handler(target, methodName, propertyDescriptor);
}

const decorateFnToAllMethods = (constructor: any, handler: DecorateHandlerType) => {
  getStaticMethods(constructor).forEach(methodName => decorateMethod(constructor, methodName, handler));
  getInstanceMethods(constructor).forEach(methodName => decorateMethod(constructor.prototype, methodName, handler));
};

const isInstanceMethod = (target: any): boolean => {
  return !target.prototype;
}

const getNamespace = (target: any, suffix: string): string => {
  const Fn = isInstanceMethod(target) ? target.constructor : target;
  return Fn.name.replace(suffix, "").toLowerCase();
}

const generateEventName = (target: any, propertyKey: string, suffix: string): string => {
  return [getNamespace(target, suffix), propertyKey].filter(Boolean).join(":");
}

const getStaticMethods = (constructor: Function): string[] => {
  return Object.getOwnPropertyNames(constructor).filter(
    (m) => !["constructor", "length", "name", "prototype"].includes(m)
  );
}

const getInstanceMethods = (constructor: Function): string[] => {
  return Object.getOwnPropertyNames(constructor.prototype).filter((m) => !["constructor"].includes(m));
}