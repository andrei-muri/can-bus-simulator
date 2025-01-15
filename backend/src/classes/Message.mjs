export class Message {
    constructor(time, sentBy, id, description, type, data_length, data) {
        this.time = time; // Time when the message is ready to be sent
        this.sentBy = sentBy; // ECU sending the message
        this.id = this.convertIdToBinary(id); // Convert ID to binary string
        this.description = description;
        this.type = type;
        this.data_length = data_length; // Data length in bytes
        this.data = this.convertDataToBinary(data, data_length); // Convert data to binary
        this.state = "undispatched";
        this.currentBitIndex = 0;
        this.totalBits = 11 + this.data_length * 8;
        this.message = this.id + this.data;
    }

    // Convert a hexadecimal ID (e.g., "0x12A") to a binary string of length 11
    convertIdToBinary(id) {
        const numericId = parseInt(id, 16); // Convert hex to integer
        const binaryId = numericId.toString(2); // Convert integer to binary
        return binaryId.padStart(11, '0'); // Ensure 11-bit representation
    }

    // Convert data to a binary string of the correct length
    convertDataToBinary(data, data_length) {
        const numericData = parseInt(data, 16); // Convert hex to integer
        const binaryData = numericData.toString(2); // Convert integer to binary
        return binaryData.padStart(data_length * 8, '0'); // Pad to match data length in bits
    }

    //checks to see if the whole message has been sent
    isFullySent() {
        return this.currentBitIndex >= this.totalBits;
    }

    getCurrentBit() {
        return this.message[this.currentBitIndex] || null;
    }

    // toString method for debugging/logging
    toString() {
        return `(${this.time}, ${this.sentBy}, ${this.id}, ${this.data_length}, ${this.data})`;
    }
}
