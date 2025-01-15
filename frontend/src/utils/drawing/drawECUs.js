const availablePositions = [
    {x: 100, y: 100}, {x: 200, y: 100}, {x: 300, y: 100}, {x: 400, y: 100}, {x: 500, y: 100}, {x: 600, y: 100},
    {x: 150, y: 300}, {x: 250, y: 300}, {x: 350, y: 300}, {x: 450, y: 300}, {x: 550, y: 300}
]
const ECUSize = 60;
const drawECUs = (p5, busY, wireOffset, ecus, names, states, message_id, ecus_bits, data, message_type, message_description) => {
    
    const connectionOffset = 10;
    let positions = getPositions(ecus);
    positions.forEach(({x, y}, index) => {
        
        p5.fill("#219EBC");
        p5.stroke("#023047");
        p5.strokeWeight(1.25);
        p5.rect(x, y, ECUSize, ECUSize);

        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.strokeWeight(1.5);
        p5.fill(255);
        p5.text(names[index], x + ECUSize / 2 , y + ECUSize / 2);


        p5.strokeWeight(2.5);
        p5.stroke(255, 165, 0); 
        let connectionY = (y < busY) ? y + ECUSize + 1 : y - 1;
        p5.line(x + ECUSize / 2 - connectionOffset, connectionY, x + ECUSize / 2 - connectionOffset, busY - wireOffset);

        p5.stroke(0, 150, 0);
        p5.line(x + ECUSize / 2 + connectionOffset, connectionY, x + ECUSize / 2 + connectionOffset, busY + wireOffset);

        //arrows
        if(states[index] === "SENDING") {
            p5.strokeWeight(2.5);
            p5.stroke(255, 165, 0); 
            const arrowOffsetY = (y < busY) ? -10 : 10;
            p5.line(x + ECUSize / 2 - connectionOffset, busY - wireOffset, x + ECUSize / 2 - connectionOffset - 5, busY - wireOffset + arrowOffsetY); 
            p5.line(x + ECUSize / 2 - connectionOffset, busY - wireOffset, x + ECUSize / 2 - connectionOffset + 5, busY - wireOffset + arrowOffsetY); 
            p5.stroke(0, 150, 0);
            p5.line(x + ECUSize / 2 + connectionOffset, busY + wireOffset, x + ECUSize / 2 + connectionOffset - 5, busY + wireOffset + arrowOffsetY);
            p5.line(x + ECUSize / 2 + connectionOffset, busY + wireOffset, x + ECUSize / 2 + connectionOffset + 5, busY + wireOffset + arrowOffsetY);
        }

        //hovering state
        if(p5.mouseX >= x && p5.mouseX <= x + ECUSize && p5.mouseY >= y && p5.mouseY <= y + ECUSize) {
            hoverState(p5, x, y, states[index], message_id[index], ecus_bits[index], data[index], message_type[index], message_description[index]);
        }

        
    });
} 

const hoverState = (p5, x, y, state, message_id, ecus_bit, data, message_type, message_description) => {
    const padding_left = 10;
    const padding_top = 5;
    let textOffset = 5;
    const half = ECUSize / 2;
    const xHover = x - 1.75 * half;
    const yHover = y - 1.75 * half;
    const lineIncrement = 19;
    p5.stroke(0);
    p5.strokeWeight(1);
    p5.fill(255, 255, 255, 220);
    p5.rect(xHover, yHover, ECUSize + 4.5 * half, ECUSize + 3.5 * half);
    p5.fill(0);
    p5.strokeWeight(0.3);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(state, xHover + padding_left, yHover + textOffset + padding_top);
    textOffset += lineIncrement;
    if(state === "SENDING") {
        p5.text(`Msg id:${message_id}`, xHover + padding_left, yHover + textOffset);
        textOffset += lineIncrement;
        p5.text(`Bit:${ecus_bit}`, xHover + padding_left, yHover + textOffset);
        textOffset += lineIncrement;
        p5.text(`Data:${data}`, xHover + padding_left, yHover + textOffset);
        textOffset += lineIncrement;
        p5.text(`Msg type:${message_type}`, xHover + padding_left, yHover + textOffset);
        textOffset += lineIncrement;
    }
    p5.text(`${message_description}`, xHover + padding_left, yHover + textOffset);
}

const getPositions = (size) => {
    switch (size) {
        case 0:
            return [];
        case 1:
            return [availablePositions[2]];
        case 2:
            return [availablePositions[0], availablePositions[9]];
        case 3:
            return [availablePositions[0], availablePositions[4], availablePositions[8]];
        case 4:
            return [availablePositions[0], availablePositions[2], availablePositions[7], availablePositions[9]];
        case 5:
            return [availablePositions[0], availablePositions[2], availablePositions[4],availablePositions[7], availablePositions[9]];
        case 6:
            return availablePositions.filter((_, index) => index % 2 === 0);
        case 7:
            const positions = availablePositions.filter((_, index) => index % 2 === 0);
            positions.push(availablePositions[5])
            return positions;
        case 8:
            return availablePositions.filter((_, index) => (index !== 2 && index !== 5 && index !== 8));
        case 9:
            return availablePositions.filter((_, index) => (index !== 2 && index !== 8));
        case 10:
            return availablePositions.filter((_, index) => (index !== 8));
        case 11:
            return availablePositions;
        default: 
            return [];
    }
}

export default drawECUs;