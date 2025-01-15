import { useState, useEffect } from 'react';
import styles from './AddPopup.module.css';

const AddPopup = () => {
    const [availableParams, setAvailableParams] = useState(null);
    const [configuration, setConfiguration] = useState({
        configuration_name: '',
        ecus: [],
        messages: []
    });

    const [newMessage, setNewMessage] = useState({
        time: '',
        sent_by: '',
        message_name: '',
        data_length: '',
        data: ''
    });

    useEffect(() => {
        // Fetch available params from the backend
        const fetchParams = async () => {
            try {
                const response = await fetch('http://localhost:8001/api/available-params');
                if (!response.ok) {
                    throw new Error('Failed to fetch available parameters');
                }
                const data = await response.json();
                setAvailableParams(data);
            } catch (error) {
                console.error('Error fetching available params:', error);
            }
        };
        fetchParams();
    }, []);

    const handleEcuSelection = (ecu) => {
        setConfiguration((prev) => {
            const updatedEcus = prev.ecus.includes(ecu)
                ? prev.ecus.filter((e) => e !== ecu) // Uncheck
                : [...prev.ecus, ecu]; // Check
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
            messages: [...prev.messages, { ...newMessage, time: parseInt(newMessage.time, 10) , data_length: parseInt(newMessage.data_length, 10)}]
        }));
        setNewMessage({ time: '', sent_by: '', message_name: '', data_length: '', data: '' });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8001/api/configurations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configuration)
            });
            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }
            alert('Configuration saved successfully!');
        } catch (error) {
            console.error('Error saving configuration:', error);
            alert('Failed to save configuration.');
        }
    };

    if (!availableParams) {
        return <div>Loading...</div>;
    }

    // Get active messages for selected ECUs
    const activeMessages = newMessage.sent_by
        ? availableParams.available_messages.filter((msg) =>
              availableParams.available_ecus[newMessage.sent_by]?.messages_it_can_send.includes(
                  msg.id
              )
          )
        : [];

    return (
        <div className={styles.popup}>
            <h2>Create New Configuration</h2>
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
                                    checked={configuration.ecus.includes(ecu)}
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
                            {configuration.ecus.map((ecu) => (
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
                                        setNewMessage({ ...newMessage, data_length: e.target.value })
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
                            <button type="button" onClick={handleAddMessage}>
                                Add Message
                            </button>
                        </>
                    )}
                    <div>
                        <strong>Added Messages:</strong>
                        <ul>
                            {configuration.messages.map((msg, index) => (
                                <li key={index}>
                                    {msg.message_name} (Sent by: {msg.sent_by}, Time: {msg.time}, Data
                                    Length: {msg.data_length}, Data: {msg.data})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Submit */}
                <button type="button" onClick={handleSubmit}>
                    Save Configuration
                </button>
            </form>
        </div>
    );
};

export default AddPopup;
