import React from 'react';
import LoadingScreen from 'components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import useLogin from 'hooks/Auth/useLogin';
import background from 'assets/img/background.jpg';
import logo from 'assets/img/logo.png';

const Login = () => {
  const {
    username, setUsername,
    password, setPassword,
    dni, setDni,
    showForgotPassword, setShowForgotPassword,
    cancelForgotPassword,
    loading,
    rememberMe, setRememberMe,
    handleLogin,
    handleForgotPassword,
  } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        <img src={background} alt="Fondo corporativo Talara" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-slate-900/90 to-black" />
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(220,_38,_38,_0.15)] p-8 sm:p-10 relative z-10 border border-white/20">
        <div className="flex flex-col items-center mb-10">
          <div className="h-20 w-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-5 relative overflow-hidden border border-gray-100 p-2 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <img src={logo} alt="Logo Talara Créditos" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 text-center tracking-tight">Talara</h1>
          <h2 className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase mb-1">Créditos e Inversiones</h2>
        </div>

        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingScreen />
            </div>
          ) : showForgotPassword ? (
            <ForgotPasswordForm
              dni={dni}
              setDni={setDni}
              handleForgotPassword={handleForgotPassword}
              setShowForgotPassword={setShowForgotPassword}
              onCancel={cancelForgotPassword}
            />
          ) : (
            <LoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              setShowForgotPassword={setShowForgotPassword}
            />
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-400 font-medium tracking-wider">
            © {new Date().getFullYear()} TALARA CRÉDITOS E INVERSIONES.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;