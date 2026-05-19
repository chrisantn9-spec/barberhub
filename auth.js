const msg = document.getElementById('msg');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');

// Verificar si ya está logueado
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        window.location.href = 'admin.html';
    }
});

// Event listeners
btnLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleAuth('login');
});

btnRegister.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleAuth('register');
});

async function handleAuth(type) {
    msg.textContent = "⏳ Procesando...";
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        msg.textContent = "⚠️ Completa email y contraseña";
        return;
    }

    let result;
    if (type === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password });
    } else {
        result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
        msg.textContent = "❌ " + result.error.message;
    } else {
        if (type === 'register') {
            msg.textContent = "✅ ¡Cuenta creada! Revisa tu email para confirmar.";
        } else {
            msg.textContent = "✅ ¡Bienvenido! Redirigiendo...";
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        }
    }
}"crear logica login"
