import { useState } from 'react';
import styles from './ControlPopup.module.css';

const ControlPopup = ({ ecuList, time, setSim, onClose, selectedConfigName, setSimSize}) => {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null); 

    const handleSendMessage = async (ecu) => {
        setLoading(ecu); 
        setError(null); 

        try {
            // Make the API call to send the message and get the updated simulation result
            const response = await fetch(`http://localhost:8001/api/simulation/ecu-result?ecu=${ecu}&time=${time}&configName=${selectedConfigName}`);
            if (!response.ok) {
                throw new Error(`Failed to send message for ${ecu}: ${response.statusText}`);
            }

            const simResult = await response.json();

            // Update the simulation state with the result
            setSim(simResult);
            setSimSize(simResult.times.length);
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(null); // Clear loading state
        }
        onClose();
    };

    return (
        <div className={styles.container}>
            <h3>Control Popup</h3>
            {error && <p className={styles.error}>{error}</p>} 
            {ecuList.map((ecu) => (
                <button
                    key={ecu}
                    className={styles.ecuButton}
                    onClick={() => handleSendMessage(ecu)}
                    disabled={loading === ecu} // Disable button if it's loading
                >
                    {loading === ecu ? `Sending ${ecu}'s message...` : `Send ${ecu}'s message`}
                </button>
            ))}
        </div>
    );
};

export default ControlPopup;

