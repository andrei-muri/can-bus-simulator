import { SimulationManager } from "../classes/SimulationManager.mjs";

export const validateConfig = (configJson) => {
    if(!configJson) {
        console.log("Config json is empty!\n");
        return false;
    }

    const availableParamsJson = SimulationManager.availableParamsJson;
    if(!configJson.configuration_name || (typeof configJson.configuration_name !== "string")) {
        console.log("Configuration doesn't have a name!\n");
        return false;
    }

    if (!configJson.ecus || !Array.isArray(configJson.ecus)) {
        console.log("configJson.ecus is either missing or not an array.\n");
        return false;
    }

    if (!configJson.messages || !Array.isArray(configJson.messages)) {
        console.log("configJson.messages is either missing or not an array.\n");
        return false;
    }

    if (!availableParamsJson) {
    console.log("availableParamsJson is undefined or null!\n");
    return false;
    }

    if (!availableParamsJson.available_names) {
        console.log("availableParamsJson.available_names is missing!\n");
        return false;
    }

    if (!availableParamsJson.available_messages) {
        console.log("availableParamsJson.available_messages is missing!\n");
        return false;
    }


    if(!configJson.ecus.every(element => availableParamsJson.available_names.includes(element))) {
        console.log("Invalid ecus.\n");
        return false;
    }

    let availableMessages = null;
    try {
        availableMessages = availableParamsJson.available_messages.map(message => message.name);
    }
    catch (error) {
        console.log(`here ${error}`);
    }

    if(!configJson.messages.every(message => availableMessages.includes(message.message_name))) {
        console.log("Unknown message\n");
        return false;
    }

    if(!configJson.messages.every(message => message.data_length >= 0 || message.data_length <= 8)) {
        console.log("Invalid data length\n");
        return false;
    }

    return true;

}