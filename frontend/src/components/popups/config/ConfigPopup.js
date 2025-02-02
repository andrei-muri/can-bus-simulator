import styles from './ConfigPopup.module.css';

const ConfigPopup = ({onSelect, onEdit, onAdd}) => {
    return (
        <div className={styles.container}>
            <button onClick={onSelect}>SELECT CONFIG</button>
            <button onClick={onEdit}>EDIT CONFIG</button>
            <button onClick={onAdd}>ADD CONFIG</button>
        </div>
    );
}

export default ConfigPopup;