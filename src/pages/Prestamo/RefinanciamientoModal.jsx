import React from 'react';
import Modal from 'components/Shared/Modals/ViewModal';
import ProductoSearchSelect from 'components/Shared/Comboboxes/ProductoSearchSelect';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import CalculadoraCuota from 'components/Shared/CalculadoraCuota';
import { useRefinanciamientoModal } from 'hooks/Prestamo/useRefinanciamientoModal';
import { ArrowPathRoundedSquareIcon, ExclamationTriangleIcon, UserIcon } from '@heroicons/react/24/outline';

const RefinanciamientoModal = ({ isOpen, onClose, data, integrantesGrupo, onSuccess }) => {
    const {
        formData, setFormData, loading, alert, setAlert,
        integrantesRestantes, esPresidenteRefinanciado,
        handleChange, handleSubmit, montoCalc,
        moraDisponible, moraIncluidaNum, moraCondonada,
        interesDisponible, interesIncluidoNum, interesCondonado,
        submitDisabled,
    } = useRefinanciamientoModal({ isOpen, data, integrantesGrupo, onSuccess });

    if (!data) return null;

    const handleClose = () => { if (!loading) onClose(); };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} hideFooter={true} title="Refinanciar Integrante" size="lg">
            {loading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-3 rounded-[inherit] transition-colors">
                    <div className="w-8 h-8 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">Aplicando refinanciamiento...</p>
                </div>
            )}
            <div className="p-1 transition-colors">

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl mb-4 flex gap-3 items-start transition-colors">
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                        <h4 className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase">Cliente: {data.cliente_nombre}</h4>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-1">
                            Deuda Base: S/ {data.deuda.toFixed(2)} | Interés: S/ {interesDisponible.toFixed(2)} | Mora Total: S/ {moraDisponible.toFixed(2)}
                        </p>
                        {data.excedente > 0 && (
                            <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold mt-0.5">
                                Excedente aplicado: -S/ {data.excedente.toFixed(2)}
                            </p>
                        )}
                        <p className="text-sm font-black text-brand-red dark:text-brand-gold mt-2">Total a Refinanciar: S/ {montoCalc.toFixed(2)}</p>
                    </div>
                </div>

                <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">Producto Financiero *</label>
                        <ProductoSearchSelect disabled={loading} onSelect={p => setFormData(prev => ({ ...prev, producto_id: p?.id }))} />
                    </div>

                    {esPresidenteRefinanciado && integrantesRestantes.length > 1 && (
                        <div className="border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 bg-blue-50/50 dark:bg-blue-500/10 transition-colors">
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase mb-2">
                                <UserIcon className="w-4 h-4" /> Actualizar Presidente del Grupo Original *
                            </label>
                            <select name="nuevo_presidente_id" value={formData.nuevo_presidente_id} onChange={handleChange} disabled={loading}
                                className="w-full border border-blue-200 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-slate-700 dark:text-dark-text focus:ring-2 focus:ring-blue-400 outline-none bg-white dark:bg-dark-surface disabled:opacity-50 transition-colors">
                                {integrantesRestantes.map(int => (
                                    <option key={int.id} value={int.id}>{int.nombre} (Cargo actual: {int.cargo})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {esPresidenteRefinanciado && integrantesRestantes.length === 1 && (
                        <div className="border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 bg-blue-50/50 dark:bg-blue-500/10 flex flex-col gap-1 transition-colors">
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase">
                                <UserIcon className="w-4 h-4" /> Actualización Automática de Titular
                            </label>
                            <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold uppercase mt-1 transition-colors">
                                Al ser el único integrante restante, <span className="font-black">{integrantesRestantes[0].nombre}</span> asumirá automáticamente como PRESIDENTE.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">N° Cuotas *</label>
                            <input type="number" name="cuotas_solicitadas" required min="1" disabled={loading}
                                value={formData.cuotas_solicitadas} onChange={handleChange}
                                className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none disabled:opacity-50 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">Tasa Interés (%) *</label>
                            <input type="number" name="tasa_interes" required min="0" step="0.01" disabled={loading}
                                value={formData.tasa_interes} onChange={handleChange}
                                className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none disabled:opacity-50 transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">Frecuencia *</label>
                            <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} disabled={loading}
                                className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none bg-white dark:bg-dark-surface disabled:opacity-50 transition-colors">
                                <option value="SEMANAL">SEMANAL</option>
                                <option value="CATORCENAL">CATORCENAL</option>
                                <option value="MENSUAL">MENSUAL</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Interés del préstamo BASE: monto editable, capado al real ── */}
                    <div className="border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 space-y-3 bg-blue-50/30 dark:bg-blue-500/10 transition-colors">
                        <label className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase">Interés del Préstamo Base</label>

                        {interesDisponible <= 0 ? (
                            <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold">Este préstamo no tiene interés pendiente.</p>
                        ) : (
                            <div className="pt-1">
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">
                                    Interés a Incluir (S/) — Máx. S/ {interesDisponible.toFixed(2)} *
                                </label>
                                <input
                                    type="text" inputMode="decimal" name="interes_incluido" required disabled={loading}
                                    value={formData.interes_incluido} onChange={handleChange} placeholder="0.00"
                                    className="w-full border border-blue-300 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface focus:ring-2 focus:ring-blue-400 outline-none disabled:opacity-50 transition-colors"
                                />
                                {interesCondonado > 0 && (
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5">
                                        ⚠ Los S/ {interesCondonado.toFixed(2)} restantes de interés quedarán condonados (no se cobrarán).
                                    </p>
                                )}
                                {interesIncluidoNum === interesDisponible && (
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1.5">
                                        ✓ Se incluirá el interés completo.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Mora: check + monto editable ── */}
                    <div className={`border rounded-xl p-4 space-y-3 transition-colors ${formData.incluir_mora ? 'border-brand-red/30 dark:border-brand-gold/30 bg-brand-red-light/20 dark:bg-brand-gold/10' : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt'}`}>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="incluir_mora" checked={formData.incluir_mora} onChange={handleChange} disabled={loading || moraDisponible <= 0}
                                className="w-4 h-4 text-brand-red dark:text-brand-gold border-slate-300 dark:border-dark-border rounded focus:ring-brand-red dark:focus:ring-brand-gold disabled:opacity-50" />
                            <span className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase">Incluir Mora al Capital</span>
                        </label>

                        {moraDisponible <= 0 && (
                            <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold">Este cliente no tiene mora pendiente.</p>
                        )}

                        {formData.incluir_mora && moraDisponible > 0 && (
                            <div className="pt-1">
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">
                                    Monto de Mora a Incluir (S/) — Máx. S/ {moraDisponible.toFixed(2)} *
                                </label>
                                <input
                                    type="text" inputMode="decimal" name="mora_incluida" required disabled={loading}
                                    value={formData.mora_incluida} onChange={handleChange} placeholder="0.00"
                                    className="w-full border border-brand-red/30 dark:border-brand-gold/30 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none disabled:opacity-50 transition-colors"
                                />
                                {moraCondonada > 0 && (
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1.5">
                                        ⚠ Los S/ {moraCondonada.toFixed(2)} restantes de mora quedarán condonados (no se cobrarán).
                                    </p>
                                )}
                                {moraIncluidaNum === moraDisponible && (
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1.5">
                                        ✓ Se incluirá la mora completa.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border border-slate-200 dark:border-dark-border rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-dark-surface-alt transition-colors">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="tiene_seguro" checked={formData.tiene_seguro} onChange={handleChange} disabled={loading}
                                className="w-4 h-4 text-brand-red dark:text-brand-gold border-slate-300 dark:border-dark-border rounded focus:ring-brand-red dark:focus:ring-brand-gold disabled:opacity-50" />
                            <span className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase">Aplicar Seguro</span>
                        </label>
                        {formData.tiene_seguro && (
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">Monto Seguro (S/) *</label>
                                    <input type="number" name="seguro" required min="0.01" step="0.01" disabled={loading}
                                        value={formData.seguro} onChange={handleChange} placeholder="0.00"
                                        className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none disabled:opacity-50 transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">Modalidad Seguro *</label>
                                    <select name="seguro_financiado" value={formData.seguro_financiado} disabled={loading}
                                        onChange={e => setFormData(prev => ({ ...prev, seguro_financiado: e.target.value === 'true' }))}
                                        className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none bg-white dark:bg-dark-surface disabled:opacity-50 transition-colors">
                                        <option value="true">Financiado en cuotas</option>
                                        <option value="false">Cobrado por separado</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">Código de Recaudo *</label>
                        <input type="text" name="codigo_recaudo" required disabled={loading}
                            value={formData.codigo_recaudo} onChange={handleChange} placeholder="Ingrese el código único"
                            className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface uppercase focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none disabled:opacity-50 transition-colors" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">Observaciones</label>
                        <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="2" disabled={loading}
                            className="w-full border border-slate-300 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none disabled:opacity-50 transition-colors" />
                    </div>

                    <CalculadoraCuota monto={montoCalc} tasa={formData.tasa_interes} cuotas={formData.cuotas_solicitadas} seguro={formData.seguro} frecuencia={formData.frecuencia} />

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={handleClose} disabled={loading}
                            className="px-4 py-2 text-xs font-black text-slate-500 dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-dark-surface-alt rounded-xl uppercase disabled:opacity-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={submitDisabled}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-gold dark:bg-brand-gold hover:bg-brand-gold-dark dark:hover:brightness-110 text-white dark:text-black text-xs font-black uppercase rounded-xl transition-all shadow-md disabled:opacity-50">
                            {loading ? <><div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" /> Aplicando...</> : <><ArrowPathRoundedSquareIcon className="w-4 h-4" /> Aplicar Refinanciamiento</>}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default RefinanciamientoModal;