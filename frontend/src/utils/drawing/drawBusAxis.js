const drawBusAxis = (p5, width, height, padding) => {
    p5.strokeWeight(1.5);
    p5.background(255);
    //origin will be at x = 20 and y = height - 20 (padding 20)
    //the height will be height - 40 and width width - 40

    //x axis
    p5.line(padding, height - padding, padding, padding);
    //y axis
    p5.line(padding, height - padding, width - padding, height - padding);

    //vertical arrow
    p5.line(padding, padding, padding - 5, padding + 10);
    p5.line(padding, padding, padding + 5, padding + 10);

    //horizontal arrow
    p5.line(width - padding, height - padding, width - padding - 10, height - padding - 5);
    p5.line(width - padding, height - padding, width - padding - 10, height - padding + 5);

    p5.fill(0);
    //draw voltage label (vertical axis)
    p5.strokeWeight(1);
    p5.textSize(20);
    p5.text("V", 0, 20);

    //draw time label (horizontal axis)
    p5.text("T", width - 20, height);

    //draw ticks for 5 voltage values
    const tickSize = 5;
    for(let i = 1; i <= 5; i++) {
        let y = p5.map(i, 0, 5, height - padding, 3 * padding);

        p5.text(`${i}`, 0, y + 5);
        p5.line(padding - tickSize, y, padding, y);
    }
}

export default drawBusAxis;