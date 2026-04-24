/* ================================
   UTILIDADES
================================ */
const $ = (s) => document.querySelector(s);

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('currentUser'));
  } catch {
    return null;
  }
};

/* ================================
   REDIRECCIÓN POR ROL
================================ */
function redirigirUsuario(user) {
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'cobrador.html';
  }
}

/* ================================
   LOGIN
================================ */
$('#loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = $('#username').value.trim();
  const password = $('#password').value;
  const errorDiv = $('#loginError');
  const btn = e.target.querySelector('button[type="submit"]');

  // Reset UI
  errorDiv.textContent = '';

  // Validación básica
  if (!username || !password) {
    errorDiv.textContent = 'Complete todos los campos';
    return;
  }

  // Estado de carga
  btn.disabled = true;
  btn.textContent = 'Ingresando...';

  try {
    const resp = await fetch(`${API_URL}?sheet=Usuarios&action=getAll`);

    if (!resp.ok) throw new Error('Error en API');

    const users = await resp.json();

    const user = users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      redirigirUsuario(user);
    } else {
      errorDiv.textContent = 'Credenciales incorrectas';
    }

  } catch (error) {
    console.error(error);
    errorDiv.textContent = 'Error de conexión';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ingresar';
  }
});

/* ================================
   PROTECCIÓN DE RUTAS
================================ */
(function protegerRutas() {
  const path = window.location.pathname;
  const user = getUser();

  const enAdmin = path.includes('admin.html');
  const enCobrador = path.includes('cobrador.html');

  // No autenticado
  if (!user && (enAdmin || enCobrador)) {
    return window.location.href = 'index.html';
  }

  // Usuario autenticado
  if (user) {
    if (enAdmin && user.role !== 'admin') {
      return window.location.href = 'cobrador.html';
    }

    if (enCobrador && user.role === 'admin') {
      return window.location.href = 'admin.html';
    }
  }
})();