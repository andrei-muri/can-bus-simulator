export class ECUState {
    constructor(name, state, msgId, bit, data, msgType, msgDescription) {
        this.name = name;
        this.state = state;
        this.msgId = msgId;
        this.bit = bit;
        this.data = data;
        this.msgType = msgType;
        this.msgDescription = msgDescription;
    }
}