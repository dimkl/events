import {
  CustomEvent,
  dispatch,
  dispatchAsync,
  on,
} from "../src";

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

  @dispatchAsync()
  async asyncGetFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  aloha() {
    return "Aloha to all";
  }
}

//
// Implicit tasks definition
// Requires class name to be ${namespace}Handler
// and the methods to be static type with ${event} name
//
class PersonHandler {
  @on()
  static getFullName(event: CustomEvent) {
    console.log("ImplicitPersonHandler: event listener for getFullName: ", event.data);
  }

  @on()
  static sayAloha(event: CustomEvent) {
    console.log("ImplicitPersonHandler: event listener for sayAloha: ", event.data);
  }

  @on()
  static asyncGetFullName(event: CustomEvent) {
    console.log(
      "ImplicitPersonHandler: event listener for asyncGetFullName: ",
      event.data
    );
  }
}

console.log(`
---- Implicit event attach example ----
`);

const p = new Person("Firstname", "Lastname");

p.asyncGetFullName();

console.log("log getFullName(): ", p.getFullName());
p.sayAloha();
p.firstName = "Firstname";
console.log("log getFullName(): ", p.getFullName());
