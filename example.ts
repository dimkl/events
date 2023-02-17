import { CustomEvent, dispatchEventOn, dispatchEventOnAsync, attachEventOn } from "./src";

// 
// Definition example
//
const eventBus = new EventTarget();

class Person {
    public firstName: string;
    public lastName: string;

    constructor(firstName: string, lastName: string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    @dispatchEventOn(eventBus)
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    @dispatchEventOn(eventBus)
    sayAloha() {
        console.log('said: ', this.aloha());
    }

    @dispatchEventOnAsync(eventBus)
    async asyncGetFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    aloha() {
        return 'Aloha to all';
    }
}

//
// Usage example
// 
// eventBus.addEventListener('person:getFullName', (event) => {
//     console.log('event listener for getFullName: ', {
//         name: event.type,
//         data: (event as CustomEvent).data
//     });
// });

// eventBus.addEventListener('person:sayAloha', (event) => {
//     console.log('event listener for sayAloha: ', {
//         name: event.type,
//         data: (event as CustomEvent).data
//     });
// })

// eventBus.addEventListener('person:asyncGetFullName', (event) => {
//     console.log('event listener for asyncGetFullName: ', {
//         name: event.type,
//         data: (event as CustomEvent).data
//     });
// })

class TaskHandler {
    @attachEventOn(eventBus, 'person:getFullName')
    static handleGetFullName(event: CustomEvent) {
        console.log('event listener for getFullName: ', event.data);
    }

    @attachEventOn(eventBus, 'person:sayAloha')
    static handleSayAloha(event: CustomEvent) {
        console.log('event listener for sayAloha: ', event.data);
    }

    @attachEventOn(eventBus, 'person:asyncGetFullName')
    static handleAsyncGetFullName(event: CustomEvent) {
        console.log('event listener for asyncGetFullName: ', event.data);
    }
}

const p = new Person('Dimitris', 'Klouvas');

p.asyncGetFullName();

console.log('log getFullName(): ', p.getFullName());
p.sayAloha();
p.firstName = 'Dimitrios';
console.log('log getFullName(): ', p.getFullName());
