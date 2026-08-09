import React from 'react';
import { ShoppingBagIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';

const ProductoForm = ({ data, handleChange }) => {
    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <ShoppingBagIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Información del Producto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">Nombre del Producto *</label>
                    <input 
                        type="text" 
                        value={data.nombre || ''} 
                        onChange={(e) => handleChange('nombre', toUpper(e.target.value))} 
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                        placeholder="EJ: PRÉSTAMO PERSONAL CONSUMO" 
                        required 
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">Rango de Tasa Sugerida *</label>
                    <div className="relative">
                        <PresentationChartLineIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors"/>
                        <input 
                            type="text" 
                            value={data.rango_tasa || ''} 
                            onChange={(e) => handleChange('rango_tasa', toUpper(e.target.value))} 
                            className="w-full pl-10 p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60" 
                            placeholder="EJ: 15% - 25% ANUAL" 
                            required 
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1.5 uppercase transition-colors">Referencia visual para el asesor de créditos.</p>
                </div>
            </div>
        </div>
    );
};

export default ProductoForm;