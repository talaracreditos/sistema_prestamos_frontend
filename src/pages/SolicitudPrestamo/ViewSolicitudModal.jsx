import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import {
    UserIcon, BanknotesIcon, CalendarDaysIcon,
    UserGroupIcon, MapPinIcon, ClipboardDocumentListIcon,
    ShieldCheckIcon, CheckCircleIcon, XCircleIcon, ScaleIcon,
} from '@heroicons/react/24/outline';
import CalculadoraCuota from 'components/Shared/CalculadoraCuota';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const Campo = ({ label, value, className = '' }) => (
    <div>
        <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase">{label}</p>
        <p className={`text-xs font-black text-slate-800 dark:text-dark-text uppercase ${className}`}>{value ?? '—'}</p>
    </div>
);

const statusMap = {
    1: { label: 'PENDIENTE', color: 'bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border-brand-gold/30 dark:border-brand-gold/20' },
    2: { label: 'APROBADO',  color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' },
    3: { label: 'RECHAZADO', color: 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/30' },
};

const frecuenciaMap = {
    SEMANAL: 'Semanal', CATORCENAL: 'Catorcenal', MENSUAL: 'Mensual',
};

const tipoBadge = (data) => {
    if (data.es_prendario) return { label: 'PRÉSTAMO PRENDARIO', color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20' };
    if (data.es_grupal)    return { label: 'PRÉSTAMO GRUPAL',    color: 'bg-brand-red-light dark:bg-brand-gold/10 text-brand-red dark:text-brand-gold border-brand-red/20 dark:border-brand-gold/20' };
    return { label: 'PRÉSTAMO INDIVIDUAL', color: 'bg-slate-50 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border' };
};

const ViewSolicitudModal = ({ isOpen, onClose, data, isLoading }) => {
    if (!data && !isLoading) return null;

    const totalSinSeguro  = parseFloat(data?.monto_solicitado || 0);
    const seguro          = parseFloat(data?.seguro || 0);
    const cantIntegrantes = data?.es_grupal ? (data?.integrantes?.length || 1) : 1;
    const totalConSeguro  = data?.seguro_financiado
        ? totalSinSeguro + (seguro * cantIntegrantes)
        : totalSinSeguro;

    const badge = data ? tipoBadge(data) : null;

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} title="Detalle de Solicitud de Crédito" isLoading={isLoading} size='2xl'>
            {data && (
                <div className="space-y-6 transition-colors">

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-dark-border pb-4 transition-colors">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Código de Solicitud</p>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-dark-text">#SOL-{String(data.id).padStart(5, '0')}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black border transition-colors ${statusMap[data.estado]?.color}`}>
                                {statusMap[data.estado]?.label}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${badge.color}`}>
                                {badge.label}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="bg-slate-50 dark:bg-dark-surface-alt p-5 rounded-2xl border border-slate-200 dark:border-dark-border space-y-3 transition-colors">
                            <h4 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase flex items-center gap-2">
                                <BanknotesIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> Condiciones del Crédito
                            </h4>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">Monto Solicitado:</span>
                                <span className="text-base font-black text-brand-red dark:text-brand-gold">S/ {fmt(totalSinSeguro)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">
                                    Tasa de Interés:
                                    {data.es_grupal && (
                                        <span className="ml-1 text-[9px] text-slate-400 dark:text-dark-text-muted/60 font-bold normal-case">(global)</span>
                                    )}
                                </span>
                                <span className="text-sm font-black text-brand-gold-dark dark:text-brand-gold">{data.tasa_interes}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">Cuotas:</span>
                                <span className="text-sm font-black text-slate-800 dark:text-dark-text">{data.cuotas_solicitadas} cuotas</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">Frecuencia:</span>
                                <span className="text-sm font-black text-slate-800 dark:text-dark-text">{frecuenciaMap[data.frecuencia] ?? data.frecuencia}</span>
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-dark-border space-y-1.5 transition-colors">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">Seguro por Cliente:</span>
                                    <span className="text-sm font-black text-slate-700 dark:text-dark-text">S/ {fmt(seguro)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">Seguro Financiado:</span>
                                    <span className={`flex items-center gap-1 text-xs font-black ${data.seguro_financiado ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                                        {data.seguro_financiado
                                            ? <><CheckCircleIcon className="w-4 h-4" /> Sí, incluido en cuotas</>
                                            : <><XCircleIcon className="w-4 h-4" /> No financiado</>
                                        }
                                    </span>
                                </div>
                                {data.seguro_financiado && (
                                    <div className="flex justify-between items-center bg-brand-red-light dark:bg-brand-gold/10 px-3 py-1.5 rounded-lg transition-colors">
                                        <span className="text-xs text-brand-red dark:text-brand-gold font-bold">Total con Seguro:</span>
                                        <span className="text-sm font-black text-brand-red dark:text-brand-gold">S/ {fmt(totalConSeguro)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 border-t border-slate-200 dark:border-dark-border flex justify-between items-center transition-colors">
                                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold">Modalidad:</span>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-white dark:bg-dark-surface border border-brand-red/20 dark:border-brand-gold/20 rounded text-brand-red dark:text-brand-gold uppercase transition-colors">{data.modalidad}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-dark-surface-alt p-5 rounded-2xl border border-slate-200 dark:border-dark-border space-y-4 transition-colors">
                            <h4 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> Responsables
                            </h4>
                            <Campo label={data.es_grupal ? 'Nombre del Grupo' : 'Cliente Solicitante'} value={data.cliente_nombre} />
                            <Campo label="Asesor de Negocios" value={data.asesor_nombre} className="normal-case" />
                            <Campo label="Producto Financiero" value={data.producto_nombre} />

                            <div>
                                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase">Código de Recaudo</p>
                                <span className={`inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded transition-colors ${
                                    data.codigo_recaudo
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20'
                                        : 'text-brand-gold-dark dark:text-brand-gold bg-brand-gold-light dark:bg-brand-gold/10 border border-brand-gold/30 dark:border-brand-gold/20'
                                }`}>
                                    {data.codigo_recaudo || 'PENDIENTE'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 dark:text-dark-text-muted pt-1 transition-colors">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Registrada: {data.fecha_solicitud}</span>
                            </div>

                            {data.fecha_inicio_personalizada && (
                                <div className="flex items-center gap-2 text-brand-red dark:text-brand-gold pt-1 transition-colors">
                                    <CalendarDaysIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase">Inicio personalizado: {data.fecha_inicio_personalizada}</span>
                                </div>
                            )}
                        </div>

                    </div>

                    {data.es_prendario && data.tasacion && (
                        <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/20 transition-colors">
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
                                    <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase mb-2 flex items-center gap-1">
                                        Piezas Tasadas ({data.tasacion.detalles.length})
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {data.tasacion.detalles.map((d) => (
                                            <div key={d.id} className="bg-white dark:bg-dark-surface p-3 rounded-xl border border-amber-200 dark:border-amber-500/20">
                                                <p className="text-[10px] font-black text-slate-700 dark:text-dark-text uppercase">
                                                    {d.tipo_joya ?? 'Joya'}{d.subtipo_joya ? ` — ${d.subtipo_joya}` : ''}
                                                </p>
                                                {d.descripcion_detallada && (
                                                    <p className="text-[9px] text-slate-500 dark:text-dark-text-muted font-medium italic mt-0.5">
                                                        {d.descripcion_detallada}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[9px] font-bold text-slate-500 dark:text-dark-text-muted">
                                                    {d.kilates && <span>Kilates: {d.kilates}K</span>}
                                                    {d.peso_bruto && <span>Peso bruto: {d.peso_bruto}g</span>}
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

                    {data.es_grupal && data.integrantes?.length > 0 && (
                        <div className="bg-brand-red-light/40 dark:bg-brand-gold/10 p-5 rounded-2xl border border-brand-red/10 dark:border-brand-gold/20 transition-colors">
                            <h4 className="text-xs font-black text-brand-red-dark dark:text-brand-gold uppercase mb-4 flex items-center gap-2">
                                <UserGroupIcon className="w-5 h-5" /> Integrantes del Grupo
                                <span className="ml-auto text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">{data.integrantes.length} socios</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.integrantes.map((int, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-dark-surface p-3 rounded-xl border border-brand-red-light dark:border-dark-border shadow-sm hover:border-brand-red/30 dark:hover:border-brand-gold/30 hover:shadow-md transition-all">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-slate-700 dark:text-dark-text uppercase">{int.nombre_completo}</span>
                                            <span className="text-[9px] text-brand-gold-dark dark:text-brand-gold font-bold uppercase">{int.cargo}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${
                                                int.modalidad?.includes('VIGENTE') || int.modalidad?.includes('RCS')
                                                    ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                                    : 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                                            }`}>{int.modalidad}</span>
                                            {int.tasa_interes != null && (
                                                <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 px-1.5 py-0.5 rounded w-fit">
                                                    Tasa propia: {int.tasa_interes}%
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-black text-brand-red dark:text-brand-gold bg-white dark:bg-dark-surface-alt px-2 py-1 rounded-lg border border-brand-red/20 dark:border-dark-border flex-shrink-0 transition-colors">
                                            S/ {fmt(int.monto)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-brand-red/10 dark:border-dark-border flex justify-between items-center transition-colors">
                                <div>
                                    <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase">Seguro total grupo</p>
                                    <p className="text-xs font-black text-slate-600 dark:text-dark-text">S/ {fmt(seguro * data.integrantes.length)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mr-2">Suma total:</span>
                                    <span className="text-sm font-black text-brand-red dark:text-brand-gold underline">S/ {fmt(data.monto_solicitado)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {data.observaciones && data.observaciones !== 'Sin observaciones.' && (
                        <div className="bg-brand-gold-light/40 dark:bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/30 dark:border-brand-gold/20 flex gap-3 transition-colors">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-brand-gold-dark dark:text-brand-gold flex-shrink-0" />
                            <div>
                                <h4 className="text-[10px] font-black text-brand-gold-dark dark:text-brand-gold uppercase mb-1">Notas del Asesor</h4>
                                <p className="text-xs text-slate-700 dark:text-dark-text leading-relaxed font-medium italic">"{data.observaciones}"</p>
                            </div>
                        </div>
                    )}

                    <div className={`p-5 rounded-2xl border transition-colors ${data.aval ? 'bg-brand-gold-light/30 dark:bg-brand-gold/10 border-brand-gold/30 dark:border-brand-gold/20' : 'bg-slate-50 dark:bg-dark-surface-alt border-dashed border-slate-100 dark:border-dark-border'}`}>
                        <h4 className="text-xs font-black text-slate-400 dark:text-dark-text-muted uppercase mb-4 flex items-center gap-2">
                            <ShieldCheckIcon className={`w-4 h-4 ${data.aval ? 'text-brand-gold-dark dark:text-brand-gold' : 'text-slate-300 dark:text-dark-text-muted/40'}`} />
                            Garantía — Aval
                        </h4>
                        {data.aval ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <Campo label="Nombre Completo" value={`${data.aval.nombres_aval} ${data.aval.apellido_paterno_aval} ${data.aval.apellido_materno_aval}`} />
                                </div>
                                <Campo label="DNI" value={data.aval.dni_aval} />
                                <Campo label="Vínculo" value={data.aval.relacion_cliente_aval} />
                                <Campo label="Celular" value={data.aval.telefono_movil_aval} />
                                <div className="md:col-span-3">
                                    <p className="text-[9px] text-brand-gold-dark dark:text-brand-gold font-bold uppercase flex items-center gap-1 mb-0.5">
                                        <MapPinIcon className="w-3 h-3" /> Dirección
                                    </p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-dark-text italic transition-colors">
                                        {data.aval.direccion_aval} — {data.aval.distrito_aval}, {data.aval.provincia_aval}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="py-4 text-xs font-bold text-slate-300 dark:text-dark-text-muted/60 italic uppercase text-center">Sin aval registrado.</p>
                        )}
                    </div>

                    {data.es_grupal && data.integrantes?.length > 0 ? (
                        <CalculadoraCuota
                            integrantes={data.integrantes.map(i => ({
                                ...i,
                                nombre:              i.nombre_completo,
                                tasa_interes:        i.tasa_interes ?? null,
                                usa_tasa_individual: i.tasa_interes != null,
                            }))}
                            tasaGlobal={data.tasa_interes}
                            cuotas={data.cuotas_solicitadas}
                            frecuencia={data.frecuencia}
                            seguro={data.seguro}
                            seguro_financiado={data.seguro_financiado}
                        />
                    ) : (
                        <CalculadoraCuota
                            monto={data.monto_solicitado}
                            tasa={data.tasa_interes}
                            cuotas={data.cuotas_solicitadas}
                            frecuencia={data.frecuencia}
                            seguro={data.seguro}
                            seguro_financiado={data.seguro_financiado}
                            cantidadIntegrantes={1}
                        />
                    )}

                </div>
            )}
        </ViewModal>
    );
};

export default ViewSolicitudModal;