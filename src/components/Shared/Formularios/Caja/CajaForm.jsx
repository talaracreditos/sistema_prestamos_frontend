import React from 'react';
import { InboxStackIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';

const CajaForm = ({ data, handleChange }) => {
    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-100 dark:border-dark-border transition-colors duration-300">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <InboxStackIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Configuración de Caja
            </h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Nombre de la Caja *</label>
                    <input 
                        type="text" 
                        value={data.nombre || ''} 
                        onChange={(e) => handleChange('nombre', toUpper(e.target.value))} 
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                        placeholder="EJ: CAJA 01" 
                        required 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Descripción / Ubicación</label>
                    <div className="relative">
                        <DocumentTextIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors"/>
                        <textarea 
                            value={data.descripcion || ''} 
                            onChange={(e) => handleChange('descripcion', toUpper(e.target.value))} 
                            className="w-full pl-10 p-3.5 text-sm font-medium text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all min-h-[100px] placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                            placeholder="DETALLES SOBRE DÓNDE SE UBICA O PARA QUÉ SE USA..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CajaForm;