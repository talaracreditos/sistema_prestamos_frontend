import React from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const SectionNotas = ({ data, handleChange, isBlocked }) => (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
        <h3 className="text-xs font-black text-slate-700 dark:text-dark-text uppercase mb-2 flex items-center gap-2 transition-colors">
            <ClipboardDocumentListIcon className="w-5 h-5 text-brand-gold-dark dark:text-brand-gold" /> Notas Internas
        </h3>
        <textarea 
            disabled={isBlocked}
            value={data.observaciones || ''} 
            onChange={e => handleChange('observaciones', e.target.value)}
            placeholder="Ej: Cliente con buen historial, ingresos demostrables..."
            className="w-full p-3 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none min-h-[80px] disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors"
        />
    </div>
);
export default SectionNotas;