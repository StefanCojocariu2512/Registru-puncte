const API_URL = "https://script.google.com/macros/s/AKfycbwh-Mx-1FFEjT5NSssTsKu57BATRdF5fz9DBsdwOT2-v-oxjYhPdi0Rm07wg5WRRQk6Dg/exec";
let allData = {};

async function loadData() {
    const response = await fetch(API_URL);
    allData = await response.json();

    const select = document.getElementById("class-selector");
    select.innerHTML = "";
    Object.keys(allData).forEach(sheetName => {
        const opt = document.createElement("option");
        opt.value = sheetName;
        opt.innerText = sheetName;
        select.appendChild(opt);
    });
    renderTable();
}

function renderTable() {
    const selectedSheet = document.getElementById("class-selector").value;
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    if (allData[selectedSheet]) {
        allData[selectedSheet].forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${item.cod}</td><td>${item.punctaj}</td>`;
            tbody.appendChild(tr);
        });
    }
}

loadData();