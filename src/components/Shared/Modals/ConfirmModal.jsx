import React, { useState, useRef } from 'react';
import { ExclamationTriangleIcon, KeyIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({
    title       = "¿Estás seguro?",
    message,
    onConfirm,
    onCancel,
    confirmText = 'Sí, continuar',
    cancelText  = 'Cancelar',
    requirePin  = false,
    loading     = false,
}) => {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const inputsRef           = useRef([]);

    const handleChange = (index, value) => {
        const val  = value.replace(/\D/, '').slice(-1);
        const next = [...digits];
        next[index] = val;
        setDigits(next);
        if (val && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            inputsRef.current[5]?.focus();
        }
        e.preventDefault();
    };

    const pin        = digits.join('');
    const canSubmit = !loading && (!requirePin || pin.length === 6);

    const handleConfirm = () => {
        if (!canSubmit) return;
        onConfirm(requirePin ? pin : undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors">
            {/* Backdrop — bloqueado mientras loading */}
            <div
                className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
                onClick={loading ? undefined : onCancel}
            />

            <div className="relative bg-white dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-sm overflow-hidden transition-colors">

                {/* Overlay bloqueante mientras procesa */}
                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-2xl transition-colors">
                        <div className="w-8 h-8 border-4 border-brand-red/20 dark:border-brand-gold/20 border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">Procesando...</p>
                    </div>
                )}

                <div className="p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 mb-5 transition-colors">
                        <ExclamationTriangleIcon className="h-7 w-7 text-brand-red dark:text-red-400" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-black text-slate-900 dark:text-dark-text uppercase tracking-tight transition-colors">{title}</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-muted font-medium transition-colors">{message}</p>
                    </div>

                    {requirePin && (
                        <div className="mt-5">
                            <div className="flex items-center gap-1.5 justify-center mb-3">
                                <KeyIcon className="w-3.5 h-3.5 text-slate-400 dark:text-dark-text-muted" />
                                <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-wider">
                                    PIN de Autorización
                                </p>
                            </div>
                            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                                {digits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => inputsRef.current[i] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={d}
                                        disabled={loading}
                                        onChange={e => handleChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        className={`w-10 h-11 text-center text-base font-black rounded-xl border-2 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                            ${d ? 'border-brand-red dark:border-brand-gold bg-brand-red-light dark:bg-brand-gold/10 text-brand-red dark:text-brand-gold' : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt text-slate-700 dark:text-dark-text'}
                                            focus:border-brand-red dark:focus:border-brand-gold focus:ring-2 focus:ring-brand-red/20 dark:focus:ring-brand-gold/20`}
                                    />
                                ))}
                            </div>
                            <p className="text-[9px] text-slate-400 dark:text-dark-text-muted text-center mt-2 font-medium">
                                Solicita el PIN a un administrador para continuar.
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 dark:bg-dark-surface-alt px-4 py-4 flex flex-col-reverse sm:flex-row justify-center gap-3 border-t border-slate-100 dark:border-dark-border transition-colors">
                    <button
                        type="button" onClick={onCancel} disabled={loading}
                        className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-6 py-2 text-sm font-bold text-slate-700 dark:text-dark-text shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button" onClick={handleConfirm} disabled={!canSubmit}
                        className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent bg-brand-red dark:bg-brand-red-glow px-6 py-2 text-sm font-bold text-white dark:text-black shadow-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all active:scale-95 uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                Procesando...
                            </span>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;