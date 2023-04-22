let table;
let form;
let selectors;
let sortBtnArray;

document.addEventListener("DOMContentLoaded", () => {
    table = document.getElementById('table');
    BuildSortForm();
    BuildTableFromFile();
    InitToggleButton();
    document.querySelector("#graph-form").onclick = drawGraph;
});

function InitToggleButton() {
    let btn = document.getElementById("ToggleTable");
    btn.textContent = "Скрыть таблицу"
    table.hidden = false;
    btn.onclick = () => {
        if (table.hidden === false) {
            table.hidden = true;
            btn.textContent = "Показать таблицу"
        } else {
            table.hidden = false;
            btn.textContent = "Скрыть таблицу"
        }
    }
}

function BuildSortForm() {
    form = document.getElementById('sort-form');
    selectors = form.querySelectorAll('select');
    sortBtnArray = form.querySelectorAll('input[type=button]');
    selectors.forEach ( s => {
        s.addEventListener('change', function(){
            if(s === selectors[0]) {
                if(s.value === '0') {
                    selectors[1].value = '0';
                    selectors[2].value = '0';
                    selectors[1].disabled = true;
                    selectors[2].disabled = true;
                } else {
                    selectors[1].disabled = false;
                }
            }
            
            if(s === selectors[1]) {
                if(s.value === '0') {
                    selectors[2].value = '0';
                    selectors[2].disabled = true;
                } else {
                    selectors[2].disabled = false;
                }
            }

            selectors.forEach( selector => {
                //All active
                for(let i = 0; i < selector.options.length; i++)
                    selector.options[i].disabled = false;
                
                //Block selected
                selector.options[parseInt(selectors[0].value)].disabled = true;
                selector.options[parseInt(selectors[1].value)].disabled = true;
                selector.options[parseInt(selectors[2].value)].disabled = true;

                //Enable first
                selector.options[0].disabled = false;
            });
        });
    });

    sortBtnArray.forEach(btn => {
        btn.onclick = () => {
            btn.value = (btn.value === 'По возрастанию') ? 'По убыванию' : 'По возрастанию';
        };
    });
}

const getCellValue = (tr, col) => tr.children[col] ? (tr.children[col].innerText || tr.children[col].textContent) : '';

const comparer = (asc1, col1, asc2=null, col2=null, asc3=null, col3=null) => 
        (a, b) => ((c11, c12, c21, c22, c31, c32) => c11.toString().localeCompare(c12) 
        || c21.toString().localeCompare(c22)
        || c31.toString().localeCompare(c32))
    (getCellValue(asc1 ? a : b, col1), getCellValue(asc1 ? b : a, col1), 
    getCellValue(asc2 ? a : b, col2), getCellValue(asc2 ? b : a, col2),
    getCellValue(asc3 ? a : b, col3), getCellValue(asc3 ? b : a, col3))

function SortByTh(th) {
    CustomSort( this.asc = !this.asc, Array.from(th.parentNode.children).indexOf(th));
}

function CustomSort(asc1, l1, asc2=null, l2=null, asc3=null, l3=null) {
    let tbody = table.getElementsByTagName('tbody')[0];
    Array.from(tbody.querySelectorAll('tr'))
        .sort(comparer(asc1, l1, asc2, l2, asc3, l3))
        .forEach(tr => tbody.appendChild(tr));
}

function SortByForm(e) {
    if(selectors[0].value === '0')
        return false;
    
    CustomSort(sortBtnArray[0].value[3] === 'в', +selectors[0].value-1,
    sortBtnArray[1].value[3] === 'в', selectors[1].value === '0' ? null : +selectors[1].value - 1,
    sortBtnArray[2].value[3] === 'в', selectors[2].value === '0' ? null : +selectors[2].value - 1);
    return false;
}

function FilterByForm(e) {
    e.preventDefault();
    let arr = {};
    arr = table.getElementsByTagName('tbody')[0].querySelectorAll('tr');
    arr.forEach( tr => {
        tr.hidden = false;
    });
    let name = e.target.querySelector('#name').value.trim();
    let vkl = e.target.querySelector('#vkl').value.trim();
    let avgMin = parseFloat(e.target.querySelector('#avgmin').value.trim().replace(':','.'));
    let avgMax = parseFloat(e.target.querySelector('#avgmax').value.trim().replace(':','.'));
    let radio = e.target.querySelector('#radio').value.trim();
    let lengthMin = parseFloat(e.target.querySelector('#lengthmin').value.trim().replace(':','.'));
    let lengthMax = parseFloat(e.target.querySelector('#lengthmax').value.trim().replace(':','.'));

    let antiResult = Array.prototype.filter.call(arr, tr => 
        name.length !== 0 && !tr.children[0].textContent.includes(name)
        || vkl.length !== 0 && !tr.children[1].textContent.includes(vkl)
        || avgMin.length !== 0 && parseFloat(tr.children[2].textContent.replace(':','.')) < avgMin
        || avgMax.length !== 0 && parseFloat(tr.children[2].textContent.replace(':','.')) > avgMax
        || radio.length !== 0 && !tr.children[3].textContent.includes(radio)
        || lengthMin.length !== 0 && parseFloat(tr.children[4].textContent.replace(':','.')) < lengthMin
        || lengthMax.length !== 0 && parseFloat(tr.children[4].textContent.replace(':','.')) > lengthMax
    );
    antiResult.forEach( tr => {
        tr.hidden = true;
    });

    return false;
}

