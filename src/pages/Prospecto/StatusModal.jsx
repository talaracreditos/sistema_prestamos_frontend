import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { status } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { EstadoBadge } from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import { toUpper } from 'utilities/Validations/validations';

const StatusModal = ({ isOpen, onClose, prospecto, onSuccess, onNotify }) => {
    const [estadoNuevo, setEstadoNuevo] = useState('');
    const [nota,        setNota]        = useState('');
    const [loading,     setLoading]     = useState(false);

    const handleSubmit = async () => {
        if (!estadoNuevo) {
            onNotify?.({ type: 'error', message: 'Selecciona Aprobar o Rechazar.' });
            return;
        }
        setLoading(true);
        try {
            const res = await status(prospecto.id, { estado: parseInt(estadoNuevo), nota });
            onNotify?.({
                type: 'success',
                message: estadoNuevo === '4' ? 'Prospecto aprobado correctamente.' : 'Prospecto rechazado correctamente.',
            });
            onSuccess(res.data || res);
            onClose();
            setEstadoNuevo('');
            setNota('');
        } catch (err) {
            const apiErr = handleApiError(err);
            onNotify?.({
                type: 'error',
                message: apiErr?.message || 'Error al actualizar el estado',
                details: apiErr?.details,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={true} title="Aprobar / Rechazar Prospecto" size="md">
            <div className="space-y-5 transition-colors">

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border transition-colors">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase">Estado actual:</span>
                    <EstadoBadge estado={prospecto?.estado} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setEstadoNuevo('4')}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-black text-xs uppercase transition-all
                            ${estadoNuevo === '4'
                                ? 'border-green-500 bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                : 'border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted hover:border-green-200 dark:hover:border-green-500/40'}`}>
                        <CheckCircleIcon className="w-6 h-6" />
                        Aprobar
                    </button>
                    <button type="button" onClick={() => setEstadoNuevo('5')}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-black text-xs uppercase transition-all
                            ${estadoNuevo === '5'
                                ? 'border-red-500 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                : 'border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted hover:border-red-200 dark:hover:border-red-500/40'}`}>
                        <XCircleIcon className="w-6 h-6" />
                        Rechazar
                    </button>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">
                        Motivo / Comentario {estadoNuevo === '5' ? '*' : '(Opcional)'}
                    </label>
                    <textarea
                        value={nota}
                        onChange={(e) => setNota(toUpper(e.target.value))}
                        className="w-full p-3 text-sm bg-slate-50 dark:bg-dark-surface-alt text-slate-800 dark:text-dark-text border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-brand-gold outline-none min-h-[80px] placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors"
                        placeholder={estadoNuevo === '5' ? 'MOTIVO DEL RECHAZO...' : 'OBSERVACIONES DE APROBACIÓN...'}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-dark-border transition-colors">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text rounded-xl font-bold text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading || !estadoNuevo}
                        className={`px-6 py-2.5 text-white rounded-xl font-black text-xs uppercase transition-all disabled:opacity-40
                            ${estadoNuevo === '5' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'}`}>
                        {loading ? 'Guardando...' : estadoNuevo === '4' ? 'Aprobar' : estadoNuevo === '5' ? 'Rechazar' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </ViewModal>
    );
};

export default StatusModal;