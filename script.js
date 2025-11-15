// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } 
from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCe0MPBRfK_IdTRPWhIGfECuAS8ktoozbY",
  authDomain: "pagina15valen.firebaseapp.com",
  projectId: "pagina15valen",
  storageBucket: "pagina15valen.firebasestorage.app",
  messagingSenderId: "589719568440",
  appId: "1:589719568440:web:0e8cab245969c1d3fb24cd",
  measurementId: "G-SXFERLPTXJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const btnSubir = document.getElementById("btnSubir");
    btnSubir.addEventListener("click", subirFoto);

    // eventos para cerrar el modal
    const modal = document.getElementById("modal");
    const btnClose = document.getElementById("modal-close");

    btnClose.addEventListener("click", cerrarModal);
    modal.addEventListener("click", (e) => {
        if (e.target.id === "modal") cerrarModal(); // click fuera del cuadro
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarModal();
    });

    cargarGaleria();
});

// SUBIR FOTO
async function subirFoto() {
    try {
        const nombreInput   = document.getElementById("nombre");
        const mensajeInput  = document.getElementById("mensaje");
        const archivoInput  = document.getElementById("foto");

        let nombre  = nombreInput.value.trim();
        let mensaje = mensajeInput.value.trim();
        let archivo = archivoInput.files[0];

        if (!nombre) {
            alert("Por favor, escribí tu nombre y apellido 💕");
            nombreInput.focus();
            return;
        }

        if (!archivo) {
            alert("Seleccioná una foto para subir 📷");
            return;
        }

        let reader = new FileReader();

        reader.onload = async function () {
            let base64 = reader.result;
            const ahora = new Date();

            const data = {
                imagen: base64,
                nombre: nombre,
                mensaje: mensaje,
                fecha: ahora.toISOString()
            };

            // Mostrar al instante
            mostrarFotoInstantanea(data);

            // Guardar en Firestore
            await addDoc(collection(db, "fotosInvitados"), data);

            alert("¡Gracias! Tu foto y mensaje se subieron ❤️");

            // Limpiar campos (dejo el nombre para siguientes fotos)
            archivoInput.value = "";
            mensajeInput.value = "";

            cargarGaleria();
        };

        reader.readAsDataURL(archivo);
    } catch (error) {
        console.error("Error en subirFoto:", error);
        alert("Ocurrió un error al subir la foto 😢");
    }
}

// ===== MODAL =====
function abrirModal(data) {
    const modal = document.getElementById("modal");
    const img   = document.getElementById("modal-img");
    const nom   = document.getElementById("modal-nombre");
    const fec   = document.getElementById("modal-fecha");
    const msg   = document.getElementById("modal-mensaje");

    img.src = data.imagen;
    nom.textContent = data.nombre || "Invitado";

    // fecha
    let fechaTexto = "";
    if (data.fecha) {
        const fechaObj = new Date(data.fecha);
        if (!isNaN(fechaObj.getTime())) {
            fechaTexto = fechaObj.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        }
    }
    fec.textContent = fechaTexto ? `Subida el ${fechaTexto}` : "";

    // mensaje
    if (data.mensaje && data.mensaje.trim() !== "") {
        msg.textContent = `“${data.mensaje.trim()}”`;
    } else {
        msg.textContent = "Sin mensaje 💌";
    }

    modal.style.display = "flex";
}

function cerrarModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

// Muestra una tarjeta en la galería (instantáneo)
function mostrarFotoInstantanea(data) {
    const contenedor = document.getElementById("galeria");
    const card = crearCardFoto(data);
    card.style.animation = "fadein 0.8s";
    contenedor.prepend(card);
}

// Crea una card <div> para una foto + datos
function crearCardFoto(data) {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = data.imagen;

    const info = document.createElement("div");
    info.className = "card-info";

    // Nombre
    const nombreEl = document.createElement("div");
    nombreEl.className = "card-nombre";
    nombreEl.textContent = data.nombre || "Invitado";

    // Fecha
    const fechaEl = document.createElement("div");
    fechaEl.className = "card-fecha";
    let fechaTexto = "";
    if (data.fecha) {
        const fechaObj = new Date(data.fecha);
        if (!isNaN(fechaObj.getTime())) {
            fechaTexto = fechaObj.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        }
    }
    fechaEl.textContent = fechaTexto ? `Subida el ${fechaTexto}` : "";

    // Mensaje (resumen)
    const msgEl = document.createElement("div");
    msgEl.className = "card-msg";
    if (data.mensaje && data.mensaje.trim() !== "") {
        msgEl.textContent = `“${data.mensaje.trim()}”`;
    } else {
        msgEl.textContent = "";
    }

    info.appendChild(nombreEl);
    info.appendChild(fechaEl);
    if (msgEl.textContent) info.appendChild(msgEl);

    card.appendChild(img);
    card.appendChild(info);

    // 👉 al hacer clic, abre el modal
    card.addEventListener("click", () => abrirModal(data));

    return card;
}

// CARGAR GALERÍA desde Firestore
async function cargarGaleria() {
    try {
        const contenedor = document.getElementById("galeria");
        contenedor.innerHTML = "";

        const querySnapshot = await getDocs(collection(db, "fotosInvitados"));

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const card = crearCardFoto(data);
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar galería:", error);
    }
}
