import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';

const ZonaForm = ({ data, handleChange }) => {
    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <MapPinIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Configuración de Zona Operativa
            </h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">Nombre de la Zona *</label>
                    <input 
                        type="text" 
                        value={data.nombre || ''} 
                        onChange={(e) => handleChange('nombre', toUpper(e.target.value))} 
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                        placeholder="EJ: TALARA ALTA 2" 
                        required 
                    />
                    <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-2 ml-1 italic transition-colors">
                        El nombre debe ser único. Se usará para agrupar clientes y grupos solidarios.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ZonaForm;