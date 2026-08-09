import React from 'react';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { onlyNumbers } from 'utilities/Validations/validations';

const EmpleoForm = ({ data, handleNestedChange }) => {
    if (Number(data.datos_cliente.tipo) !== 1) return null;
    const emp = data.empleo;
    const onEmp = (field, value) => handleNestedChange('empleo', field, value);
    const inputClass = "w-full p-3 text-sm text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors";

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border h-full transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-5 uppercase tracking-wide transition-colors">
                <BriefcaseIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Datos Laborales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Centro Laboral</label>
                    <input type="text" value={emp.centroLaboral || ''} onChange={(e) => onEmp('centroLaboral', e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Ingreso Mensual (S/)</label>
                    <input type="text" value={emp.ingresoMensual || ''} onChange={(e) => onEmp('ingresoMensual', onlyNumbers(e.target.value))} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Inicio Laboral</label>
                    <input type="date" value={emp.inicioLaboral || ''} onChange={(e) => onEmp('inicioLaboral', e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Situación Laboral</label>
                    <select value={emp.situacionLaboral || ''} onChange={(e) => onEmp('situacionLaboral', e.target.value)} className={inputClass}>
                        <option value="">-- Seleccionar --</option>
                        <option value="DEPENDIENTE">DEPENDIENTE</option>
                        <option value="INDEPENDIENTE">INDEPENDIENTE</option>
                        <option value="JUBILADO">JUBILADO</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
export default EmpleoForm;