import React, { useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
    SparklesIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useCronogramaCliente } from './hooks/useCronogramaCliente';
import TutorialCliente from './components/CronogramaCliente/TutorialCliente';
import { fmt } from './components/CronogramaCliente/utils';

import ListaIntegrantes from './components/CronogramaCliente/ListaIntegrantes';
import ProgresoPago from './components/CronogramaCliente/ProgresoPago';
import ProximaCuota from './components/CronogramaCliente/ProximaCuota';
import CuotaPendienteItem from './components/CronogramaCliente/CuotaPendienteItem';
import CuotasAtrasadasSection from './components/CronogramaCliente/CuotasAtrasadasSection';
import CuotaPagadaItem from './components/CronogramaCliente/CuotaPagadaItem';
import CuotasRefinanciadasSection from './components/CronogramaCliente/CuotasRefinanciadasSection';

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
    integrantesRefinanciados = [],
    miIntegranteId = null,
}) => {

    const [verPagadas, setVerPagadas]   = useState(false);
    const [tutorialKey, setTutorialKey] = useState(0);

    const esVistaPersonal = !esGrupal || esVistaIntegrante;

    const { atrasadas, proxima, siguientes, pagadas, refinanciadas, totalExigibles, prestamoTerminado } =
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

            {/* Integrantes — SOLO grupal en vista global (incluye a los ya refinanciados) */}
            {esGrupal && !esVistaIntegrante && (
                <ListaIntegrantes
                    integrantes={integrantes}
                    miIntegranteId={miIntegranteId}
                    integrantesRefinanciados={integrantesRefinanciados}
                />
            )}

            {/* Barra de progreso */}
            {totalExigibles > 0 && (
                <ProgresoPago
                    pagadas={pagadas.length}
                    total={totalExigibles}
                    esVistaPersonal={esVistaPersonal}
                />
            )}

            {/* Préstamo terminado */}
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

            {/* 1º: cuotas atrasadas, siempre arriba de todo */}
            {!prestamoCancelado && (
                <CuotasAtrasadasSection
                    atrasadas={atrasadas}
                    esVistaPersonal={esVistaPersonal}
                    esVistaIntegrante={esVistaIntegrante}
                />
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

            {/* 5º: cuotas refinanciadas — su deuda ya pasó a otro préstamo */}
            <CuotasRefinanciadasSection refinanciadas={refinanciadas} />

            {/* Sin cuotas */}
            {!proxima && atrasadas.length === 0 && siguientes.length === 0 && pagadas.length === 0 && refinanciadas.length === 0 && (
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