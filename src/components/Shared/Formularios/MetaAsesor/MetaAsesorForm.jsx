import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';

const MESES = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
];

const anioActual = new Date().getFullYear();
const ANIOS = Array.from({ length: 5 }, (_, i) => anioActual - 2 + i);

const MetaAsesorForm = ({ data, handleChange, initialAsesorNombre = '' }) => {
    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-100 dark:border-dark-border space-y-5 transition-colors duration-300">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <ChartBarIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Datos de la Meta
            </h3>

            {/* Asesor — onSelect devuelve objeto completo, extraemos el id */}
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Asesor *</label>
                <EmpleadoSearchSelect
                    rol="ASESOR"
                    initialName={initialAsesorNombre}
                    onSelect={emp => handleChange('asesor_id', emp?.id ?? '')}
                    clearOnSelect={false}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Mes *</label>
                    <select
                        value={data.mes || ''}
                        onChange={e => handleChange('mes', parseInt(e.target.value))}
                        required
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all"
                    >
                        {MESES.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Año *</label>
                    <select
                        value={data.anio || ''}
                        onChange={e => handleChange('anio', parseInt(e.target.value))}
                        required
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all"
                    >
                        {ANIOS.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Meta S/ *</label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={data.meta_monto || ''}
                    onChange={e => handleChange('meta_monto', e.target.value)}
                    required
                    placeholder="10000.00"
                    className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                />
            </div>
        </div>
    );
};

export default MetaAsesorForm;