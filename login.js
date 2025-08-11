import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    const alertDiv = document.querySelector('#alert');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm['login-email'].value;
            const password = loginForm['login-password'].value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                alertDiv.innerHTML = '<p style="color: green;">Login bem-sucedido! Redirecionando...</p>';
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                }, 1500);
            } catch (error) {
                let errorMessage = 'Erro ao fazer login.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = 'Email ou senha inválidos.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Formato de email inválido.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                }
                alertDiv.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
                console.error("Erro de login:", error.message);
            }
        });
    }
});

function showAlert(msg) {
    document.querySelector('#alert').innerHTML = msg;
}
