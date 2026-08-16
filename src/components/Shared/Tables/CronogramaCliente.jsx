import React, { useState } from 'react';
import {
    CalendarDaysIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    SparklesIcon,
    UsersIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolidIcon } from '@heroicons/react/24/solid';
import { useCuotaData } from './hooks/useCuotaData';
import { useCronogramaCliente } from './hooks/useCronogramaCliente';
import TutorialCliente from './TutorialCliente';

const fmt = (v) => `S/ ${parseFloat(v ?? 0).toFixed(2)}`;

/* ─────────────────────────────────────────────────────────────
 * LISTA DE INTEGRANTES (solo lectura — nombre y cargo)
 * ───────────────────────────────────────────────────────────── */
const ListaIntegrantes = ({ integrantes, miIntegranteId }) => {
    if (!integrantes?.length) return null;
    return (
        <div data-tutorial="integrantes" className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest mb-3 transition-colors">
                <UsersIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" />
                Integrantes del grupo ({integrantes.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {integrantes.map((int) => {
                    const soyYo = int.id === miIntegranteId;
                    return (
                        <div
                            key={int.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                                soyYo
                                    ? 'bg-brand-red-light/40 dark:bg-brand-gold/10 border-brand-red/20 dark:border-brand-gold/20'
                                    : 'bg-slate-50 dark:bg-dark-surface-alt border-slate-100 dark:border-dark-border'
                            }`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase transition-colors ${
                                    soyYo ? 'text-brand-red dark:text-brand-gold' : 'text-slate-600 dark:text-dark-text'
                                }`}>
                                    {int.nombre} {soyYo && '(Tú)'}
                                </span>
                                <span className="text-[9px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase transition-colors">
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
        <div data-tutorial="progreso" className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest transition-colors">
                    {esVistaPersonal ? 'Tu avance de pago' : 'Avance del grupo'}
                </p>
                <p className="text-[11px] font-black text-brand-red dark:text-brand-gold transition-colors">
                    {pagadas} de {total} cuotas pagadas
                </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-dark-surface-alt rounded-full h-3 overflow-hidden transition-colors">
                <div
                    className="h-full bg-gradient-to-r from-brand-red to-brand-gold rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted mt-1.5 text-right transition-colors">{pct}% completado</p>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * PRÓXIMA CUOTA (destacada) — usa useCuotaData
 * Esta tarjeta SOLO recibe cuotas completas y NO atrasadas desde el
 * componente padre — las atrasadas (completas o parciales) van en
 * la sección de alerta arriba de todo, para no confundir a quien
 * ya pagó o para priorizar lo más urgente.
 * ───────────────────────────────────────────────────────────── */
const ProximaCuota = ({ cuota, i, esVistaIntegrante, esVistaPersonal }) => {

    const d = useCuotaData(cuota, i, esVistaIntegrante);

    const esVencida  = cuota.estado === 4;
    const esVenceHoy = cuota.estado === 3;
    const conAtraso  = esVencida && d.diasAtraso > 0;

    return (
        <div data-tutorial="proxima" className={`p-5 rounded-2xl shadow-xl dark:shadow-black/50 text-white dark:text-dark-text transition-colors ${
            conAtraso
                ? 'bg-brand-red dark:bg-red-950/80 border dark:border-red-500/30 shadow-brand-red/30'
                : 'bg-slate-800 dark:bg-dark-surface border dark:border-dark-border shadow-slate-800/20'
        }`}>
            <div className="flex items-center gap-2 mb-3">
                {conAtraso
                    ? <ExclamationTriangleIcon className="w-5 h-5 text-brand-gold" />
                    : <CalendarDaysIcon className="w-5 h-5 text-brand-gold" />
                }
                <p className="text-[14px] font-black uppercase tracking-widest text-white/70 dark:text-dark-text-muted">
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
                    <p className="text-[14px] font-bold text-white/70 dark:text-dark-text-muted mt-1">
                        Cuota #{d.nro.toString().padStart(2, '0')} · Vence: {cuota.vencimiento}
                    </p>
                </div>
                {conAtraso && (
                    <div className="text-right">
                        <p className="text-[15px] font-black uppercase text-brand-gold">
                            {d.diasAtraso} {d.diasAtraso === 1 ? 'día' : 'días'} de atraso
                        </p>
                        {d.moraPend > 0 && (
                            <p className="text-[13px] font-bold text-white/80 dark:text-dark-text-muted">
                                Incluye mora: {fmt(d.moraPend)}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {d.excAnterior > 0 && (
                <p className="text-[11px] font-bold text-white/70 dark:text-dark-text-muted mt-2">
                    ✓ Ya se descontó {fmt(d.excAnterior)} que {esVistaPersonal ? 'tenías' : 'tenía el grupo'} a favor
                </p>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * CUOTA PENDIENTE (item de lista) — usa useCuotaData
 * Se usa tanto en la sección de "Atrasadas" como en "Siguientes".
 *
 * La mora TOTAL agregada (d.moraPend) solo tiene sentido en vista
 * personal ("mi saldo"), donde es TU mora. En vista grupal global
 * la mora es individual de cada integrante — nunca se agrega arriba,
 * solo se muestra al costado del nombre de quien la debe.
 * ───────────────────────────────────────────────────────────── */
const CuotaPendienteItem = ({ cuota, i, esVistaIntegrante }) => {

    const d = useCuotaData(cuota, i, esVistaIntegrante);
    const esParcial = cuota.estado === 5;
    const conAtraso = d.diasAtraso > 0;

    const integrantesPendientes = !esVistaIntegrante && cuota.integrantes?.length > 0
        ? cuota.integrantes.filter((int) => !int.pagado)
        : [];

    return (
        <div className={`flex items-center justify-between bg-white dark:bg-dark-surface p-3 rounded-xl border shadow-sm dark:shadow-black/20 transition-colors ${
            conAtraso
                ? 'border-brand-red/30 dark:border-brand-gold/30'
                : esParcial
                ? 'border-orange-300 dark:border-orange-500/40'
                : 'border-slate-100 dark:border-dark-border'
        }`}>
            <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black font-mono rounded-lg px-2 py-1 transition-colors ${
                    conAtraso
                        ? 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400'
                        : esParcial
                        ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400'
                        : 'bg-slate-100 dark:bg-dark-surface-alt text-slate-400 dark:text-dark-text-muted'
                }`}>
                    #{d.nro.toString().padStart(2, '0')}
                </span>
                <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-dark-text transition-colors">{cuota.vencimiento}</p>

                    {conAtraso ? (
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[9px] font-black text-brand-red dark:text-red-400 uppercase">
                                {d.diasAtraso} {d.diasAtraso === 1 ? 'día' : 'días'} de atraso
                                {/* La mora total solo se muestra en vista personal ("mi saldo").
                                    En vista grupal, la mora va individual junto al nombre abajo. */}
                                {esVistaIntegrante && d.moraPend > 0 && ` · Incluye mora: ${fmt(d.moraPend)}`}
                            </p>
                            {esParcial && (
                                integrantesPendientes.length > 0 ? (
                                    <>
                                        <p className="text-[9px] font-black text-brand-red dark:text-red-400 uppercase">
                                            Falta que pague:
                                        </p>
                                        {integrantesPendientes.map((int) => (
                                            <p key={int.id} className="text-[9px] font-bold text-brand-red dark:text-red-400">
                                                - {int.nombre}
                                                {int.mora_pendiente > 0 && (
                                                    <span className="ml-1">
                                                        (Incluye mora: {fmt(int.mora_pendiente)})
                                                    </span>
                                                )}
                                            </p>
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-[9px] font-bold text-brand-red dark:text-red-400">
                                        Abonado: {fmt(d.abonado)}
                                    </p>
                                )
                            )}
                        </div>
                    ) : esParcial ? (
                        integrantesPendientes.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase">
                                    Falta que pague:
                                </p>
                                {integrantesPendientes.map((int) => (
                                    <p key={int.id} className="text-[9px] font-bold text-orange-500 dark:text-orange-400">
                                        - {int.nombre}
                                        {int.mora_pendiente > 0 && (
                                            <span className="text-brand-red dark:text-red-400 ml-1">
                                                (Incluye mora: {fmt(int.mora_pendiente)})
                                            </span>
                                        )}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase">
                                Pago parcial · Abonado: {fmt(d.abonado)}
                            </p>
                        )
                    ) : (
                        <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase">Por pagar</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-black ${
                    conAtraso
                        ? 'text-brand-red dark:text-red-400'
                        : esParcial
                        ? 'text-orange-500 dark:text-orange-400'
                        : 'text-slate-800 dark:text-dark-text'
                }`}>
                    {fmt(d.saldo)}
                </p>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * CUOTAS ATRASADAS (sección de alerta, siempre arriba de todo)
 * Agrupa lo más urgente: vencidas completas + parciales con atraso.
 *
 * El texto "ponte al día" es personal — solo aplica en vista
 * individual ("mi saldo"), donde el atraso es tuyo. En vista grupal
 * global no todos están atrasados (algunos ya pagaron), así que el
 * título solo indica que hay atraso en el grupo, sin imperativo.
 * ───────────────────────────────────────────────────────────── */
const CuotasAtrasadasSection = ({ atrasadas, esVistaIntegrante }) => {
    if (!atrasadas.length) return null;
    return (
        <div
            data-tutorial="atrasadas"
            className="flex flex-col gap-2 p-3 bg-brand-red-light/40 dark:bg-red-950/30 border border-brand-red/30 dark:border-red-500/30 rounded-2xl transition-colors"
        >
            <p className="flex items-center gap-1.5 text-[10px] font-black text-brand-red dark:text-red-400 uppercase tracking-widest px-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {esVistaIntegrante
                    ? `Cuotas atrasadas — ponte al día (${atrasadas.length})`
                    : `Cuotas atrasadas del grupo (${atrasadas.length})`}
            </p>
            {atrasadas.map(({ cuota, i }) => (
                <CuotaPendienteItem
                    key={cuota.nro ?? i}
                    cuota={cuota}
                    i={i}
                    esVistaIntegrante={esVistaIntegrante}
                />
            ))}
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
        <div className="flex items-center justify-between bg-green-50/50 dark:bg-green-500/10 p-3 rounded-xl border border-green-100 dark:border-green-500/20 transition-colors">
            <div className="flex items-center gap-3">
                <CheckSolidIcon className="w-5 h-5 text-green-500 dark:text-green-400 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-slate-600 dark:text-dark-text transition-colors">
                        Cuota #{d.nro.toString().padStart(2, '0')} · {cuota.vencimiento}
                    </p>
                    <p className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase">
                        ✓ Pagada
                        {tuvoMora && (
                            <span className="text-brand-gold-dark dark:text-brand-gold ml-1.5">
                                · Mora pagada: {fmt(d.moraPagada)}
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-green-700 dark:text-green-400">
                    {tuvoMora ? fmt(d.monto + d.moraPagada) : fmt(d.monto)}
                </p>
                {tuvoMora && (
                    <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted whitespace-nowrap">
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

    const [verPagadas, setVerPagadas]   = useState(false);
    const [tutorialKey, setTutorialKey] = useState(0); // >0 = reabrir guía

    const esVistaPersonal = !esGrupal || esVistaIntegrante;

    const { atrasadas, proxima, siguientes, pagadas, totalExigibles, prestamoTerminado } =
        useCronogramaCliente(cronograma, estadoPrestamo);

    return (
        <div className="flex flex-col gap-4 transition-colors">

            {/* Tutorial spotlight — resalta las secciones reales de esta vista.
                Se abre solo la primera vez (localStorage 'tutorial_cliente') */}
            <TutorialCliente esGrupal={esGrupal} reabrir={tutorialKey} />

            {/* Botón para reabrir la guía (también es el ancla del último paso) */}
            <button
                data-tutorial="ayuda"
                onClick={() => setTutorialKey(k => k + 1)}
                className="flex items-center gap-1.5 self-end -mb-2 text-[9px] font-black text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold uppercase tracking-wide transition-colors"
            >
                <QuestionMarkCircleIcon className="w-3.5 h-3.5" />
                ¿Cómo leer mi cronograma?
            </button>

            {eco !== null && !prestamoCancelado && (
                <div data-tutorial="resumen" className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-brand-red dark:bg-brand-red-glow rounded-2xl shadow-lg shadow-brand-red/20 dark:shadow-black/30 transition-colors">
                        <p className="text-[9px] font-black uppercase text-white/70 dark:text-dark-text-muted mb-1">
                            {prestamoTerminado
                                ? 'Total pagado'
                                : esVistaPersonal ? 'Mi saldo por pagar' : 'Saldo del grupo'}
                        </p>
                        <p className="text-lg font-black text-white dark:text-dark-text">
                            {fmt(eco?.total_prestamo)}
                        </p>
                        <p className="text-[11px] font-bold text-white/60 dark:text-dark-text-muted mt-0.5">
                            de {fmt(eco?.total_original)}
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
                        <p className="text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">
                            {esVistaPersonal ? 'Mi cuota' : 'Valor de la cuota'}
                        </p>
                        <p className="text-lg font-black text-slate-800 dark:text-dark-text">{fmt(eco?.valor_cuota)}</p>
                        <p className="text-[9px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase mt-0.5">{eco?.frecuencia}</p>
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
                <div className="flex items-center gap-3 p-5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl transition-colors">
                    <SparklesIcon className="w-8 h-8 text-green-500 dark:text-green-400 shrink-0" />
                    <div>
                        <p className="text-sm font-black text-green-700 dark:text-green-400 uppercase">¡Felicidades!</p>
                        <p className="text-[11px] font-bold text-green-600 dark:text-green-300">
                            {esVistaPersonal
                                ? 'Completaste el pago de tu préstamo. Gracias por tu puntualidad.'
                                : 'El préstamo está completamente pagado. Gracias por su puntualidad.'}
                        </p>
                    </div>
                </div>
            )}

            {/* 1º: lo más urgente — cuotas atrasadas, siempre arriba de todo */}
            {!prestamoCancelado && (
                <CuotasAtrasadasSection atrasadas={atrasadas} esVistaIntegrante={esVistaIntegrante} />
            )}

            {/* 2º: próxima cuota destacada — nunca atrasada, nunca parcial */}
            {proxima && !prestamoCancelado && (
                <ProximaCuota
                    cuota={proxima.cuota}
                    i={proxima.i}
                    esVistaIntegrante={esVistaIntegrante}
                    esVistaPersonal={esVistaPersonal}
                />
            )}

            {/* 3º: resto de cuotas pendientes (ya sin las atrasadas, que van arriba) */}
            {siguientes.length > 0 && !prestamoCancelado && (
                <div data-tutorial="pendientes" className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest px-1">
                        Cuotas siguientes ({siguientes.length})
                    </p>
                    {siguientes.map(({ cuota, i }) => (
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
                <div data-tutorial="pagadas" className="flex flex-col gap-2">
                    <button
                        onClick={() => setVerPagadas(v => !v)}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-surface-alt hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-dark-border transition-all"
                    >
                        <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 dark:text-green-400" />
                            Cuotas pagadas ({pagadas.length})
                        </span>
                        {verPagadas
                            ? <ChevronUpIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                            : <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
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
            {!proxima && atrasadas.length === 0 && siguientes.length === 0 && pagadas.length === 0 && (
                <div className="p-8 text-center">
                    <p className="text-xs font-bold text-slate-400 dark:text-dark-text-muted uppercase">
                        Aún no hay cuotas registradas en el cronograma
                    </p>
                </div>
            )}
        </div>
    );
};

export default CronogramaCliente;