function BuildTableFromFile() {
    let names = [Object.keys(tableArray[0])];
    {
        let tr = d3.select("#table thead")
            .selectAll("tr")
            .data(names)
            .enter().append("tr")
            .classed("table-secondary", true);

        let td = tr.selectAll("th")
            .data(function (d, i) {
                return Object.values(d);
            })
            .enter().append("th")
            .on("click", e => {
                SortByTh(e.srcElement);
            })
            .text(function (d) {
                return d;
            })
    }

    {
        let tr = d3.select("#table tbody")
            .selectAll("tr")
            .data(tableArray)
            .enter().append("tr");

        let td = tr.selectAll("td")
            .data(function (d, i) {
                return Object.values(d);
            })
            .enter().append("td")
            .text(function (d) {
                return d;
            });
    }
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

drawGraph();
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
        .tickFormat( (d,i) => unFunc(d));

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


    //Данные
    let min_value = d3.min(data, d => func(d.valueMin));
    svg.selectAll('.rec')
        .data(data, (item, index) => index)
        .join('rect')
        .attr('class','rec')
        .attr("x", d => scale_x(d.labelX))
        .attr("y", d => scale_y(func(d.valueMax)))
        .attr("width", scale_x.bandwidth())
        .attr("height", d => height - scale_y(func(d.valueMax)));

    /*
    //Заполнение пустыми rec
    svg
        .selectAll('.rec')
        .data(data, (item, index) => index)
        .enter()
        .append('rect')
        .attr('class','rec')
        .exit()
        .remove();

    //Заполнение данными
    svg
        .selectAll('.rec')
        .data(data, (item, index) => index)
        .enter()
        .append('rect')
        .attr("x", (item, index) => -50 + scale_x(item.valueMax))
        .attr("y", (item, index) => scale_y(item.labelX))
        .attr("width", 100)
        .attr("height", (item, index) => 800 - scale_y(item.labelX))
        .attr("fill", "blue");
     */
}

/*
function drawGraph() {
    // формируем массив для построения диаграммы
    let arrGraph = getArrGraph(tableArray, "Радиостанция", "Длительность")
    let marginX = 50;
    let marginY = 50;
    let height = 400;
    let width = 800;

    let svg = d3.select("#graph")
        .attr("height", height)
        .attr("width", width);

    // очищаем svg перед построением
    svg.selectAll("*").remove();
    // определяем минимальное и максимальное значение по оси OY
    let min = d3.min(arrGraph.map(d => d.valueMin)) * 0.95;
    let max = d3.max(arrGraph.map(d => d.valueMax)) * 1.05;
    let xAxisLen = width - 2 * marginX;
    let yAxisLen = height - 2 * marginY;

    // определяем шкалы для осей
    let scaleX = d3.scaleBand()
        .rangeRound([0, xAxisLen],1)
        .domain(arrGraph.map(function(d) {
            return d.labelX;
        }));
    let scaleY = d3.scaleLinear()
        .domain([min, max])
        .range([yAxisLen, 0]);
    // создаем оси
    let axisX = d3.axisBottom(scaleX); // горизонтальная
    let axisY = d3.axisLeft(scaleY); // вертикальная

    // отображаем ось OX, устанавливаем подписи оси ОX и угол их наклона
    svg.append("g")
        .attr("transform", `translate(${marginX}, ${height - marginY})`)
        .call(axisX)
        .attr("class", "x-axis")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function (d) {
            return "rotate(-45)";
        });

    // отображаем ось OY
    svg.append("g")
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .attr("class", "y-axis")
        .call(axisY);

    // создаем набор вертикальных линий для сетки
    d3.selectAll("g.x-axis g.tick")
        .append("line") // добавляем линию
        .classed("grid-line", true) // добавляем класс
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", - (yAxisLen));

    // создаем горизонтальные линии сетки
    d3.selectAll("g.y-axis g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", xAxisLen)
        .attr("y2", 0);

    // отображаем данные в виде точечной диаграммы
    svg.selectAll(".dot")
        .data(arrGraph)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return scaleX(d.labelX); })
        .attr("cy", function(d) { return scaleY(d.valueMax); })
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .style("fill", "red");

    svg.selectAll(".dot")
        .data(arrGraph)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return scaleX(d.labelX); })
        .attr("cy", function(d) { return scaleY(d.valueMin); })
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .style("fill", "blue");
}
 */
