const API_URL = "https://script.google.com/macros/s/AKfycbwh-Mx-1FFEjT5NSssTsKu57BATRdF5fz9DBsdwOT2-v-oxjYhPdi0Rm07wg5WRRQk6Dg/exec";
let ADMIN_SECRET = "";
let allData = {};
let randSelectat = null;

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

            document.getElementById("panou-login").classList.add("hidden");
            document.getElementById("admin-content").classList.remove("hidden");

            populeazaSelector();
            populeazaTabela();
        } else if (res.status === "unauthorized") {
            alert("Parola incorectă!");
        }
    } catch (err) {
        console.error(err);
        alert("Eroare la conectare!");
    }
}

function configurareInitiala() {
    // Adauga un click listener pe tabela care indica codul din randul dat.
    document.getElementById("data").addEventListener("click", function (event) {
        const tr = event.target.closest("tr");

        randSelectat = tr.rowIndex;

        const prevSelected = this.querySelector(".selected-row");
        if (prevSelected) {
            prevSelected.classList.remove("selected-row");
        }
        if (randSelectat != 0) {
            tr.classList.add('selected-row');
        }
        else {
            randSelectat = null;
        }
    });
}

function populeazaSelector() {
    const select = document.getElementById("class-panou-selector");
    select.innerHTML = "";
    Object.keys(allData).forEach(sheetName => {
        const opt = document.createElement("option");
        opt.value = sheetName;
        opt.innerText = sheetName;
        select.appendChild(opt);
    });
}

function populeazaTabela() {
    const clasaSelectata = document.getElementById("class-panou-selector").value;
    const randuriElevi = allData[clasaSelectata];
    
    if (!randuriElevi || randuriElevi.length === 0) 
        return;

    const tabela = document.querySelector("#data tbody");
    tabela.innerHTML = "";

    for (let i = 0; i < randuriElevi.length; i++) {
        const tr = document.createElement("tr");
        const dateElev = randuriElevi[i];

        for (let j = 0; j < dateElev.length; j++) {
            let td = document.createElement(i === 0 ? "th" : "td");
            td.innerText = dateElev[j];
            tr.appendChild(td);
        }
        tabela.appendChild(tr);
    }
}

async function modificaPunctaj(action) {
    if (randSelectat == null)
        return;

    const butoaneActiune = document.querySelectorAll(".buton-actiune");
    butoaneActiune.forEach(btn => btn.disabled = true);

    const clasaSelectata = document.getElementById("class-panou-selector").value;
    const payload = {
        secret: ADMIN_SECRET,
        sheetName: clasaSelectata,
        rowIndex: randSelectat + 1, // Matching cu indexarea din GSuite.
        action: action
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });

        const responseJson = await response.json();
        if (responseJson.status === "success") {
            const tbody = document.querySelector("#data tbody");
            if (!tbody) 
                return null;

            let randActualizat = responseJson.rowIndex - 1;
            const rand = tbody.rows[randActualizat];

            rand.cells[3].innerText = responseJson.newScore;
            rand.cells[4].innerText = responseJson.newUsed;
            allData[clasaSelectata][randActualizat][3] = responseJson.newScore;
            allData[clasaSelectata][randActualizat][4] = responseJson.newUsed;
        }

    } catch (err) {
        alert("Eroare la trimiterea cererii!");
    }
    finally {
        butoaneActiune.forEach(btn => btn.disabled = false);
    }
}

async function loadData() {
    const response = await fetch(API_URL);
    const res = await response.json();
    if (res.status === "success") {
        allData = res.data;

        populeazaSelector();
        populeazaTabela();
    }
}

configurareInitiala();