export class CustomEvent extends Event {
    data: any;

    constructor(type: string, options?: any) {
        const { data, ...opts } = options || {};
        super(type, opts);
        this.data = data;
    }
}
//
// Implementation v1 (without result of method)
//
// function dispatchEventOn(eventBus: EventTarget, eventName?: string) {
//     return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
//         eventName ||= target.constructor.name.toLowerCase();
//         eventBus.dispatchEvent(new ClerkEvent(`${eventName}:${propertyKey}`))
//     };
// }

//
// Implementation v2 (with method result)
//
export const dispatchEventOn = (eventBus: EventTarget, eventName?: string) => {
    return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) => {
        eventName ||= target.constructor.name.toLowerCase();

        return {
            get() {
                const wrapperFn = (...args: any[]): any => {
                    const result = propertyDescriptor.value.apply(this, args)
                    eventBus.dispatchEvent(new CustomEvent(`${eventName}:${propertyKey}`, { data: result }))
                    return result;
                }

                Object.defineProperty(this, propertyKey, {
                    value: wrapperFn,
                    configurable: true,
                    writable: true
                });

                return wrapperFn;
            }
        }
    }
}

export const dispatchEventOnAsync = (eventBus: EventTarget, eventName?: string) => {
    return (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) => {
        eventName ||= target.constructor.name.toLowerCase();

        return {
            get() {
                const wrapperFn = async (...args: any[]): Promise<any> => {
                    const result = await propertyDescriptor.value.apply(this, args)
                    eventBus.dispatchEvent(new CustomEvent(`${eventName}:${propertyKey}`, { data: result }));
                    return result;
                }

                Object.defineProperty(this, propertyKey, {
                    value: wrapperFn,
                    configurable: true,
                    writable: true
                });

                return wrapperFn;
            }
        }
    }
}

export const attachEventOn = (eventBus: EventTarget, eventName: string) => {
    return (target: any, _propertyKey: string, propertyDescriptor: PropertyDescriptor) => {
        eventName ||= target.constructor.name.toLowerCase();
        eventBus.addEventListener(eventName, propertyDescriptor.value);
    }
}
