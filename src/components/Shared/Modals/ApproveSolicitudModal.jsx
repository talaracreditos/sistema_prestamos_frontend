import React, { useState } from 'react';
import { BuildingLibraryIcon, CheckBadgeIcon, XMarkIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const ApproveSolicitudModal = ({ isOpen, onClose, onConfirm, solicitud, loading, alert, onClearAlert }) => {
    const [codigoRecaudo, setCodigoRecaudo] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(solicitud.id, 2, 'CUENTA CORRIENTE', codigoRecaudo.trim());
    };

    return (
        <div className="fixed inset-0 z-[999] overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">

                    <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="p-6 text-center border-b border-slate-50 bg-slate-50/50">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <CheckBadgeIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase">Aprobar Préstamo</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tight">
                            Cliente: <span className="text-blue-600">{solicitud?.cliente_nombre}</span>
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-6 text-center space-y-5">

                        {/* Alert de error dentro del modal */}
                        <AlertMessage
                            type={alert?.type}
                            message={alert?.message}
                            details={alert?.details}
                            onClose={onClearAlert}
                        />

                        <p className="text-sm font-bold text-slate-600">
                            ¿Estás seguro de aprobar esta solicitud por <span className="text-black font-black">S/ {solicitud?.monto_solicitado}</span>?
                        </p>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 justify-center">
                            <BuildingLibraryIcon className="w-6 h-6 text-blue-600" />
                            <div className="text-left">
                                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Modalidad de Desembolso</p>
                                <p className="text-xs font-bold text-blue-600">Transferencia Bancaria (Cta. Corriente)</p>
                            </div>
                        </div>

                        <div className="text-left">
                            <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase mb-2">
                                <IdentificationIcon className="w-4 h-4 text-brand-red" />
                                Código de Recaudo *
                            </label>
                            <input
                                type="text"
                                value={codigoRecaudo}
                                onChange={(e) => setCodigoRecaudo(e.target.value)}
                                placeholder="Escribe el código de recaudo aquí..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-brand-red focus:border-brand-red block p-3 placeholder-slate-400 uppercase outline-none transition-all"
                                required
                            />
                            <p className="text-[10px] text-slate-400 mt-1.5">
                                Este código debe ser único. Se usará para los pagos del cliente.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 flex gap-3">
                        <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button
                            disabled={loading || !codigoRecaudo.trim()}
                            onClick={handleConfirm}
                            className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none active:scale-95 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Procesando...
                                </>
                            ) : 'Confirmar Desembolso'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApproveSolicitudModal;