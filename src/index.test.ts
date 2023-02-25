import * as modules from "./index";

describe("index", () => {
  test("verified exports of module", () => {
    expect(Object.keys(modules)).toMatchSnapshot();
  });
});
