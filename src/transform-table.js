
export default function transformTable(context, canvas, bw, bh, p, d, data) {

    let count = 1;
    let tempArray = [];
    for (let i = 0; i < data.length; i++) {
        console.log("data name: ", (data[i]["Name"]).split(" ")[0]);
        console.log("d.name: ", d.name);
        console.log("i: ", i);
        let str = (data[i]["Name"]).split(" ")[0];
        if (str.localeCompare(d.name) == 0) {
            tempArray.push(data[i]);
            ++count;
        }
    }

    bh = count * 40;
    //Drawing rows outline on the table...
    for (var x = 0; x <= bw; x += 200) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
    }

    //Drawing column outline on the table...
    for (var x = 0; x <= bh; x += 40) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
    }

    //Setting properties for the border lines in the table drawn
    context.strokeStyle = "black";
    context.stroke();


    let keys = Object.keys(data[0]); // finding keys in each JSON object

    // To print the values of the Table Excluding Header...
    for (let y = 80, i = 0; y <= bh && i<tempArray.length; y += 40) {
        for (let x = 0, keyCount = 0; x < bw; x += 200) {
            context.font = "normal 16px Verdana";
            context.fillStyle = 'black';
            context.fillText((tempArray[i])[keys[keyCount]], 0.5 + x + p + 5, y);
            ++keyCount;
        }
        ++i;
    }

// //To Print the Header... 
for (let x = 0, keyCount = 0; x < bw; x += 200) {
    context.font = "bold 16px Verdana";
    context.fillStyle = 'black';
    context.fillText(keys[keyCount], 0.5 + x + p + 5, p + 25);
    ++keyCount;
}

//To clear extra rows and table in the column in canvas when table restructures.
context.clearRect(9, bh + 11, canvas.width, canvas.height)
context.clearRect(bw + 11, 9.5, canvas.width, canvas.height)

}
