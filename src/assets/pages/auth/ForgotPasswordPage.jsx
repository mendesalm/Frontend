import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../login/LoginPage.css'; // Importando os estilos da página de login

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!email) {
      setError('Por favor, insira seu email.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        Email: email,
      });
      setMessage(response.data.message || 'Se um usuário com este email existir, um link de redefinição de senha foi enviado.');
      setEmail('');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
      console.error("Erro ao solicitar redefinição de senha:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-body-wrapper"> {/* Usa a classe wrapper para o fundo e centralização */}
      <div className="container"> {/* Usa a classe container do seu AdaptedLoginPage.css */}
        <form onSubmit={handleSubmit}>
          {/* Adapte o h1 ou use uma classe de título se tiver no seu CSS */}
          <h1 style={{ fontSize: '2.8rem', marginBottom: '20px' }}>Esqueci Minha Senha</h1>
          <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', color: '#fff' }}>
            Digite seu email para receber o link de redefinição.
          </p>
          
          <div className="input-box"> {/* Usa a classe input-box */}
            <input
              type="email"
              placeholder="Seu Email"
              name="email" // O nome do input é importante se você fosse pegar por FormData, mas estamos usando estado
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            {/* Se quiser ícone, adicione como na AdaptedLoginPage */}
            <i className='bx bxs-envelope'></i> 
          </div>

          <button type="submit" className="btn" disabled={isLoading}> {/* Usa a classe btn */}
            {isLoading ? 'Enviando...' : 'Enviar Link'}
          </button>

          {isLoading && <p className="login-loading-message">Processando...</p>}
          {message && !isLoading && (
            <div className="login-message login-success-message">
              {message}
            </div>
          )}
          {error && !isLoading && (
            <div className="login-message login-error-message">
              {error}
            </div>
          )}

          <div className="register-link" style={{ marginTop: '20px' }}> {/* Usa a classe register-link */}
            <p><Link to="/login-adaptado" style={{ color: '#fff' }}>Voltar para o Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;