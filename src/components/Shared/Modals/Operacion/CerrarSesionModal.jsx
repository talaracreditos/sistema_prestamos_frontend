import React, { useState, useEffect } from 'react';
import { BanknotesIcon, ChatBubbleLeftEllipsisIcon, XMarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const CerrarSesionModal = ({ isOpen, onClose, onConfirm, loading, sesionActiva }) => {
    const [montoReal,      setMontoReal]      = useState('');
    const [observaciones, setObservaciones] = useState('');

    const saldoEsperado = sesionActiva ? parseFloat(sesionActiva.saldo_esperado) : 0;
    const fisico        = montoReal !== '' ? parseFloat(montoReal) : 0;
    const diferencia    = parseFloat((fisico - saldoEsperado).toFixed(2));

    useEffect(() => {
        if (!isOpen) return;
        setMontoReal('');
        setObservaciones('');
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ monto_real: montoReal, observaciones });
    };

    const difColor = diferencia === 0
        ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400'
        : diferencia > 0
            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400'
            : 'bg-red-50 dark:bg-red-500/10 border-brand-red/30 dark:border-red-500/20 text-brand-red dark:text-red-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 bg-white dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-3xl shadow-2xl dark:shadow-black/50 w-full max-w-lg overflow-hidden transition-colors">

                {/* Header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-dark-border transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 dark:bg-black rounded-xl transition-colors">
                            <LockClosedIcon className="w-4 h-4 text-white dark:text-dark-text" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[.18em] text-slate-800 dark:text-dark-text transition-colors">
                            Arqueo y Cierre de Caja
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-7 space-y-5">

                    {/* Saldo esperado */}
                    <div className="bg-brand-red dark:bg-brand-red-glow p-6 rounded-2xl text-center text-white dark:text-black shadow-xl shadow-brand-red/20 dark:shadow-black/30 border border-brand-red-dark dark:border-transparent relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-brand-red-light opacity-10 rounded-full blur-2xl pointer-events-none" />
                        <p className="text-[10px] font-black text-brand-red-light/80 dark:text-black/70 uppercase tracking-widest mb-1 relative z-10">
                            Sistema: Saldo Esperado
                        </p>
                        <h2 className="text-4xl font-black text-brand-gold dark:text-black italic relative z-10 drop-shadow-sm">
                            S/ {saldoEsperado.toFixed(2)}
                        </h2>
                    </div>

                    {/* Efectivo real */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-2">
                            Efectivo Real Contado *
                        </label>
                        <div className="relative">
                            <BanknotesIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={montoReal}
                                onChange={(e) => setMontoReal(e.target.value)}
                                placeholder="¿Cuánto dinero físico hay en la caja?"
                                className="w-full pl-10 p-3 bg-white dark:bg-dark-surface-alt border-2 border-slate-200 dark:border-dark-border rounded-xl font-black text-xl text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Diferencia */}
                    {montoReal !== '' && (
                        <div className={`p-4 rounded-xl border text-center transition-colors ${difColor}`}>
                            <p className="text-[10px] font-black uppercase mb-1">Diferencia de Arqueo</p>
                            <h3 className="text-lg font-black">
                                {diferencia === 0
                                    ? 'CUADRE EXACTO'
                                    : diferencia > 0
                                        ? `SOBRAN S/ ${Math.abs(diferencia)}`
                                        : `FALTAN S/ ${Math.abs(diferencia)}`
                                }
                            </h3>
                        </div>
                    )}

                    {/* Observaciones */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-2">
                            Observaciones del Cierre
                        </label>
                        <div className="relative">
                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted" />
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Justifica si hubo algún faltante o sobrante..."
                                className="w-full pl-10 p-3 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl font-medium text-sm text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all min-h-[80px] placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                                disabled={loading}
                                required={diferencia !== 0}
                            />
                        </div>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={loading || montoReal === '' || (diferencia !== 0 && observaciones.trim() === '')}
                        className="w-full bg-brand-red-dark dark:bg-brand-red-glow text-white dark:text-black py-4 rounded-xl font-black uppercase text-sm shadow-xl hover:bg-brand-red dark:hover:brightness-110 hover:text-brand-gold dark:hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? 'Procesando Cierre...' : 'Finalizar y Cerrar Turno'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CerrarSesionModal;