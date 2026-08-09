import React from 'react';
import { IdentificationIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import { onlyLetters, onlyNumbers } from 'utilities/Validations/validations';
import CiiuSelect from 'components/Shared/Comboboxes/CiiuSearchSelect';

const DatosPersonalesForm = ({ data, handleNestedChange, isEditing = false }) => {
    const c = data.datos_cliente;
    const onC = (field, value) => handleNestedChange('datos_cliente', field, value);
    const esEmpresa = Number(c.tipo) === 2;
    const inputClass = "w-full p-3 text-sm text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors";

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border h-full transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-5 uppercase tracking-wide transition-colors">
                <IdentificationIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Datos Principales
            </h3>

            <div className="mb-6 flex flex-col gap-2">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase transition-colors">Tipo de Cliente</label>
                <div className="flex gap-3">
                    <button type="button" onClick={() => onC('tipo', 1)} disabled={isEditing}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                            !esEmpresa ? 'bg-brand-red-light dark:bg-brand-gold/15 text-brand-red dark:text-brand-gold border-brand-red dark:border-brand-gold' : 'bg-white dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border hover:border-slate-300'
                        } ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <UserIcon className="w-4 h-4" /> Persona
                    </button>
                    <button type="button" onClick={() => onC('tipo', 2)} disabled={isEditing}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                            esEmpresa ? 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500 dark:border-yellow-500/40' : 'bg-white dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border hover:border-slate-300'
                        } ${isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <BuildingOfficeIcon className="w-4 h-4" /> Empresa
                    </button>
                </div>
                {isEditing && <p className="text-[9px] text-slate-400 dark:text-dark-text-muted/60 italic">* El tipo de cliente no se puede modificar después del registro.</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!esEmpresa ? (
                    <>
                        <div><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">DNI *</label>
                            <input type="text" value={c.dni || ''} onChange={(e) => onC('dni', onlyNumbers(e.target.value, 8))} className={inputClass} required /></div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">
                                Vencimiento DNI {!c.no_caduca && '*'}
                            </label>
                            <input type="date" value={c.fechaVencimientoDni || ''}
                                onChange={(e) => onC('fechaVencimientoDni', e.target.value)}
                                className={`${inputClass} ${c.no_caduca ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-dark-surface-alt' : ''}`}
                                required={!c.no_caduca}
                                disabled={!!c.no_caduca} />
                            <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer select-none">
                                <input type="checkbox" checked={!!c.no_caduca}
                                    onChange={(e) => {
                                        onC('no_caduca', e.target.checked);
                                        if (e.target.checked) onC('fechaVencimientoDni', '');
                                    }}
                                    className="w-3.5 h-3.5 accent-brand-red dark:accent-brand-gold" />
                                <span className="text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase">DNI no caduca (mayor de 60 años)</span>
                            </label>
                        </div>
                        <div><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">F. Nacimiento *</label>
                            <input type="date" value={c.fechaNacimiento || ''} onChange={(e) => onC('fechaNacimiento', e.target.value)} className={inputClass} required /></div>
                        <div><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Sexo *</label>
                            <select value={c.sexo || ''} onChange={(e) => onC('sexo', e.target.value)} className={inputClass} required>
                                <option value="">-- Seleccionar --</option>
                                <option value="MASCULINO">MASCULINO</option>
                                <option value="FEMENINO">FEMENINO</option>
                            </select></div>
                        <div className="sm:col-span-2"><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Nombres *</label>
                            <input type="text" value={c.nombre || ''} onChange={(e) => onC('nombre', onlyLetters(e.target.value))} className={inputClass} required /></div>
                        <div><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Ap. Paterno *</label>
                            <input type="text" value={c.apellidoPaterno || ''} onChange={(e) => onC('apellidoPaterno', onlyLetters(e.target.value))} className={inputClass} required /></div>
                        <div><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Ap. Materno *</label>
                            <input type="text" value={c.apellidoMaterno || ''} onChange={(e) => onC('apellidoMaterno', onlyLetters(e.target.value))} className={inputClass} required /></div>
                    </>
                ) : (
                    <>
                        <div className="sm:col-span-2"><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">RUC *</label>
                            <input type="text" value={c.ruc || ''} onChange={(e) => onC('ruc', onlyNumbers(e.target.value, 11))} className={inputClass} required /></div>
                        <div className="sm:col-span-2"><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Razón Social *</label>
                            <input type="text" value={c.razon_social || ''} onChange={(e) => onC('razon_social', e.target.value)} className={inputClass} required /></div>
                        <div className="sm:col-span-2"><label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Nombre Comercial</label>
                            <input type="text" value={c.nombre_comercial || ''} onChange={(e) => onC('nombre_comercial', e.target.value)} className={inputClass} /></div>
                    </>
                )}
                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100 dark:border-dark-border transition-colors">
                    <CiiuSelect onSelect={(ciiu) => onC('ciiu_id', ciiu ? ciiu.id : null)} initialCiiu={c.ciiu || null} />
                </div>
            </div>
        </div>
    );
};
export default DatosPersonalesForm;