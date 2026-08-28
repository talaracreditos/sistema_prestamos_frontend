// components/Shared/Formularios/CajaChicaMovimiento/CajaChicaMovimientoForm.jsx
import React from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import GastoSearchSelect from 'components/Shared/Comboboxes/GastoSearchSelect';
import { toUpper } from 'utilities/Validations/validations';

const CajaChicaMovimientoForm = ({ data, handleChange }) => {
    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <BanknotesIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Registrar Movimiento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">Fecha *</label>
                    <input
                        type="date"
                        value={data.fecha}
                        onChange={(e) => handleChange('fecha', e.target.value)}
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">Tipo *</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => handleChange('tipo', 'ingreso')}
                            className={`flex-1 p-3.5 rounded-xl font-black text-xs uppercase border transition-all ${data.tipo === 'ingreso' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' : 'bg-slate-50 dark:bg-dark-surface-alt text-slate-400 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'}`}>
                            Ingreso
                        </button>
                        <button type="button" onClick={() => handleChange('tipo', 'egreso')}
                            className={`flex-1 p-3.5 rounded-xl font-black text-xs uppercase border transition-all ${data.tipo === 'egreso' ? 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20' : 'bg-slate-50 dark:bg-dark-surface-alt text-slate-400 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'}`}>
                            Egreso
                        </button>
                    </div>
                </div>

                {data.tipo === 'egreso' && (
                    <div className="md:col-span-2">
                        <GastoSearchSelect
                            onSelect={(gasto) => handleChange('caja_chica_gasto_id', gasto ? gasto.id : '')}
                        />
                    </div>
                )}

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">Detalle *</label>
                    <input
                        type="text"
                        value={data.concepto}
                        onChange={(e) => handleChange('concepto', toUpper(e.target.value))}
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all"
                        placeholder="Ej: Sueldo Juan Pérez - Agosto"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">Medio de Pago *</label>
                    <select
                        value={data.medio_pago}
                        onChange={(e) => handleChange('medio_pago', e.target.value)}
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all"
                        required
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">Monto (S/) *</label>
                    <input
                        type="number" step="0.01" min="0.01"
                        value={data.monto}
                        onChange={(e) => handleChange('monto', e.target.value)}
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all"
                        placeholder="0.00"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2">N° Comprobante</label>
                    <input
                        type="text"
                        value={data.numero_comprobante}
                        onChange={(e) => handleChange('numero_comprobante', toUpper(e.target.value))}
                        className="w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-all"
                        placeholder="Opcional"
                    />
                </div>
            </div>
        </div>
    );
};

export default CajaChicaMovimientoForm;