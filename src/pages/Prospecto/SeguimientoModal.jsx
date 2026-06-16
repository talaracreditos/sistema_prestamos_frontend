import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { registrarSeguimiento } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { EstadoBadge, ESTADOS_LABEL } from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import { toUpper } from 'utilities/Validations/validations';

const ESTADOS_OPCIONES = [2, 3]; // Contactado, En Evaluación

const SeguimientoModal = ({ isOpen, onClose, prospecto, onSuccess }) => {
    const [estadoNuevo, setEstadoNuevo] = useState('');
    const [nota,        setNota]        = useState('');
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!estadoNuevo) return setError('Selecciona el nuevo estado.');
        setLoading(true);
        setError(null);
        try {
            const res = await registrarSeguimiento(prospecto.id, { estado: parseInt(estadoNuevo), nota });
            onSuccess(res.data || res);
            onClose();
            setEstadoNuevo('');
            setNota('');
        } catch (err) {
            setError(handleApiError(err)?.message || 'Error al registrar seguimiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={true} title="Registrar Seguimiento" size="md">
            <div className="space-y-5">

                {/* Estado actual */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Estado actual:</span>
                    <EstadoBadge estado={prospecto?.estado} />
                    <ArrowRightIcon className="w-4 h-4 text-slate-400" />
                    {estadoNuevo
                        ? <EstadoBadge estado={parseInt(estadoNuevo)} />
                        : <span className="text-[11px] text-slate-300 italic">Selecciona nuevo estado</span>
                    }
                </div>

                {/* Selector de estado */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Nuevo Estado *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ESTADOS_OPCIONES.map(e => {
                            const info = ESTADOS_LABEL[e];
                            return (
                                <button key={e} type="button"
                                    onClick={() => setEstadoNuevo(e.toString())}
                                    className={`py-2.5 px-3 rounded-xl border-2 text-[11px] font-black uppercase transition-all ${
                                        estadoNuevo === e.toString()
                                            ? `${info.color} border-current`
                                            : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                    }`}>
                                    {info.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Nota */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Nota / Comentario</label>
                    <textarea
                        value={nota}
                        onChange={(e) => setNota(toUpper(e.target.value))}
                        className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none min-h-[80px]"
                        placeholder="DESCRIBE EL RESULTADO DEL CONTACTO..."
                    />
                </div>

                {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase hover:bg-slate-200 transition-all">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading || !estadoNuevo}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase hover:bg-slate-700 transition-all disabled:opacity-40">
                        {loading ? 'Guardando...' : 'Registrar'}
                    </button>
                </div>
            </div>
        </ViewModal>
    );
};

export default SeguimientoModal;