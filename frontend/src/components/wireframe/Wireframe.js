import Sketch from 'react-p5';
import { useRef, useState } from 'react';
import styles from './Wireframe.module.css';
import wirframeImg from "../../resources/images/car.png";
import absImg from "../../resources/images/abs.png";
import espImg from "../../resources/images/esp.png";
import shortLightImg from "../../resources/images/short-light.png";
import longLightImg from "../../resources/images/long-light.png";
import { drawWires, drawECUs } from '../../utils/index';


const Wireframe = ({ wireframeData }) => {
    const {configuration, time, names, ecus, states, message_id, ecus_bits, data, message_type, message_description} = wireframeData;
    const carRef = useRef(null); 
    const absRef = useRef(null);
    const espRef = useRef(null);
    const shortLightRef = useRef(null);
    const longLightRef = useRef(null);
    const initialized = useRef(false); 
    const imageSize = useRef({ width: 0, height: 0 }); 
    const absImageSize = useRef({ width: 0, height: 0 }); 
    const espImageSize = useRef({ width: 0, height: 0 }); 
    const shortImageSize = useRef({ width: 0, height: 0 }); 
    const longImageSize = useRef({ width: 0, height: 0 }); 
    const scaleFactor = 1.25;
    const scaleFactorMartors = 0.15;

    const [isAbsOn, setIsAbsOn] = useState(false);
    const [isEspOn, setIsEspOn] = useState(false); 
    const [isShortLightOn, setIsShortLightOn] = useState(false);
    const [isLongLightOn, setIsLongLightOn] = useState(false);
    let toggled = useRef(false);

    const setup = (p5, canvasParentRef) => {
        if (!initialized.current) { 
            carRef.current = p5.loadImage(wirframeImg, (img) => {
                imageSize.current = { width: img.width, height: img.height };
                p5.createCanvas(imageSize.current.width * scaleFactor, imageSize.current.height * scaleFactor).parent(canvasParentRef);
            });

            absRef.current = p5.loadImage(absImg, (img) => {
                absImageSize.current = { width: img.width, height: img.height };
            });

            espRef.current = p5.loadImage(espImg, (img) => {
                espImageSize.current = { width: img.width, height: img.height };
            });

            shortLightRef.current = p5.loadImage(shortLightImg, (img) => {
                shortImageSize.current = { width: img.width, height: img.height };
            });

            longLightRef.current = p5.loadImage(longLightImg, (img) => {
                longImageSize.current = { width: img.width, height: img.height };
            });
            
            
            initialized.current = true;
        } else {
            p5.remove();
        }
    };
    let scaledWidth = 0;
    let scaledHeight = 0;
    const wireOffset = 10;
    const padding = 60;
    const draw = (p5) => {
        p5.background("#ffffff");
        
        if (carRef.current) {
            scaledWidth = imageSize.current.width * scaleFactor;
            scaledHeight = imageSize.current.height * scaleFactor;
            p5.image(carRef.current, 0, 0, scaledWidth, scaledHeight);
        }
        let absIndex = -1;
        if(names.includes("ABS")) {
            absIndex = names.indexOf("ABS");
        }
       
        if(names.includes("ABS") && states[absIndex] === "PROCESSING" && message_description[absIndex] === "ABS on") {
            setIsAbsOn(true);
        }

        if(names.includes("ABS") && states[absIndex] === "PROCESSING" && message_description[absIndex] === "ABS off") {
            setIsAbsOn(false);
        }

        if (names.includes("ABS") && absRef.current && isAbsOn) {
            p5.image(absRef.current, 100, 0, imageSize.current.width * scaleFactorMartors * 0.9, imageSize.current.height * scaleFactorMartors);
        }


        let espIndex = -1;
        if (names.includes("ESP")) {
            espIndex = names.indexOf("ESP");
        }

        if (names.includes("ESP") && states[espIndex] === "PROCESSING" && message_description[espIndex] === "ESP on") {
            setIsEspOn(true);
        }

        if (names.includes("ESP") && states[espIndex] === "PROCESSING" && message_description[espIndex] === "ESP off") {
            setIsEspOn(false);
        }

        if (names.includes("ESP") && espRef.current && isEspOn) {
            p5.image(espRef.current, 200, 0, imageSize.current.width * scaleFactorMartors * 0.9, imageSize.current.height * scaleFactorMartors);
        }

        // Short Light Logic
        let shortLightIndex = -1;
        if (names.includes("LCM")) {
            shortLightIndex = names.indexOf("LCM");
        }

        if (names.includes("LCM") && states[shortLightIndex] === "PROCESSING" && message_description[shortLightIndex] === "Lights on") {
            setIsShortLightOn(true);
        }

        if (names.includes("LCM") && states[shortLightIndex] === "PROCESSING" && message_description[shortLightIndex] === "Lights off") {
            setIsShortLightOn(false);
            setIsLongLightOn(false);
        }

        if (names.includes("LCM") && states[shortLightIndex] === "PROCESSING" && message_description[shortLightIndex] === "Toggle lights mode" && !toggled.current) {
            if(isShortLightOn) {
                setIsShortLightOn(false);
                setIsLongLightOn(true);
            } else if(isLongLightOn) {
                setIsShortLightOn(true);
                setIsLongLightOn(false);
            }
            toggled.current = true;
        }

        if (names.includes("LCM") && shortLightRef.current && isShortLightOn) {
            p5.image(shortLightRef.current, 300, 0, imageSize.current.width * scaleFactorMartors * 0.9, imageSize.current.height * scaleFactorMartors);
        }


        if (names.includes("LCM") && longLightRef.current && isLongLightOn) {
            p5.image(longLightRef.current, 400, 0, imageSize.current.width * scaleFactorMartors * 0.9, imageSize.current.height * scaleFactorMartors);
        }


        p5.fill(0);
        p5.strokeWeight(0.3);
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.text(`Playing ${configuration}`, scaledWidth - padding * 3.75, scaledHeight - padding);
        p5.text(`Time: ${time}`, scaledWidth - padding * 3.75, scaledHeight - padding / 2);
        let busY = drawWires(p5, scaledWidth, scaledHeight, wireOffset, padding);
        drawECUs(p5, busY, wireOffset, ecus, names, states, message_id, ecus_bits, data, message_type, message_description);
        
    }
    
    return (
        <div className={styles.container}>
            <Sketch setup={setup} draw={draw}/>
        </div>
    );
}

export default Wireframe;