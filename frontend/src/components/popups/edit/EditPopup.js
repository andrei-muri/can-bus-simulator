import styles from './EditPopup.module.css';
import { useState, useEffect } from 'react';

const EditPopup = ({ configName, onClose }) => {
    const [availableParams, setAvailableParams] = useState(null);
    const [configuration, setConfiguration] = useState(null);
    const [deselectedEcus, setDeselectedEcus] = useState([]);
    const [newMessage, setNewMessage] = useState({
        time: '',
        sent_by: '',
        message_name: '',
        data_length: '',
        data: ''
    });

    useEffect(() => {
        // Fetch available params
        const fetchParams = async () => {
            try {
                const paramsResponse = await fetch('http://localhost:8001/api/available-params');
                if (!paramsResponse.ok) throw new Error('Failed to fetch available parameters');
                const paramsData = await paramsResponse.json();
                setAvailableParams(paramsData);
            } catch (error) {
                console.error('Error fetching available params:', error);
            }
        };

        // Fetch the configuration to edit
        const fetchConfig = async () => {
            try {
                const configResponse = await fetch(`http://localhost:8001/api/configurations/${configName}`);
                if (!configResponse.ok) throw new Error('Failed to fetch configuration');
                const configData = await configResponse.json();
                setConfiguration(configData);
            } catch (error) {
                console.error('Error fetching configuration:', error);
            }
        };

        fetchParams();
        fetchConfig();
    }, [configName]);

    const handleEcuSelection = (ecu) => {
        setConfiguration((prev) => {
            let updatedEcus = prev.ecus;

            // If the ECU is already in the configuration
            if (prev.ecus.includes(ecu)) {
                // If it's deselected, re-enable it
                if (deselectedEcus.includes(ecu)) {
                    setDeselectedEcus((prevDeselected) =>
                        prevDeselected.filter((e) => e !== ecu)
                    );
                } else {
                    // Otherwise, add it to the deselected list
                    setDeselectedEcus((prevDeselected) => [...prevDeselected, ecu]);
                }
            } else {
                // If the ECU is not in the configuration, add it
                updatedEcus = [...prev.ecus, ecu];
            }

            return { ...prev, ecus: updatedEcus };
        });
    };

    const handleAddMessage = () => {
        if (!newMessage.sent_by || !newMessage.message_name || !newMessage.time) {
            alert('Please fill all fields for the message.');
            return;
        }
        setConfiguration((prev) => ({
            ...prev,
            messages: [
                ...prev.messages,
                {
                    ...newMessage,
                    time: parseInt(newMessage.time, 10),
                    data_length: parseInt(newMessage.data_length, 10)
                }
            ]
        }));
        setNewMessage({ time: '', sent_by: '', message_name: '', data_length: '', data: '' });
    };

    const handleUpdateConfig = async () => {
        try {
            // Filter out deselected ECUs and their messages before sending
            const updatedConfiguration = {
                ...configuration,
                ecus: configuration.ecus.filter((ecu) => !deselectedEcus.includes(ecu)),
                messages: configuration.messages.filter(
                    (msg) => !deselectedEcus.includes(msg.sent_by)
                )
            };

            const response = await fetch(`http://localhost:8001/api/configurations/${configName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedConfiguration)
            });
            if (!response.ok) throw new Error('Failed to update configuration');
            alert('Configuration updated successfully!');
            onClose(); // Close the popup
        } catch (error) {
            console.error('Error updating configuration:', error);
            alert('Failed to update configuration.');
        }
    };

    if (!availableParams || !configuration) {
        return <div>Loading...</div>;
    }

    const activeMessages = newMessage.sent_by
        ? availableParams.available_messages.filter((msg) =>
              availableParams.available_ecus[newMessage.sent_by]?.messages_it_can_send.includes(
                  msg.id
              )
          )
        : [];

    return (
        <div className={styles.popup}>
            <h2>Edit Configuration</h2>
            <form onSubmit={(e) => e.preventDefault()}>
                {/* Configuration Name */}
                <label>
                    Configuration Name:
                    <input
                        type="text"
                        value={configuration.configuration_name}
                        onChange={(e) =>
                            setConfiguration({ ...configuration, configuration_name: e.target.value })
                        }
                    />
                </label>

                {/* Select ECUs */}
                <div>
                    <h3>Select ECUs</h3>
                    {availableParams.available_names.map((ecu) => (
                        <div key={ecu}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={
                                        configuration.ecus.includes(ecu) &&
                                        !deselectedEcus.includes(ecu)
                                    }
                                    onChange={() => handleEcuSelection(ecu)}
                                />
                                {ecu}
                            </label>
                        </div>
                    ))}
                </div>

                {/* Add Messages */}
                <div>
                    <h3>Add Messages</h3>
                    <label>
                        Sent By:
                        <select
                            value={newMessage.sent_by}
                            onChange={(e) =>
                                setNewMessage({ ...newMessage, sent_by: e.target.value })
                            }
                        >
                            <option value="">Select ECU</option>
                            {configuration.ecus
                                .filter((ecu) => !deselectedEcus.includes(ecu))
                                .map((ecu) => (
                                    <option key={ecu} value={ecu}>
                                        {ecu}
                                    </option>
                                ))}
                        </select>
                    </label>
                    {newMessage.sent_by && (
                        <>
                            <label>
                                Message Name:
                                <select
                                    value={newMessage.message_name}
                                    onChange={(e) =>
                                        setNewMessage({ ...newMessage, message_name: e.target.value })
                                    }
                                >
                                    <option value="">Select Message</option>
                                    {activeMessages.map((msg) => (
                                        <option key={msg.id} value={msg.name}>
                                            {msg.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Time:
                                <input
                                    type="number"
                                    value={newMessage.time}
                                    onChange={(e) =>
                                        setNewMessage({ ...newMessage, time: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Data Length:
                                <input
                                    type="number"
                                    value={newMessage.data_length}
                                    onChange={(e) =>
                                        setNewMessage({
                                            ...newMessage,
                                            data_length: parseInt(e.target.value, 10)
                                        })
                                    }
                                />
                            </label>
                            <label>
                                Data:
                                <input
                                    type="text"
                                    value={newMessage.data}
                                    onChange={(e) =>
                                        setNewMessage({ ...newMessage, data: e.target.value })
                                    }
                                />
                            </label>
                            <button type="button" onClick={handleAddMessage} className={styles.button_edit}>
                                Add Message
                            </button>
                        </>
                    )}
                    <div>
                        <strong>Added Messages:</strong>
                        <ul>
                            {configuration.messages
                                .filter((msg) => !deselectedEcus.includes(msg.sent_by)) // Hide messages for deselected ECUs
                                .map((msg, index) => (
                                    <li key={index}>
                                        {msg.message_name} (Sent by: {msg.sent_by}, Time: {msg.time},
                                        Data Length: {msg.data_length}, Data: {msg.data})
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>

                {/* Update Button */}
                <button type="button" onClick={handleUpdateConfig} className={styles.button_edit}>
                    Update Configuration
                </button>
                <button type="button" onClick={onClose} className={styles.button_edit}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default EditPopup;
