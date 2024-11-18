import Sketch from 'react-p5';
import styles from './Bus.module.css';
import { useRef } from 'react';
import { drawBusAxis } from '../../utils/index';


const Bus = ({ busState }) => {
    const initialized = useRef(false);
    const width = 350;
    const height = 250;

    const setup = (p5, canvasParentRef) => {
        if(!initialized.current) {
            p5.createCanvas(width, height).parent(canvasParentRef);
            
            initialized.current = true;
        } else {
            p5.remove();
        }
    }


    let lastTime = 0;
    let currentTime = 0;
    let x = 0;
    const speed = 200;
    const padding = 20;

    const draw = (p5) => {
        p5.stroke(0);
        if (!lastTime) lastTime = p5.millis(); // Initialize on the first frame
        currentTime = p5.millis();
        const deltaTime = (currentTime - lastTime) / 1000; // Elapsed time in seconds
        lastTime = currentTime;
        
        x += speed * deltaTime;
        if( x > width - 2 * padding) x = width - 2 * padding;

        
        drawBusAxis(p5, width, height, padding);

        let canh;
        let canl;

        if(busState === "dominant") {
            canh = 3.5;
            canl = 1.5;
        } else {
            canh = 2.5;
            canl = 2.5;
        }

        let wireOffset = (busState === "recessive") ? 2 : 0;

        let yHigh = p5.map(canh, 0, 5, height - padding, 3 * padding);
        let yLow = p5.map(canl, 0, 5, height - padding, 3 * padding);

        p5.strokeWeight(3);
        p5.stroke(255, 165, 0);
        p5.line(padding, yHigh + wireOffset, padding + x, yHigh + wireOffset);
        p5.stroke(0, 150, 0);
        p5.line(padding, yLow - wireOffset, padding + x, yLow - wireOffset);
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>Bus State</div>
            <Sketch setup={setup} draw={draw} />
            <div className={styles.legend}>
                <div className={styles.canh}>
                    <p className={styles.text}>CAN_H</p>
                    <div className={`${styles.wire} ${styles.orange}`}></div>
                </div>
                <div className={styles.canl}>
                    <p className={styles.text}>CAN_L</p>
                    <div className={`${styles.wire} ${styles.green}`}></div>
                </div>
            </div>
        </div>
    );
}

export default Bus;