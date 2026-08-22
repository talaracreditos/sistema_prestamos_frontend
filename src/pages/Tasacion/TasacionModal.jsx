import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import {
    UserIcon, CalendarDaysIcon, IdentificationIcon,
    BriefcaseIcon, BanknotesIcon, SparklesIcon, CurrencyDollarIcon, AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const ESTADOS = {
    0: { label: 'Pendiente',  classes: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30' },
    1: { label: 'Abandonado', classes: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text-muted border-slate-300 dark:border-dark-border' },
    2: { label: 'Expirado',   classes: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30' },
    3: { label: 'Convertida', classes: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' },
};

const TasacionModal = ({ isOpen, onClose, data, isLoading }) => {
    if (!data && !isLoading) return null;

    const estadoInfo = ESTADOS[data?.estado] ?? ESTADOS[0];

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={false} title="Detalle de Tasación" isLoading={isLoading} size="lg">
            {data && (
                <div className="space-y-6 relative transition-colors">

                    {/* ── Header: cliente + estado ── */}
                    <div className="flex flex-col md:flex-row gap-5 border-b border-slate-100 dark:border-dark-border pb-6 transition-colors">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 shrink-0 bg-brand-red-light dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <UserIcon className="w-10 h-10 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div className="flex-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border transition-colors ${estadoInfo.classes}`}>
                                {estadoInfo.label}
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-dark-text uppercase mt-1 leading-tight transition-colors">
                                {data.cliente?.nombre_completo || 'Sin cliente asignado'}
                            </h2>

                            <div className="flex flex-wrap items-center gap-2.5 mt-3">
                                {data.cliente?.documento && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-dark-border transition-colors">
                                        <IdentificationIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                                        {data.cliente.documento}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-dark-border transition-colors">
                                    <CalendarDaysIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                                    {data.fecha_tasacion}
                                </div>
                                {data.tasador?.name && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-white dark:text-dark-text bg-slate-900 dark:bg-black px-2.5 py-1.5 rounded-lg border border-slate-800 dark:border-dark-border transition-colors">
                                        <BriefcaseIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                                        Tasador: {data.tasador.name}
                                    </div>
                                )}
                                {data.precio_oro_gramo_aplicado != null && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 transition-colors">
                                        <CurrencyDollarIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                        Oro: S/ {fmt(data.precio_oro_gramo_aplicado)}/g
                                    </div>
                                )}
                                {data.porcentaje_prestamo_aplicado != null && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-red dark:text-brand-gold bg-brand-red-light dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                        {data.porcentaje_prestamo_aplicado}% a prestar
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Totales ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-dark-surface-alt p-4 rounded-2xl border border-slate-200 dark:border-dark-border transition-colors">
                            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Total tasación</p>
                            <p className="text-xl font-black text-slate-800 dark:text-dark-text">S/ {fmt(data.total_tasacion)}</p>
                        </div>
                        <div className="bg-brand-red-light dark:bg-dark-surface-alt p-4 rounded-2xl border border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <p className="text-[10px] font-black text-brand-red dark:text-brand-gold uppercase tracking-widest mb-1 flex items-center gap-1">
                                <BanknotesIcon className="w-3.5 h-3.5" /> Total máximo a prestar
                            </p>
                            <p className="text-xl font-black text-brand-red dark:text-brand-gold">S/ {fmt(data.total_maximo_prestar)}</p>
                        </div>
                    </div>

                    {/* ── Joyas tasadas ── */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <SparklesIcon className="w-4 h-4" /> Joyas tasadas ({data.detalles?.length ?? 0})
                        </h4>

                        {data.detalles?.length > 0 ? (
                            <div className="space-y-3">
                                {data.detalles.map((d) => (
                                    <div key={d.id} className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm transition-colors">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-dark-text uppercase">
                                                    {d.tipo_joya?.descripcion} · {d.subtipo_joya?.descripcion}
                                                </p>
                                                {d.kilates && (
                                                    <span className="inline-block mt-1 text-[10px] font-black bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text-muted px-2 py-0.5 rounded border border-slate-200 dark:border-dark-border">
                                                        {d.kilates}K
                                                    </span>
                                                )}
                                                {d.descripcion_detallada && (
                                                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5 max-w-md">
                                                        {d.descripcion_detallada}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-slate-400 dark:text-dark-text-muted font-bold">
                                                    {fmt(d.peso_bruto)} g bruto — {fmt(d.peso_neto)} g neto
                                                </p>
                                                <p className="text-sm font-black text-slate-800 dark:text-dark-text mt-1">S/ {fmt(d.valor_tasado)}</p>
                                                <p className="text-xs font-black text-brand-gold">Máx: S/ {fmt(d.maximo_prestar)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted/60 text-sm transition-colors">
                                Esta tasación no tiene joyas registradas
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ViewModal>
    );
};

export default TasacionModal;