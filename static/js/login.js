const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const msgElem = document.getElementById('msg');

const API = 'http://localhost:3000/api/auth';

function getUserInputs() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  return { username, password };
}

loginBtn.onclick = async () => {
  const { username, password } = getUserInputs();

  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (res.ok) {
    msgElem.style.color = 'green';
    msgElem.textContent = 'Login bem-sucedido! Redirecionando...';
    localStorage.setItem('user', JSON.stringify(data.user));
    setTimeout(() => window.location.href = 'index-multplay.html', 1500);
  } else {
    msgElem.textContent = data.error || 'Erro no login';
  }
};

registerBtn.onclick = async () => {
  const { username, password } = getUserInputs();

  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (res.ok) {
    msgElem.style.color = 'green';
    msgElem.textContent = 'Cadastro realizado! Agora faça login.';
  } else {
    msgElem.textContent = data.error || 'Erro no cadastro';
  }
};
