import React, { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { decorNavidad } from 'utilities/data/loginThemeAssets';
import ButtonSnowDecoration from './ButtonSnowDecoration';

/* ============================================================
   ESTILOS REUTILIZABLES
============================================================ */
const INPUT_CLASS =
  'block w-full pl-12 pr-5 py-4 bg-slate-50 border border-transparent ' +
  'text-slate-900 rounded-2xl placeholder-slate-400 focus:bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ' +
  'transition-all duration-300 text-sm font-medium';

const ICON_CLASS =
  'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none';

/* ============================================================
   SUBCOMPONENTE: Input con ícono
============================================================ */
const IconInput = ({ icon: Icon, rightSlot, ...inputProps }) => (
  <div className="relative">
    <Icon className={ICON_CLASS} />
    <input
      className={rightSlot ? INPUT_CLASS.replace('pr-5', 'pr-12') : INPUT_CLASS}
      {...inputProps}
    />
    {rightSlot}
  </div>
);

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */
const LoginForm = ({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
  rememberMe,
  setRememberMe,
  setShowForgotPassword
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full animate-fade-in">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-1">¡Hola de nuevo!</h2>
        <p className="text-sm text-slate-500 font-medium">Accede a tu panel de control</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Usuario */}
        <IconInput
          icon={UserIcon}
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario del sistema"
          required
        />

        {/* Contraseña */}
        <IconInput
          icon={LockClosedIcon}
          type={showPassword ? 'text' : 'password'}
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          }
        />

        {/* Recordar sesión / problemas */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-red-600 bg-slate-100 border-transparent rounded focus:ring-red-500 cursor-pointer transition-colors"
            />
            <label
              htmlFor="remember-me"
              className="ml-3 block text-sm text-slate-600 font-medium cursor-pointer select-none"
            >
              Recordar sesión
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm font-bold text-yellow-600 hover:text-yellow-500 transition-colors"
          >
            ¿Problemas?
          </button>
        </div>

        {/* Botón ingresar */}
        <div>
          <button
            type="submit"
            className="relative w-full h-16 overflow-hidden flex items-center justify-center rounded-2xl shadow-lg shadow-red-600/30 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:via-red-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transform transition-all duration-300 hover:-translate-y-1"
          >
            {decorNavidad && <ButtonSnowDecoration />}
            <span className="relative z-30 text-sm font-bold text-white tracking-wide drop-shadow-md">
              INGRESAR AHORA
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;