
import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#register-form');
    const alertDiv = document.querySelector('#alert');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerForm['register-email'].value;
            const password = registerForm['register-password'].value;
            const confirmPassword = registerForm['register-confirm-password'].value;

            if (password !== confirmPassword) {
                alertDiv.innerHTML = '<p style="color: red;">As senhas não coincidem!</p>';
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                alertDiv.innerHTML = '<p style="color: green;">Registro bem-sucedido! Redirecionando para o login...</p>';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } catch (error) {
                let errorMessage = 'Erro ao registrar.';
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Este email já está em uso.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Formato de email inválido.';
                }
                alertDiv.innerHTML = `<p style="color: red;">${errorMessage}</p>`;
                console.error("Erro de registro:", error.message);
            }
        });
    }
});

function showAlert(msg) {
    document.querySelector('#alert').innerHTML = msg;
}
