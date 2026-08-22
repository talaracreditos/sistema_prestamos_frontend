import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';

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
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          ¡Hola de nuevo!
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Accede a tu panel de control
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1 relative">
          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full pl-12 pr-5 py-4 bg-slate-50 border border-transparent text-slate-900 rounded-2xl placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-sm font-medium"
            placeholder="Usuario del sistema"
            required
          />
        </div>

        <div className="relative">
          <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent text-slate-900 rounded-2xl placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-sm font-medium"
            placeholder="Contraseña"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword
              ? <EyeSlashIcon className="w-5 h-5" />
              : <EyeIcon className="w-5 h-5" />
            }
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-red-600 bg-slate-100 border-transparent rounded focus:ring-red-500 cursor-pointer transition-colors"
            />
            <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-600 font-medium cursor-pointer select-none">
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

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-lg shadow-red-600/30 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transform transition-all duration-300 hover:-translate-y-1 tracking-wide"
          >
            INGRESAR AHORA
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;