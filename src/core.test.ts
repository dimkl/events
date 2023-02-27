import { on, dispatch, CustomEvent } from "./core";
import { globalEventBus } from "./eventBus";

describe("core", () => {
  describe("CustomEvent", () => {
    test("extends Event", () => {
      expect(new CustomEvent("eventName")).toBeInstanceOf(Event);
    });

    test("holds data", () => {
      const c = new CustomEvent("eventName");
      expect(c.data).toBeUndefined();

      const data = { aloha: 1 };
      const c2 = new CustomEvent("eventName", { data });
      expect(c2.data).toMatchObject(data);
    });
  });

  describe("@on()", () => {
    test("listen events (implicitly)", () => {
      const listenerSpy = jest.fn((_evt: string) => {});
      class Example {
        @on()
        static eventA() {
          listenerSpy("res example:eventA");
        }

        @on()
        static eventB() {
          listenerSpy("res example:eventB");
        }
      }

      class ExampleB {
        @on()
        static eventA() {
          listenerSpy("res exampleb:eventA");
        }

        @on()
        static eventB() {
          listenerSpy("res exampleb:eventB");
        }
      }

      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventB"));

      expect(listenerSpy.mock.calls).toMatchSnapshot();
    });

    test("listen events (explicitly)", () => {
      const listenerSpy = jest.fn((_evt: string) => {});
      class Example {
        @on({ eventName: "eventA" })
        static eventA() {
          listenerSpy("res eventA");
        }

        @on({ eventName: "eventB" })
        static eventB() {
          listenerSpy("res eventB");
        }
      }

      class ExampleB {
        @on({ eventName: "eventC" })
        static eventA() {
          listenerSpy("res eventC");
        }

        @on({ eventName: "eventD" })
        static eventB() {
          listenerSpy("res eventD");
        }
      }

      globalEventBus.dispatchEvent(new CustomEvent("eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      globalEventBus.dispatchEvent(new CustomEvent("eventD"));

      expect(listenerSpy.mock.calls).toMatchSnapshot();
    });

    test("listen event once", () => {
      const listenerSpy = jest.fn((_evt: string) => {});
      class Example {
        @on({ once: true })
        static eventA() {
          listenerSpy("res example:eventA");
        }

        @on()
        static eventB() {
          listenerSpy("res example:eventB");
        }
      }

      class ExampleB {
        @on({ eventName: "eventC", once: true })
        static eventA() {
          listenerSpy("res eventC");
        }

        @on()
        static eventB() {
          listenerSpy("res exampleb:eventB");
        }
      }

      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventB"));

      expect(listenerSpy.mock.calls).toMatchSnapshot();
    });

    test("listen event debounced", async () => {
      const listenerSpy = jest.fn((_evt: string) => {});
      class Example {
        @on({ debounceMs: 1 })
        static eventA() {
          listenerSpy("res example:eventA");
        }

        @on()
        static eventB() {
          listenerSpy("res example:eventB");
        }
      }

      class ExampleB {
        @on({ eventName: "eventC", debounceMs: 1 })
        static eventA() {
          listenerSpy("res eventC");
        }

        @on()
        static eventB() {
          listenerSpy("res exampleb:eventB");
        }
      }

      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventB"));

      await new Promise((res) => setTimeout(res, 1));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      await new Promise((res) => setTimeout(res, 1));

      expect(listenerSpy.mock.calls).toMatchSnapshot();
    });

    test.skip("listen event errorHandler", async () => {
      const listenerSpy = jest.fn((_evt: string) => {});
      const errorHandlerSpy = jest.fn(() => {});

      class Example {
        @on({ errorHandler: errorHandlerSpy })
        static eventA() {
          listenerSpy("res example:eventA");
        }

        @on({ errorHandler: errorHandlerSpy })
        static eventB() {
          throw new Error("err example:eventB");
          listenerSpy("res example:eventB");
        }
      }

      class ExampleError {
        @on({ eventName: "eventC", errorHandler: errorHandlerSpy })
        static eventA() {
          throw new Error("err eventC");
          listenerSpy("res eventC");
        }

        @on()
        static eventB() {
          throw new Error("err exampleerror:eventB");
        }
      }

      globalEventBus.dispatchEvent(new CustomEvent("example:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("eventC"));
      await expect(() =>
        globalEventBus.dispatchEvent(new CustomEvent("exampleerror:eventB"))
      ).toThrow("err exampleerror:eventB");

      expect(listenerSpy.mock.calls).toMatchSnapshot();
      expect(errorHandlerSpy.mock.calls).toMatchSnapshot();
    });

    test("listen event on different eventBus", () => {
      const eventBus = new EventTarget();

      const listenerSpy = jest.fn((_evt: string) => {});
      class Example {
        @on({ eventName: "eventA", eventBus })
        static eventA() {
          listenerSpy("res eventA");
        }

        @on()
        static eventB() {
          listenerSpy("res example:eventB");
        }
      }

      class ExampleB {
        @on({ eventBus })
        static eventA() {
          listenerSpy("res exampleb:eventA");
        }

        @on()
        static eventB() {
          listenerSpy("res exampleb:eventB");
        }
      }

      globalEventBus.dispatchEvent(new CustomEvent("eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("example:eventB"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventA"));
      globalEventBus.dispatchEvent(new CustomEvent("exampleb:eventB"));
      expect(listenerSpy.mock.calls).toMatchSnapshot();
      listenerSpy.mockClear();

      eventBus.dispatchEvent(new CustomEvent("eventA"));
      eventBus.dispatchEvent(new CustomEvent("example:eventB"));
      eventBus.dispatchEvent(new CustomEvent("exampleb:eventA"));
      eventBus.dispatchEvent(new CustomEvent("exampleb:eventB"));

      expect(listenerSpy.mock.calls).toMatchSnapshot();
    });

    test.todo("listen event on debounced once with different eventBus");
  });

  describe("@dispatch()", () => {
    test("dispatch events (implicitly)", async () => {
      class Example {
        @dispatch()
        eventA() {
          return "res example:eventA";
        }

        @dispatch()
        eventB() {
          return "res example:eventB";
        }
      }

      class ExampleB {
        @dispatch()
        eventA() {
          return "res exampleb:eventA";
        }

        @dispatch()
        eventB() {
          return "res exampleb:eventB";
        }
      }

      const dispatcherSpy = jest.fn();
      globalEventBus.addEventListener("example:eventA", dispatcherSpy);
      globalEventBus.addEventListener("example:eventB", dispatcherSpy);
      globalEventBus.addEventListener("exampleb:eventA", dispatcherSpy);
      globalEventBus.addEventListener("exampleb:eventB", dispatcherSpy);

      expect(dispatcherSpy).not.toBeCalled();

      const e = new Example();
      e.eventA();
      e.eventB();
      const eB = new ExampleB();
      eB.eventA();
      eB.eventB();

      // wait for the Promise used in dispatching events
      await new Promise((res) => setTimeout(res, 1));

      expect(dispatcherSpy).toBeCalledTimes(4);
      expect(dispatcherSpy.mock.calls).toMatchObject([
        [expect.objectContaining({ data: "res example:eventA" })],
        [expect.objectContaining({ data: "res example:eventB" })],
        [expect.objectContaining({ data: "res exampleb:eventA" })],
        [expect.objectContaining({ data: "res exampleb:eventB" })],
      ]);
    });

    test("dispatch events (explicitly)", async () => {
      class Example {
        @dispatch({ eventName: "eventA" })
        eventA() {
          return "res eventA";
        }

        @dispatch({ eventName: "eventB" })
        eventB() {
          return "res eventB";
        }
      }

      class ExampleB {
        @dispatch({ eventName: "eventC" })
        eventA() {
          return "res eventC";
        }

        @dispatch({ eventName: "eventD" })
        eventB() {
          return "res eventD";
        }
      }

      const dispatcherSpy = jest.fn();
      globalEventBus.addEventListener("eventA", dispatcherSpy);
      globalEventBus.addEventListener("eventB", dispatcherSpy);
      globalEventBus.addEventListener("eventC", dispatcherSpy);
      globalEventBus.addEventListener("eventD", dispatcherSpy);

      expect(dispatcherSpy).not.toBeCalled();

      const e = new Example();
      e.eventA();
      e.eventB();
      const eB = new ExampleB();
      eB.eventA();
      eB.eventB();

      // wait for the Promise used in dispatching events
      await new Promise((res) => setTimeout(res, 1));

      expect(dispatcherSpy).toBeCalledTimes(4);
      expect(dispatcherSpy.mock.calls).toMatchObject([
        [expect.objectContaining({ data: "res eventA" })],
        [expect.objectContaining({ data: "res eventB" })],
        [expect.objectContaining({ data: "res eventC" })],
        [expect.objectContaining({ data: "res eventD" })],
      ]);
    });

    test("dispatch event on different eventBus", async () => {
      const eventBus = new EventTarget();
      class Example {
        @dispatch({ eventName: "eventA", eventBus })
        eventA() {
          return "res eventA";
        }

        @dispatch({ eventName: "eventB" })
        eventB() {
          return "res eventB";
        }
      }

      class ExampleB {
        @dispatch({ eventBus })
        eventA() {
          return "res exampleb:eventA";
        }

        @dispatch()
        eventB() {
          return "res exampleb:eventB";
        }
      }

      const globalDispatcherSpy = jest.fn();
      globalEventBus.addEventListener("eventA", globalDispatcherSpy);
      globalEventBus.addEventListener("eventB", globalDispatcherSpy);
      globalEventBus.addEventListener("exampleb:eventA", globalDispatcherSpy);
      globalEventBus.addEventListener("exampleb:eventB", globalDispatcherSpy);

      const dispatcherSpy = jest.fn();
      eventBus.addEventListener("eventA", dispatcherSpy);
      eventBus.addEventListener("eventB", dispatcherSpy);
      eventBus.addEventListener("exampleb:eventA", dispatcherSpy);
      eventBus.addEventListener("exampleb:eventB", dispatcherSpy);

      expect(globalDispatcherSpy).not.toBeCalled();
      expect(dispatcherSpy).not.toBeCalled();

      const e = new Example();
      e.eventA();
      e.eventB();
      const eB = new ExampleB();
      eB.eventA();
      eB.eventB();

      // wait for the Promise used in dispatching events
      await new Promise((res) => setTimeout(res, 1));

      expect(globalDispatcherSpy).toBeCalledTimes(2);
      expect(globalDispatcherSpy.mock.calls).toMatchObject([
        [expect.objectContaining({ data: "res eventB" })],
        [expect.objectContaining({ data: "res exampleb:eventB" })],
      ]);

      expect(dispatcherSpy).toBeCalledTimes(2);
      expect(dispatcherSpy.mock.calls).toMatchObject([
        [expect.objectContaining({ data: "res eventA" })],
        [expect.objectContaining({ data: "res exampleb:eventA" })],
      ]);
    });
  });
});
