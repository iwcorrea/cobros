/* UTILIDADES */
const $ = (s) => document.querySelector(s);

const formatMoney = (v) =>
  `$${Number(v).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

const parseFecha = (f) => {
  const [d, m, a] = f.split('/');
  return new Date(`${a}-${m}-${d}`);
};

const hoyStr = () => new Date().toLocaleDateString('es-CO');

/* PROTECCIÓN LOGIN */
if (!localStorage.getItem('currentUser')) {
  window.location.href = 'index.html';
}

/* LOGOUT */
$('#logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
});

/* ESTADO */
let todosCobros = [];
let todosUsuarios = [];

/* FETCH */
async function fetchData(url) {
  try {
    const r = await fetch(url);
    return await r.json();
  } catch {
    alert('Error cargando datos');
    return [];
  }
}

/* CARGA */
async function cargarDatos() {
  const [usuarios, cobros] = await Promise.all([
    fetchData(`${API_URL}?sheet=Usuarios&action=getAll`),
    fetchData(`${API_URL}?sheet=Cobros&action=getAll`)
  ]);

  todosUsuarios = usuarios;
  todosCobros = cobros;

  renderTodo();
}

/* RENDER GENERAL */
function renderTodo() {
  renderCobradores();
  renderResumen();
  renderTablaTodos();
}

/* COBRADORES */
function renderCobradores() {
  const tbody = $('#tablaCobradores tbody');
  tbody.innerHTML = '';

  todosUsuarios
    .filter(u => u.role === 'cobrador')
    .forEach(u => {
      tbody.innerHTML += `
        <tr>
          <td>${u.username}</td>
          <td>${u.nombre}</td>
          <td>${u.role}</td>
        </tr>`;
    });
}

/* SUMAR */
const sumar = (arr) =>
  arr.reduce((a, c) => a + Number(c.monto || 0), 0);

/* RESUMEN */
function renderResumen() {
  const hoy = hoyStr();
  const hoyCobros = todosCobros.filter(c => c.fecha === hoy);

  $('#totalHoyGeneral').textContent = formatMoney(sumar(hoyCobros));

  const now = new Date();
  const mes = now.getMonth();
  const año = now.getFullYear();

  const mesCobros = todosCobros.filter(c => {
    const f = parseFecha(c.fecha);
    return f.getMonth() === mes && f.getFullYear() === año;
  });

  $('#totalMes').textContent = formatMoney(sumar(mesCobros));
  $('#totalHistorico').textContent = formatMoney(sumar(todosCobros));

  renderMejorCobrador(hoyCobros);
  renderResumenCobradores(hoyCobros);
}

/* 🏆 MEJOR COBRADOR */
function renderMejorCobrador(cobrosHoy) {
  const mapa = {};

  cobrosHoy.forEach(c => {
    mapa[c.username] = (mapa[c.username] || 0) + Number(c.monto);
  });

  const mejor = Object.entries(mapa).sort((a, b) => b[1] - a[1])[0];
  const el = $('#mejorCobrador');

  if (!el) return;

  if (mejor) {
    const nombre = getNombre(mejor[0]);
    el.textContent = `${nombre} (${formatMoney(mejor[1])})`;
  } else {
    el.textContent = 'Sin datos hoy';
  }
}

/* RESUMEN TABLA */
function renderResumenCobradores(cobrosHoy) {
  const tbody = $('#tablaResumenCobradores tbody');
  tbody.innerHTML = '';

  todosUsuarios
    .filter(u => u.role === 'cobrador')
    .forEach(u => {
      const lista = cobrosHoy.filter(c => c.username === u.username);

      tbody.innerHTML += `
        <tr>
          <td>${u.nombre}</td>
          <td>${formatMoney(sumar(lista))}</td>
          <td>${lista.length}</td>
        </tr>`;
    });
}

/* TABLA GENERAL */
function renderTablaTodos(filtro = '', custom = null) {
  const tbody = $('#tablaTodosCobros tbody');
  tbody.innerHTML = '';

  let data = custom || [...todosCobros];

  if (filtro) {
    const f = new Date(filtro).toLocaleDateString('es-CO');
    data = data.filter(c => c.fecha === f);
  }

  data.sort((a, b) => parseFecha(b.fecha) - parseFecha(a.fecha));

  data.forEach(c => {
    tbody.innerHTML += `
      <tr>
        <td>${c.fecha}</td>
        <td>${getNombre(c.username)}</td>
        <td>${c.cliente}</td>
        <td>${formatMoney(c.monto)}</td>
        <td>${c.tipoPago}</td>
      </tr>`;
  });
}

/* BUSCADOR */
$('#buscador')?.addEventListener('input', e => {
  const txt = e.target.value.toLowerCase();
  const filtrados = todosCobros.filter(c =>
    c.cliente.toLowerCase().includes(txt)
  );
  renderTablaTodos('', filtrados);
});

/* EXPORTAR */
$('#btnExportar')?.addEventListener('click', () => {
  let csv = "Fecha,Cobrador,Cliente,Monto\n";

  todosCobros.forEach(c => {
    csv += `${c.fecha},${c.username},${c.cliente},${c.monto}\n`;
  });

  const blob = new Blob([csv]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cobros.csv';
  a.click();
});

/* EVENTOS */
$('#btnFiltrar')?.addEventListener('click', () => {
  renderTablaTodos($('#filtroFecha').value);
});

$('#btnReset')?.addEventListener('click', () => {
  $('#filtroFecha').value = '';
  renderTablaTodos();
});

/* UTIL */
function getNombre(username) {
  return todosUsuarios.find(u => u.username === username)?.nombre || username;
}

/* INIT */
cargarDatos();