import * as d3 from "https://cdn.skypack.dev/d3";

let table = null;
let inputDraw = null;
document.addEventListener("DOMContentLoaded", () => {
    table = document.getElementById('table');
    if(table != null) {
        BuildTableFromFile();
        document.querySelector("#graph-form").onclick = drawGraph;
    }

    {
        let input = document.getElementById('count-graph');
        if (input != null) {
            Epicycloid(15);
            input.oninput = () => Epicycloid(+input.value);
        }
    }
    {
        inputDraw = [document.getElementById('restrict-x-min'), document.getElementById('restrict-x-max')];
        if (inputDraw[0] !== null) {
            inputDraw[0].oninput = () => CheckDraw(0);
            inputDraw[1].oninput = () => CheckDraw(1);
            CheckDraw();
        }
    }
});

function CheckDraw(e) {
    if(inputDraw == null)
        return;
    const sim = document.getElementById("checkBox").checked;
    if(sim) {
        if(inputDraw[1].value < 5)
            inputDraw[1].value = 5;
        else
        if(inputDraw[0].value > -5)
            inputDraw[0].value = -5;

        if(e === 0) {
            inputDraw[1].value = - +inputDraw[0].value;
        } else {
            inputDraw[0].value = - +inputDraw[1].value;
        }
    } else {
        if (+inputDraw[0].value >= +inputDraw[1].value) {
            if (e === 0) {
                inputDraw[0].value = +inputDraw[1].value - +inputDraw[0].step;
            } else {
                inputDraw[1].value = +inputDraw[0].value + +inputDraw[1].step;
            }
        }
    }
    document.getElementById("values").textContent = `${inputDraw[0].value} < x < ${inputDraw[1].value}`;
    DrawFunction(+inputDraw[0].value, +inputDraw[1].value);
}

function BuildTableFromFile() {
    d3.select("#table thead")
        .append("tr")
        .classed("table-secondary", true)
        .selectAll("th")
        .data(Object.keys(tableArray[0]))
        .join("th")
        .on("click", e => SortByTh(e.srcElement))
        .text(d => d);

    d3.select("#table tbody")
        .selectAll("tr")
        .data(tableArray)
        .join("tr")
        .selectAll("td")
        .data(d => Object.values(d))
        .join("td")
        .text(d => d);
}

function getArrGraph(arrObject, fieldX, fieldY) {
    let nest = d3.group(arrObject, d => d[fieldX]);

    let arrGroup = []; // массив объектов для построения графика
    nest._intern.forEach( name => {
        if(name === undefined) return;

        let minMax = d3.extent(nest.get(name).map(d => d[fieldY]));

        let elementGroup = {};
        elementGroup.labelX = name;
        elementGroup.valueMin = minMax[0];
        elementGroup.valueMax = minMax[1];

        arrGroup.push(elementGroup);
    });
    return arrGroup;
}

function ToSeconds(param) {
    param = param.split(':');
    return +param[0]*60 + +param[1];
}

function UnSeconds(param) {
    return Math.floor(param/60) + ":" + param%60;
}

function drawGraph() {
    const width = 600;
    const height = 400;

    let checkedX = document.querySelector('#graph-form input[name="axis-x"]:checked');
    let checkedY = document.querySelector('#graph-form input[name="axis-y"]:checked');
    if(checkedX === undefined || checkedX === null || checkedY === undefined || checkedY === null) return;
    let fieldY = checkedX.value; //Число
    let fieldX = checkedY.value;
    let func = (fieldY === "Включений за месяц") ? d => d : ToSeconds;
    let unFunc = (fieldY === "Включений за месяц") ? d => d : UnSeconds;
    if(fieldY === "Включений за месяц")
        func = d => d;
    else
        func = ToSeconds;

    let data = getArrGraph(tableArray, fieldX, fieldY);
    data.sort((x, y) => d3.ascending(x.labelX, y.labelX));

    let svg = d3.select("#graph");
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    //Масштабирование
    let scale_x = d3
        .scaleBand()
        .range([0,width])
        .domain(data.map(d => d.labelX));

    let scale_y = d3
        .scaleLinear()
        .range([height,0])
        .domain([d3.min(data, d => func(d.valueMin) - 1), d3.max(data, d => func(d.valueMax) + 1)]);

    let axisY = d3.axisLeft(scale_y)
        .tickFormat( (d) => unFunc(d));

    //Оси
    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate( 0," + height + ")")
        .call(d3.axisBottom(scale_x));

    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(axisY);

    let calcHeight = (d) => {
        let h = height - scale_y(func(d.valueMax)) + scale_y(func(d.valueMin)) - scale_y(min_value);
        if(h === 0)
            return 0;

        if(h < 5)
            h = 5;

        return h;
    }

    //Данные
    let min_value = d3.min(data, d => func(d.valueMin));
    svg.selectAll('.rec')
        .data(data, (item, index) => index)
        .join('rect')
        .attr('class','rec')
        .attr("x", d => scale_x(d.labelX))
        .attr("y", d => scale_y(func(d.valueMax)))
        .attr("width", scale_x.bandwidth())
        .attr("height", d => calcHeight(d));
}

