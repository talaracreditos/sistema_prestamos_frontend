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

/**
 * Vista de cronograma SIMPLIFICADA para usuarios con rol "cliente".
 *
 *  - Por defecto muestra el cronograma GLOBAL con el saldo global.
 *  - En grupal: los demás integrantes se ven SOLO como lista (nombre + cargo),
 *    sin acceso a sus cronogramas individuales.
 *  - Con el toggle "Mi saldo" el cliente ve su propio cronograma individual.
 *  - Solo muestra las cuotas que faltan pagar; las pagadas quedan colapsadas.
 *  - Lenguaje amigable, sin jerga interna (excedentes, castigo, estados, etc.).
 *
 * Estados de cuota:
 *   0=Cancelado, 1=Pendiente, 2=Pagado, 3=Vence hoy, 4=Vencido, 5=Parcial, 6=Refinanciado
 */

const ESTADOS_INACTIVOS = [0, 2, 6]; // cancelado, pagado, refinanciado → no exigibles

const fmt = (v) => `S/ ${parseFloat(v ?? 0).toFixed(2)}`;

const getCuotaInfo = (cuota, i) => {
    const nro        = cuota.nro ?? i + 1;
    const monto      = parseFloat(cuota.total_cuota ?? cuota.monto ?? 0);
    const saldo      = parseFloat(cuota.saldo_pendiente ?? cuota.saldo_real ?? 0);
    const moraTotal  = parseFloat(cuota.mora_total ?? cuota.mora ?? 0);
    const moraPagada = parseFloat(cuota.mora_pagada ?? 0);
    const moraPend   = Math.max(0, moraTotal - moraPagada);
    const diasAtraso = cuota.dias_atraso || 0;
    const abonado    = parseFloat(cuota.pago_acumulado ?? cuota.pago_realizado ?? 0);

    const esPagada   = cuota.estado === 2 || (!ESTADOS_INACTIVOS.includes(cuota.estado) && saldo <= 0 && abonado > 0);
    const esInactiva = ESTADOS_INACTIVOS.includes(cuota.estado) || esPagada;
    const esVencida  = cuota.estado === 4 || diasAtraso > 0;
    const esVenceHoy = cuota.estado === 3;
    const esParcial  = cuota.estado === 5 || (abonado > 0 && saldo > 0);

    return {
        nro, monto, saldo, moraPend, diasAtraso, abonado,
        esPagada, esInactiva, esVencida, esVenceHoy, esParcial,
        vencimiento: cuota.vencimiento,
        totalAPagar: saldo + moraPend,
    };
};

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
const ProgresoPago = ({ pagadas, total, esVistaIntegrante }) => {
    const pct = total > 0 ? Math.round((pagadas / total) * 100) : 0;
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {esVistaIntegrante ? 'Tu avance de pago' : 'Avance del grupo'}
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
 * PRÓXIMA CUOTA (destacada)
 * ───────────────────────────────────────────────────────────── */
const ProximaCuota = ({ d, esVistaIntegrante }) => {
    const conAtraso = d.esVencida && d.diasAtraso > 0;
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
                        : d.esVenceHoy
                        ? '¡La cuota vence hoy!'
                        : esVistaIntegrante ? 'Tu próximo pago' : 'Próximo pago del grupo'}
                </p>
            </div>

            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <p className="text-3xl font-black">{fmt(d.totalAPagar)}</p>
                    <p className="text-[14px] font-bold text-white/70 mt-1">
                        Cuota #{d.nro.toString().padStart(2, '0')} · Vence: {d.vencimiento}
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

            {d.esParcial && d.abonado > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-[10px] font-bold text-white/80">
                        Ya {esVistaIntegrante ? 'abonaste' : 'se abonó'} {fmt(d.abonado)} de esta cuota. Falta {fmt(d.totalAPagar)}.
                    </p>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * CUOTA PENDIENTE (item de lista)
 * ───────────────────────────────────────────────────────────── */
const CuotaPendienteItem = ({ d }) => (
    <div className={`flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm ${
        d.esVencida ? 'border-brand-red/30' : 'border-slate-100'
    }`}>
        <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black font-mono rounded-lg px-2 py-1 ${
                d.esVencida
                    ? 'bg-brand-red-light text-brand-red'
                    : 'bg-slate-100 text-slate-400'
            }`}>
                #{d.nro.toString().padStart(2, '0')}
            </span>
            <div>
                <p className="text-xs font-bold text-slate-700">{d.vencimiento}</p>
                {d.esVencida && d.diasAtraso > 0 ? (
                    <p className="text-[9px] font-black text-brand-red uppercase">
                        {d.diasAtraso} {d.diasAtraso === 1 ? 'día' : 'días'} de atraso
                        {d.moraPend > 0 && ` · Mora: ${fmt(d.moraPend)}`}
                    </p>
                ) : d.esParcial ? (
                    <p className="text-[9px] font-black text-orange-500 uppercase">
                        Pago parcial · Abonado: {fmt(d.abonado)}
                    </p>
                ) : (
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Por pagar</p>
                )}
            </div>
        </div>
        <div className="text-right">
            <p className={`text-sm font-black ${d.esVencida ? 'text-brand-red' : 'text-slate-800'}`}>
                {fmt(d.totalAPagar)}
            </p>
        </div>
    </div>
);

/* ─────────────────────────────────────────────────────────────
 * CUOTA PAGADA (item colapsable)
 * ───────────────────────────────────────────────────────────── */
const CuotaPagadaItem = ({ d }) => (
    <div className="flex items-center justify-between bg-green-50/50 p-3 rounded-xl border border-green-100">
        <div className="flex items-center gap-3">
            <CheckSolidIcon className="w-5 h-5 text-green-500 shrink-0" />
            <div>
                <p className="text-xs font-bold text-slate-600">
                    Cuota #{d.nro.toString().padStart(2, '0')} · {d.vencimiento}
                </p>
                <p className="text-[9px] font-black text-green-600 uppercase">✓ Pagada</p>
            </div>
        </div>
        <p className="text-sm font-black text-green-700">{fmt(d.monto)}</p>
    </div>
);

/* ─────────────────────────────────────────────────────────────
 * COMPONENTE PRINCIPAL
 * ───────────────────────────────────────────────────────────── */
const CronogramaCliente = ({
    cronograma = [],
    eco = null,
    estadoPrestamo = 1,
    prestamoCancelado = false,
    esVistaIntegrante = false,   // false = global | true = "Mi saldo"
    integrantes = [],            // lista solo lectura (grupal, vista global)
    miIntegranteId = null,       // para resaltar "(Tú)" en la lista
}) => {

    const [verPagadas, setVerPagadas] = useState(false);

    const { pendientes, pagadas, totalExigibles, proxima } = useMemo(() => {
        const infos = (cronograma ?? []).map((c, i) => getCuotaInfo(c, i));

        const pend = infos.filter(d => !d.esInactiva);
        const pag  = infos.filter(d => d.esPagada);

        // Total exigible = pagadas + pendientes (excluye canceladas/refinanciadas)
        const total = pend.length + pag.length;

        // Próxima = la primera pendiente (el cronograma ya viene ordenado por nro)
        const prox = pend.length > 0 ? pend[0] : null;

        return { pendientes: pend, pagadas: pag, totalExigibles: total, proxima: prox };
    }, [cronograma]);

    const prestamoTerminado = estadoPrestamo === 3 || (pendientes.length === 0 && pagadas.length > 0);

    return (
        <div className="flex flex-col gap-4">

            {/* Resumen económico simple (saldo global o individual según vista) */}
            {eco !== null && !prestamoCancelado && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-brand-red rounded-2xl shadow-lg shadow-brand-red/20">
                        <p className="text-[9px] font-black uppercase text-white/70 mb-1">
                            {prestamoTerminado
                                ? 'Total pagado'
                                : esVistaIntegrante ? 'Mi saldo por pagar' : 'Saldo del grupo'}
                        </p>
                        <p className="text-lg font-black text-white">
                            {fmt(eco?.total_prestamo)}
                        </p>
                        <p className="text-[9px] font-bold text-white/60 mt-0.5">
                            de {fmt(eco?.total_original)}
                        </p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
                            {esVistaIntegrante ? 'Mi cuota' : 'Valor de la cuota'}
                        </p>
                        <p className="text-lg font-black text-slate-800">{fmt(eco?.valor_cuota)}</p>
                        <p className="text-[9px] font-bold text-brand-gold-dark uppercase mt-0.5">{eco?.frecuencia}</p>
                    </div>
                </div>
            )}

            {/* Integrantes — SOLO lista informativa en vista global */}
            {!esVistaIntegrante && (
                <ListaIntegrantes integrantes={integrantes} miIntegranteId={miIntegranteId} />
            )}

            {/* Barra de progreso */}
            {totalExigibles > 0 && (
                <ProgresoPago
                    pagadas={pagadas.length}
                    total={totalExigibles}
                    esVistaIntegrante={esVistaIntegrante}
                />
            )}

            {/* Préstamo terminado 🎉 */}
            {prestamoTerminado && !prestamoCancelado && (
                <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 rounded-2xl">
                    <SparklesIcon className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-green-700 uppercase">¡Felicidades!</p>
                        <p className="text-[11px] font-bold text-green-600">
                            {esVistaIntegrante
                                ? 'Completaste el pago de tus cuotas. Gracias por tu puntualidad.'
                                : 'El préstamo está completamente pagado. Gracias por su puntualidad.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Próxima cuota destacada */}
            {proxima && !prestamoCancelado && (
                <ProximaCuota d={proxima} esVistaIntegrante={esVistaIntegrante} />
            )}

            {/* Resto de cuotas pendientes */}
            {pendientes.length > 1 && !prestamoCancelado && (
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        Cuotas siguientes ({pendientes.length - 1})
                    </p>
                    {pendientes.slice(1).map(d => (
                        <CuotaPendienteItem key={d.nro} d={d} />
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
                    {verPagadas && pagadas.map(d => (
                        <CuotaPagadaItem key={d.nro} d={d} />
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