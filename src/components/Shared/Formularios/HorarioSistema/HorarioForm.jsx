import React from 'react';
import RolesMultiSelect from 'components/Shared/Comboboxes/RolesMultiSelect';
import { ClockIcon, SunIcon } from '@heroicons/react/24/outline';

const DIAS_SEMANA = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' },
];

const HorarioForm = ({ formData, handleChange, handleSubmit, loading, isEdit = false }) => {

    const toggleDia = (val) => {
        const dias = formData.dias.includes(val)
            ? formData.dias.filter(d => d !== val)
            : [...formData.dias, val];
        handleChange('dias', dias);
    };

    return (
        <form onSubmit={handleSubmit}
            className="mt-6 bg-white dark:bg-dark-surface p-8 rounded-[32px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 space-y-6 max-w-2xl transition-colors">

            {/* Nombre */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 transition-colors">
                    Nombre del Horario *
                </label>
                <input type="text" value={formData.nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                    placeholder="Ej: Horario Laboral, Turno Noche..."
                    required
                    className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm font-bold
                        focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all
                        bg-white dark:bg-dark-surface-alt text-slate-800 dark:text-dark-text
                        placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                />
            </div>

            {/* Horas */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1 transition-colors">
                        <ClockIcon className="w-3 h-3" /> Hora Inicio *
                    </label>
                    <input type="time" value={formData.hora_inicio}
                        onChange={e => handleChange('hora_inicio', e.target.value)}
                        required
                        className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm font-bold
                            focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all
                            bg-white dark:bg-dark-surface-alt text-slate-800 dark:text-dark-text"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1 transition-colors">
                        <ClockIcon className="w-3 h-3" /> Hora Fin *
                    </label>
                    <input type="time" value={formData.hora_fin}
                        onChange={e => handleChange('hora_fin', e.target.value)}
                        required
                        className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm font-bold
                            focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all
                            bg-white dark:bg-dark-surface-alt text-slate-800 dark:text-dark-text"
                    />
                </div>
            </div>

            {/* Días */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors">
                    <SunIcon className="w-3 h-3" /> Días que aplica *
                </label>
                <div className="flex gap-2 flex-wrap">
                    {DIAS_SEMANA.map(d => {
                        const active = formData.dias.includes(d.value);
                        return (
                            <button key={d.value} type="button" onClick={() => toggleDia(d.value)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all border
                                    ${active
                                        ? 'bg-brand-red dark:bg-brand-red-glow text-white dark:text-black border-brand-red dark:border-transparent shadow-md shadow-brand-red/20 dark:shadow-black/20'
                                        : 'bg-white dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 hover:text-brand-red dark:hover:text-brand-gold'
                                    }`}>
                                {d.label}
                            </button>
                        );
                    })}
                </div>
                {formData.dias.length === 0 && (
                    <p className="text-[9px] text-red-400 dark:text-red-400 font-black uppercase mt-1">Selecciona al menos un día</p>
                )}
            </div>

            {/* Roles */}
            <RolesMultiSelect
                incluirCliente={true}
                selectedIds={formData.roles}
                initialRoles={formData._rolesObj ?? []}
                onChange={(ids, objs) => {
                    handleChange('roles', ids);
                    handleChange('_rolesObj', objs);
                }}
            />

            {/* Activo */}
            <div className="flex items-center gap-3">
                <button type="button"
                    onClick={() => handleChange('activo', !formData.activo)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none
                        ${formData.activo ? 'bg-brand-red dark:bg-brand-red-glow' : 'bg-slate-300 dark:bg-dark-border'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-dark-surface rounded-full shadow-sm transition-transform duration-300
                        ${formData.activo ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-[11px] font-black text-slate-600 dark:text-dark-text uppercase transition-colors">
                    {formData.activo ? 'Horario Activo' : 'Horario Inactivo'}
                </span>
            </div>

            {/* Submit */}
            <div className="pt-2">
                <button type="submit"
                    disabled={loading || !formData.nombre || !formData.hora_inicio || !formData.hora_fin || formData.dias.length === 0}
                    className="w-full py-3.5 bg-brand-red dark:bg-brand-red-glow text-white dark:text-black font-black uppercase rounded-2xl hover:bg-brand-red-dark
                         dark:hover:brightness-110 transition-all shadow-xl shadow-brand-red/30 dark:shadow-black/30 disabled:opacity-50 tracking-widest active:scale-95">
                    {loading
                        ? (isEdit ? 'Guardando...' : 'Procesando...')
                        : (isEdit ? 'Actualizar Horario' : 'Registrar Horario')
                    }
                </button>
            </div>
        </form>
    );
};

export default HorarioForm;