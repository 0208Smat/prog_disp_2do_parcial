const usuarios = [
    {
        usuario: "cajero",
        password: "123",
        rol: "Cajero"
    },
    {
        usuario: "asistente",
        password: "123",
        rol: "Asistente"
    },
    {
        usuario: "gerente",
        password: "123",
        rol: "Gerente"
    }
];

let usuarioActual = null;

function login() {

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    const encontrado = usuarios.find(
        u => u.usuario === usuario &&
            u.password === password
    );

    if (!encontrado) {
        alert("Credenciales incorrectas");
        return;
    }

    usuarioActual = encontrado;

    document.getElementById("login-container")
        .classList.add("hidden");

    document.getElementById("panel")
        .classList.remove("hidden");

    document.getElementById("bienvenida")
        .innerText = "Bienvenido " + usuario;

    document.getElementById("rol")
        .innerText = "Rol: " + encontrado.rol;

    aplicarPermisos();
    actualizarEstadisticas();
    mostrarInforme();
    actualizarEstadoBotones()
}

function logout() {
    location.reload();
}

function registrarAsistencia() {

    let asistencias =
        JSON.parse(
            localStorage.getItem("asistencias")
        ) || [];

    const ahora = new Date();

    const fecha = ahora.toISOString().split("T")[0];

    const hora = ahora.toLocaleTimeString();

    const yaRegistrado = asistencias.find(
        a =>
            a.empleado === usuarioActual.usuario &&
            a.fecha === fecha &&
            !a.horaSalida
    );

    if (yaRegistrado) {
        alert("Ya registró su entrada hoy.");
        return;
    }

    const tardia =
        ahora.getHours() > 8 ||
        (ahora.getHours() === 8 && ahora.getMinutes() > 0);

    asistencias.push({
        empleado: usuarioActual.usuario,
        rol: usuarioActual.rol,
        fecha: fecha,
        horaEntrada: hora,
        horaSalida: null,
        estado: tardia ? "Tardía" : "Puntual"
    });

    localStorage.setItem(
        "asistencias",
        JSON.stringify(asistencias)
    );

    alert("Entrada registrada.");

    mostrarInforme();
    actualizarEstadisticas();
    actualizarEstadoBotones()
}

function mostrarInforme(){

    let asistencias =
    JSON.parse(localStorage.getItem("asistencias")) || [];

    // Cajero: solo ve lo suyo
    if(usuarioActual.rol === "Cajero"){
        asistencias = asistencias.filter(
            a => a.empleado === usuarioActual.usuario
        );
    }

    let html = "";

    asistencias.forEach(a => {

        html += `
        <tr>
            <td>${a.empleado}</td>
            <td>${a.rol}</td>
            <td>${a.fecha}</td>
            <td>${a.horaEntrada}</td>
            <td>${a.horaSalida || "-"}</td>
            <td>${a.estado}</td>
        </tr>
        `;
    });

    document.getElementById("tablaAsistencia")
    .innerHTML = html;
}

function filtrarFecha(){

    const fecha = document.getElementById("fechaFiltro").value;

    if(!fecha){
        alert("Seleccione una fecha.");
        return;
    }

    let asistencias =
    JSON.parse(localStorage.getItem("asistencias")) || [];

    // seguridad extra: cajero no debería entrar aquí
    if(usuarioActual.rol === "Cajero"){
        alert("Sin permisos para filtrar.");
        return;
    }

    const filtradas = asistencias.filter(
        a => a.fecha === fecha
    );

    let html = "";

    filtradas.forEach(a => {

        html += `
        <tr>
            <td>${a.empleado}</td>
            <td>${a.rol}</td>
            <td>${a.fecha}</td>
            <td>${a.horaEntrada}</td>
            <td>${a.horaSalida || "-"}</td>
            <td>${a.estado}</td>
        </tr>
        `;
    });

    document.getElementById("tablaAsistencia")
    .innerHTML = html;
}

function actualizarEstadisticas() {

    let asistencias =
        JSON.parse(
            localStorage.getItem("asistencias")
        ) || [];

    let tardias =
        asistencias.filter(
            a => a.estado === "Tardía"
        ).length;

    document.getElementById("totalRegistros")
        .innerText = asistencias.length;

    document.getElementById("totalTardias")
        .innerText = tardias;
}

function exportarCSV() {

    if (usuarioActual.rol !== "Gerente") {
        alert("No posee permisos para exportar informes.");
        return;
    }

    let asistencias =
        JSON.parse(
            localStorage.getItem("asistencias")
        ) || [];

    let csv =
        "Empleado,Rol,Fecha,Entrada,Salida,Estado\n";

    asistencias.forEach(a => {

        csv +=
            `${a.empleado},${a.rol},${a.fecha},${a.horaEntrada},${a.horaSalida || ""},${a.estado}\n`;

    });

    const blob =
        new Blob([csv], { type: "text/csv" });

    const url =
        window.URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;
    a.download = "asistencia.csv";

    a.click();
}

function aplicarPermisos(){

    const rol = usuarioActual.rol;

    const btnExportar = document.getElementById("btnExportar");

    const bloqueInforme = document.querySelector("section table")?.parentElement;

    if(rol === "Cajero"){

        btnExportar?.remove();

        // opcional: si quieres ocultar completamente el módulo de informes
        bloqueInforme?.remove();
    }

    if(rol === "Asistente"){
        btnExportar?.remove();
    }
}

function registrarSalida() {

    let asistencias =
        JSON.parse(
            localStorage.getItem("asistencias")
        ) || [];

    const ahora = new Date();

    const fecha = ahora.toISOString().split("T")[0];

    const registro = asistencias.find(
        a =>
            a.empleado === usuarioActual.usuario &&
            a.fecha === fecha &&
            !a.horaSalida
    );

    if (!registro) {
        alert("Primero debe registrar una entrada.");
        return;
    }

    registro.horaSalida =
        ahora.toLocaleTimeString();

    localStorage.setItem(
        "asistencias",
        JSON.stringify(asistencias)
    );

    alert("Salida registrada.");

    mostrarInforme();
    actualizarEstadoBotones()
}

function actualizarEstadoBotones() {

    let asistencias =
        JSON.parse(localStorage.getItem("asistencias")) || [];

    const fecha = new Date().toISOString().split("T")[0];

    const registroAbierto = asistencias.find(
        a =>
            a.empleado === usuarioActual.usuario &&
            a.fecha === fecha &&
            !a.horaSalida
    );

    const btnEntrada = document.getElementById("btnRegistrar");
    const btnSalida = document.getElementById("btnSalida");

    if (btnEntrada && btnSalida) {

        btnEntrada.disabled = !!registroAbierto;
        btnSalida.disabled = !registroAbierto;
    }
}