function Epicycloid(count) {
    const accuracy = Math.PI*2 / count;
    if(accuracy === 0)
        return;

    d3.selectAll("#Epicycloid *").remove();
    const r = 14;
    const margin = r * 8;
    const k = 3;
    let x = fi => r * (k + 1) * (Math.cos(fi) - Math.cos((k + 1) * fi) / (k + 1));
    let y = fi => r * (k + 1) * (Math.sin(fi) - Math.sin((k + 1) * fi) / (k + 1));


    for(let fi = accuracy; fi/2 <= Math.PI; fi += accuracy) {
        d3.select("#Epicycloid")
            .append('circle')
            .attr("stroke", "white")
            .attr("fill", "blue")
            .attr("r", 7)
            .attr("cx", margin + x(fi))
            .attr("cy", margin + y(fi));

    }

    d3.select("#Epicycloid")
        .attr("height", margin*2)
        .attr("width", margin*2)
        .attr("viewBox", "0 0 " +  margin*2 + " " + margin*2);

}

function DrawAxis(L, R, size) {
    let svg = d3.select("#Axis");
    svg.selectAll("*").remove();

    const absSum = ( Math.abs(L) + Math.abs(R) );
    const yLimit = absSum;

    let scaleY = d3.scaleLinear().domain([-yLimit, yLimit]).range([0,yLimit]);
    let axisY = d3.axisLeft(scaleY);
    svg.append("g").call(axisY)
        .attr("transform", "translate(" + Math.abs(yLimit/2) + ", 0)")

    const mVal = Math.max(Math.abs(L),Math.abs(R));
    let scaleX = d3.scaleLinear().domain([-mVal, mVal]).range([0,absSum]);
    let axisX = d3.axisBottom(scaleX);
    svg.append("g").call(axisX)
        .attr("transform", "translate(" + 0 + ", " + Math.abs(yLimit/2) + ")")

    svg
        .attr("height", size)
        .attr("width", size)
        .attr("viewBox", "0 0 " +  absSum + " " + absSum)
        .attr("font-size", absSum/4);
}

function DrawFunction(LeftLim, RightLim) {
    const size = 600;

    d3.selectAll("#Function *").remove();
    let svg = d3.select("#Function");
    DrawAxis(LeftLim, RightLim, size);

    const absSum = ( Math.abs(LeftLim) + Math.abs(RightLim) );
    let step = absSum / 10000;
    if(step < 0.01)
        step = 0.01;

    const yLimit = absSum;

    const f = x => (4 - x) / (x ** 2 - 4) + yLimit/2;

    let path = d3.path();
    let skip = true;
    for(let x = LeftLim; x < RightLim; x += step) {
        let y = f(x);
        if (Math.abs(y) >= yLimit) {
            skip = true;
            continue;
        }

        if(skip) {
            path.moveTo(x + absSum/2, y);
            skip = false;
        } else {
            path.lineTo(x + absSum/2, y);
        }
    }

    svg
        .attr("height", size)
        .attr("width", size)
        .attr("viewBox", "0 0 " +  absSum + " " + absSum)
        .append("path")
        .attr("d", path)
}