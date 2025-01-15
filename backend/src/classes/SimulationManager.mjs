import { Configuration } from './Configuration.mjs';
import { ECUState } from './ECUState.mjs';
import { State } from '../utils/index.mjs';
import fs from 'fs';

export class SimulationManager {
    static availableParamsJson = SimulationManager.loadJson();

    static loadJson() {
        const filePath = "E:\\Facultate\\An 3\\Sem 1\\SCS\\Project\\backend\\src\\data\\available_params.json";
        try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent);
        } catch (error) {
        console.error("Error reading or parsing JSON file:", error);
        return {}; // Return an empty object on failure
        }
    }


    constructor(configurationJson) {
        const sortedConfigurationJson = {
            ...configurationJson,
            messages: [...configurationJson.messages].sort((a, b) => a.time - b.time)
        };
        this.configuration = new Configuration(sortedConfigurationJson); 
        this.result = {configuration: this.configuration.name};
        this.timeSim = 0;     
        this.isBusAvailable = true;
        this.activeMessages = new Map();
        this.messagesProcessed = 0;
        this.initActiveMessages();
        this.calculateResult();
        this.result.results.total_simulation_time = this.timeSim;
        this.result.results.successful_messages = this.messagesProcessed;
        this.result.results.success_rate = `${(this.messagesProcessed / this.configuration.noOfMessages) * 100}%`;
        const dominantCount = this.result.times.filter(t => t.bus_state === 'dominant').length;
        const recessiveCount = this.result.times.filter(t => t.bus_state === 'recessive').length;
        this.result.results.bus_dominance_ratio = `('0'/'1')${dominantCount}:${recessiveCount}`;

    }

    initActiveMessages() {
        Array.from(this.configuration.Ecus.keys()).forEach(ecuName => {
            this.activeMessages.set(ecuName, null);
        }); 
    }

    calculateResult() {
        this.result.ecus_meta = {};
        this.result.ecus_meta.names = Array.from(this.configuration.Ecus.keys());
        this.result.results = {};
        this.result.results.ecus = this.result.ecus_meta.names.length;
        this.result.results.conflicts_resolved = 0;
        this.result.results.amount_of_data = `${this.configuration.bytes}B`;
        this.result.times = [];
        this.ecusStatesMap = new Map();
        this.result.ecus_meta.names.forEach(ecu => {
            this.ecusStatesMap.set(
                ecu,
                new ECUState(ecu, State.IDLE, "na", "na", "na", "na", "")
            );
        });

        let endSim = false;
        while(!endSim) {
            this.refreshActiveMessages();

            if(this.isBusAvailable) {
                // no message is being sent. Either we have no active message or one or multiple messages start to send
                this.handleBusIdle();
            } else {
                this.handleBusOccupied();
            }

            if(this.messagesProcessed === this.configuration.noOfMessages) {
                endSim = true;
            }
        }
    }



    handleBusOccupied() {
        let sendingMessages = this.getMessagesList().filter(message => message.state === "sending");
        const arbitrationBits = sendingMessages.map(message => message.getCurrentBit());

        const isArbitration = arbitrationBits.includes("0") && arbitrationBits.includes("1");

        let logMessages = [];
        let busState = isArbitration ? "dominant" : arbitrationBits[0] === "0" ? "dominant" : "recessive";
        let arbitrationMessage;

        sendingMessages.forEach(message => {
            const hexId = parseInt(message.id, 2).toString(16).toUpperCase();
            const hexData = parseInt(message.data, 2).toString(16).toUpperCase();

            if(isArbitration) {
                if(message.getCurrentBit() === "1") {
                    //lost arbitration
                    message.state = "waiting";
                    this.setState(State.WAITING, hexId, "na", hexData, message.type, message.description, message.sentBy);
                    message.currentBitIndex = 0;
                    logMessages.push(this.log(this.timeSim, `${message.sentBy} lost arbitration`));
                } else {
                    //won arbitration
                    this.setState(State.SENDING, hexId, message.getCurrentBit(), hexData, message.type, message.description, message.sentBy);
                    logMessages.push(this.log(this.timeSim, `${message.sentBy} won arbitration`));
                    message.currentBitIndex++;
                }
            } else {
                //no arbitration
                this.setState(State.SENDING, hexId, message.getCurrentBit(), hexData, message.type, message.description, message.sentBy);
                logMessages.push(this.log(this.timeSim, `${message.sentBy} is sending ${message.getCurrentBit()} of message 0x${hexId} 0x${hexData}`));
                message.currentBitIndex++;
            }
        });
        let ecusThatWonArbitration;
        if(isArbitration) {
            this.result.results.conflicts_resolved++;
            ecusThatWonArbitration = 
                        this.getMessagesList().filter(message => message.state === "sending").map(message => message.sentBy).join(", ");
            
        }
        arbitrationMessage = isArbitration
                    ? `${ecusThatWonArbitration} won arbitration and continues to transmit.`
                    : "No arbitration is needed; all ECUs are transmitting the same bit.";
        this.addTimeInfo(busState, logMessages, arbitrationMessage);
        this.timeSim++;

        logMessages = [];
        //now checking if any message finished its sending
        sendingMessages = this.getMessagesList().filter(message => message.state === "sending");
        let existsFinishedMessages = false;
        let ecusThatProcessTheMessage = [];
        sendingMessages.forEach(message => {
            const hexId = parseInt(message.id, 2).toString(16).toUpperCase();
            const hexData = parseInt(message.data, 2).toString(16).toUpperCase();
            if(message.isFullySent()) {
                this.setState(State.FINISHED, hexId, "1", hexData, message.type, `${message.description} - EOF`, message.sentBy);
                existsFinishedMessages = true;
                logMessages.push(this.log(this.timeSim, `${message.sentBy} finished sending message ${hexId}`));
                message.state = "sent";
                this.messagesProcessed++;
                Array.from(this.configuration.Ecus.keys()).forEach(ecuName => {
                    if(ecuName !== message.sentBy && this.configuration.Ecus.get(ecuName).canProcess(`0x${hexId}`)) {
                        ecusThatProcessTheMessage.push(ecuName);
                        logMessages.push(this.log(this.timeSim, `${ecuName} is processing the message ${hexId}`));
                        this.setState(State.PROCESSING, hexId, "na", hexData, message.type, message.description, ecuName);
                    }
                });
            }
        });
        if(existsFinishedMessages) {
            
            this.addTimeInfo("recessive", logMessages, "No arbitration - EOF");
            this.timeSim++;
            this.isBusAvailable = true;
        }
        //after done sending, send back to idle all the ecus that finished sending the message
        const sentMessages = sendingMessages.filter(message => message.state === "sent");
        sentMessages.forEach(message => {
            this.setState(State.IDLE, "na", "na", "na", "na", "", message.sentBy);
            this.activeMessages.set(message.sentBy, null);
        })
    }

    handleBusIdle() {
        let logMessages = [];
        let busState;
        let arbitrationMessage;
        if(this.getNoOfActiveMessages() === 0) {
            //no active messages, everything is idle
            this.setState(State.IDLE, "na", "na", "na", "na", "");
            busState = "recessive";
            logMessages.push(this.log(this.timeSim, "No ecu is sending"));
            arbitrationMessage = "No arbitration";
        } else {
            //there are active messages so we must begin sending each of their content
            const sendingMessages = this.getMessagesList();
            sendingMessages.forEach(message => {
                const hexData = parseInt(message.data, 2).toString(16).toUpperCase();
                const hexId = parseInt(message.id, 2).toString(16).toUpperCase();
                this.setState(State.SENDING, hexId, "0", hexData, message.type, `${message.description} - SOF `, message.sentBy);
                logMessages.push(this.log(this.timeSim, `${message.sentBy} started sending message (ID: ${hexId}) with SOF`));
                message.state = "sending";
            });
            this.isBusAvailable = false;
            busState = "dominant";
            arbitrationMessage = "Arbitration begins";
        }
        this.addTimeInfo(busState, logMessages, arbitrationMessage);
        this.timeSim++;
    }


    getNoOfActiveMessages() {
        return this.getMessagesList().length;
    }

    getMessagesList() {
        return Array.from(this.activeMessages.values()).filter(message => message != null);
    }

    log(time, message) {
        return `TIME${time} - ${message}`;
    }

    refreshActiveMessages() {
        this.activeMessages.forEach((message, ecuName) => {
            if (message === null) { // Check if no active message for the ECU
                const ecu = this.configuration.Ecus.get(ecuName);
                if (ecu.hasMessage()) {      
                    if(ecu.peek().time <= this.timeSim) {
                        const nextMessage = ecu.dequeue();
                        this.activeMessages.set(ecuName, nextMessage); // Update the Map
                        nextMessage.state = "waiting";
                        const hexData = parseInt(nextMessage.data, 2).toString(16).toUpperCase();
                        const hexId = parseInt(nextMessage.id, 2).toString(16).toUpperCase();
                        this.setState(State.WAITING, hexId, "na", hexData, nextMessage.type, nextMessage.description, ecuName);
                        //console.log(`Message ${nextMessage.id} has been added to active messages of ${ecuName}`);
                    }
                }
            }
        });
    }


    addTimeInfo(busState, logMessages, arbitrationMessage) {
        const ecuStates = Array.from(this.ecusStatesMap.values());
        this.result.times.push({
            time: this.timeSim,
            states: ecuStates.map(ecuState => ecuState.state),
            message_id: ecuStates.map(ecuState => ecuState.msgId),
            ecus_bits: ecuStates.map(ecuState => ecuState.bit),
            data: ecuStates.map(ecuState => ecuState.data),
            message_type: ecuStates.map(ecuState => ecuState.msgType),
            message_description: ecuStates.map(ecuState => ecuState.msgDescription),
            bus_state: busState,
            log_messages: logMessages,
            arbitration_message: arbitrationMessage
        });
    }


    setState(state, msgId, bit, data, msgType, msgDescription, ecuName = null) {
        if (ecuName) {
            // Update a specific ECU's state
            const ecuState = this.ecusStatesMap.get(ecuName);
            if (ecuState) {
                ecuState.state = state;
                ecuState.msgId = msgId;
                ecuState.bit = bit;
                ecuState.data = data;
                ecuState.msgType = msgType;
                ecuState.msgDescription = msgDescription;
            }
        } else {
            // Update all ECUs
            this.ecusStatesMap.forEach(ecuState => {
                ecuState.state = state;
                ecuState.msgId = msgId;
                ecuState.bit = bit;
                ecuState.data = data;
                ecuState.msgType = msgType;
                ecuState.msgDescription = msgDescription;
            });
        }
    }


}


    