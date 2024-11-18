import styles from './Logger.module.css';

const Logger = ({ logMessages = [] }) => {

    return (
        <div className={styles.container}>
            <div className={styles.logger}>
                <div className={styles.title}>CAN LOGGER</div>
                <div className={styles.content}>
                    {
                        (logMessages || []).map((msg, index) => (
                            <p key={index} class={styles.logMessage}>{msg}</p>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default Logger;