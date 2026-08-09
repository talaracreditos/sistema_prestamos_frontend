import React from 'react';
import LoadingScreen from 'components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import useLogin from 'hooks/Auth/useLogin';
import background from 'assets/img/background.jpg';
import logo from 'assets/img/logoblanco.png';

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 lg:bg-white">

      {/* Panel imagen */}
      <div className="relative h-[45vh] sm:h-[50vh] lg:h-auto lg:w-1/2 overflow-hidden">
        <img
          src={background}
          alt="Fondo corporativo Talara"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-red-900/30 lg:bg-gradient-to-r lg:from-slate-950/95 lg:via-slate-900/60 lg:to-red-900/20" />

        {/* Branding sobre la imagen */}
        <div className="absolute inset-0 flex flex-col justify-center items-center lg:items-start p-6 sm:p-10 lg:p-16 lg:justify-center">
          <img
            src={logo}
            alt="Logo Talara Créditos"
            className="h-20 sm:h-24 lg:h-28 w-auto object-contain mb-4 lg:mb-6 drop-shadow-xl"
          />
          <h1 className="text-2xl lg:text-4xl font-extrabold text-white text-center lg:text-left tracking-tight drop-shadow-sm">
            Talara
          </h1>
          <h2 className="text-[10px] lg:text-xs font-black text-red-400 tracking-[0.3em] uppercase mt-1">
            Créditos e Inversiones
          </h2>
          <p className="hidden lg:block text-slate-300 text-sm font-medium mt-6 max-w-xs leading-relaxed">
            Gestión de créditos, pagos y cobranza en un solo panel.
          </p>
        </div>
      </div>

      {/* Panel formulario */}
      <div className="relative flex-1 -mt-8 sm:-mt-10 lg:mt-0 z-10 bg-white rounded-t-[2.5rem] lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:shadow-none flex items-center justify-center p-6 pt-10 sm:p-10 sm:pt-12 lg:p-16">
        <div className="w-full max-w-[420px]">
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

          <div className="mt-10 text-center lg:text-left">
            <p className="text-[10px] text-slate-400 font-medium tracking-wider">
              © {new Date().getFullYear()} TALARA CRÉDITOS E INVERSIONES.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;