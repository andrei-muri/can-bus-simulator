const drawWires = (p5, width, height, wireOffset, padding) => {
    const middleY = height / 2;

    const resistorHeight = 40;
    const resistorWidth = 15;

    p5.strokeWeight(3);
    p5.stroke(255, 165, 0);
    p5.line(padding, middleY - wireOffset, width - padding, middleY - wireOffset);
    p5.stroke(0, 150, 0);
    p5.line(padding, middleY + wireOffset, width - padding, middleY + wireOffset);

    p5.noStroke();
    p5.fill(50);
    p5.rect(padding - resistorWidth, middleY - resistorHeight / 2, resistorWidth, resistorHeight);
    p5.rect(width - padding, middleY - resistorHeight / 2, resistorWidth, resistorHeight);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text("120Ω", padding - resistorWidth / 2, middleY + resistorHeight / 2 + 10);
    p5.text("120Ω", width - padding + resistorWidth / 2, middleY + resistorHeight / 2 + 10);

    return middleY;
}

export default drawWires;