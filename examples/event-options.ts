import { CustomEvent, dispatch, on } from "../src";

//
// Definition example
//

class Person {
  public firstName: string;
  public lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  @dispatch()
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @dispatch()
  sayAloha() {
    console.log("said: ", this.aloha());
  }

  @dispatch()
  sayAloha2() {
    console.log("said2: ", this.aloha());
  }

  @dispatch()
  async asyncGetFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  aloha() {
    return "Aloha to all";
  }
}

class PersonHandler {
  @on({ debounceMs: 200 })
  static getFullName(event: CustomEvent) {
    console.log("event listener for getFullName: ", event.data);
  }

  @on({ once: true, debounceMs: 100 })
  static sayAloha(event: CustomEvent) {
    console.log("event listener for sayAloha: ", event.data);
  }

  @on({ once: true })
  static asyncGetFullName(event: CustomEvent) {
    console.log("event listener for asyncGetFullName: ", event.data);
  }

  @on({
    eventName: "person:sayAloha2",
    errorHandler: console.error,
  })
  static sayAloha2WithError(event: CustomEvent) {
    throw new Error(`sayAloha2WithError: ${event.data}`);
  }
}

console.log(`
---- Event options example ----
`);

const p = new Person("Fistname", "Lastname");

console.log("asyncGetFullName should be triggered once");
for (let i = 0; i <= 5; i++) {
  p.asyncGetFullName();
}

console.log("sayAloha once & debounce should be called once for 5 executions");
let counter = 0;
const intervalFn = setInterval(() => {
  console.log("sayAloha once & debounce", counter);
  counter += 1;
  p.sayAloha();
  if (counter == 5) clearInterval(intervalFn);
}, 200);

console.log(
  "getFullName debounce should be called once for 5 * 100ms interval"
);
let counter2 = 0;
const intervalFn2 = setInterval(() => {
  console.log("getFullName debounce ", counter2);
  counter2 += 1;
  p.getFullName();
  if (counter2 == 5) clearInterval(intervalFn2);
}, 100);

p.sayAloha2();
