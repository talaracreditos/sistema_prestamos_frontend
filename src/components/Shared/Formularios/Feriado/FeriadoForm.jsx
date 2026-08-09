import React from 'react';
import Calendario from 'components/Shared/Calendars/Calendario';
import { toUpper } from 'utilities/Validations/validations';

const FeriadoForm = ({
    formData,
    handleChange,
    handleSubmit,
    loading,
    feriados = [],
    isEdit = false,
}) => {
    const feriadosCalendario = feriados.map(f => ({
        ...f,
        fecha: f.fecha?.includes('/') ? f.fecha.split('/').reverse().join('-') : f.fecha,
    }));

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 bg-white dark:bg-dark-surface p-10 rounded-[40px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors"
        >
            {/* Columna izquierda — Calendario */}
            <div className="flex flex-col items-center">
                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-6 tracking-widest transition-colors">
                    {isEdit ? 'Modificar Fecha' : '1. Selecciona la Fecha del Calendario'}
                </label>
                <Calendario
                    mode="single"
                    selected={formData.fecha || null}
                    onSelect={(iso) => { if (iso) handleChange('fecha', iso); }}
                    feriados={feriadosCalendario}
                />
                {!isEdit && feriadosCalendario.length > 0 && (
                    <p className="text-[9px] text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mt-4 transition-colors">
                        Días <span className="font-bold text-brand-red dark:text-brand-gold">marcados</span> = feriados registrados
                    </p>
                )}
            </div>

            {/* Columna derecha — Campos */}
            <div className="flex flex-col justify-center space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1 tracking-widest transition-colors">
                        {isEdit ? 'Nueva Fecha' : 'Fecha Seleccionada'}
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={formData.fecha || 'NADA SELECCIONADO'}
                        className="w-full p-4 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-2xl font-black text-brand-red dark:text-brand-gold text-center outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1 tracking-widest transition-colors">
                        Descripción {isEdit ? '' : 'del Feriado'}
                    </label>
                    <input
                        type="text"
                        value={formData.descripcion || ''}
                        onChange={(e) => handleChange('descripcion', toUpper(e.target.value))}
                        placeholder="EJ: COMBATE DE ANGAMOS"
                        className="w-full p-4 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-2xl font-bold text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-all"
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.fecha}
                        className="w-full py-4 bg-brand-red dark:bg-brand-red-glow text-white dark:text-black font-black uppercase rounded-2xl hover:bg-brand-red-dark dark:hover:brightness-110 transition-all shadow-xl shadow-brand-red/30 dark:shadow-black/30 disabled:opacity-50 tracking-widest active:scale-95"
                    >
                        {loading
                            ? (isEdit ? 'Guardando...' : 'Procesando...')
                            : (isEdit ? 'Actualizar Feriado' : 'Registrar Feriado')
                        }
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FeriadoForm;