import type { CustomEvent, IEvent } from "@dimkl/events";
import { dispatch, on } from "@dimkl/events";
import { EventBus } from "@dimkl/events";

declare global {
  interface PersonGetFullName extends IEvent {
    type: "person:getFullName"
    data?: any
  }
  
  interface PersonSayAloha extends IEvent {
    type: "person:sayAloha"
    data?: any
  }

  interface PersonAsyncGetFullName extends IEvent {
    type: "person:asyncGetFullName"
    data?: any
  }

  interface Events {
    "person:getFullName": PersonGetFullName
    "person:sayAloha": PersonSayAloha
    "person:asyncGetFullName": PersonAsyncGetFullName
  }
}


//
// Definition example
//
const eventBus = new EventBus();

class IsolatedPerson {
  public firstName: string;
  public lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  @dispatch({ eventName: "person:getFullName", eventBus })
  getFullName() {
    return `Isolated ${this.firstName} ${this.lastName}`;
  }

  @dispatch({ eventName: "person:sayAloha", eventBus })
  sayAloha() {
    console.log("Isolated said: ", this.aloha());
  }

  @dispatch({ eventName: "person:asyncGetFullName", eventBus })
  async asyncGetFullName() {
    return `Isolated ${this.firstName} ${this.lastName}`;
  }

  aloha() {
    return "Aloha to all";
  }
}

class IsolatedPersonHandler {
  @on({ eventName: "person:getFullName", eventBus })
  static handleGetFullName(event: CustomEvent) {
    console.log(
      "IsolatedPersonHandler: event listener for getFullName: ",
      event.data
    );
  }

  @on({ eventName: "person:sayAloha", eventBus })
  static handleSayAloha(event: CustomEvent) {
    console.log(
      "IsolatedPersonHandler: event listener for sayAloha: ",
      event.data
    );
  }

  @on({ eventName: "person:asyncGetFullName", eventBus })
  static handleAsyncGetFullName(event: CustomEvent) {
    console.log(
      "IsolatedPersonHandler: event listener for asyncGetFullName: ",
      event.data
    );
  }
}

console.log(`
---- Isolated event bus example ----
`);

const p = new IsolatedPerson("Firstname", "Lastname");

p.asyncGetFullName();
console.log("log getFullName(): ", p.getFullName());
