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
  async asyncGetFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  aloha() {
    return "Aloha to all";
  }
  @dispatch()
  async alohaAsync() {
    return "Aloha to all";
  }
}

class ExplicitPersonHandler {
  @on({ eventName: "person:getFullName" })
  static handleGetFullName(event: CustomEvent) {
    console.log(
      "ExplicitPersonHandler: event listener for getFullName: ",
      event.data
    );
  }

  @on({ eventName: "person:sayAloha" })
  static handleSayAloha(event: CustomEvent) {
    console.log(
      "ExplicitPersonHandler: event listener for sayAloha: ",
      event.data
    );
  }

  @on({ eventName: "person:asyncGetFullName" })
  static handleAsyncGetFullName(event: CustomEvent) {
    console.log(
      "ExplicitPersonHandler: event listener for asyncGetFullName: ",
      event.data
    );
  }
}

console.log(`
---- Minimal example ----
`);
const p = new Person("Fistname", "Lastname");

p.asyncGetFullName();

console.log("log getFullName(): ", p.getFullName());
p.sayAloha();
p.firstName = "Fistname2";
console.log("log getFullName(): ", p.getFullName());

p.alohaAsync();
