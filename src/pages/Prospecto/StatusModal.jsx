import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { status } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { EstadoBadge } from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import { toUpper } from 'utilities/Validations/validations';

const StatusModal = ({ isOpen, onClose, prospecto, onSuccess }) => {
    const [estadoNuevo, setEstadoNuevo] = useState('');
    const [nota,        setNota]        = useState('');
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState(null);

    const handleSubmit = async () => {
        if (!estadoNuevo) return setError('Selecciona Aprobar o Rechazar.');
        setLoading(true);
        setError(null);
        try {
            const res = await status(prospecto.id, { estado: parseInt(estadoNuevo), nota });
            onSuccess(res.data || res);
            onClose();
            setEstadoNuevo('');
            setNota('');
        } catch (err) {
            setError(handleApiError(err)?.message || 'Error al actualizar el estado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={true} title="Aprobar / Rechazar Prospecto" size="md">
            <div className="space-y-5">

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Estado actual:</span>
                    <EstadoBadge estado={prospecto?.estado} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setEstadoNuevo('4')}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-black text-xs uppercase transition-all
                            ${estadoNuevo === '4'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-slate-200 text-slate-400 hover:border-green-200'}`}>
                        <CheckCircleIcon className="w-6 h-6" />
                        Aprobar
                    </button>
                    <button type="button" onClick={() => setEstadoNuevo('5')}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-black text-xs uppercase transition-all
                            ${estadoNuevo === '5'
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-slate-200 text-slate-400 hover:border-red-200'}`}>
                        <XCircleIcon className="w-6 h-6" />
                        Rechazar
                    </button>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                        Motivo / Comentario {estadoNuevo === '5' ? '*' : '(Opcional)'}
                    </label>
                    <textarea
                        value={nota}
                        onChange={(e) => setNota(toUpper(e.target.value))}
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none min-h-[80px]"
                        placeholder={estadoNuevo === '5' ? 'MOTIVO DEL RECHAZO...' : 'OBSERVACIONES DE APROBACIÓN...'}
                    />
                </div>

                {error && <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-xl">{error}</p>}

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading || !estadoNuevo}
                        className={`px-6 py-2.5 text-white rounded-xl font-black text-xs uppercase transition-all disabled:opacity-40
                            ${estadoNuevo === '5' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {loading ? 'Guardando...' : estadoNuevo === '4' ? 'Aprobar' : estadoNuevo === '5' ? 'Rechazar' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </ViewModal>
    );
};

export default StatusModal;