import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const ESTADOS_CUOTA = {
    0: { label: 'Cancelado',    classes: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted line-through' },
    1: { label: 'Pendiente',    classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' },
    2: { label: 'Pagado',       classes: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' },
    3: { label: 'Vence Hoy',    classes: 'bg-brand-gold-light/30 dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold' },
    4: { label: 'Vencido',      classes: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30' },
    5: { label: 'Parcial',      classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' },
    6: { label: 'Refinanciada', classes: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 line-through' },
};

const badgeDiasAtraso = (dias) => {
    if (dias === null || dias === undefined) {
        return <span className="text-slate-300 dark:text-dark-text-muted/50 text-xs">—</span>;
    }
    if (dias < 0) {
        return <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">{Math.abs(dias)} (adelantado)</span>;
    }
    if (dias === 0) {
        return <span className="text-[11px] font-black text-green-600 dark:text-green-400">0 (a tiempo)</span>;
    }
    const colorClass = dias >= 9
        ? 'text-red-600 dark:text-red-400'
        : 'text-amber-600 dark:text-amber-400';
    return <span className={`text-[11px] font-black ${colorClass}`}>{dias} día{dias !== 1 ? 's' : ''}</span>;
};

const KardexCuotas = ({ loading, data, esGrupal }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-400 dark:text-dark-text-muted gap-2">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Cargando kardex...</span>
            </div>
        );
    }

    if (!data || !data.cuotas?.length) {
        return (
            <div className="py-6 text-center text-slate-400 dark:text-dark-text-muted/60 text-xs uppercase font-bold">
                Sin cuotas registradas.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-dark-border mt-3">
            {esGrupal && (
                <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-slate-50 dark:bg-dark-surface-alt border-b border-slate-200 dark:border-dark-border text-xs font-bold text-slate-600 dark:text-dark-text-muted">
                    <span>Monto grupal total: <span className="text-slate-800 dark:text-dark-text font-black">S/ {fmt(data.monto_grupal_total)}</span></span>
                    <span>Monto de este cliente: <span className="text-brand-red dark:text-brand-gold font-black">S/ {fmt(data.monto_cliente)}</span></span>
                </div>
            )}
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50 dark:bg-dark-surface-alt text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase">
                        <th className="p-3 text-left">N°</th>
                        <th className="p-3 text-left">Vencimiento</th>
                        {esGrupal ? (
                            <>
                                <th className="p-3 text-right">Cuota (grupo)</th>
                                <th className="p-3 text-right">Su parte</th>
                                <th className="p-3 text-right">Pagado (su parte)</th>
                                <th className="p-3 text-right">Saldo (su parte)</th>
                            </>
                        ) : (
                            <>
                                <th className="p-3 text-right">Monto</th>
                                <th className="p-3 text-right">Pagado</th>
                                <th className="p-3 text-right">Saldo</th>
                            </>
                        )}
                        <th className="p-3 text-left">Fecha pago</th>
                        <th className="p-3 text-left">Días atraso</th>
                        <th className="p-3 text-left">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {data.cuotas.map((c) => {
                        const estadoInfo = ESTADOS_CUOTA[c.estado] ?? { label: `Estado ${c.estado}`, classes: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500' };
                        const inactiva = c.estado === 0 || c.estado === 6;

                        return (
                            <tr key={c.id} className={`border-t border-slate-100 dark:border-dark-border transition-colors ${inactiva ? 'opacity-60 bg-slate-50/50 dark:bg-dark-surface-alt/50' : ''}`}>
                                <td className="p-3 font-black text-slate-700 dark:text-dark-text">{c.numero_cuota}</td>
                                <td className={`p-3 text-slate-600 dark:text-dark-text-muted ${inactiva ? 'line-through' : ''}`}>{c.fecha_vencimiento}</td>
                                {esGrupal ? (
                                    <>
                                        <td className="p-3 text-right text-slate-500 dark:text-dark-text-muted">S/ {fmt(c.monto_grupal_total)}</td>
                                        <td className="p-3 text-right font-bold text-slate-800 dark:text-dark-text">S/ {fmt(c.monto_cliente)}</td>
                                        <td className="p-3 text-right text-green-600 dark:text-green-400 font-bold">S/ {fmt(c.pagado_cliente)}</td>
                                        <td className={`p-3 text-right font-bold text-slate-800 dark:text-dark-text ${inactiva ? 'line-through' : ''}`}>S/ {fmt(c.saldo_cliente)}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3 text-right font-bold text-slate-800 dark:text-dark-text">S/ {fmt(c.monto)}</td>
                                        <td className="p-3 text-right text-green-600 dark:text-green-400 font-bold">S/ {fmt(c.pago_acumulado)}</td>
                                        <td className={`p-3 text-right font-bold text-slate-800 dark:text-dark-text ${inactiva ? 'line-through' : ''}`}>S/ {fmt(c.saldo)}</td>
                                    </>
                                )}
                                <td className="p-3 text-slate-500 dark:text-dark-text-muted">{c.fecha_pago || '—'}</td>
                                <td className="p-3">{badgeDiasAtraso(c.dias_atraso)}</td>
                                <td className="p-3">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${estadoInfo.classes}`}>
                                        {estadoInfo.label}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default KardexCuotas;