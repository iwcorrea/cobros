const currentUser = JSON.parse(localStorage.getItem('currentUser'));
document.getElementById('userDisplay').textContent = currentUser.nombre;
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
});

// Cargar datos iniciales
cargarCobros();

async function cargarCobros() {
  try {
    const resp = await fetch(`${API_URL}?sheet=Cobros&action=getByUser&data=${JSON.stringify({username: currentUser.username})}`);
    const cobros = await resp.json();
    const hoy = new Date().toLocaleDateString('es-CO');
    const cobrosHoy = cobros.filter(c => c.fecha === hoy);
    const totalHoy = cobrosHoy.reduce((s, c) => s + parseFloat(c.monto), 0);
    document.getElementById('totalHoy').textContent = `$${totalHoy.toFixed(2)}`;
    
    // Tabla hoy
    const tbodyHoy = document.querySelector('#tablaCobrosHoy tbody');
    tbodyHoy.innerHTML = '';
    cobrosHoy.forEach(c => {
      tbodyHoy.innerHTML += `<tr><td>${c.cliente}</td><td>$${parseFloat(c.monto).toFixed(2)}</td><td>${c.tipoPago}</td></tr>`;
    });
    
    // Historial (últimos 10)
    const tbodyHist = document.querySelector('#tablaHistorial tbody');
    tbodyHist.innerHTML = '';
    cobros.slice(-10).reverse().forEach(c => {
      tbodyHist.innerHTML += `<tr><td>${c.fecha}</td><td>${c.cliente}</td><td>$${parseFloat(c.monto).toFixed(2)}</td></tr>`;
    });
  } catch (error) {
    console.error(error);
  }
}

document.getElementById('formCobro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cobro = {
    username: currentUser.username,
    fecha: new Date().toLocaleDateString('es-CO'),
    monto: parseFloat(document.getElementById('monto').value),
    cliente: document.getElementById('cliente').value,
    tipoPago: document.getElementById('tipoPago').value,
    observaciones: document.getElementById('observaciones').value
  };
  
  try {
    await fetch(`${API_URL}?sheet=Cobros&action=append`, {
      method: 'POST',
      body: new URLSearchParams({data: JSON.stringify(cobro)})
    });
    document.getElementById('formCobro').reset();
    cargarCobros();
  } catch (error) {
    alert('Error al registrar');
  }
});