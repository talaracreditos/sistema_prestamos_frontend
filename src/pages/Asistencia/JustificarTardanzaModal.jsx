// components/Shared/Modals/JustificarTardanzaModal.jsx
import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const JustificarTardanzaModal = ({ asistencia, onClose, onConfirm, loading }) => {
    const [motivo, setMotivo] = useState(asistencia?.motivo_justificacion || '');

    const yaJustificada = !!asistencia?.justificada;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-surface rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-dark-border transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-dark-text uppercase flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                        Justificar Tardanza
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-dark-text-muted dark:hover:text-dark-text">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-xs font-bold text-slate-500 dark:text-dark-text-muted mb-4">
                    {asistencia?.nombre_completo} — {asistencia?.fecha}
                </p>

                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5">
                    Motivo
                </label>
                <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={3}
                    placeholder="Ej: Cita médica, tráfico por accidente, etc."
                    className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm font-bold
                        focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all
                        bg-white dark:bg-dark-surface-alt text-slate-800 dark:text-dark-text resize-none"
                />

                <div className="flex gap-2 mt-5">
                    {yaJustificada && (
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => onConfirm({ justificada: false, motivo_justificacion: null })}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text-muted font-black uppercase text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-dark-border transition-all disabled:opacity-50"
                        >
                            Quitar justificación
                        </button>
                    )}
                    <button
                        type="button"
                        disabled={loading || !motivo.trim()}
                        onClick={() => onConfirm({ justificada: true, motivo_justificacion: motivo.trim() })}
                        className="flex-1 py-2.5 bg-brand-red dark:bg-brand-red-glow text-white dark:text-black font-black uppercase text-xs rounded-xl hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Justificar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JustificarTardanzaModal;