import { globalEventBus } from "./eventBus";

describe("eventBus", () => {
  test("globalEventBus", () => {
    expect(typeof globalEventBus.dispatchEvent).toBe("function");
    expect(typeof globalEventBus.removeEventListener).toBe("function");
    expect(typeof globalEventBus.addEventListener).toBe("function");
  });
});
