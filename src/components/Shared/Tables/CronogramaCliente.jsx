import React, { useState, useMemo } from 'react';
import {
    CalendarDaysIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    SparklesIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolidIcon } from '@heroicons/react/24/solid';
import { useCuotaData } from './hooks/useCuotaData';

const ESTADOS_NO_EXIGIBLES = [0, 2, 6]; // cancelado, pagado, refinanciado

const fmt = (v) => `S/ ${parseFloat(v ?? 0).toFixed(2)}`;

/* ─────────────────────────────────────────────────────────────
 * LISTA DE INTEGRANTES (solo lectura — nombre y cargo)
 * ───────────────────────────────────────────────────────────── */
const ListaIntegrantes = ({ integrantes, miIntegranteId }) => {
    if (!integrantes?.length) return null;
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                <UsersIcon className="w-4 h-4 text-brand-red" />
                Integrantes del grupo ({integrantes.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {integrantes.map((int) => {
                    const soyYo = int.id === miIntegranteId;
                    return (
                        <div
                            key={int.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border ${
                                soyYo
                                    ? 'bg-brand-red-light/40 border-brand-red/20'
                                    : 'bg-slate-50 border-slate-100'
                            }`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase ${
                                    soyYo ? 'text-brand-red' : 'text-slate-600'
                                }`}>
                                    {int.nombre} {soyYo && '(Tú)'}
                                </span>
                                <span className="text-[9px] font-bold text-brand-gold-dark uppercase">
                                    {int.cargo}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * BARRA DE PROGRESO
 * ───────────────────────────────────────────────────────────── */
const ProgresoPago = ({ pagadas, total, esVistaPersonal }) => {
    const pct = total > 0 ? Math.round((pagadas / total) * 100) : 0;
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {esVistaPersonal ? 'Tu avance de pago' : 'Avance del grupo'}
                </p>
                <p className="text-[11px] font-black text-brand-red">
                    {pagadas} de {total} cuotas pagadas
                </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-brand-red to-brand-gold rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1.5 text-right">{pct}% completado</p>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * PRÓXIMA CUOTA (destacada) — usa useCuotaData
 * ───────────────────────────────────────────────────────────── */
const ProximaCuota = ({ cuota, i, esVistaIntegrante, esVistaPersonal }) => {

    const d = useCuotaData(cuota, i, esVistaIntegrante);

    const esVencida  = cuota.estado === 4;
    const esVenceHoy = cuota.estado === 3;
    const esParcial  = cuota.estado === 5;
    const conAtraso  = esVencida && d.diasAtraso > 0;

    return (
        <div className={`p-5 rounded-2xl shadow-xl text-white ${
            conAtraso
                ? 'bg-brand-red shadow-brand-red/30'
                : 'bg-slate-800 shadow-slate-800/20'
        }`}>
            <div className="flex items-center gap-2 mb-3">
                {conAtraso
                    ? <ExclamationTriangleIcon className="w-5 h-5 text-brand-gold" />
                    : <CalendarDaysIcon className="w-5 h-5 text-brand-gold" />
                }
                <p className="text-[14px] font-black uppercase tracking-widest text-white/70">
                    {conAtraso
                        ? 'Cuota atrasada — ponte al día'
                        : esVenceHoy
                        ? '¡La cuota vence hoy!'
                        : esVistaPersonal ? 'Tu próximo pago' : 'Próximo pago del grupo'}
                </p>
            </div>

            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <p className="text-3xl font-black">{fmt(d.saldo)}</p>
                    <p className="text-[14px] font-bold text-white/70 mt-1">
                        Cuota #{d.nro.toString().padStart(2, '0')} · Vence: {cuota.vencimiento}
                    </p>
                </div>
                {conAtraso && (
                    <div className="text-right">
                        <p className="text-[15px] font-black uppercase text-brand-gold">
                            {d.diasAtraso} {d.diasAtraso === 1 ? 'día' : 'días'} de atraso
                        </p>
                        {d.moraPend > 0 && (
                            <p className="text-[13px] font-bold text-white/80">
                                Incluye mora: {fmt(d.moraPend)}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {d.excAnterior > 0 && (
                <p className="text-[11px] font-bold text-white/70 mt-2">
                    ✓ Ya se descontó {fmt(d.excAnterior)} que {esVistaPersonal ? 'tenías' : 'tenía el grupo'} a favor
                </p>
            )}

            {esParcial && d.abonado > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-[10px] font-bold text-white/80">
                        Ya {esVistaPersonal ? 'abonaste' : 'se abonó'} {fmt(d.abonado)} de esta cuota. Falta {fmt(d.saldo)}.
                    </p>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * CUOTA PENDIENTE (item de lista) — usa useCuotaData
 * ───────────────────────────────────────────────────────────── */
const CuotaPendienteItem = ({ cuota, i, esVistaIntegrante }) => {

    const d = useCuotaData(cuota, i, esVistaIntegrante);

    const esVencida = cuota.estado === 4;
    const esParcial = cuota.estado === 5;

    return (
        <div className={`flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm ${
            esVencida ? 'border-brand-red/30' : 'border-slate-100'
        }`}>
            <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black font-mono rounded-lg px-2 py-1 ${
                    esVencida
                        ? 'bg-brand-red-light text-brand-red'
                        : 'bg-slate-100 text-slate-400'
                }`}>
                    #{d.nro.toString().padStart(2, '0')}
                </span>
                <div>
                    <p className="text-xs font-bold text-slate-700">{cuota.vencimiento}</p>
                    {esVencida && d.diasAtraso > 0 ? (
                        <p className="text-[9px] font-black text-brand-red uppercase">
                            {d.diasAtraso} {d.diasAtraso === 1 ? 'día' : 'días'} de atraso
                            {d.moraPend > 0 && ` · Incluye mora: ${fmt(d.moraPend)}`}
                        </p>
                    ) : esParcial ? (
                        <p className="text-[9px] font-black text-orange-500 uppercase">
                            Pago parcial · Abonado: {fmt(d.abonado)}
                        </p>
                    ) : (
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Por pagar</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-black ${esVencida ? 'text-brand-red' : 'text-slate-800'}`}>
                    {fmt(d.saldo)}
                </p>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * CUOTA PAGADA (item colapsable) — usa useCuotaData
 * ───────────────────────────────────────────────────────────── */
const CuotaPagadaItem = ({ cuota, i, esVistaIntegrante }) => {

    const d = useCuotaData(cuota, i, esVistaIntegrante);

    const tuvoMora = d.moraPagada > 0;

    return (
        <div className="flex items-center justify-between bg-green-50/50 p-3 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
                <CheckSolidIcon className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-slate-600">
                        Cuota #{d.nro.toString().padStart(2, '0')} · {cuota.vencimiento}
                    </p>
                    <p className="text-[9px] font-black text-green-600 uppercase">
                        ✓ Pagada
                        {tuvoMora && (
                            <span className="text-brand-gold-dark ml-1.5">
                                · Mora pagada: {fmt(d.moraPagada)}
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-green-700">
                    {tuvoMora ? fmt(d.monto + d.moraPagada) : fmt(d.monto)}
                </p>
                {tuvoMora && (
                    <p className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                        Cuota {fmt(d.monto)} + Mora {fmt(d.moraPagada)}
                    </p>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * COMPONENTE PRINCIPAL
 * ───────────────────────────────────────────────────────────── */
const CronogramaCliente = ({
    cronograma = [],
    eco = null,
    estadoPrestamo = 1,
    prestamoCancelado = false,
    esGrupal = false,
    esVistaIntegrante = false,
    integrantes = [],
    miIntegranteId = null,
}) => {

    const [verPagadas, setVerPagadas] = useState(false);

    const esVistaPersonal = !esGrupal || esVistaIntegrante;

    const { pendientes, pagadas } = useMemo(() => {
        const items = (cronograma ?? []).map((cuota, i) => ({ cuota, i }));
        return {
            pendientes: items.filter(({ cuota }) => !ESTADOS_NO_EXIGIBLES.includes(cuota.estado)),
            pagadas:    items.filter(({ cuota }) => cuota.estado === 2),
        };
    }, [cronograma]);

    const totalExigibles = pendientes.length + pagadas.length;
    const proxima = pendientes[0] ?? null;
    const prestamoTerminado = estadoPrestamo === 3 || (pendientes.length === 0 && pagadas.length > 0);

    return (
        <div className="flex flex-col gap-4">

            {eco !== null && !prestamoCancelado && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-brand-red rounded-2xl shadow-lg shadow-brand-red/20">
                        <p className="text-[9px] font-black uppercase text-white/70 mb-1">
                            {prestamoTerminado
                                ? 'Total pagado'
                                : esVistaPersonal ? 'Mi saldo por pagar' : 'Saldo del grupo'}
                        </p>
                        <p className="text-lg font-black text-white">
                            {fmt(eco?.total_prestamo)}
                        </p>
                        <p className="text-[11px] font-bold text-white/60 mt-0.5">
                            de {fmt(eco?.total_original)}
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                            {esVistaPersonal ? 'Mi cuota' : 'Valor de la cuota'}
                        </p>
                        <p className="text-lg font-black text-slate-800">{fmt(eco?.valor_cuota)}</p>
                        <p className="text-[9px] font-bold text-brand-gold-dark uppercase mt-0.5">{eco?.frecuencia}</p>
                    </div>
                </div>
            )}

            {/* Integrantes — SOLO grupal en vista global */}
            {esGrupal && !esVistaIntegrante && (
                <ListaIntegrantes integrantes={integrantes} miIntegranteId={miIntegranteId} />
            )}

            {/* Barra de progreso */}
            {totalExigibles > 0 && (
                <ProgresoPago
                    pagadas={pagadas.length}
                    total={totalExigibles}
                    esVistaPersonal={esVistaPersonal}
                />
            )}

            {/* Préstamo terminado 🎉 */}
            {prestamoTerminado && !prestamoCancelado && (
                <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-2xl">
                    <SparklesIcon className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-green-700 uppercase">¡Felicidades!</p>
                        <p className="text-[11px] font-bold text-green-600">
                            {esVistaPersonal
                                ? 'Completaste el pago de tu préstamo. Gracias por tu puntualidad.'
                                : 'El préstamo está completamente pagado. Gracias por su puntualidad.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Próxima cuota destacada */}
            {proxima && !prestamoCancelado && (
                <ProximaCuota
                    cuota={proxima.cuota}
                    i={proxima.i}
                    esVistaIntegrante={esVistaIntegrante}
                    esVistaPersonal={esVistaPersonal}
                />
            )}

            {/* Resto de cuotas pendientes */}
            {pendientes.length > 1 && !prestamoCancelado && (
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        Cuotas siguientes ({pendientes.length - 1})
                    </p>
                    {pendientes.slice(1).map(({ cuota, i }) => (
                        <CuotaPendienteItem
                            key={cuota.nro ?? i}
                            cuota={cuota}
                            i={i}
                            esVistaIntegrante={esVistaIntegrante}
                        />
                    ))}
                </div>
            )}

            {/* Cuotas pagadas — colapsadas */}
            {pagadas.length > 0 && (
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setVerPagadas(v => !v)}
                        className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 transition-all"
                    >
                        <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            Cuotas pagadas ({pagadas.length})
                        </span>
                        {verPagadas
                            ? <ChevronUpIcon className="w-4 h-4 text-slate-400" />
                            : <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                        }
                    </button>
                    {verPagadas && pagadas.map(({ cuota, i }) => (
                        <CuotaPagadaItem
                            key={cuota.nro ?? i}
                            cuota={cuota}
                            i={i}
                            esVistaIntegrante={esVistaIntegrante}
                        />
                    ))}
                </div>
            )}

            {/* Sin cuotas */}
            {pendientes.length === 0 && pagadas.length === 0 && (
                <div className="p-8 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                        Aún no hay cuotas registradas en el cronograma
                    </p>
                </div>
            )}
        </div>
    );
};

export default CronogramaCliente;