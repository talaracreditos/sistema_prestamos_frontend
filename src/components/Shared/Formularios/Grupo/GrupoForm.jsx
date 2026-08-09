import React from 'react';
import { UserGroupIcon, TagIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';
import ZonaSearchSelect from 'components/Shared/Comboboxes/ZonaSearchSelect';

const GrupoForm = ({ data, handleChange }) => {
    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <UserGroupIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Información del Grupo
            </h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Nombre del Grupo Solidario *</label>
                    <div className="relative">
                        <TagIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors"/>
                        <input 
                            type="text" 
                            value={data.nombre || ''} 
                            onChange={(e) => handleChange('nombre', toUpper(e.target.value))} 
                            className="w-full pl-10 p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                            placeholder="EJ: LAS GUERRERAS DE PIURA" 
                            required 
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-dark-border pt-4 transition-colors">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Zona Operativa (Asignación) *</label>
                    <ZonaSearchSelect 
                        initialName={data.zona_nombre || ''}
                        onSelect={(zona) => handleChange('zona_id', zona ? zona.id : null)}
                    />
                </div>
            </div>
        </div>
    );
};

export default GrupoForm;