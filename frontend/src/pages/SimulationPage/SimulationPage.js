import { Arbitration, Bus, Buttons, Logger, Nav, Wireframe, Results, Popup, SelectPopup, EditPopup, AddPopup, StartPopup, ConfigPopup, ControlPopup } from '../../components';
import styles from './SimulationPage.module.css';
import { useState, useEffect } from 'react';
import { defaultSim } from '../../data';
import { extractingLogMessages, extractingResults, extractingBusState, extractingArbitration, extractingWireframe } from '../../utils';

const SimulationPage = () => {
    
    const [time, setTime] = useState(0);
    const [simSize, setSimSize] = useState(defaultSim.times.length);
    const [sim, setSim] = useState(defaultSim);

    const [selectedConfigName, setSelectedConfigName] = useState("configuration1.json");

    useEffect(() =>{
        console.log(selectedConfigName);
    }, [selectedConfigName])

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupContent, setPopupContent] = useState(null);

    const [autoplay, setAutoplay] = useState(false);

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const handleOpenPopup = (Child) => {
        setPopupContent(Child);
        setIsPopupOpen(true);
    }

    useEffect(() => {
        let interval;
        if (autoplay) {
            interval = setInterval(() => {
                setTime((prev) => (prev + 1) % simSize);
            }, 1300);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoplay, simSize]);

    

    const functions = {
        onSelect: () => handleOpenPopup(<SelectPopup selectedConfigName={selectedConfigName} setSelectedConfigName={setSelectedConfigName} onClose={handleClosePopup}/>),
        onEdit: () => handleOpenPopup(<EditPopup configName={selectedConfigName} onClose={handleClosePopup}/>), 
        onAdd: () => handleOpenPopup(<AddPopup />),
        onConfig: () => handleOpenPopup(<ConfigPopup onSelect={functions.onSelect} onEdit={functions.onEdit} onAdd={functions.onAdd}/>),
        onControl: () => handleOpenPopup(
            <ControlPopup ecuList={sim.ecus_meta.names} time={time} setSim={setSim} onClose={handleClosePopup} selectedConfigName={selectedConfigName} setSimSize={setSimSize}/>),
        onStart: () => handleOpenPopup(<StartPopup setSim={setSim} setSimSize={setSimSize} onClose={handleClosePopup} selectedConfigName={selectedConfigName} setTime={setTime}/>),
        onAutoplay: () => setAutoplay((prev) => !prev), 
        onNext: () => setTime(prev => (prev + 1) % simSize)
    };

    return (
        <div className={styles.page}>
            <Nav />
            <Wireframe wireframeData={extractingWireframe(sim, time)}/>
            <Bus busState={extractingBusState(sim, time)}/>
            <Arbitration arbitration_data={extractingArbitration(sim, time)}/>
            <Buttons functions={functions} autoplay={autoplay} simSize={simSize}/>
            <Logger logMessages={extractingLogMessages(sim, time)}/>
            <Results results={extractingResults(sim)}/>
            {isPopupOpen && <Popup isOpen={isPopupOpen} onClose={handleClosePopup}>
                {popupContent}
            </Popup>}
        </div>
    );
}

export default SimulationPage;