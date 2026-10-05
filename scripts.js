const API_URL = "https://script.google.com/macros/s/AKfycbwh-Mx-1FFEjT5NSssTsKu57BATRdF5fz9DBsdwOT2-v-oxjYhPdi0Rm07wg5WRRQk6Dg/exec";
let ADMIN_SECRET = "";
let allData = {};
let selectedRowIndex = null; // Rândul selectat din Sheet

async function authenticateAdmin() {
    const inputPass = document.getElementById("admin-pass").value;
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ secret: inputPass, action: "login" })
        });

        const res = await response.json();

        if (res.status === "success") {
            ADMIN_SECRET = inputPass;
            allData = res.data;

            document.getElementById("login-window").classList.add("hidden");
            document.getElementById("admin-content").classList.remove("hidden");

            populateSelect();
            renderTable();
        } else if (res.status === "unauthorized") {
            alert("Parola incorectă!");
        }
    } catch (err) {
        console.error(err);
        alert("Eroare la conectare!");
    }
}

function populateSelect() {
    const select = document.getElementById("class-selector");
    select.innerHTML = "";
    Object.keys(allData).forEach(sheetName => {
        const opt = document.createElement("option");
        opt.value = sheetName;
        opt.innerText = sheetName;
        select.appendChild(opt);
    });
}

function renderTable() {
    const selectedSheet = document.getElementById("class-selector").value;
    const tbody = document.querySelector("#data tbody");
    tbody.innerHTML = "";
    selectedRowIndex = null; // Resetăm rândul selectat la schimbarea clasei

    const rows = allData[selectedSheet];
    if (!rows || rows.length === 0) return;

    for (let i = 0; i < rows.length; i++) {
        const tr = document.createElement("tr");
        const rowData = rows[i];
        const sheetRowIndex = i + 1; // Indexul real din Google Sheet (rândul 1 = header)

        if (i > 0) {
            // Permitem selectarea doar pentru rândurile de date (nu pentru header)
            tr.onclick = function() {
                document.querySelectorAll("#data tbody tr").forEach(r => r.classList.remove("selected-row"));
                this.classList.add("selected-row");
                selectedRowIndex = sheetRowIndex;
            };
        }

        for (let j = 0; j < rowData.length; j++) {
            let td = document.createElement(i === 0 ? "th" : "td");
            td.innerText = rowData[j];
            
            // Atribuim un ID celulei de punctaj pentru actualizare directă pe ecran
            if (i > 0 && j === 3) {
                td.id = `score-${selectedSheet}-${sheetRowIndex}`;
            }
            
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
}

async function updateScore(action) {
    const selectedSheet = document.getElementById("class-selector").value;

    if (!selectedRowIndex) {
        alert("Alege mai întâi un elev din tabel!");
        return;
    }

    const payload = {
        secret: ADMIN_SECRET,
        sheetName: selectedSheet,
        rowIndex: selectedRowIndex,
        action: action
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (res.status === "success") {
            // Actualizăm valoarea în celula din tabel
            const scoreCell = document.getElementById(`score-${selectedSheet}-${selectedRowIndex}`);
            if (scoreCell) {
                scoreCell.innerText = res.newScore;
            }
            
            // Actualizăm valoarea și în memoria locală allData (Coloana 4 -> Index 3)
            allData[selectedSheet][selectedRowIndex - 1][3] = res.newScore;
        } else {
            alert("Eroare: " + (res.message || "Neautorizat"));
        }
    } catch (err) {
        alert("Eroare la trimiterea cererii!");
    }
}

async function loadData() {
    const response = await fetch(API_URL);
    const res = await response.json();
    if (res.status === "success") {
        allData = res.data;

        populateSelect();
        renderTable();
    }
}