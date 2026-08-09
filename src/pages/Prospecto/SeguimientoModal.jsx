import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { registrarSeguimiento } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { EstadoBadge, ESTADOS_LABEL } from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import { toUpper } from 'utilities/Validations/validations';

const ESTADOS_OPCIONES = [2, 3]; // Contactado, En Evaluación

const SeguimientoModal = ({ isOpen, onClose, prospecto, onSuccess, onNotify }) => {
    const [estadoNuevo, setEstadoNuevo] = useState('');
    const [nota,        setNota]        = useState('');
    const [loading,     setLoading]     = useState(false);

    const handleSubmit = async () => {
        if (!estadoNuevo) {
            onNotify?.({ type: 'error', message: 'Selecciona el nuevo estado.' });
            return;
        }
        setLoading(true);
        try {
            const res = await registrarSeguimiento(prospecto.id, { estado: parseInt(estadoNuevo), nota });
            onNotify?.({ type: 'success', message: 'Seguimiento registrado correctamente.' });
            onSuccess(res.data || res);
            onClose();
            setEstadoNuevo('');
            setNota('');
        } catch (err) {
            const apiErr = handleApiError(err);
            onNotify?.({
                type: 'error',
                message: apiErr?.message || 'Error al registrar seguimiento',
                details: apiErr?.details,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={true} title="Registrar Seguimiento" size="md">
            <div className="space-y-5 transition-colors">

                {/* Estado actual */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border transition-colors">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase">Estado actual:</span>
                    <EstadoBadge estado={prospecto?.estado} />
                    <ArrowRightIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                    {estadoNuevo
                        ? <EstadoBadge estado={parseInt(estadoNuevo)} />
                        : <span className="text-[11px] text-slate-300 dark:text-dark-text-muted/60 italic">Selecciona nuevo estado</span>
                    }
                </div>

                {/* Selector de estado */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">Nuevo Estado *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ESTADOS_OPCIONES.map(e => {
                            const info = ESTADOS_LABEL[e];
                            return (
                                <button key={e} type="button"
                                    onClick={() => setEstadoNuevo(e.toString())}
                                    className={`py-2.5 px-3 rounded-xl border-2 text-[11px] font-black uppercase transition-all ${
                                        estadoNuevo === e.toString()
                                            ? `${info.color} border-current`
                                            : 'border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}>
                                    {info.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Nota */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">Nota / Comentario</label>
                    <textarea
                        value={nota}
                        onChange={(e) => setNota(toUpper(e.target.value))}
                        className="w-full p-3 text-sm bg-slate-50 dark:bg-dark-surface-alt text-slate-800 dark:text-dark-text border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-brand-gold outline-none min-h-[80px] placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors"
                        placeholder="DESCRIBE EL RESULTADO DEL CONTACTO..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text rounded-xl font-bold text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading || !estadoNuevo}
                        className="px-6 py-2.5 bg-slate-900 dark:bg-black text-white rounded-xl font-black text-xs uppercase hover:bg-slate-700 dark:hover:bg-slate-800 transition-all disabled:opacity-40">
                        {loading ? 'Guardando...' : 'Registrar'}
                    </button>
                </div>
            </div>
        </ViewModal>
    );
};

export default SeguimientoModal;