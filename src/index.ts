const gloablEventBus = new EventTarget();

export class CustomEvent<TData = any> extends Event {
  data: TData;

  constructor(type: string, options?: any) {
    const { data, ...opts } = options || {};
    super(type, opts);
    this.data = data;
  }
}

export const dispatchEventOn = (
  eventName?: string,
  eventBus: EventTarget = gloablEventBus
) => {
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

export const dispatchEventOnAsync = (
  eventName?: string,
  eventBus: EventTarget = gloablEventBus
) => {
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

export const attachEventOn = (
  eventName?: string,
  eventBus: EventTarget = gloablEventBus
) => {
  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor
  ) => {
    const namespace = target.name.replace(/Handler/, "").toLowerCase();
    const event = eventName || `${namespace}:${propertyKey}`;

    eventBus.addEventListener(event, propertyDescriptor.value);
  };
};

export const eventBus = gloablEventBus;
