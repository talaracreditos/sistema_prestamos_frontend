import React from 'react';
import { BuildingLibraryIcon, CheckBadgeIcon, XMarkIcon, IdentificationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const ApproveSolicitudModal = ({ isOpen, onClose, onConfirm, solicitud, loading, alert, onClearAlert }) => {
    if (!isOpen) return null;

    const tieneCodigoRecaudo = !!solicitud?.codigo_recaudo;

    const handleConfirm = () => {
        onConfirm(solicitud.id, 2, 'CUENTA CORRIENTE');
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

                        {/* 🔥 Código de recaudo — ya NO se pide aquí, solo se muestra */}
                        {tieneCodigoRecaudo ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 justify-center">
                                <IdentificationIcon className="w-6 h-6 text-slate-400" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código de Recaudo</p>
                                    <p className="text-sm font-black text-slate-800">{solicitud.codigo_recaudo}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 justify-center">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
                                <p className="text-xs font-bold text-red-700 text-left">
                                    Esta solicitud aún no tiene código de recaudo asignado. Ciérrala y asígnalo primero desde el botón correspondiente.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 flex gap-3">
                        <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 text-xs font-black text-slate-400 uppercase hover:text-slate-600 transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button
                            disabled={loading || !tieneCodigoRecaudo}
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