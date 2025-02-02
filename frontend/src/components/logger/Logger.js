import { useEffect, useRef } from 'react';
import styles from './Logger.module.css';

const Logger = ({ logMessages = [] }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [logMessages]);

    return (
        <div className={styles.container}>
            <div className={styles.panel}>
                <div className={styles.title}>CAN LOGGER</div>
                <div className={styles.content} ref={contentRef}>
                    {
                        logMessages.map((msg, index) => (
                            <p key={index} className={styles.logMessage}>{msg}</p>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Logger;
