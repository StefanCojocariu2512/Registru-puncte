const API_URL = "https://script.google.com/macros/s/AKfycbwh-Mx-1FFEjT5NSssTsKu57BATRdF5fz9DBsdwOT2-v-oxjYhPdi0Rm07wg5WRRQk6Dg/exec";
const ADMIN_SECRET = "admin123";
let allData = {};

async function loadData() {
    const response = await fetch(API_URL);
    allData = await response.json();

    const select = document.getElementById("class-selector");
    const currentVal = select.value;
    select.innerHTML = "";

    Object.keys(allData).forEach(sheetName => {
        const opt = document.createElement("option");
        opt.value = sheetName;
        opt.innerText = sheetName;
        select.appendChild(opt);
    });

    if (currentVal) select.value = currentVal;
    renderTable();
}

function renderTable() {
    const selectedSheet = document.getElementById("class-selector").value;
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    if (allData[selectedSheet]) {
        allData[selectedSheet].forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${item.cod}</td>
            <td id="score-${selectedSheet}-${item.row}">${item.punctaj}</td>
            <td>
              <button class="btn-plus" onclick="updateScore('${selectedSheet}', ${item.row}, 'plus')">+</button>
              <button class="btn-minus" onclick="updateScore('${selectedSheet}', ${item.row}, 'minus')">-</button>
            </td>
          `;
            tbody.appendChild(tr);
        });
    }
}

async function updateScore(sheetName, rowIndex, action) {
    const payload = {
        secret: ADMIN_SECRET,
        sheetName: sheetName,
        rowIndex: rowIndex,
        action: action
    };

    const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    });

    const res = await response.json();
    if (res.status === "success") {
        document.getElementById(`score-${sheetName}-${rowIndex}`).innerText = res.newScore;
    } else {
        alert("Eroare: " + res.message);
    }
}

loadData();