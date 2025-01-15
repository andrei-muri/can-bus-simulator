import styles from './Buttons.module.css';

const Buttons = ({ functions, autoplay, simSize }) => {
    const { onSelect, onEdit, onConfig, onAdd, onStart, onNext, onControl, onAutoplay } = functions;
    return (
        <div className={styles.container}>
            <button onClick={onConfig}>CONFIG MENU</button>
            <button onClick={onControl} disabled={simSize === 0}>CONTROL MENU</button>
            <button onClick={onStart}>START SIMULATION</button>
            <button className={styles.next} onClick={onAutoplay} disabled={simSize === 0}>AUTOPLAY {autoplay ? "OFF" : "ON"}</button>
            <button className={styles.next} onClick={onNext} disabled={autoplay || simSize === 0}>NEXT STEP</button>
        </div>
    );
}

export default Buttons;