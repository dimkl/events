jest.mock("./eventBus", () => {
  const globalEventBus = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  return { globalEventBus };
});

import { on, dispatch, CustomEvent } from "./core";
import { globalEventBus } from "./eventBus";

describe("core", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

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
      class Example {
        @on()
        static eventA() {
          return "example:eventA";
        }

        @on()
        static eventB() {
          return "example:eventB";
        }
      }

      class ExampleB {
        @on()
        static eventA() {
          return "exampleb:eventA";
        }

        @on()
        static eventB() {
          return "exampleb:eventB";
        }
      }
      // @ts-ignore
      expect(globalEventBus.addEventListener.mock.calls).toMatchSnapshot();
    });

    test.todo("listen events (explicitly)");

    test.todo("listen event once");

    test.todo("listen event debounced");

    test.todo("listen event errorHandler");

    test.todo("listen event on different eventBus");
  });

  describe("@dispatch()", () => {
    test("dispatch events (implicitly)", async () => {
      class Example {
        @dispatch()
        eventA() {
          return "example:eventA";
        }

        @dispatch()
        eventB() {
          return "example:eventB";
        }
      }

      class ExampleB {
        @dispatch()
        eventA() {
          return "exampleb:eventA";
        }

        @dispatch()
        eventB() {
          return "exampleb:eventB";
        }
      }

      expect(globalEventBus.dispatchEvent).not.toBeCalled();

      const e = new Example();
      e.eventA();
      e.eventB();
      const eB = new ExampleB();
      eB.eventA();
      eB.eventB();

      // wait for the Promise used in dispatching events
      await new Promise((res) => setTimeout(res, 1));

      expect(globalEventBus.dispatchEvent).toBeCalledTimes(4);
      // @ts-ignore
      expect(globalEventBus.dispatchEvent.mock.calls).toMatchObject([
        [expect.objectContaining({ data: "example:eventA" })],
        [expect.objectContaining({ data: "example:eventB" })],
        [expect.objectContaining({ data: "exampleb:eventA" })],
        [expect.objectContaining({ data: "exampleb:eventB" })],
      ]);
    });

    test.todo("dispatch events (explicitly)");

    test.todo("dispatch event on different eventBus");
  });
});
