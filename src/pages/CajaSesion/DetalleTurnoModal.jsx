import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { ArrowDownIcon, ArrowUpIcon, CalendarDaysIcon, UserIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

const DetalleTurnoModal = ({ isOpen, onClose, detalle, loading }) => {
    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title={loading ? 'Cargando turno...' : `Detalle de Turno: ${detalle?.caja_nombre ?? 'S/N'}`}
            isLoading={loading}
            hideFooter={true}
        >
            {detalle && (
                <div className="space-y-6 transition-colors">

                    {/* CABECERA */}
                    <div className="flex flex-wrap gap-4 items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                            <span className="text-[11px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-tight transition-colors">
                                Cajero: {detalle.cajero}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                            <span className="text-[11px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-tight transition-colors">
                                Apertura: {detalle.fecha_apertura}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                            <span className="text-[11px] font-black uppercase tracking-tight transition-colors">
                                {detalle.fecha_cierre
                                    ? <span className="text-slate-500 dark:text-dark-text-muted">Cierre: {detalle.fecha_cierre}</span>
                                    : <span className="text-green-600 dark:text-green-400 italic normal-case">Turno en curso</span>
                                }
                            </span>
                        </div>
                    </div>

                    {/* RESUMEN FINANCIERO */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 dark:bg-dark-surface-alt p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 transition-colors">
                            <span className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Monto Inicial</span>
                            <span className="text-lg font-black text-slate-700 dark:text-dark-text italic transition-colors">
                                S/ {parseFloat(detalle.monto_apertura).toFixed(2)}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-dark-surface-alt p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 transition-colors">
                            <span className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Saldo Esperado</span>
                            <span className="text-lg font-black text-slate-700 dark:text-dark-text italic transition-colors">
                                {detalle.saldo_esperado != null
                                    ? `S/ ${parseFloat(detalle.saldo_esperado).toFixed(2)}`
                                    : '—'
                                }
                            </span>
                        </div>

                        <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-2xl border border-green-100 dark:border-green-500/20 shadow-sm transition-colors">
                            <span className="block text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Saldo de Cierre</span>
                            <span className="text-lg font-black text-green-700 dark:text-green-400 italic transition-colors">
                                {detalle.monto_cierre ? `S/ ${parseFloat(detalle.monto_cierre).toFixed(2)}` : '—'}
                            </span>
                        </div>

                        {detalle.cuadro !== null && (
                            <div className={`p-4 rounded-2xl border shadow-sm transition-colors ${
                                detalle.cuadro ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'
                            }`}>
                                <span className={`block text-[9px] font-black uppercase tracking-widest mb-1 ${
                                    detalle.cuadro ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                    Cuadre de Caja
                                </span>
                                <span className={`text-lg font-black italic ${detalle.cuadro ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {detalle.cuadro ? '✓ Cuadró' : '✗ No cuadró'}
                                </span>
                                {!detalle.cuadro && detalle.diferencia != null && (
                                    <span className="block text-[10px] font-bold text-red-500 dark:text-red-400 mt-1">
                                        Dif: S/ {parseFloat(detalle.diferencia).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Observaciones */}
                        <div className={`${detalle.cuadro === null ? 'col-span-2' : ''} md:col-span-1 bg-brand-gold-light/40 dark:bg-brand-gold/10 p-4 rounded-2xl border border-brand-gold/30 dark:border-brand-gold/20 shadow-sm transition-colors`}>
                            <span className="block text-[9px] font-black text-brand-gold-dark dark:text-brand-gold uppercase tracking-widest mb-1 flex items-center gap-1">
                                <ChatBubbleLeftEllipsisIcon className="w-3 h-3" /> Observaciones
                            </span>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-dark-text leading-tight transition-colors">
                                {detalle.observaciones ?? 'Sin comentarios registrados.'}
                            </p>
                        </div>
                    </div>

                    {/* MOVIMIENTOS */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted tracking-widest transition-colors">Auditoría de Movimientos</h4>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted bg-slate-100 dark:bg-dark-surface-alt px-2 py-0.5 rounded-full border border-slate-200 dark:border-dark-border transition-colors">
                                {detalle.movimientos?.length ?? 0} operac.
                            </span>
                        </div>

                        <div className="border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm transition-colors">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-slate-50 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted uppercase font-black transition-colors">
                                    <tr>
                                        <th className="px-4 py-3">Hora</th>
                                        <th className="px-4 py-3">Tipo / Motivo</th>
                                        <th className="px-4 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-dark-border bg-white dark:bg-dark-surface transition-colors">
                                    {detalle.movimientos?.length > 0 ? (
                                        detalle.movimientos.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-colors">
                                                <td className="px-4 py-3 text-slate-400 dark:text-dark-text-muted font-bold whitespace-nowrap">
                                                    {m.created_at}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className={`font-black uppercase text-[9px] flex items-center gap-1 ${
                                                            m.tipo === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {m.tipo === 'ingreso'
                                                                ? <ArrowDownIcon className="w-2.5 h-2.5" />
                                                                : <ArrowUpIcon className="w-2.5 h-2.5" />
                                                            }
                                                            {m.tipo}
                                                        </span>
                                                        <span className="text-slate-600 dark:text-dark-text font-bold leading-tight transition-colors">{m.motivo}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3 text-right font-black italic ${
                                                    m.tipo === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {m.tipo === 'ingreso' ? '+' : '-'} S/ {parseFloat(m.monto).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-12 text-slate-300 dark:text-dark-text-muted/60 font-black uppercase tracking-tighter italic transition-colors">
                                                No hay transacciones registradas
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </ViewModal>
    );
};

export default DetalleTurnoModal;