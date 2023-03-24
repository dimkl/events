import { CustomEvent } from "./customEvent";

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
