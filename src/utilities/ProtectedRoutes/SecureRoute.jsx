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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="w-full max-w-sm">

                {/* Icono + título */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand-red flex items-center justify-center shadow-xl shadow-brand-red/30 mb-4">
                        <LockClosedIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-widest">
                        Módulo Restringido
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Ingresa tu contraseña para acceder
                    </p>
                </div>

                {/* Aviso */}
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-6">
                    <ShieldCheckIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                        Esta sección contiene configuraciones críticas del sistema.
                        El acceso se mantendrá desbloqueado por{' '}
                        <span className="font-black">5 minutos</span>.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
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
                                    focus:ring-2 focus:ring-brand-red outline-none transition-all
                                    disabled:opacity-50 disabled:bg-slate-50
                                    ${error
                                        ? 'border-red-400 bg-red-50 focus:ring-red-400'
                                        : 'border-slate-300 bg-white'
                                    }`}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPass(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPass
                                    ? <EyeSlashIcon className="w-4 h-4" />
                                    : <EyeIcon className="w-4 h-4" />
                                }
                            </button>
                        </div>
                        {error && (
                            <p className="text-[10px] font-black text-red-500 uppercase mt-1.5 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-black text-slate-500
                                hover:bg-slate-100 rounded-xl uppercase transition-all"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" /> Volver
                        </button>
                        <button
                            type="submit"
                            disabled={!password.trim() || verifying}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5
                                bg-brand-red hover:bg-brand-red-dark text-white text-[11px] font-black
                                uppercase rounded-xl transition-all shadow-md shadow-brand-red/20
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
    <div className="flex justify-start px-1 mt-4 mb-2 ml-12">
        <button
            onClick={onLock}
            className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200
                rounded-lg text-[10px] font-black text-green-700 uppercase hover:bg-green-100 transition-all"
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