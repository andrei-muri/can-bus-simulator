# CAN network simulator

The **CAN Simulator** is a web-based tool designed to visualize CAN bus communication and simulate arbitration without using CAN-related libraries. It allows users to observe *message transmission*, *arbitration*, and *interactions* between multiple ECUs within a network.

![Overview of the simulation](/Documentation/app.png)

A complete documentation of the project can be found [here](/Documentation/doc.pdf).

## Features

- Visualization of the bus, ECUs and wireframe of the car
- Information about each ECU (state, what message it is sending, if it consumes a received message etc.) obtained through hovering
- Select, edit and add configurations
- Auto-play or step by step
- Real time logging
- Visualization of the bus state through a graph (Ox = time, Oy = voltage)
- Arbitration messages
- Stats about the simulation (number of messages sent, total amount of data sent etc.)
- Visualizing indicators (ABS, ESP, lights)
- Real time message sending
 
 > [!TIP]
 > Try running the simulation with all the predefined configurations and see different types of message and their effect.

 ## Technologies stack

 - Frontend: React.js and p5.js
 - Backend: Express.js

 ## Instalation

 ### Prerequisites

 - Node.js
 - npm

 ### Setup

 1. Clone the repository
 ```
https://github.com/andrei-muri/can-bus-simulator.git
cd can-bus-simulator
 ```
 2. Install dependencies
 ```
npm install
 ```
 3. Start the backend
 ```
 cd backend
 node server.js
 ```
 4. Start the frontend
 ```
 cd frontend
 npm start
 ```

 ## Usage
 
 1. Open you browser and navigate to `http://localhost:3000`
 2. Select a configuration
 3. Start the simulation
 4. Navigate through discrete time intervals
 4. Send messages dinamically

 ## Personal opinion

 This was a fun project. I learned a lot about how electrical components communicate in a car (and in many other machines). This inspires me to create a real hardware component that connects to the car's CAN network and performs diagnosis. Maybe I will implement it with an ESP microcontroller. If you have any suggestions or you can offer some help, leave a message. 

## Author

Muresan Andrei   
[LinkedIn](https://www.linkedin.com/in/andrei-muresan-muri/)
[GitHub](https://github.com/andrei-muri)


