import React, { useEffect } from 'react';
import styles from './StartPopup.module.css';
import { useFetch } from '../../../utils'; // Import the custom useFetch hook

const StartPopup = ({ setSim, setSimSize, onClose, selectedConfigName, setTime }) => {
    // Use the useFetch hook to fetch the simulation data
    const { data, loading, error } = useFetch(`http://localhost:8001/api/simulation/result?configName=${selectedConfigName}`);

    const handleStart = () => {
        if (data) {
            setSim(data); // Update the parent state with simulation data
            setSimSize(data.times.length); // Update the parent state with the simulation size
            console.log(data.times);
            setTime(0);
        }
        onClose();
    }; // Run effect whenever data changes

    // Conditional rendering
    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className={styles.error}>Error: {error}</p>;
    }

    return (
        <div className={styles.container}>
            <div>Selected Configuration: {selectedConfigName}</div>
            <button onClick={handleStart} className={styles.startButton}>
                START
            </button>
        </div>
        
    );
};

export default StartPopup;
