import React, { useState, useEffect } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { ScaleIcon, ShoppingCartIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const LoteDetalleModal = ({ isOpen, onClose, loading, lote, enCarrito, onAgregarCarrito }) => {
    const [precioVenta, setPrecioVenta] = useState('');

    useEffect(() => {
        if (lote) setPrecioVenta(String(lote.valor_total ?? 0));
    }, [lote]);

    const precioNumerico = parseFloat(precioVenta || 0);
    const diferencia = lote ? round2(precioNumerico - parseFloat(lote.valor_total ?? 0)) : 0;

    const handleAgregar = () => {
        onAgregarCarrito({ ...lote, precio_venta: round2(precioNumerico) });
    };

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} title={lote ? `Lote #${lote.lote}` : 'Detalle del Lote'} size="md" hideFooter>
            <div className="space-y-4 p-1 transition-colors">
                {loading && (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-brand-red/20 dark:border-brand-gold/20 border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                    </div>
                )}

                {!loading && lote && (
                    <>
                        <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Préstamo origen</p>
                                <p className="text-sm font-black text-slate-800 dark:text-dark-text">#{lote.prestamo_id}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Cliente original</p>
                                <p className="text-sm font-black text-slate-800 dark:text-dark-text truncate">{lote.cliente_original}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Adjudicado</p>
                                <p className="text-sm font-black text-slate-800 dark:text-dark-text">{lote.fecha_adjudicacion ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Por</p>
                                <p className="text-sm font-black text-slate-800 dark:text-dark-text truncate">{lote.adjudicado_por}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                                Piezas del lote ({lote.piezas?.length ?? 0})
                            </p>
                            {lote.piezas?.map(p => (
                                <div key={p.id} className="flex items-center justify-between bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border p-3">
                                    <div className="flex items-center gap-2">
                                        <ScaleIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 dark:text-dark-text">{p.descripcion}</p>
                                            <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted">
                                                {[p.tipo_joya, p.subtipo_joya, p.kilataje].filter(Boolean).join(' · ')}
                                                {p.peso_neto && ` — ${p.peso_neto} gr`}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-slate-800 dark:text-dark-text shrink-0">S/ {fmt(p.valor_tasado)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase">Valor tasado (referencia)</span>
                            <span className="text-sm font-black text-slate-500 dark:text-dark-text-muted">S/ {fmt(lote.valor_total)}</span>
                        </div>

                        {/* ── Precio de venta editable ── */}
                        <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4">
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5">
                                Precio de venta del lote
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 dark:text-dark-text-muted">S/</span>
                                <input
                                    type="text" inputMode="decimal"
                                    value={precioVenta}
                                    onChange={e => setPrecioVenta(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
                                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl text-lg font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold"
                                />
                            </div>
                            {diferencia !== 0 && (
                                <p className={`text-[9px] font-bold mt-1.5 ${diferencia > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                    {diferencia > 0
                                        ? `S/ ${fmt(diferencia)} por encima del valor tasado`
                                        : `S/ ${fmt(Math.abs(diferencia))} por debajo del valor tasado`}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleAgregar}
                            disabled={enCarrito || precioNumerico <= 0}
                            className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black uppercase text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                                enCarrito
                                    ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 cursor-default'
                                    : 'bg-brand-red dark:bg-brand-red-glow text-white dark:text-black hover:bg-brand-red-dark dark:hover:brightness-110 shadow-xl shadow-brand-red/30 dark:shadow-black/30'
                            }`}
                        >
                            {enCarrito
                                ? <><CheckCircleIcon className="w-4 h-4" /> Ya está en el carrito</>
                                : <><ShoppingCartIcon className="w-4 h-4" /> Agregar al carrito — S/ {fmt(precioNumerico)}</>}
                        </button>
                    </>
                )}
            </div>
        </ViewModal>
    );
};

const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;

export default LoteDetalleModal;