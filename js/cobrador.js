/* ================================
   UTILIDADES
================================ */
const $ = (s) => document.querySelector(s);

const formatMoney = (v) =>
  `$${Number(v).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

const hoyStr = () => new Date().toLocaleDateString('es-CO');

/* ================================
   USUARIO (PROTECCIÓN)
================================ */
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

if (!currentUser) {
  window.location.href = 'index.html';
}

$('#userDisplay').textContent = currentUser.nombre;

/* ================================
   LOGOUT
================================ */
$('#logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
});

/* ================================
   FETCH SEGURO
================================ */
async function fetchData(url, options = {}) {
  try {
    const resp = await fetch(url, options);
    if (!resp.ok) throw new Error('Error en la API');
    return await resp.json();
  } catch (error) {
    console.error(error);
    mostrarError('Error de conexión');
    return null;
  }
}

/* ================================
   UI MENSAJES
================================ */
function mostrarError(msg) {
  alert(msg);
}

/* ================================
   ESTADO
================================ */
let todosCobros = [];

/* ================================
   CARGAR COBROS
================================ */
async function cargarCobros() {
  const data = await fetchData(
    `${API_URL}?sheet=Cobros&action=getByUser&data=${JSON.stringify({
      username: currentUser.username
    })}`
  );

  if (!data) return;

  todosCobros = data;

  renderDashboard();
}

/* ================================
   RENDER GENERAL
================================ */
function renderDashboard() {
  renderTotalHoy();
  renderTablaHoy();
  renderHistorial();
}

/* ================================
   TOTAL HOY
================================ */
function renderTotalHoy() {
  const hoy = hoyStr();

  const total = todosCobros
    .filter(c => c.fecha === hoy)
    .reduce((acc, c) => acc + Number(c.monto), 0);

  $('#totalHoy').textContent = formatMoney(total);
}

/* ================================
   TABLA HOY
================================ */
function renderTablaHoy() {
  const hoy = hoyStr();
  const tbody = $('#tablaCobrosHoy tbody');
  tbody.innerHTML = '';

  const fragment = document.createDocumentFragment();

  todosCobros
    .filter(c => c.fecha === hoy)
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.cliente}</td>
        <td>${formatMoney(c.monto)}</td>
        <td>${c.tipoPago}</td>
      `;
      fragment.appendChild(tr);
    });

  tbody.appendChild(fragment);
}

/* ================================
   HISTORIAL (ÚLTIMOS 10)
================================ */
function renderHistorial() {
  const tbody = $('#tablaHistorial tbody');
  tbody.innerHTML = '';

  const fragment = document.createDocumentFragment();

  [...todosCobros]
    .slice(-10)
    .reverse()
    .forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.fecha}</td>
        <td>${c.cliente}</td>
        <td>${formatMoney(c.monto)}</td>
      `;
      fragment.appendChild(tr);
    });

  tbody.appendChild(fragment);
}

/* ================================
   REGISTRAR COBRO
================================ */
$('#formCobro')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const cobro = {
    username: currentUser.username,
    fecha: hoyStr(),
    monto: Number($('#monto').value),
    cliente: $('#cliente').value.trim(),
    tipoPago: $('#tipoPago').value,
    observaciones: $('#observaciones').value.trim()
  };

  try {
    await fetchData(`${API_URL}?sheet=Cobros&action=append`, {
      method: 'POST',
      body: new URLSearchParams({
        data: JSON.stringify(cobro)
      })
    });

    e.target.reset();
    await cargarCobros();

  } catch (error) {
    mostrarError('Error al registrar');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrar';
  }
});

/* ================================
   INICIO
================================ */
cargarCobros();