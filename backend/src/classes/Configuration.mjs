import { ECU } from './ECU.mjs';
import { Message } from './Message.mjs';
import { SimulationManager } from './SimulationManager.mjs';
import { validateConfig } from '../validators/validateConfig.mjs';
import { State } from '../utils/index.mjs';

export class Configuration {
    constructor(configuration) {
        if (!validateConfig(configuration)) {
            console.log("Invalid config");
            return;
        }
        this.name = configuration.configuration_name;
        this.Ecus = new Map();
        this.noOfMessages = configuration.messages.length;
        this.bytes = 0;
        this.initEcus(configuration);
        this.initMessages(configuration);
    }

    initEcus(configuration) {
        const availableParams = SimulationManager.availableParamsJson;
        configuration.ecus.forEach((ecu) => {
            this.Ecus.set(
                ecu,
                new ECU(
                    ecu,
                    availableParams.available_ecus[ecu].messages_it_can_send,
                    availableParams.available_ecus[ecu].messages_it_can_receive
                )
            );
        });
    }

    initMessages(configuration) {
        configuration.messages.forEach(message => {
            this.Ecus.get(message.sent_by).enqueue(
                new Message(
                    message.time,
                    message.sent_by,
                    this.getId(message.message_name),
                    message.message_name,
                    SimulationManager.availableParamsJson.available_messages.find(msg => msg.id === this.getId(message.message_name)).CANopen_type,
                    message.data_length,
                    message.data
                )
            );
            this.bytes += message.data_length;
        });
    }

    getId(messageName) {
        const availableParams = SimulationManager.availableParamsJson;
        for (const message of availableParams.available_messages) {
            if (message.name === messageName) {
                return message.id;
            }
        }
        return null; // Return null if not found
    }

    toString() {
        const ecusString = Array.from(this.Ecus.values())
            .map(ecu => ecu.toString())
            .join("\n");
        
        return `Configuration ${this.name}:
            ECUs:
                ${ecusString}`
    }
}
