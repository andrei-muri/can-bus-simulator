import { useState, useEffect } from 'react';
import styles from './SelectPopup.module.css';

const SelectPopup = ({ selectedConfigName, setSelectedConfigName, onClose }) => {
    const [configurations, setConfigurations] = useState([]);
    const [loadingConfigurations, setLoadingConfigurations] = useState(true);
    const [configurationsError, setConfigurationsError] = useState(null);

    const [selectedConfigDetails, setSelectedConfigDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState(null);

    const [localSelectedConfigName, setLocalSelectedConfigName] = useState(selectedConfigName);

    // Fetch available configurations on component mount
    useEffect(() => {
        const fetchConfigurations = async () => {
            setLoadingConfigurations(true);
            setConfigurationsError(null);
            try {
                const response = await fetch("http://localhost:8001/api/configurations");
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setConfigurations(data.configurations);
            } catch (err) {
                setConfigurationsError(err.message);
            } finally {
                setLoadingConfigurations(false);
            }
        };

        fetchConfigurations();
    }, []);

    // Fetch details of the selected configuration when selectedConfigName changes
    useEffect(() => {
        const fetchSelectedConfigDetails = async () => {
            if (!localSelectedConfigName) return;

            setLoadingDetails(true);
            setDetailsError(null);
            try {
                const response = await fetch(`http://localhost:8001/api/configurations/${localSelectedConfigName}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setSelectedConfigDetails(data);
            } catch (err) {
                setDetailsError(err.message);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchSelectedConfigDetails();
    }, [localSelectedConfigName]); // Triggered whenever localSelectedConfigName changes

    const handleSelectionChange = (configName) => {
        setSelectedConfigName(configName); // Update the parent state
        setLocalSelectedConfigName(configName); // Immediately update local state for the child
    };

    if (loadingConfigurations) {
        return <div>Loading configurations...</div>;
    }

    if (configurationsError) {
        return <div>Error fetching configurations: {configurationsError}</div>;
    }

    return (
        <div className={styles.container}>
            <form>
                <h3>Select a Configuration</h3>
                {configurations.map((configName) => (
                    <div key={configName} className={styles.radioOption}>
                        <input
                            type="radio"
                            id={configName}
                            name="configuration"
                            value={configName}
                            checked={localSelectedConfigName === configName} // Use local state for immediate feedback
                            onChange={() => handleSelectionChange(configName)} // Update both parent and local state
                        />
                        <label htmlFor={configName}>{configName}</label>
                    </div>
                ))}
            </form>

            {loadingDetails && <div>Loading configuration details...</div>}
            {detailsError && <div>Error loading configuration details: {detailsError}</div>}

            {selectedConfigDetails && (
                <div className={styles.details}>
                    <h4>Configuration Details</h4>
                    <p><strong>Name:</strong> {selectedConfigDetails.configuration_name}</p>
                    <h5>ECUs:</h5>
                    <ul>
                        {selectedConfigDetails.ecus.map((ecu, index) => (
                            <li key={index}>{ecu}</li>
                        ))}
                    </ul>
                    <h5>Messages:</h5>
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Sent By</th>
                                <th>Message Name</th>
                                <th>Data Length</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedConfigDetails.messages.map((message, index) => (
                                <tr key={index}>
                                    <td>{message.time}</td>
                                    <td>{message.sent_by}</td>
                                    <td>{message.message_name}</td>
                                    <td>{message.data_length}</td>
                                    <td>{message.data}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <button onClick={onClose}>OK</button>
        </div>
    );
};

export default SelectPopup;
