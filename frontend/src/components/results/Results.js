import styles from './Results.module.css';

const Results = ({ results }) => {
    return (
        <div className={styles.container}>
            <div className={styles.panel}>
                <div className={styles.title}>SIM RESULTS</div>
                <div className={styles.content}>
                    {
                        Object.entries(results || {}).map(([key, value]) => (
                            <div key={key} className={styles.result}>
                                <strong>{key}</strong> : {value}
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default Results;