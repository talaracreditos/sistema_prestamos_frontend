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
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

                    <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <div className="p-6 text-center border-b border-slate-50 bg-slate-50/50">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <IdentificationIcon className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase">Código de Recaudo</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tight">
                            Solicitud #{solicitud?.id} — <span className="text-blue-600">{solicitud?.cliente_nombre}</span>
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
                            <label className="block text-xs font-black text-slate-700 uppercase mb-2">
                                Código de Recaudo *
                            </label>
                            <input
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                placeholder="Escribe el código de recaudo aquí..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 placeholder-slate-400 uppercase outline-none transition-all"
                                required
                                autoFocus
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5">
                                Este código debe ser único en todo el sistema (solicitudes y préstamos). Se necesita antes de poder aprobar la solicitud.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 flex gap-3">
                        <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button
                            disabled={loading || !codigo.trim()}
                            onClick={handleConfirm}
                            className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none active:scale-95 flex justify-center items-center gap-2"
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