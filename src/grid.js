import DataLoader from './data-loader.js';
import drawBoard from './table-grid.js';
import PivotTable from './pivot-table.js';
import mergerow from './merge-row.js';
import mergecol from './merge-column.js';
import transformTable from './transform-table.js'
import { observable, Reaction, autorun } from 'mobx';

class Grid {

    //initialising contructor for class Grid
    constructor(canvasId) {

        //Initialising a flag to stop the user form re-pivoting if once pivoted the Table.
        this.pivotFlag = 0;

        //Initialising a flag to stpo the user from pivoting if rowa and columns are merged.
        this.mergeFlag = 0;

        //Initializing data array
        this.data = [];

        //Defining an array to save the state of Row
        this.previousStateArray = [];

        //Defining an array to save the state of Column
        this.previousColumnStateArray = [];

        // Obtaining a reference to the canvas element.
        this.canvas = document.getElementById(canvasId);

        // Obtaining a 2D context from the canvas element.
        this.context = this.canvas.getContext("2d");

        //to control the transparency of the table
        this.context.globalAlpha = 1; // can be change later on by passing the parameter by User.

        //Initialisind d3 array to render a chart based on CSV data provided
        this.d3Array = [];
        this.chartArray = [];

    }

    //to convert the  CSV Data into JSON
    getData(csv) {

        //Creating new object of Dataloader class
        const jsonData = new DataLoader();

        console.log("JSON data Object: ", jsonData);

        //Contains JSON converted Data from CSV
        observable(this.data = JSON.parse(jsonData.CSV2JSON(csv)));

        //AutoRun in Mobx
        autorun(() => this.render());

    }

    //to render table in Canvas
    render() {

        console.log("JSON converted Data from CSV: ", this.data);

        //pivot flag variable
        this.pivotFlag = 0;

        //merge Flag variable
        this.mergeFlag = 0;

        //Logic to create a table
        const bw = (Object.keys(this.data[0]).length) * 200; //Calculating Border Width
        const bh = (this.data.length + 1) * 40; // Calculating Border Height
        const p = 10; //margin

        //to resize Canvas
        this.context.canvas.width = bw + 11;
        this.context.canvas.height = bh + 11;

        //to scale the Canvas to fit into the canvas size
        this.context.scale(.80, .60);

        //calling drawBoard function.
        drawBoard(this.context, this.canvas, bw, bh, p, this.data)

        //To save the context of Canvas into Stack.
        this.context.save();

        return "Grid Table created";
    }

    //to pivot the table in Canvas
    pivot(...params) {

        if (this.pivotFlag == 0 && this.mergeFlag == 0) {
            if (params.length < 3) {
                return "Please pass all the required Arguments"
            }
            else {

                //Instantiating object for Pivoting table
                let pivot = new PivotTable(this.data, params);

                //calling renderPivotTable function from pivot object
                pivot.renderPivotTable(this.context, this.canvas, this.data);

                //pivot flag variable
                this.pivotFlag = 1;

                return "Grid table Pivoted";
            }
        }
        else {
            return "Sorry! you have already pivoted the Table or have merged the columns or rows. Please Rerender the Original table to Pivot Again."
        }

    }

    //to merge Rows...
    mergeRow(...rowParams) {

        if (this.pivotFlag == 0) {
            if (rowParams.length < 3) {
                return "Please pass all the required Arguments"
            }
            else {

                this.mergeFlag = 1;
                const bw = (Object.keys(this.data[0]).length) * 200; //Calculating Border Width
                const bh = (this.data.length + 1) * 40; // Calculating Border Height
                const p = 10; //margin

                observable(rowParams)

                autorun(() => mergerow(rowParams[0], rowParams[1], rowParams[2], bh, bw, p, this.context, this.canvas, this.data, this.previousStateArray)
                )

            }
        }
        else {
            return "Sorry! you have already pivoted the Table. Please Rerender the Original table to Merge Rows."
        }


    }

    //to merge Columns...
    mergeColumn(...colParams) {

        if (this.pivotFlag == 0) {
            if (colParams.length < 3) {
                return "Please pass all the required Arguments"
            }
            else {

                this.mergeFlag = 1;
                const bw = (Object.keys(this.data[0]).length) * 200; //Calculating Border Width
                const bh = (this.data.length + 1) * 40; // Calculating Border Height
                const p = 10; //margin

                observable(colParams)

                autorun(() => mergecol(colParams[0], colParams[1], colParams[2], bh, bw, p, this.context, this.canvas, this.data, this.previousColumnStateArray)
                )

            }
        }
        else {
            return "Sorry! you have already pivoted the Table. Please Rerender the Original table to Merge Columns."
        }


    }

    //to render d3 chart from CSV data
    getD3Data() {

        let tempArray = this.data.slice();

        for (let i = 0; i < tempArray.length;) {
            let count = 1;
            let str = (tempArray[i]["Name"]).split(" ")[0];

            for (let j = i + 1; j < tempArray.length; j++) {
                let compstr = (tempArray[j]["Name"]).split(" ")[0];

                if (str.localeCompare(compstr) == 0) {
                    count++;
                    tempArray.splice(j, 1);
                }
            }
            let tempElement = {
                name: str,
                count: count
            }

            this.d3Array.push(tempElement);
            tempArray.splice(0, 1);
            i = 0;
        }

        for (let i = 0; i < this.d3Array.length;) {
            let count = this.d3Array[i]["count"];
            let str = (this.d3Array[i]["name"]);
            for (let j = i + 1; j < this.d3Array.length; j++) {
                let compstr = (this.d3Array[j]["name"]);
                if (str.localeCompare(compstr) == 0) {
                    count = count + this.d3Array[j]["count"];
                    this.d3Array.splice(j, 1);
                }
            }
            let tempElement = {
                name: str,
                count: count
            }
            this.chartArray.push(tempElement);
            this.d3Array.splice(0, 1);
            i = 0;
        }

        console.log("new d3 array: ", this.chartArray);

    }

    //to create d3 chart
    createChart() {
        console.log("Original Array: ", this.data);
        let json = this.chartArray.slice();
        let fields = Object.keys(json[0])
        let replacer = function (key, value) { return value === null ? '' : value }
        let csv = json.map(function (row) {
            return fields.map(function (fieldName) {
                return JSON.stringify(row[fieldName], replacer)
            }).join('   ')
        });
        let csvData = csv.unshift(fields.join('   ')) // add header column
        csvData = csv.join('\r\n');
        console.log(csvData);
        let grid = this;

        let svg = d3.select("svg"),
            margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom;

        let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
            y = d3.scaleLinear().rangeRound([height, 0]);

        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        d3.tsv("./data.tsv", function (d) {
            d.count = +d.count;
            return d;
        }, function (error, data) {

            if (error) throw error;

            x.domain(data.map(function (d) { return d.name; }));
            y.domain([0, d3.max(data, function (d) { return d.count; })]);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(10))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("count");

            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return x(d.name); })
                .attr("y", function (d) { return y(d.count); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return height - y(d.count); })
                .attr("fill", "#89B1F0")
                .on("click", function (d, i) {

                    let children = this.parentNode.childNodes;
                    for (let c = 2; c < children.length - 2; c++) {
                        if ((c - 2) == i) {
                            d3.select(children[c]).attr("fill", "#684677")
                        }
                        else {
                            d3.select(children[c]).attr("fill", "#89B1F0")
                        }
                    }
                    grid.filterCanvas(d);
                })
                .on("dblclick", function () {
                    d3.select(this)
                        .attr("fill", "#89B1F0");
                    grid.restoreCanvas();
                })

            // to add titles to the axes
            g.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + (-30) + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text("Car Variants");

            g.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + (width / 2) + "," + (height + 80) + ")")  // centre below axis
                .text("Car Companies");
        });

    }

    //filter the Canvas 
    filterCanvas(d) {
        //To clear the canvas before drawing or redrawing the Table
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const bw = (Object.keys(this.data[0]).length) * 200; //Calculating Border Width
        const bh = (this.data.length + 1) * 40; // Calculating Border Height
        const p = 10; //margin
        transformTable(this.context, this.canvas, bw, bh, p, d, this.data);
    }

    //to restore the canvas
    restoreCanvas() {
        //To restore the canvas
        this.render();
    }
}

export default Grid;