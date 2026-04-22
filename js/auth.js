document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
      const response = await fetch(`${API_URL}?sheet=Usuarios&action=getAll`);
      const users = await response.json();
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'cobrador.html';
        }
      } else {
        errorDiv.textContent = 'Credenciales incorrectas';
      }
    } catch (error) {
      errorDiv.textContent = 'Error de conexión';
    }
  });
  
  // Protección de páginas
  if (window.location.pathname.includes('cobrador.html') || window.location.pathname.includes('admin.html')) {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) window.location.href = 'index.html';
    if (window.location.pathname.includes('admin.html') && user.role !== 'admin') window.location.href = 'cobrador.html';
    if (window.location.pathname.includes('cobrador.html') && user.role === 'admin') window.location.href = 'admin.html';
  }