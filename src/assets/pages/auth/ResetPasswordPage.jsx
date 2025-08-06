import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../login/LoginPage.css'; // Importando os estilos da página de login

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useParams(); // Pega o token da URL
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!password || !confirmPassword) {
      setError('Por favor, preencha ambos os campos de senha.');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/auth/reset-password/${token}`, {
        novaSenha: password,
      });
      setMessage(response.data.message || 'Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login-adaptado'); // Redireciona para o login
      }, 2500);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(' ');
        setError(errorMessages || 'Erro ao redefinir senha.');
      } else {
        setError('Ocorreu um erro. Token inválido, expirado ou problema no servidor.');
      }
      console.error("Erro ao redefinir senha:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-body-wrapper"> {/* Usa a classe wrapper */}
      <div className="container"> {/* Usa a classe container */}
        <form onSubmit={handleSubmit}>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '25px' }}>Redefinir Senha</h1>
          
          <div className="input-box"> {/* Usa a classe input-box */}
            <input
              type="password"
              placeholder="Nova Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <i className='bx bxs-lock-alt'></i> {/* Ícone do Boxicons */}
          </div>

          <div className="input-box"> {/* Usa a classe input-box */}
            <input
              type="password"
              placeholder="Confirmar Nova Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <i className='bx bxs-lock-alt'></i> {/* Ícone do Boxicons */}
          </div>

          <button type="submit" className="btn" disabled={isLoading} style={{backgroundColor: isLoading? '#6c757d' : '#28a745', marginTop: '10px'}}> {/* Usa a classe btn e ajusta a cor */}
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>

          {isLoading && <p className="login-loading-message">Processando...</p>}
          {message && !isLoading && (
            <div className="login-message login-success-message">
              {message} Se não for redirecionado, <Link to="/login-adaptado" style={{color: '#155724', fontWeight: 'bold'}}>clique aqui para fazer login</Link>.
            </div>
          )}
          {error && !isLoading && (
            <div className="login-message login-error-message">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;