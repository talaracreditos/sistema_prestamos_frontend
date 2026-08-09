import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecureModule } from 'context/SecureModuleContext';
import {
    LockClosedIcon, LockOpenIcon,
    ShieldCheckIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

// ── Pantalla de bloqueo inline (no es un modal flotante, ocupa el espacio
//    del contenido para que el layout sidebar/header siga visible) ─────────────
const LockScreen = ({ onUnlock, verifying, error, onClearError, onBack }) => {
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 80);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password.trim() || verifying) return;
        onUnlock(password);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 transition-colors">
            <div className="w-full max-w-sm">

                {/* Icono + título */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand-red dark:bg-brand-red-glow flex items-center justify-center shadow-xl shadow-brand-red/30 dark:shadow-black/30 mb-4 transition-colors">
                        <LockClosedIcon className="w-8 h-8 text-white dark:text-black" />
                    </div>
                    <h2 className="text-base font-black text-slate-800 dark:text-dark-text uppercase tracking-widest transition-colors">
                        Módulo Restringido
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-wider mt-1 transition-colors">
                        Ingresa tu contraseña para acceder
                    </p>
                </div>

                {/* Aviso */}
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2.5 mb-6 transition-colors">
                    <ShieldCheckIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 leading-relaxed transition-colors">
                        Esta sección contiene configuraciones críticas del sistema.
                        El acceso se mantendrá desbloqueado por{' '}
                        <span className="font-black">5 minutos</span>.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 transition-colors">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); onClearError(); }}
                                placeholder="••••••••"
                                disabled={verifying}
                                className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm font-bold
                                    focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all
                                    disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-dark-surface-alt
                                    text-slate-800 dark:text-dark-text
                                    ${error
                                        ? 'border-red-400 bg-red-50 dark:bg-red-500/20 focus:ring-red-400'
                                        : 'border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface'
                                    }`}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPass(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text transition-colors"
                            >
                                {showPass
                                    ? <EyeSlashIcon className="w-4 h-4" />
                                    : <EyeIcon className="w-4 h-4" />
                                }
                            </button>
                        </div>
                        {error && (
                            <p className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase mt-1.5 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-black text-slate-500 dark:text-dark-text-muted
                                hover:bg-slate-100 dark:hover:bg-dark-surface-alt rounded-xl uppercase transition-all"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" /> Volver
                        </button>
                        <button
                            type="submit"
                            disabled={!password.trim() || verifying}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5
                                bg-brand-red dark:bg-brand-red-glow hover:bg-brand-red-dark dark:hover:brightness-110 text-white dark:text-black text-[11px] font-black
                                uppercase rounded-xl transition-all shadow-md shadow-brand-red/20 dark:shadow-black/30
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {verifying
                                ? <><ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Verificando...</>
                                : <><LockClosedIcon className="w-3.5 h-3.5" /> Confirmar</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Badge de estado visible cuando el módulo está desbloqueado ──────────────
const UnlockedBadge = ({ onLock }) => (
    <div className="flex justify-start px-1 mt-4 mb-2 ml-12 transition-colors">
        <button
            onClick={onLock}
            className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20
                rounded-lg text-[10px] font-black text-green-700 dark:text-green-400 uppercase hover:bg-green-100 dark:hover:bg-green-500/20 transition-all"
        >
            <LockOpenIcon className="w-3 h-3" />
            Desbloqueado — Click para bloquear
        </button>
    </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const SecureRoute = ({ element }) => {
    const { isUnlocked, verifying, error, unlock, lock, clearError } = useSecureModule();
    const navigate = useNavigate();

    if (!isUnlocked) {
        return (
            <LockScreen
                onUnlock={unlock}
                verifying={verifying}
                error={error}
                onClearError={clearError}
                onBack={() => navigate('/home')}
            />
        );
    }

    return (
        <>
            <UnlockedBadge onLock={lock} />
            {element}
        </>
    );
};

export default SecureRoute;