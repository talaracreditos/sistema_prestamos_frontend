import React, { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon, ArrowPathIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { historialReprogramaciones } from 'services/prestamoService';

const HistorialReprogramacionesModal = ({ isOpen, onClose, prestamoId }) => {
    const [loading, setLoading]      = useState(false);
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        if (!isOpen || !prestamoId) return;
        setLoading(true);
        historialReprogramaciones(prestamoId)
            .then(res => setHistorial(res.data || res || []))
            .finally(() => setLoading(false));
    }, [isOpen, prestamoId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
            <div className="bg-white dark:bg-dark-surface rounded-[24px] shadow-2xl dark:shadow-black/50 w-full max-w-2xl max-h-[85vh] overflow-hidden border border-slate-100 dark:border-dark-border animate-in zoom-in-95 duration-200 flex flex-col transition-colors">

                <div className="p-6 bg-slate-50 dark:bg-dark-surface-alt border-b border-slate-100 dark:border-dark-border flex items-center justify-between shrink-0 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-100 dark:bg-teal-500/20 rounded-xl transition-colors">
                            <ClockIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-dark-text uppercase text-sm tracking-wide transition-colors">
                                Historial de Reprogramaciones
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-dark-text-muted font-bold mt-0.5 transition-colors">
                                {historial.length} {historial.length === 1 ? 'movimiento registrado' : 'movimientos registrados'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <ArrowPathIcon className="w-7 h-7 animate-spin text-teal-600 dark:text-teal-400" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {historial.map((r) => (
                                <div key={r.id} className="p-4 rounded-2xl border border-teal-100 dark:border-teal-500/20 bg-teal-50/50 dark:bg-teal-500/10 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-2 rounded-full bg-teal-100 dark:bg-teal-500/20 shrink-0 transition-colors">
                                            <ClockIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                                <p className="text-sm font-black text-teal-800 dark:text-teal-300 transition-colors">{r.fecha}</p>
                                                <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 transition-colors">
                                                    {r.frecuencia_anterior} → {r.frecuencia_nueva}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-dark-text mb-1.5 transition-colors">
                                                <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400 dark:text-dark-text-muted shrink-0" />
                                                1ra cuota: <span className="text-slate-800 dark:text-dark-text">{r.fecha_primera_cuota_anterior}</span>
                                                <span className="text-slate-300 dark:text-dark-text-muted">→</span>
                                                <span className="text-teal-700 dark:text-teal-400">{r.fecha_primera_cuota_nueva}</span>
                                            </div>

                                            <p className="text-xs font-bold text-slate-500 dark:text-dark-text-muted mb-1.5 transition-colors">
                                                {r.cuotas_afectadas} {r.cuotas_afectadas === 1 ? 'cuota afectada' : 'cuotas afectadas'}
                                            </p>

                                            {r.motivo && (
                                                <p className="text-xs text-slate-500 dark:text-dark-text-muted font-medium italic bg-white dark:bg-dark-surface rounded-lg px-3 py-2 mt-2 border border-slate-100 dark:border-dark-border transition-colors">
                                                    "{r.motivo}"
                                                </p>
                                            )}

                                            <p className="text-[11px] text-slate-400 dark:text-dark-text-muted font-bold mt-2 transition-colors">Realizado por: {r.usuario}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {historial.length === 0 && (
                                <p className="text-center text-sm text-slate-400 dark:text-dark-text-muted font-bold py-10 transition-colors">Sin reprogramaciones</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistorialReprogramacionesModal;