import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import {
    UserIcon, BanknotesIcon, CalendarDaysIcon,
    UserGroupIcon, MapPinIcon, ClipboardDocumentListIcon,
    ShieldCheckIcon, CheckCircleIcon, XCircleIcon,
} from '@heroicons/react/24/outline';
import CalculadoraCuota from 'components/Shared/CalculadoraCuota';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const Campo = ({ label, value, className = '' }) => (
    <div>
        <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
        <p className={`text-xs font-black text-slate-800 uppercase ${className}`}>{value ?? '—'}</p>
    </div>
);

const statusMap = {
    1: { label: 'PENDIENTE', color: 'bg-brand-gold-light text-brand-gold-dark border-brand-gold/30' },
    2: { label: 'APROBADO',  color: 'bg-green-100 text-green-700 border-green-200' },
    3: { label: 'RECHAZADO', color: 'bg-brand-red-light text-brand-red border-brand-red/30' },
};

const frecuenciaMap = {
    SEMANAL: 'Semanal', CATORCENAL: 'Catorcenal', MENSUAL: 'Mensual',
};

const ViewSolicitudModal = ({ isOpen, onClose, data, isLoading }) => {
    if (!data && !isLoading) return null;

    const totalSinSeguro  = parseFloat(data?.monto_solicitado || 0);
    const seguro          = parseFloat(data?.seguro || 0);
    const cantIntegrantes = data?.es_grupal ? (data?.integrantes?.length || 1) : 1;
    const totalConSeguro  = data?.seguro_financiado
        ? totalSinSeguro + (seguro * cantIntegrantes)
        : totalSinSeguro;

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} title="Detalle de Solicitud de Crédito" isLoading={isLoading} size='2xl'>
            {data && (
                <div className="space-y-6">

                    {/* ── Encabezado ────────────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código de Solicitud</p>
                            <h3 className="text-2xl font-black text-slate-800">#SOL-{String(data.id).padStart(5, '0')}</h3>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black border ${statusMap[data.estado]?.color}`}>
                                {statusMap[data.estado]?.label}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${data.es_grupal ? 'bg-brand-red-light text-brand-red border-brand-red/20' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                {data.es_grupal ? 'PRÉSTAMO GRUPAL' : 'PRÉSTAMO INDIVIDUAL'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* ── Condiciones del crédito ───────────────────────── */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                                <BanknotesIcon className="w-4 h-4 text-brand-red" /> Condiciones del Crédito
                            </h4>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">Monto Solicitado:</span>
                                <span className="text-base font-black text-brand-red">S/ {fmt(totalSinSeguro)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">
                                    Tasa de Interés:
                                    {data.es_grupal && (
                                        <span className="ml-1 text-[9px] text-slate-400 font-bold normal-case">(global)</span>
                                    )}
                                </span>
                                <span className="text-sm font-black text-brand-gold-dark">{data.tasa_interes}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">Cuotas:</span>
                                <span className="text-sm font-black text-slate-800">{data.cuotas_solicitadas} cuotas</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">Frecuencia:</span>
                                <span className="text-sm font-black text-slate-800">{frecuenciaMap[data.frecuencia] ?? data.frecuencia}</span>
                            </div>

                            {/* Seguro */}
                            <div className="pt-2 border-t border-slate-200 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-bold">Seguro por Cliente:</span>
                                    <span className="text-sm font-black text-slate-700">S/ {fmt(seguro)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-bold">Seguro Financiado:</span>
                                    <span className={`flex items-center gap-1 text-xs font-black ${data.seguro_financiado ? 'text-green-600' : 'text-slate-400'}`}>
                                        {data.seguro_financiado
                                            ? <><CheckCircleIcon className="w-4 h-4" /> Sí, incluido en cuotas</>
                                            : <><XCircleIcon className="w-4 h-4" /> No financiado</>
                                        }
                                    </span>
                                </div>
                                {data.seguro_financiado && (
                                    <div className="flex justify-between items-center bg-brand-red-light px-3 py-1.5 rounded-lg">
                                        <span className="text-xs text-brand-red font-bold">Total con Seguro:</span>
                                        <span className="text-sm font-black text-brand-red">S/ {fmt(totalConSeguro)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">Modalidad:</span>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-white border border-brand-red/20 rounded text-brand-red uppercase">{data.modalidad}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-brand-red" /> Responsables
                            </h4>
                            <Campo label={data.es_grupal ? 'Nombre del Grupo' : 'Cliente Solicitante'} value={data.cliente_nombre} />
                            <Campo label="Asesor de Negocios" value={data.asesor_nombre} className="normal-case" />
                            <Campo label="Producto Financiero" value={data.producto_nombre} />

                            {/* Código de recaudo */}
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Código de Recaudo</p>
                                <span className={`inline-block mt-0.5 text-[10px] font-black px-2 py-0.5 rounded ${
                                    data.codigo_recaudo
                                        ? 'text-blue-600 bg-blue-50 border border-blue-200'
                                        : 'text-brand-gold-dark bg-brand-gold-light border border-brand-gold/30'
                                }`}>
                                    {data.codigo_recaudo || 'PENDIENTE'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 pt-1">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase">Registrada: {data.fecha_solicitud}</span>
                            </div>
                        </div>

                    </div>

                    {/* ── Integrantes (solo grupal) ─────────────────────────── */}
                    {data.es_grupal && data.integrantes?.length > 0 && (
                        <div className="bg-brand-red-light/40 p-5 rounded-2xl border border-brand-red/10">
                            <h4 className="text-xs font-black text-brand-red-dark uppercase mb-4 flex items-center gap-2">
                                <UserGroupIcon className="w-5 h-5" /> Integrantes del Grupo
                                <span className="ml-auto text-[10px] font-bold text-slate-500">{data.integrantes.length} socios</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.integrantes.map((int, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-brand-red-light shadow-sm hover:border-brand-red/30 hover:shadow-md transition-all">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-slate-700 uppercase">{int.nombre_completo}</span>
                                            <span className="text-[9px] text-brand-gold-dark font-bold uppercase">{int.cargo}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit ${
                                                int.modalidad?.includes('VIGENTE') || int.modalidad?.includes('RCS')
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-green-50 text-green-600'
                                            }`}>{int.modalidad}</span>
                                            {/* Tasa individual si tiene */}
                                            {int.tasa_interes != null && (
                                                <span className="text-[9px] font-black bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded w-fit">
                                                    Tasa propia: {int.tasa_interes}%
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-black text-brand-red bg-brand-red-light/50 px-2 py-1 rounded-lg border border-brand-red/20 flex-shrink-0">
                                            S/ {fmt(int.monto)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-brand-red/10 flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Seguro total grupo</p>
                                    <p className="text-xs font-black text-slate-600">S/ {fmt(seguro * data.integrantes.length)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase mr-2">Suma total:</span>
                                    <span className="text-sm font-black text-brand-red underline">S/ {fmt(data.monto_solicitado)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Observaciones ─────────────────────────────────────── */}
                    {data.observaciones && data.observaciones !== 'Sin observaciones.' && (
                        <div className="bg-brand-gold-light/40 p-4 rounded-xl border border-brand-gold/30 flex gap-3">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-brand-gold-dark flex-shrink-0" />
                            <div>
                                <h4 className="text-[10px] font-black text-brand-gold-dark uppercase mb-1">Notas del Asesor</h4>
                                <p className="text-xs text-slate-700 leading-relaxed font-medium italic">"{data.observaciones}"</p>
                            </div>
                        </div>
                    )}

                    {/* ── Aval ──────────────────────────────────────────────── */}
                    <div className={`p-5 rounded-2xl border ${data.aval ? 'bg-brand-gold-light/30 border-brand-gold/30' : 'bg-slate-50 border-dashed border-slate-100'}`}>
                        <h4 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                            <ShieldCheckIcon className={`w-4 h-4 ${data.aval ? 'text-brand-gold-dark' : 'text-slate-300'}`} />
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
                                    <p className="text-[9px] text-brand-gold-dark font-bold uppercase flex items-center gap-1 mb-0.5">
                                        <MapPinIcon className="w-3 h-3" /> Dirección
                                    </p>
                                    <p className="text-xs font-bold text-slate-700 italic">
                                        {data.aval.direccion_aval} — {data.aval.distrito_aval}, {data.aval.provincia_aval}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="py-4 text-xs font-bold text-slate-300 italic uppercase text-center">Sin aval registrado.</p>
                        )}
                    </div>

                    {/* ── Calculadora ───────────────────────────────────────── */}
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