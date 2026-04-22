document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  });
  
  let todosCobros = [];
  let todosUsuarios = [];
  
  async function cargarDatos() {
    try {
      // Usuarios
      const respUsers = await fetch(`${API_URL}?sheet=Usuarios&action=getAll`);
      todosUsuarios = await respUsers.json();
      const cobradores = todosUsuarios.filter(u => u.role === 'cobrador');
      const tbodyCob = document.querySelector('#tablaCobradores tbody');
      tbodyCob.innerHTML = '';
      cobradores.forEach(c => {
        tbodyCob.innerHTML += `<tr><td>${c.username}</td><td>${c.nombre}</td><td>${c.role}</td></tr>`;
      });
      
      // Cobros
      const respCobros = await fetch(`${API_URL}?sheet=Cobros&action=getAll`);
      todosCobros = await respCobros.json();
      renderResumen();
      renderTablaTodos();
    } catch (error) {
      console.error(error);
    }
  }
  
  function renderResumen() {
    const hoy = new Date().toLocaleDateString('es-CO');
    const cobrosHoy = todosCobros.filter(c => c.fecha === hoy);
    const totalHoy = cobrosHoy.reduce((s, c) => s + parseFloat(c.monto), 0);
    document.getElementById('totalHoyGeneral').textContent = `$${totalHoy.toFixed(2)}`;
    
    const mesActual = new Date().getMonth() + 1;
    const añoActual = new Date().getFullYear();
    const cobrosMes = todosCobros.filter(c => {
      const [d, m, a] = c.fecha.split('/');
      return parseInt(m) === mesActual && parseInt(a) === añoActual;
    });
    const totalMes = cobrosMes.reduce((s, c) => s + parseFloat(c.monto), 0);
    document.getElementById('totalMes').textContent = `$${totalMes.toFixed(2)}`;
    
    const totalHistorico = todosCobros.reduce((s, c) => s + parseFloat(c.monto), 0);
    document.getElementById('totalHistorico').textContent = `$${totalHistorico.toFixed(2)}`;
    
    // Resumen por cobrador hoy
    const tbodyResumen = document.querySelector('#tablaResumenCobradores tbody');
    tbodyResumen.innerHTML = '';
    const cobradores = todosUsuarios.filter(u => u.role === 'cobrador');
    cobradores.forEach(cob => {
      const cobrosCobHoy = cobrosHoy.filter(c => c.username === cob.username);
      const total = cobrosCobHoy.reduce((s, c) => s + parseFloat(c.monto), 0);
      tbodyResumen.innerHTML += `<tr><td>${cob.nombre}</td><td>$${total.toFixed(2)}</td><td>${cobrosCobHoy.length}</td></tr>`;
    });
  }
  
  function renderTablaTodos(filtroFecha = '') {
    const tbody = document.querySelector('#tablaTodosCobros tbody');
    tbody.innerHTML = '';
    let cobrosFiltrados = todosCobros;
    if (filtroFecha) {
      const fechaFormateada = new Date(filtroFecha + 'T00:00:00').toLocaleDateString('es-CO');
      cobrosFiltrados = todosCobros.filter(c => c.fecha === fechaFormateada);
    }
    cobrosFiltrados.sort((a, b) => new Date(b.fecha.split('/').reverse().join('-')) - new Date(a.fecha.split('/').reverse().join('-')));
    cobrosFiltrados.forEach(c => {
      const nombreCob = todosUsuarios.find(u => u.username === c.username)?.nombre || c.username;
      tbody.innerHTML += `<tr><td>${c.fecha}</td><td>${nombreCob}</td><td>${c.cliente}</td><td>$${parseFloat(c.monto).toFixed(2)}</td><td>${c.tipoPago}</td></tr>`;
    });
  }
  
  document.getElementById('btnFiltrar').addEventListener('click', () => {
    const fecha = document.getElementById('filtroFecha').value;
    renderTablaTodos(fecha);
  });
  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('filtroFecha').value = '';
    renderTablaTodos();
  });
  
  cargarDatos();