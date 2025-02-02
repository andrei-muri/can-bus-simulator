export class ECU {
    constructor(name, OD_send, OD_receive) {
        this.name = name;
        this.OD_send = OD_send;
        this.OD_receive = OD_receive;
        this.messageQueue = [];
    }

    enqueue(message) {
        this.messageQueue.push(message);
    }

    dequeue() {
        return this.messageQueue.shift();
    }

    hasMessage() {
        return this.messageQueue.length !== 0;
    }

    peek() {
        return this.messageQueue[0];
    }

    canProcess(id) {
        return this.OD_receive.includes(id);
    }

    toString() {
        return `(${this.name}, [${this.OD_send.join(", ")}], [${this.OD_receive.join(", ")}])`;
    }
}
