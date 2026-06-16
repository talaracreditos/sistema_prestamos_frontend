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
                <div className="space-y-6">

                    {/* CABECERA */}
                    <div className="flex flex-wrap gap-4 items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
                                Cajero: {detalle.cajero}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">
                                Apertura: {detalle.fecha_apertura}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-black uppercase tracking-tight">
                                {detalle.fecha_cierre
                                    ? <span className="text-slate-500">Cierre: {detalle.fecha_cierre}</span>
                                    : <span className="text-green-600 italic normal-case">Turno en curso</span>
                                }
                            </span>
                        </div>
                    </div>

                    {/* RESUMEN FINANCIERO */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Inicial</span>
                            <span className="text-lg font-black text-slate-700 italic">
                                S/ {parseFloat(detalle.monto_apertura).toFixed(2)}
                            </span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Esperado</span>
                            <span className="text-lg font-black text-slate-700 italic">
                                {detalle.saldo_esperado != null
                                    ? `S/ ${parseFloat(detalle.saldo_esperado).toFixed(2)}`
                                    : '—'
                                }
                            </span>
                        </div>

                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm">
                            <span className="block text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Saldo de Cierre</span>
                            <span className="text-lg font-black text-green-700 italic">
                                {detalle.monto_cierre ? `S/ ${parseFloat(detalle.monto_cierre).toFixed(2)}` : '—'}
                            </span>
                        </div>

                        {detalle.cuadro !== null && (
                            <div className={`p-4 rounded-2xl border shadow-sm ${
                                detalle.cuadro ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                            }`}>
                                <span className={`block text-[9px] font-black uppercase tracking-widest mb-1 ${
                                    detalle.cuadro ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                    Cuadre de Caja
                                </span>
                                <span className={`text-lg font-black italic ${detalle.cuadro ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {detalle.cuadro ? '✓ Cuadró' : '✗ No cuadró'}
                                </span>
                                {!detalle.cuadro && detalle.diferencia != null && (
                                    <span className="block text-[10px] font-bold text-red-500 mt-1">
                                        Dif: S/ {parseFloat(detalle.diferencia).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* 🔥 Observaciones ahora en dorado corporativo */}
                        <div className={`${detalle.cuadro === null ? 'col-span-2' : ''} md:col-span-1 bg-brand-gold-light/40 p-4 rounded-2xl border border-brand-gold/30 shadow-sm`}>
                            <span className="block text-[9px] font-black text-brand-gold-dark uppercase tracking-widest mb-1 flex items-center gap-1">
                                <ChatBubbleLeftEllipsisIcon className="w-3 h-3" /> Observaciones
                            </span>
                            <p className="text-[10px] font-bold text-slate-700 leading-tight">
                                {detalle.observaciones ?? 'Sin comentarios registrados.'}
                            </p>
                        </div>
                    </div>

                    {/* MOVIMIENTOS */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auditoría de Movimientos</h4>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border">
                                {detalle.movimientos?.length ?? 0} operac.
                            </span>
                        </div>

                        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-slate-50 text-slate-500 uppercase font-black">
                                    <tr>
                                        <th className="px-4 py-3">Hora</th>
                                        <th className="px-4 py-3">Tipo / Motivo</th>
                                        <th className="px-4 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    {detalle.movimientos?.length > 0 ? (
                                        detalle.movimientos.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-400 font-bold whitespace-nowrap">
                                                    {m.created_at}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className={`font-black uppercase text-[9px] flex items-center gap-1 ${
                                                            m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {m.tipo === 'ingreso'
                                                                ? <ArrowDownIcon className="w-2.5 h-2.5" />
                                                                : <ArrowUpIcon className="w-2.5 h-2.5" />
                                                            }
                                                            {m.tipo}
                                                        </span>
                                                        <span className="text-slate-600 font-bold leading-tight">{m.motivo}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3 text-right font-black italic ${
                                                    m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {m.tipo === 'ingreso' ? '+' : '-'} S/ {parseFloat(m.monto).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-12 text-slate-300 font-black uppercase tracking-tighter italic">
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