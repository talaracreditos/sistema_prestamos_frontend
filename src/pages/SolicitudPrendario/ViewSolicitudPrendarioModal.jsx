import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import CalculadoraCuota from 'components/Shared/CalculadoraCuota';
import {
    UserIcon, BanknotesIcon, CalendarDaysIcon,
    ClipboardDocumentListIcon, CheckCircleIcon, XCircleIcon, ScaleIcon,
} from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const Campo = ({ label, value, className = '' }) => (
    <div>
        <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase">{label}</p>
        <p className={`text-xs font-black text-slate-800 dark:text-dark-text uppercase ${className}`}>{value ?? '—'}</p>
    </div>
);

const Fila = ({ label, children }) => (
    <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">{label}</span>
        {children}
    </div>
);

const statusMap = {
    1: { label: 'PENDIENTE', color: 'bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border-brand-gold/30 dark:border-brand-gold/20' },
    2: { label: 'APROBADO',  color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' },
    3: { label: 'RECHAZADO', color: 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/30' },
};

const ViewSolicitudPrendarioModal = ({ isOpen, onClose, data, isLoading }) => {
    if (!data && !isLoading) return null;

    const monto    = parseFloat(data?.monto_solicitado || 0);
    const seguro   = parseFloat(data?.seguro || 0);
    const custodia = parseFloat(data?.monto_custodia || 0);
    const total    = monto + (data?.seguro_financiado ? seguro : 0) + custodia;

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} title="Detalle de Solicitud Prendaria" isLoading={isLoading} size="2xl">
            {data && (
                <div className="space-y-6 transition-colors">

                    {/* Encabezado */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-dark-border pb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Código de Solicitud</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-dark-text">#SOL-{String(data.id).padStart(5, '0')}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black border ${statusMap[data.estado]?.color}`}>
                                {statusMap[data.estado]?.label}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20">
                                PRÉSTAMO PRENDARIO
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Condiciones */}
                        <div className="bg-slate-50 dark:bg-dark-surface-alt p-5 rounded-2xl border border-slate-200 dark:border-dark-border space-y-3">
                            <h4 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase flex items-center gap-2">
                                <BanknotesIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> Condiciones del Crédito
                            </h4>
                            <Fila label="Monto Solicitado:">
                                <span className="text-base font-black text-brand-red dark:text-brand-gold">S/ {fmt(monto)}</span>
                            </Fila>
                            <Fila label="Tasa de Interés:">
                                <span className="text-sm font-black text-brand-gold-dark dark:text-brand-gold">{data.tasa_interes}%</span>
                            </Fila>
                            <Fila label="Cuotas:">
                                <span className="text-sm font-black text-slate-800 dark:text-dark-text">{data.cuotas_solicitadas} · Mensual</span>
                            </Fila>
                            <div className="pt-2 border-t border-slate-200 dark:border-dark-border space-y-1.5">
                                <Fila label="Seguro:">
                                    <span className="text-sm font-black text-slate-700 dark:text-dark-text">S/ {fmt(seguro)}</span>
                                </Fila>
                                <Fila label="Seguro Financiado:">
                                    <span className={`flex items-center gap-1 text-xs font-black ${data.seguro_financiado ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                                        {data.seguro_financiado
                                            ? <><CheckCircleIcon className="w-4 h-4" /> Sí</>
                                            : <><XCircleIcon className="w-4 h-4" /> No</>}
                                    </span>
                                </Fila>
                                <Fila label="Monto de Custodia:">
                                    <span className="text-sm font-black text-slate-700 dark:text-dark-text">S/ {fmt(custodia)}</span>
                                </Fila>
                                <div className="flex justify-between items-center bg-brand-red-light dark:bg-brand-gold/10 px-3 py-1.5 rounded-lg">
                                    <span className="text-xs text-brand-red dark:text-brand-gold font-bold">Total:</span>
                                    <span className="text-sm font-black text-brand-red dark:text-brand-gold">S/ {fmt(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Responsables */}
                        <div className="bg-slate-50 dark:bg-dark-surface-alt p-5 rounded-2xl border border-slate-200 dark:border-dark-border space-y-4">
                            <h4 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> Responsables
                            </h4>
                            <Campo label="Cliente" value={data.cliente_nombre} />
                            {data.cliente_documento && <Campo label="Documento" value={data.cliente_documento} />}
                            <Campo label="Tasador" value={data.tasador_nombre} className="normal-case" />
                            <Campo label="Producto Financiero" value={data.producto_nombre} />
                            <div>
                                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase">Código de Recaudo</p>
                                <span className={`inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded ${
                                    data.codigo_recaudo
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20'
                                        : 'text-brand-gold-dark dark:text-brand-gold bg-brand-gold-light dark:bg-brand-gold/10 border border-brand-gold/30 dark:border-brand-gold/20'
                                }`}>
                                    {data.codigo_recaudo || 'PENDIENTE'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-dark-text-muted pt-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Registrada: {data.fecha_solicitud}</span>
                            </div>
                            {data.fecha_inicio_personalizada && (
                                <div className="flex items-center gap-2 text-brand-red dark:text-brand-gold">
                                    <CalendarDaysIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase">Inicio personalizado: {data.fecha_inicio_personalizada}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasación */}
                    {data.tasacion && (
                        <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/20">
                            <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase mb-4 flex items-center gap-2">
                                <ScaleIcon className="w-4 h-4" /> Garantía Prendaria — Tasación #{data.tasacion.id}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase">Fecha de Tasación</p>
                                    <p className="text-xs font-black text-amber-800 dark:text-amber-300">{data.tasacion.fecha_tasacion ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase">Tasador</p>
                                    <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase">{data.tasacion.tasador_nombre ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase">Valor Tasado Total</p>
                                    <p className="text-xs font-black text-amber-800 dark:text-amber-300">S/ {fmt(data.tasacion.total_tasacion)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase">Máximo a Prestar</p>
                                    <p className="text-sm font-black text-brand-red dark:text-brand-gold">S/ {fmt(data.tasacion.total_maximo_prestar)}</p>
                                </div>
                            </div>

                            {data.tasacion.detalles?.length > 0 && (
                                <div className="pt-3 border-t border-amber-200 dark:border-amber-500/20">
                                    <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase mb-2">
                                        Piezas Tasadas ({data.tasacion.detalles.length})
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {data.tasacion.detalles.map((d) => (
                                            <div key={d.id} className="bg-white dark:bg-dark-surface p-3 rounded-xl border border-amber-200 dark:border-amber-500/20">
                                                <p className="text-[10px] font-black text-slate-700 dark:text-dark-text uppercase">
                                                    {d.tipo_joya ?? 'Joya'}{d.subtipo_joya ? ` — ${d.subtipo_joya}` : ''}
                                                </p>
                                                {d.descripcion_detallada && (
                                                    <p className="text-[9px] text-slate-500 dark:text-dark-text-muted font-medium italic mt-0.5">{d.descripcion_detallada}</p>
                                                )}
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[9px] font-bold text-slate-500 dark:text-dark-text-muted">
                                                    {d.kilates && <span>Kilates: {d.kilates}</span>}
                                                    {d.peso_bruto && <span>Peso bruto: {d.peso_bruto}g</span>}
                                                    {d.peso_incrustacion && <span>Peso incrustación: {d.peso_incrustacion}g</span>}
                                                    {d.peso_neto && <span>Peso neto: {d.peso_neto}g</span>}
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-dark-border">
                                                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase">Valor tasado</span>
                                                    <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(d.valor_tasado)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase">Máx. a prestar</span>
                                                    <span className="text-xs font-black text-brand-red dark:text-brand-gold">S/ {fmt(d.maximo_prestar)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notas */}
                    {data.observaciones && data.observaciones !== 'Sin observaciones.' && (
                        <div className="bg-brand-gold-light/40 dark:bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/30 dark:border-brand-gold/20 flex gap-3">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-brand-gold-dark dark:text-brand-gold flex-shrink-0" />
                            <div>
                                <h4 className="text-[10px] font-black text-brand-gold-dark dark:text-brand-gold uppercase mb-1">Notas del Tasador</h4>
                                <p className="text-xs text-slate-700 dark:text-dark-text leading-relaxed font-medium italic">"{data.observaciones}"</p>
                            </div>
                        </div>
                    )}

                    <CalculadoraCuota
                        monto={data.monto_solicitado}
                        tasa={data.tasa_interes}
                        cuotas={data.cuotas_solicitadas}
                        frecuencia={data.frecuencia}
                        seguro={data.seguro}
                        seguro_financiado={data.seguro_financiado}
                        cantidadIntegrantes={1}
                        custodia={data.monto_custodia}
                        esPrendario
                    />
                </div>
            )}
        </ViewModal>
    );
};

export default ViewSolicitudPrendarioModal;