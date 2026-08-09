import React, { useState, useEffect } from 'react';
import { IdentificationIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const CodigoRecaudoModal = ({ isOpen, onClose, solicitud, onConfirm, loading, alert, onClearAlert }) => {
    const [codigo, setCodigo] = useState('');

    useEffect(() => {
        if (isOpen) setCodigo(solicitud?.codigo_recaudo || '');
    }, [isOpen, solicitud]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!codigo.trim()) return;
        onConfirm(solicitud.id, codigo.trim());
    };

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-3xl shadow-2xl dark:shadow-black/50 w-full max-w-md overflow-hidden transition-colors">

                    <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text z-10 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <div className="p-6 text-center border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt transition-colors">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transition-colors">
                            <IdentificationIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-dark-text uppercase transition-colors">Código de Recaudo</h3>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted font-bold mt-1 uppercase tracking-tight transition-colors">
                            Solicitud #{solicitud?.id} — <span className="text-blue-600 dark:text-blue-400">{solicitud?.cliente_nombre}</span>
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <AlertMessage
                            type={alert?.type}
                            message={alert?.message}
                            details={alert?.details}
                            onClose={onClearAlert}
                        />

                        <div className="text-left">
                            <label className="block text-xs font-black text-slate-700 dark:text-dark-text uppercase mb-2 transition-colors">
                                Código de Recaudo *
                            </label>
                            <input
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                placeholder="Escribe el código de recaudo aquí..."
                                className="w-full bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border text-slate-800 dark:text-dark-text text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 placeholder-slate-400 dark:placeholder-dark-text-muted/60 uppercase outline-none transition-all"
                                required
                                autoFocus
                            />
                            <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1.5 transition-colors">
                                Este código debe ser único en todo el sistema (solicitudes y préstamos). Se necesita antes de poder aprobar la solicitud.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-dark-surface-alt border-t border-slate-100 dark:border-dark-border flex gap-3 transition-colors">
                        <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase hover:text-slate-600 dark:hover:text-dark-text transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button
                            disabled={loading || !codigo.trim()}
                            onClick={handleConfirm}
                            className="flex-[2] bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl dark:shadow-black/30 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-dark-border disabled:shadow-none active:scale-95 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : 'Guardar Código'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodigoRecaudoModal;