import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from 'services/authService';
import { useAuth } from 'context/AuthContext';
import { notify } from 'components/Shared/Notificaciones/ToastNotification';

/**
 * Hook que centraliza toda la lógica de autenticación de la pantalla de Login:
 * estado de credenciales, submit de login, y flujo de recuperación de contraseña.
 * El componente Login.js queda solo con la responsabilidad de presentación.
 */
const useLogin = () => {
  const [username, setUsername]                     = useState('');
  const [password, setPassword]                     = useState('');
  const [dni, setDni]                                = useState('');
  const [loading, setLoading]                        = useState(false);
  const [rememberMe, setRememberMe]                  = useState(false);
  const [showForgotPassword, setShowForgotPassword]  = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result        = await authService.login(username, password, rememberMe);
      const access_token   = result.data ? result.data.access_token : result.access_token;

      if (!access_token) throw new Error('No se pudo obtener el token de acceso.');

      document.cookie = `access_token=${access_token}; path=/; Secure; SameSite=Strict`;
      login();
      notify.success('¡Bienvenido al sistema!');
      setTimeout(() => navigate('/home'), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Credenciales inválidas';
      notify.error(msg);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.forgotPassword(dni);
      notify.success(result.message || 'Enlace enviado a tu correo.');
      setDni('');
      setShowForgotPassword(false);
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al solicitar recuperación.';
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const cancelForgotPassword = () => {
    setShowForgotPassword(false);
    setDni('');
  };

  return {
    // credenciales
    username, setUsername,
    password, setPassword,
    // recuperación
    dni, setDni,
    showForgotPassword, setShowForgotPassword,
    cancelForgotPassword,
    // estado general
    loading,
    rememberMe, setRememberMe,
    // acciones
    handleLogin,
    handleForgotPassword,
  };
};

export default useLogin;