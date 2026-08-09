import React from 'react';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { onlyNumbers, toUpper } from 'utilities/Validations/validations';

const ContactoForm = ({ data, handleNestedChange }) => {
    const ct = data.contacto;
    const onCt = (field, value) => handleNestedChange('contacto', field, value);
    const inputClass = "w-full p-3 text-sm text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors";

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border h-full transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-5 uppercase tracking-wide transition-colors">
                <PhoneIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Contacto
            </h3>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Móvil *</label>
                    <input type="text" value={ct.telefonoMovil || ''} onChange={(e) => onCt('telefonoMovil', onlyNumbers(e.target.value, 9))} className={inputClass} placeholder="999888777" required />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Fijo (Opcional)</label>
                    <input type="text" value={ct.telefonoFijo || ''} onChange={(e) => onCt('telefonoFijo', onlyNumbers(e.target.value, 9))} className={inputClass} placeholder="01 234567" />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Correo Electrónico (Opcional)</label>
                    <input type="email" value={ct.correo || ''} onChange={(e) => onCt('correo', toUpper(e.target.value))} className={inputClass} placeholder="ejemplo@correo.com" />
                </div>
            </div>
        </div>
    );
};
export default ContactoForm;