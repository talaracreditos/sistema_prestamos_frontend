import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon, LockClosedIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const CerrarSesionModal = ({ isOpen, onClose, onConfirm, loading, sesionActiva }) => {
    const [observaciones, setObservaciones] = useState('');
    const saldoActual = sesionActiva ? parseFloat(sesionActiva.saldo_actual) : 0;

    useEffect(() => {
        if (!isOpen) return;
        setObservaciones('');
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ observaciones });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors">
            <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-3xl shadow-2xl dark:shadow-black/50 w-full max-w-lg overflow-hidden transition-colors">
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-dark-border transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 dark:bg-black rounded-xl transition-colors">
                            <LockClosedIcon className="w-4 h-4 text-white dark:text-dark-text" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[.18em] text-slate-800 dark:text-dark-text transition-colors">
                            Cierre de Caja Chica
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-7 space-y-5">
                    <div className="bg-brand-red dark:bg-brand-red-glow p-6 rounded-2xl text-center text-white dark:text-black shadow-xl shadow-brand-red/20 dark:shadow-black/30 border border-brand-red-dark dark:border-transparent relative overflow-hidden transition-colors">
                        <BanknotesIcon className="w-6 h-6 mx-auto mb-2 text-brand-gold dark:text-black" />
                        <p className="text-[10px] font-black text-brand-red-light/80 dark:text-black/70 uppercase tracking-widest mb-1 relative z-10">Saldo Final a Cerrar</p>
                        <h2 className="text-4xl font-black text-brand-gold dark:text-black italic relative z-10 drop-shadow-sm">S/ {saldoActual.toFixed(2)}</h2>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-dark-text-muted font-medium text-center px-4 leading-relaxed">
                        Este saldo se calcula automáticamente con todos los movimientos registrados. No requiere arqueo físico.
                    </p>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-2">Observaciones del Cierre</label>
                        <div className="relative">
                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted" />
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Ej: Se entrega la caja chica al terminar el mes..."
                                className="w-full pl-10 p-3 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl font-medium text-sm text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all min-h-[80px] placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-red-dark dark:bg-brand-red-glow text-white dark:text-black py-4 rounded-xl font-black uppercase text-sm shadow-xl hover:bg-brand-red dark:hover:brightness-110 hover:text-brand-gold dark:hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? 'Procesando Cierre...' : 'Cerrar Caja Chica'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CerrarSesionModal;