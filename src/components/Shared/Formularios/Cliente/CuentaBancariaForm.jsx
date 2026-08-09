import React from 'react';
import { CreditCardIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { onlyNumbers } from 'utilities/Validations/validations';
import EntidadBancariaSelect from 'components/Shared/Comboboxes/EntidadBancariaSearchSelect';

const CuentaBancariaForm = ({ data, handleNestedChange }) => {
    const cuentas = data.cuentas_bancarias || [];

    const handleAddCuenta = () => {
        handleNestedChange('cuentas_bancarias', null, [...cuentas, { entidad_bancaria_id: '', ctaAhorros: '', cci: '', longitud_cuenta: null, longitud_cci: null }]);
    };
    const handleRemoveCuenta = (index) => handleNestedChange('cuentas_bancarias', null, cuentas.filter((_, i) => i !== index));
    const handleCuentaChange = (index, field, value) => {
        const n = [...cuentas]; n[index][field] = value;
        handleNestedChange('cuentas_bancarias', null, n);
    };
    const handleEntidadSelect = (index, banco) => {
        const n = [...cuentas];
        if (banco) {
            n[index].entidad_bancaria_id    = banco.id;
            n[index].entidad_nombre_visual  = banco.nombre;
            n[index].longitud_cuenta        = banco.longitud_cuenta;
            n[index].longitud_cci           = banco.longitud_cci;
            n[index].ctaAhorros             = '';
            n[index].cci                    = '';
        }
        handleNestedChange('cuentas_bancarias', null, n);
    };

    const inputClass = "w-full p-2.5 text-sm text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none font-medium tracking-wider placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors";

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border flex flex-col transition-colors">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 uppercase tracking-wide transition-colors">
                    <CreditCardIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Cuentas Bancarias
                </h3>
                <button type="button" onClick={handleAddCuenta}
                    className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text px-3 py-1.5 rounded-lg hover:bg-brand-red-light dark:hover:bg-dark-surface-alt hover:text-brand-red dark:hover:text-brand-gold transition-colors uppercase tracking-wider">
                    <PlusIcon className="w-3 h-3" /> Agregar
                </button>
            </div>
            {cuentas.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-dark-border rounded-2xl transition-colors">
                    <p className="text-xs text-slate-400 dark:text-dark-text-muted">Presiona "Agregar" para registrar una cuenta.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cuentas.map((cb, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl p-4 relative transition-colors">
                            <button type="button" onClick={() => handleRemoveCuenta(index)}
                                className="absolute -top-2 -right-2 bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 rounded-full p-1 shadow-sm hover:bg-brand-red hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors z-20">
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="z-10">
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Banco *</label>
                                    <EntidadBancariaSelect initialName={cb.entidad_nombre_visual || cb.entidad_bancaria?.nombre} onSelect={(banco) => handleEntidadSelect(index, banco)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">N° Cuenta {cb.longitud_cuenta ? `(${cb.longitud_cuenta} dígitos)` : ''} *</label>
                                    <input type="text" value={cb.ctaAhorros || ''} onChange={(e) => handleCuentaChange(index, 'ctaAhorros', onlyNumbers(e.target.value, cb.longitud_cuenta || 30))} className={inputClass} placeholder={cb.longitud_cuenta ? `Exactamente ${cb.longitud_cuenta} dígitos` : "Seleccione un banco"} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">CCI {cb.longitud_cci ? `(${cb.longitud_cci} dígitos)` : ''}</label>
                                    <input type="text" value={cb.cci || ''} onChange={(e) => handleCuentaChange(index, 'cci', onlyNumbers(e.target.value, cb.longitud_cci || 30))} className={inputClass} placeholder={cb.longitud_cci ? `Exactamente ${cb.longitud_cci} dígitos` : "Seleccione un banco"} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default CuentaBancariaForm;