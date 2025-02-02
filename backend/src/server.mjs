import express from 'express';
import cors from 'cors';
import { readFile, writeFile, readdir } from 'fs/promises';
import { SimulationManager } from './classes/SimulationManager.mjs';
import { validateConfig } from './validators/validateConfig.mjs';
import path from 'path';

const app = express();  
const port = process.env.CAN_BACKEND_PORT || 4000;


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

app.use(express.json());
app.use(cors());

app.get("/", (_, response) => {
    response.status(200).send("Connection is good!");
});


app.get('/api/configurations', async (req, res) => {
    const configDirectory = './src/data/configurations/'; // Directory storing configurations

    try {
        const files = await readdir(configDirectory);
        const configurations = files.filter(file => file.endsWith('.json'));

        if (configurations.length === 0) {
            console.warn('No configuration files found in directory:', configDirectory);
            return res.status(404).json({ error: 'No configuration files available in the specified directory.' });
        }

        res.status(200).json({ configurations });
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Configuration directory not found: ${configDirectory}`);
            return res.status(500).json({ error: `Configuration directory not found at path: ${configDirectory}` });
        } else if (error.code === 'EACCES') {
            console.error(`Permission denied accessing configuration directory: ${configDirectory}`);
            return res.status(500).json({ error: `Permission denied for accessing configuration directory at: ${configDirectory}` });
        } else {
            console.error('Unexpected error while fetching configurations:', error.message);
            return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
        }
    }
});

// Endpoint to fetch the configuration JSON by name
app.get('/api/configurations/:configName', async (req, res) => {
    const { configName } = req.params;

    if (!configName) {
        return res.status(400).json({ error: 'Configuration name is required.' });
    }

    try {
        const configPath = `./src/data/configurations/${configName}`;
        const configData = await readFile(configPath, 'utf-8');
        const parsedConfig = JSON.parse(configData);

        res.status(200).json(parsedConfig);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Configuration file not found:', configName);
            res.status(404).json({ error: 'Configuration file not found.' });
        } else if (error instanceof SyntaxError) {
            console.error('Invalid JSON format:', error.message);
            res.status(400).json({ error: 'Invalid JSON format.' });
        } else {
            console.error('An error occurred:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Add a new configuration
app.post('/api/configurations', async (req, res) => {
    const configDirectory = './src/data/configurations/'; // Directory for configurations
    const newConfig = req.body; // Expecting the new configuration as JSON in the request body

    try {
        // Validate the configuration using your existing method
        if (!validateConfig(newConfig)) {
            return res.status(400).json({ error: 'Invalid configuration data provided.' });
        }
        console.log("hello");

        const configFileName = `${newConfig.configuration_name}.json`;

        // Check if the configuration name is unique
        const files = await readdir(configDirectory);
        if (files.includes(configFileName)) {
            return res.status(400).json({ error: `A configuration with the name "${newConfig.configuration_name}" already exists.` });
        }

        // Save the configuration as a new file
        const configFilePath = path.join(configDirectory, configFileName);
        await writeFile(configFilePath, JSON.stringify(newConfig, null, 2), 'utf-8');

        res.status(201).json({ message: `Configuration "${newConfig.configuration_name}" added successfully.` });
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Configuration directory not found: ${configDirectory}`);
            return res.status(500).json({ error: 'Configuration directory not found.' });
        } else if (error.code === 'EACCES') {
            console.error(`Permission denied for writing configuration file: ${configFileName}`);
            return res.status(500).json({ error: 'Permission denied to write the configuration file.' });
        } else {
            console.error('Unexpected error while saving configuration:', error.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});


app.get('/api/simulation/result', async (req, res) => {
    const { configName } = req.query; // Extract configName from query parameters

    if (!configName) {
        return res.status(400).json({ error: 'Configuration name is required as a query parameter.' });
    }

    try {
        // Construct the file path for the configuration
        const configPath = `./src/data/configurations/${configName}`;

        // Read and parse the configuration file
        const configData = await readFile(configPath, 'utf-8');
        const parsedConfig = JSON.parse(configData);

        // Validate the configuration (using your validator)
        if (!validateConfig(parsedConfig)) {
            return res.status(400).json({ error: 'Invalid configuration provided.' });
        }

        // Process the simulation result using the SimulationManager
        const sim = new SimulationManager(parsedConfig);

        // Return the simulation result
        res.status(200).json(sim.result);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('Configuration file not found:', configName);
            res.status(404).json({ error: `Configuration file not found for ${configName}` });
        } else if (error instanceof SyntaxError) {
            console.error('Invalid JSON format in configuration file:', error.message);
            res.status(400).json({ error: 'Invalid JSON format in configuration file.' });
        } else {
            console.error('An error occurred:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.get('/api/default-messages', async (req, res) => {
    const { ecus } = req.query; // Expecting a comma-separated list of ECUs in the query parameters

    if (!ecus) {
        return res.status(400).json({ error: 'Invalid request. Provide a comma-separated list of ECUs as a query parameter.' });
    }

    // Convert the comma-separated ECUs into an array
    const ecuList = ecus.split(',').map(ecu => ecu.trim());

    const defaultMessagesPath = './src/data/defaultMessages.json'; // Path to the JSON file

    try {
        // Read the JSON file
        const fileContents = await readFile(defaultMessagesPath, 'utf-8');
        const defaultMessages = JSON.parse(fileContents);

        // Filter the default messages based on the requested ECUs
        const filteredMessages = {};
        ecuList.forEach(ecu => {
            if (defaultMessages[ecu]) {
                filteredMessages[ecu] = defaultMessages[ecu];
            }
        });

        if (Object.keys(filteredMessages).length === 0) {
            return res.status(404).json({ error: 'No matching ECUs found in the default messages.' });
        }

        res.status(200).json(filteredMessages);
    } catch (error) {
        console.error('Error reading default messages:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/simulation/ecu-result', async (req, res) => {
    const { ecu, time, configName } = req.query; // Extract query parameters
    console.log(`${time} ${ecu} ${configName}`);

    if (!ecu || !time || !configName) {
        return res.status(400).json({ error: 'Parameters "ecu", "time", and "configName" are required.' });
    }

    const configPath = `./src/data/configurations/${configName}`;
    const defaultMessagesPath = './src/data/defaultMessages.json';

    try {
        // Read and parse the configuration file
        const configData = await readFile(configPath, 'utf-8');
        const parsedConfig = JSON.parse(configData);

        // Validate the configuration
        if (!validateConfig(parsedConfig)) {
            return res.status(400).json({ error: 'Invalid configuration provided.' });
        }

        // Read and parse the default messages file
        const defaultMessagesData = await readFile(defaultMessagesPath, 'utf-8');
        const defaultMessages = JSON.parse(defaultMessagesData);

        // Check if the ECU exists in the default messages
        if (!defaultMessages[ecu]) {
            return res.status(404).json({ error: `Default message for ECU "${ecu}" not found.` });
        }

        // Add the default message with the specified time to the configuration's messages
        const defaultMessage = { ...defaultMessages[ecu], time: parseInt(time, 10) };
        const modifiedConfig = {
            ...parsedConfig,
            messages: [defaultMessage, ...parsedConfig.messages]
        };
        console.log(modifiedConfig);

        // Process the simulation result using the modified configuration
        const sim = new SimulationManager(modifiedConfig);

        // Return the simulation result
        res.status(200).json(sim.result);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('File not found:', error.message);
            res.status(404).json({ error: 'Configuration or default messages file not found.' });
        } else if (error instanceof SyntaxError) {
            console.error('Invalid JSON format:', error.message);
            res.status(400).json({ error: 'Invalid JSON format in configuration or default messages file.' });
        } else {
            console.error('An error occurred:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.get('/api/available-params', async (req, res) => {
    const paramsPath = './src/data/available_params.json';

    try {
        const paramsData = await readFile(paramsPath, 'utf-8');
        const parsedParams = JSON.parse(paramsData);
        res.status(200).json(parsedParams);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('available_params.json not found:', error.message);
            res.status(404).json({ error: 'available_params.json file not found.' });
        } else {
            console.error('Error reading available_params.json:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.put('/api/configurations/:configName', async (req, res) => {
    const { configName } = req.params;
    const updatedConfig = req.body;
    const configPath = `./src/data/configurations/${configName}`;

    try {
        if (!validateConfig(updatedConfig)) {
            return res.status(400).json({ error: 'Invalid configuration data.' });
        }

        // Write the updated configuration to the file
        await writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');
        res.status(200).json({ message: `Configuration "${configName}" updated successfully.` });
    } catch (error) {
        console.error('Error updating configuration:', error.message);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: 'Configuration file not found.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});






app.get("/api/simulation/default", async (req, res) => {
    try {
        // Read the JSON file (adjust the relative path if necessary)
        const filePath = './src/data/default.json';
        const data = await readFile(filePath, 'utf-8');

        // Parse JSON and send it as a response
        res.status(200).json(JSON.parse(data));
    } catch (err) {
        // Handle errors (e.g., file not found, invalid JSON)
        console.error('Error reading JSON file:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/test", async (req, res) => {
    try {
        // Provide the full path to the JSON file
        const path = './src/data/configurations/configuration2.json';

        // Read the file and parse its contents
        const fileContents = await readFile(path, 'utf8');
        const jsonData = JSON.parse(fileContents);
        console.log('Data stored successfully: config');

        // Create the SimulationManager instance with the parsed data
        const sim = new SimulationManager(jsonData);

        // Send success response
        res.status(200).json(sim.result);
    } catch (error) {
        // Handle errors appropriately
        if (error.code === 'ENOENT') {
            console.error('File not found:', path);
            res.status(404).json({ error: 'File not found' });
        } else if (error instanceof SyntaxError) {
            console.error('Invalid JSON format:', error.message);
            res.status(400).json({ error: 'Invalid JSON format' });
        } else {
            console.error('An error occurred:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

