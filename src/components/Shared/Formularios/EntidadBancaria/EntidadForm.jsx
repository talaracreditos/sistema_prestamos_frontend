import React from 'react';
import { BuildingLibraryIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { onlyNumbers, toUpper } from 'utilities/Validations/validations';

const EntidadForm = ({ data, handleChange }) => {
    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <BuildingLibraryIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Datos de la Entidad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">Nombre del Banco *</label>
                    <input 
                        type="text" 
                        value={data.nombre || ''} 
                        onChange={(e) => handleChange('nombre', toUpper(e.target.value))} 
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                        placeholder="EJ: BANCO DE CRÉDITO DEL PERÚ (BCP)" 
                        required 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">Longitud N° de Cuenta *</label>
                    <div className="relative">
                        <HashtagIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors"/>
                        <input 
                            type="text" 
                            value={data.longitud_cuenta || ''} 
                            onChange={(e) => handleChange('longitud_cuenta', onlyNumbers(e.target.value, 2))} 
                            className="w-full pl-10 p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                            placeholder="Ej: 14" 
                            required 
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1.5 transition-colors">Cantidad exacta de dígitos que el sistema debe validar.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">Longitud CCI *</label>
                    <div className="relative">
                        <HashtagIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors"/>
                        <input 
                            type="text" 
                            value={data.longitud_cci || ''} 
                            onChange={(e) => handleChange('longitud_cci', onlyNumbers(e.target.value, 2))} 
                            className="w-full pl-10 p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                            placeholder="Ej: 20" 
                            required 
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1.5 transition-colors">Código de Cuenta Interbancaria (Usualmente 20).</p>
                </div>
            </div>
        </div>
    );
};

export default EntidadForm;