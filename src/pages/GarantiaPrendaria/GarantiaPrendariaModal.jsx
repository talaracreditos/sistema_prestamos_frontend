import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import {
    SparklesIcon, UserIcon, IdentificationIcon, CalendarDaysIcon,
    BanknotesIcon, ArchiveBoxIcon, ScaleIcon,
} from '@heroicons/react/24/outline';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

export const ESTADOS_GARANTIA = {
    0: { label: 'Pendiente',   classes: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30' },
    1: { label: 'En custodia', classes: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30' },
    2: { label: 'Entregado',   classes: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30' },
    3: { label: 'Subastado',   classes: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-500/30' },
    4: { label: 'Adjudicado',  classes: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30' },
};

export const ESTADOS_PRESTAMO = {
    1: 'Vigente',
    2: 'Cancelado',
    3: 'Liquidado',
    4: 'Refinanciado',
};

export const EstadoGarantiaBadge = ({ estado }) => {
    const info = ESTADOS_GARANTIA[estado] ?? { label: 'Desconocido', classes: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text-muted border-slate-300 dark:border-dark-border' };
    return (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border tracking-wider w-fit transition-colors ${info.classes}`}>
            {info.label}
        </span>
    );
};

const Dato = ({ label, value }) => (
    <div>
        <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-800 dark:text-dark-text">{value ?? '—'}</p>
    </div>
);

const Seccion = ({ icon: Icon, titulo, children }) => (
    <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Icon className="w-4 h-4" /> {titulo}
        </h4>
        {children}
    </div>
);

const GarantiaPrendariaModal = ({ isOpen, onClose, data, isLoading }) => {
    if (!data && !isLoading) return null;

    const joya     = data?.joya;
    const prestamo = data?.prestamo;

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={false} title="Detalle de Garantía Prendaria" isLoading={isLoading} size="lg">
            {data && (
                <div className="space-y-6 relative transition-colors">

                    {/* ── Header: joya + estado ── */}
                    <div className="flex flex-col md:flex-row gap-5 border-b border-slate-100 dark:border-dark-border pb-6 transition-colors">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 shrink-0 bg-brand-red-light dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <SparklesIcon className="w-10 h-10 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div className="flex-1">
                            <EstadoGarantiaBadge estado={data.estado_fisico} />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-dark-text uppercase mt-1 leading-tight transition-colors">
                                {[joya?.tipo_joya, joya?.subtipo_joya].filter(Boolean).join(' · ') || 'Joya sin clasificar'}
                            </h2>
                            {joya?.descripcion && (
                                <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-1.5">{joya.descripcion}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-2.5 mt-3">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-dark-border transition-colors">
                                    <ArchiveBoxIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                                    Lote: {data.numero_lote || 'Sin lote'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-dark-border transition-colors">
                                    <CalendarDaysIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                                    Registrada: {data.fecha_registro || '—'}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-dark-border transition-colors">
                                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                                    {data.cliente?.nombre_completo}
                                </div>
                                {data.cliente?.documento && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-dark-border transition-colors">
                                        <IdentificationIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                                        {data.cliente.documento}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Préstamo amarrado ── */}
                    <Seccion icon={BanknotesIcon} titulo="Préstamo amarrado">
                        {prestamo ? (
                            <div className="bg-brand-red-light dark:bg-dark-surface-alt p-4 rounded-2xl border border-brand-red/20 dark:border-brand-gold/20 grid grid-cols-2 md:grid-cols-4 gap-4 transition-colors">
                                <Dato label="N° Préstamo" value={prestamo.numero_prestamo} />
                                <Dato label="Cód. Recaudo" value={prestamo.codigo_recaudo} />
                                <Dato label="Estado" value={ESTADOS_PRESTAMO[prestamo.estado] ?? `Estado ${prestamo.estado}`} />
                                <Dato label="Monto" value={`S/ ${fmt(prestamo.monto)}`} />
                                <Dato label="Cuotas" value={prestamo.cuotas} />
                                <Dato label="Frecuencia" value={prestamo.frecuencia} />
                                <Dato label="Desembolsado" value={prestamo.desembolsado ? 'Sí' : 'No'} />
                                <Dato label="F. Desembolso" value={prestamo.fecha_desembolso} />
                            </div>
                        ) : (
                            <div className="py-6 text-center bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted/60 text-sm transition-colors">
                                Esta garantía aún no está amarrada a un préstamo
                                {data.solicitud_id ? ` (solicitud #${data.solicitud_id})` : ''}
                            </div>
                        )}
                    </Seccion>

                    {/* ── Tasación de la joya ── */}
                    <Seccion icon={ScaleIcon} titulo="Tasación de la joya">
                        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200 dark:border-dark-border grid grid-cols-2 md:grid-cols-4 gap-4 transition-colors">
                            <Dato label="Kilataje" value={joya?.kilataje} />
                            <Dato label="Peso bruto" value={`${fmt(joya?.peso_bruto)} gr`} />
                            <Dato label="Incrustación" value={`${fmt(joya?.peso_incrustacion)} gr`} />
                            <Dato label="Peso neto" value={`${fmt(joya?.peso_neto)} gr`} />
                            <Dato label="Precio / gr" value={`S/ ${fmt(joya?.precio_gramo_aplicado)}`} />
                            <Dato label="Valor tasado" value={`S/ ${fmt(joya?.valor_tasado)}`} />
                            <Dato
                                label={joya?.porcentaje_prestamo_aplicado != null ? `Máx. a prestar (${joya.porcentaje_prestamo_aplicado}%)` : 'Máx. a prestar'}
                                value={`S/ ${fmt(joya?.maximo_prestar)}`}
                            />
                            <Dato label="Fecha tasación" value={joya?.fecha_tasacion} />
                        </div>
                    </Seccion>

                    {/* ── Adjudicación ── */}
                    {data.adjudicacion && (
                        <Seccion icon={ArchiveBoxIcon} titulo="Adjudicación">
                            <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-200 dark:border-red-500/20 grid grid-cols-2 gap-4 transition-colors">
                                <Dato label="Fecha" value={data.adjudicacion.fecha} />
                                <Dato label="Adjudicado por" value={data.adjudicacion.por} />
                            </div>
                        </Seccion>
                    )}

                    {/* ── Otras piezas del lote ── */}
                    {data.otras_piezas_lote?.length > 0 && (
                        <Seccion icon={SparklesIcon} titulo={`Otras piezas del lote (${data.otras_piezas_lote.length})`}>
                            <div className="space-y-2">
                                {data.otras_piezas_lote.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between gap-4 bg-white dark:bg-dark-surface p-3 rounded-xl border border-slate-200 dark:border-dark-border transition-colors">
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-800 dark:text-dark-text uppercase">
                                                <span className="text-slate-400 dark:text-dark-text-muted mr-1.5">#{p.id}</span>
                                                {[p.tipo_joya, p.subtipo_joya].filter(Boolean).join(' · ') || 'Joya'}
                                            </p>
                                            {p.descripcion && (
                                                <p className="text-[11px] text-slate-500 dark:text-dark-text-muted truncate">{p.descripcion}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className="text-xs font-black text-slate-800 dark:text-dark-text">S/ {fmt(p.valor_tasado)}</span>
                                            <EstadoGarantiaBadge estado={p.estado_fisico} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Seccion>
                    )}
                </div>
            )}
        </ViewModal>
    );
};

export default GarantiaPrendariaModal;