import styles from './Arbitration.module.css'

const Arbitration = ({ arbitration_data }) => {
    const {ecus_msgs, message} = arbitration_data;
    return (
        <div className={styles.container}>
            <div className={styles.title}>Arbitration</div>
            <div className={styles.ecusContainer}>
                {
                    (ecus_msgs || []).map((ecu, index) => (
                        <div key={index} className={styles.item}>
                            <div className={styles.ecuName}>{ecu.name}</div>
                            <div className={styles.ecuBit}>{ecu.bit}</div>
                        </div>
                    ))
                }
            </div>
            <div className={styles.message}>{message}</div>
        </div>
    );
}

export default Arbitration;