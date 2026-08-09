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
        <div className="fixed inset-0 z-[999] overflow-y-auto transition-colors">
            <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative bg-white dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-3xl shadow-2xl dark:shadow-black/50 w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100">

                    <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text z-10 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="p-6 text-center border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt transition-colors">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transition-colors">
                            <CheckBadgeIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-dark-text uppercase transition-colors">Aprobar Préstamo</h3>
                        <p className="text-xs text-slate-500 dark:text-dark-text-muted font-bold mt-1 uppercase tracking-tight transition-colors">
                            Cliente: <span className="text-blue-600 dark:text-blue-400">{solicitud?.cliente_nombre}</span>
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

                        <p className="text-sm font-bold text-slate-600 dark:text-dark-text transition-colors">
                            ¿Estás seguro de aprobar esta solicitud por <span className="text-black dark:text-white font-black">S/ {solicitud?.monto_solicitado}</span>?
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex items-center gap-3 justify-center transition-colors">
                            <BuildingLibraryIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <div className="text-left">
                                <p className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Modalidad de Desembolso</p>
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Transferencia Bancaria (Cta. Corriente)</p>
                            </div>
                        </div>

                        {tieneCodigoRecaudo ? (
                            <div className="bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl p-4 flex items-center gap-3 justify-center transition-colors">
                                <IdentificationIcon className="w-6 h-6 text-slate-400 dark:text-dark-text-muted" />
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Código de Recaudo</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-dark-text">{solicitud.codigo_recaudo}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-center gap-3 justify-center transition-colors">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                                <p className="text-xs font-bold text-red-700 dark:text-red-300 text-left">
                                    Esta solicitud aún no tiene código de recaudo asignado. Ciérrala y asígnalo primero desde el botón correspondiente.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-dark-surface-alt border-t border-slate-100 dark:border-dark-border flex gap-3 transition-colors">
                        <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase hover:text-slate-600 dark:hover:text-dark-text transition-colors disabled:opacity-50">
                            Cancelar
                        </button>
                        <button
                            disabled={loading || !tieneCodigoRecaudo}
                            onClick={handleConfirm}
                            className="flex-[2] bg-slate-900 dark:bg-black text-white dark:text-dark-text py-4 rounded-xl font-black uppercase text-xs shadow-xl dark:shadow-black/30 hover:bg-black dark:hover:bg-slate-900 transition-all disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-dark-border disabled:shadow-none active:scale-95 flex justify-center items-center gap-2"
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