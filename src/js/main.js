let table;
let form;
let selectors;
let sortBtnArray;
document.addEventListener("DOMContentLoaded", () => {
    table = document.getElementById('table');
    BuildSortForm();
});

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
                    selectors[2].disabled = false;
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