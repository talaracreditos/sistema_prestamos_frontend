import React from 'react';
import { Link } from 'react-router-dom';
import LoadingScreen from 'components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import Carrusel from './components/Carrusel';
import useLogin from 'hooks/Auth/useLogin';
import background from 'assets/img/carrusel/bg1.jpg';
import background2 from 'assets/img/carrusel/bg2.jpg';
import background3 from 'assets/img/carrusel/bg3.jpg';
import logo from 'assets/img/logoblanco.png';
import uplogin from 'assets/img/uplogin.png';
import resetlogin from 'assets/img/resetlogin.png';

const carruselImages = [background, background2, background3];

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
      <div className="relative h-[32vh] sm:h-[40vh] lg:h-auto lg:w-3/5 overflow-hidden">
        <Carrusel images={carruselImages} interval={5000} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-red-900/30 lg:bg-gradient-to-r lg:from-slate-950/95 lg:via-slate-900/60 lg:to-red-900/20 z-10" />

        {/* Branding sobre la imagen */}
        <div className="absolute inset-0 flex flex-col justify-center items-center lg:items-start p-4 sm:p-10 lg:p-16 lg:justify-center z-20">
          <img
            src={logo}
            alt="Logo Talara Créditos"
            className="h-14 sm:h-24 lg:h-28 w-auto object-contain mb-2 sm:mb-6 drop-shadow-xl"
          />
          <h1 className="text-lg sm:text-2xl lg:text-4xl font-extrabold text-white text-center lg:text-left tracking-tight drop-shadow-sm">
            Talara
          </h1>
          <h2 className="text-[9px] sm:text-[10px] lg:text-xs font-black text-red-400 tracking-[0.3em] uppercase mt-1">
            Créditos e Inversiones
          </h2>
          <p className="hidden lg:block text-slate-300 text-sm font-medium mt-6 max-w-xs leading-relaxed">
            Gestión de créditos, pagos y cobranza en un solo panel.
          </p>
        </div>
      </div>

      {/* Panel formulario */}
      <div className="relative flex-1 -mt-6 sm:-mt-10 lg:mt-0 z-10 bg-white rounded-t-[2.5rem] lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:shadow-none flex items-center justify-center p-6 pt-8 sm:p-10 sm:pt-12 lg:p-16">
        <div className="w-full max-w-[420px]">

          {!loading && (
            <div className="flex justify-center mb-2 sm:mb-4">
              <img
                src={showForgotPassword ? resetlogin : uplogin}
                alt={showForgotPassword ? 'Restablecer contraseña Talara' : 'Equipo Talara Créditos'}
                loading="lazy"
                decoding="async"
                className="h-28 sm:h-32 lg:h-40 w-auto object-contain"
              />
            </div>
          )}

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

          <div className="mt-6 sm:mt-10 text-center lg:text-left space-y-1">
            <p className="text-[10px] text-slate-400 font-medium tracking-wider">
              © {new Date().getFullYear()} TALARA CRÉDITOS E INVERSIONES.
            </p>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider">
              Al ingresar aceptas nuestra{' '}
              <Link to="/politica-privacidad" className="text-red-600 font-bold hover:underline">
                Política de Privacidad
              </Link>{' '}
              y{' '}
              <Link to="/politica-cookies" className="text-red-600 font-bold hover:underline">
                Política de Cookies
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;