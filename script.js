// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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

// 🔐 estado de admin
let isAdmin = false;

document.addEventListener("DOMContentLoaded", () => {
  const btnSubir = document.getElementById("btnSubir");
  btnSubir.addEventListener("click", subirFoto);

  const btnAdmin = document.getElementById("btnAdmin");
  if (btnAdmin) {
    btnAdmin.addEventListener("click", activarAdmin);
  }

  // eventos modal
  const modal = document.getElementById("modal");
  const btnClose = document.getElementById("modal-close");

  btnClose.addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => {
    if (e.target.id === "modal") cerrarModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });

  cargarGaleria();
});

// 🔐 Activar modo admin con clave
function activarAdmin() {
  const keyInput = document.getElementById("adminKey");
  const clave = keyInput.value.trim();

  // podés cambiar esta clave si querés
  if (clave === "valen15admin") {
    isAdmin = true;
    alert("Modo administrador activado ✅ Ahora podés eliminar fotos.");
    cargarGaleria(); // para que aparezcan los botones de borrar
  } else {
    alert("Clave incorrecta ❌");
  }
}

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

// 🗑 Borrar UNA foto por id
async function borrarFoto(id) {
  if (!confirm("¿Seguro que querés eliminar esta foto?")) return;

  try {
    await deleteDoc(doc(db, "fotosInvitados", id));
    alert("Foto eliminada ✅");
    cargarGaleria();
  } catch (error) {
    console.error("Error al borrar foto:", error);
    alert("No se pudo borrar la foto 😢");
  }
}

// Crea una card <div> para una foto + datos
function crearCardFoto(data, id) {
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

  // 🗑 Botón de borrar solo si es admin
  if (isAdmin && id) {
    const delBtn = document.createElement("button");
    delBtn.className = "card-delete";
    delBtn.textContent = "Eliminar";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // para que no abra el modal al borrar
      borrarFoto(id);
    });
    info.appendChild(delBtn);
  }

  card.appendChild(img);
  card.appendChild(info);

  // clic en la card abre el modal solo si no se hizo clic en borrar
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
      const card = crearCardFoto(data, docSnap.id);
      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar galería:", error);
  }
}
