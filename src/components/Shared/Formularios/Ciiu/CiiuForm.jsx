import React from 'react';
import { TagIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';

const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 ml-1 transition-colors">{label}</label>
        {children}
    </div>
);

const inputCls = "w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-all";

const CiiuForm = ({ data, handleChange }) => (
    <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
        <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
            <TagIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Datos del Código CIIU
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código */}
            <Field label="Código CIIU *">
                <input
                    type="text"
                    maxLength={4}
                    value={data.codigo || ''}
                    onChange={e => handleChange('codigo', e.target.value.replace(/\D/g, ''))}
                    className={inputCls}
                    placeholder="Ej: 0111"
                    required
                />
            </Field>

            {/* Sección */}
            <Field label="Sección *">
                <input
                    type="text"
                    maxLength={1}
                    value={data.seccion || ''}
                    onChange={e => handleChange('seccion', toUpper(e.target.value))}
                    className={inputCls}
                    placeholder="Ej: A"
                    required
                />
            </Field>

            {/* División */}
            <Field label="División *">
                <input
                    type="text"
                    maxLength={2}
                    value={data.division || ''}
                    onChange={e => handleChange('division', e.target.value.replace(/\D/g, ''))}
                    className={inputCls}
                    placeholder="Ej: 01"
                    required
                />
            </Field>

            {/* Grupo */}
            <Field label="Grupo *">
                <input
                    type="text"
                    maxLength={3}
                    value={data.grupo || ''}
                    onChange={e => handleChange('grupo', e.target.value.replace(/\D/g, ''))}
                    className={inputCls}
                    placeholder="Ej: 011"
                    required
                />
            </Field>

            {/* Descripción — full width */}
            <div className="md:col-span-2">
                <Field label="Descripción de la Actividad *">
                    <div className="relative">
                        <DocumentTextIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors" />
                        <textarea
                            value={data.descripcion || ''}
                            onChange={e => handleChange('descripcion', toUpper(e.target.value))}
                            className={`${inputCls} pl-10 min-h-[90px]`}
                            placeholder="DESCRIPCIÓN DE LA ACTIVIDAD ECONÓMICA..."
                            required
                        />
                    </div>
                </Field>
            </div>
        </div>
    </div>
);

export default CiiuForm;