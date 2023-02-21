import {
  CustomEvent,
  dispatchEventOn,
  dispatchEventOnAsync,
  attachEventOn,
} from "../src";

//
// Definition example
//
const eventBus = new EventTarget();

class IsolatedPerson {
  public firstName: string;
  public lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  @dispatchEventOn("person:getFullName", eventBus)
  getFullName() {
    return `Isolated ${this.firstName} ${this.lastName}`;
  }

  @dispatchEventOn("person:sayAloha", eventBus)
  sayAloha() {
    console.log("Isolated said: ", this.aloha());
  }

  @dispatchEventOnAsync("person:asyncGetFullName", eventBus)
  async asyncGetFullName() {
    return `Isolated ${this.firstName} ${this.lastName}`;
  }

  aloha() {
    return "Aloha to all";
  }
}

class IsolatedPersonHandler {
  @attachEventOn("person:getFullName", eventBus)
  static handleGetFullName(event: CustomEvent) {
    console.log(
      "IsolatedPersonHandler: event listener for getFullName: ",
      event.data
    );
  }

  @attachEventOn("person:sayAloha", eventBus)
  static handleSayAloha(event: CustomEvent) {
    console.log(
      "IsolatedPersonHandler: event listener for sayAloha: ",
      event.data
    );
  }

  @attachEventOn("person:asyncGetFullName", eventBus)
  static handleAsyncGetFullName(event: CustomEvent) {
    console.log(
      "IsolatedPersonHandler: event listener for asyncGetFullName: ",
      event.data
    );
  }
}

const p = new IsolatedPerson("Firstname", "Lastname");

p.asyncGetFullName();
console.log("log getFullName(): ", p.getFullName());
