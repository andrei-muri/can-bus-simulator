import styles from './Popup.module.css';

const Popup = ({ onClose, children}) => {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <button className={styles.close} onClick={onClose}>x</button>
                {children}
            </div>
        </div>
    );
}

export default Popup;