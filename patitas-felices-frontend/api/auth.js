const apiBase = 'https://4pjmo6b0e1.execute-api.us-east-1.amazonaws.com';


async function registrar() {
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const body = { nombre, email, password };

  const res = await fetch(`${apiBase}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  document.getElementById('respuesta').innerText = JSON.stringify(data, null, 2);
}

async function iniciarSesion() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${apiBase}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  document.getElementById('respuesta').innerText = JSON.stringify(data, null, 2);

  // Guardar el token JWT en localStorage y redirigir si login exitoso
  if (res.status === 200 && data.token) {
    localStorage.setItem('token', data.token);
    alert('Inicio de sesión exitoso. Redirigiendo...');
    window.location.href = 'index.html';
  }
}
