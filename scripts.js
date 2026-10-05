const API_URL = "https://script.google.com/macros/s/AKfycbwh-Mx-1FFEjT5NSssTsKu57BATRdF5fz9DBsdwOT2-v-oxjYhPdi0Rm07wg5WRRQk6Dg/exec";
let ADMIN_SECRET = "";
let allData = {};

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

    const rows = allData[selectedSheet];
    if (!rows || rows.length === 0) return;

    // Se primeste un numar arbitrar de coloane cu denumirile lor in prima linie.
    for (let i = 0; i < rows.length; i++) {
        const tr = document.createElement("tr");
        const rowData = rows[i];

        for (let j = 0; j < rowData.length; j++) {
            let td = document.createElement("td");
            if (i == 0)
                td = document.createElement("th");
            td.innerText = rowData[j];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
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
