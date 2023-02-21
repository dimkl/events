import {
  CustomEvent,
  dispatchEventOn,
  attachEventOn,
  dispatchEventOnAsync,
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

  @dispatchEventOn()
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @dispatchEventOn()
  sayAloha() {
    console.log("said: ", this.aloha());
  }

  @dispatchEventOnAsync()
  async asyncGetFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  aloha() {
    return "Aloha to all";
  }
}

class ExplicitPersonHandler {
  @attachEventOn("person:getFullName")
  static handleGetFullName(event: CustomEvent) {
    console.log("ExplicitPersonHandler: event listener for getFullName: ", event.data);
  }

  @attachEventOn("person:sayAloha")
  static handleSayAloha(event: CustomEvent) {
    console.log("ExplicitPersonHandler: event listener for sayAloha: ", event.data);
  }

  @attachEventOn("person:asyncGetFullName")
  static handleAsyncGetFullName(event: CustomEvent) {
    console.log("ExplicitPersonHandler: event listener for asyncGetFullName: ", event.data);
  }
}

const p = new Person("Fistname", "Lastname");

p.asyncGetFullName();

console.log("log getFullName(): ", p.getFullName());
p.sayAloha();
p.firstName = "Fistname2";
console.log("log getFullName(): ", p.getFullName());
