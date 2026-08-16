import React from 'react';
import { ClockIcon, ScissorsIcon } from '@heroicons/react/24/outline';

/* ─────────────────────────────────────────────────────────────
 * CELDA FINANCIERA
 * ───────────────────────────────────────────────────────────── */
export const CeldaFinanciera = ({ total, pagado, pendiente }) => (
    <div className="flex flex-col min-w-[80px]">
        <span className="text-[11px] font-black text-slate-800 dark:text-dark-text whitespace-nowrap transition-colors">
            S/ {parseFloat(total).toFixed(2)}
        </span>

        {parseFloat(pagado) > 0 && (
            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 whitespace-nowrap transition-colors">
                PAGADO: S/ {parseFloat(pagado).toFixed(2)}
            </span>
        )}

        {parseFloat(pendiente) > 0 && (
            <span className="text-[9px] font-bold text-brand-red dark:text-red-400 whitespace-nowrap transition-colors">
                PENDIENTE: S/ {parseFloat(pendiente).toFixed(2)}
            </span>
        )}
    </div>
);

/* ─────────────────────────────────────────────────────────────
 * ABONOS
 * ───────────────────────────────────────────────────────────── */
export const AbonosContent = ({ d, esVistaIntegrante }) => (
    <div className="flex flex-col gap-0.5 items-end min-w-[100px]">

        {d.mostrarRecibido && (
            <span className="text-[9px] font-bold text-brand-red dark:text-red-400 uppercase whitespace-nowrap transition-colors">
                Pago directo: S/ {d.abonado.toFixed(2)}
            </span>
        )}

        {esVistaIntegrante && d.acumInd > 0 && (
            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase whitespace-nowrap transition-colors">
                Total aplicado: S/ {d.acumInd.toFixed(2)}
            </span>
        )}

        {!esVistaIntegrante && d.pagoAcumGrupo > 0 && (
            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase whitespace-nowrap transition-colors">
                Total aplicado: S/ {d.pagoAcumGrupo.toFixed(2)}
            </span>
        )}

        {d.excAplicado > 0 && (
            <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase whitespace-nowrap transition-colors">
                Cubierto con excedente: S/ {d.excAplicado.toFixed(2)}
            </span>
        )}

        {d.moraPagada > 0 && (
            <span className="text-[9px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase whitespace-nowrap transition-colors">
                Mora cubierta: S/ {d.moraPagada.toFixed(2)}
            </span>
        )}

        {!d.tieneAbonos && (
            <span className="text-[10px] text-slate-300 dark:text-dark-text-muted/60 font-bold">—</span>
        )}
    </div>
);

/* ─────────────────────────────────────────────────────────────
 * MORA
 * ───────────────────────────────────────────────────────────── */
export const MoraContent = ({
    d,
    cuota,
    nro,
    onHistorialModal,
    onReducirMora,
    esVistaIntegrante
}) => {

    if (d.moraTotal <= 0 || d.esInactiva) {
        return (
            <span className="text-slate-300 dark:text-dark-text-muted/60 font-black text-[11px]">—</span>
        );
    }

    const moraReducida = parseFloat(cuota?.mora_reducida ?? 0);

    return (
        <div className="flex flex-col min-w-[70px]">

            {/* Mora pendiente */}
            <span
                className={`font-black text-[11px] whitespace-nowrap transition-colors ${
                    d.moraPend > 0
                        ? 'text-brand-red dark:text-red-400'
                        : 'text-brand-red dark:text-red-400 line-through'
                }`}
            >
                {d.moraPend > 0
                    ? `+S/ ${d.moraPend.toFixed(2)}`
                    : `S/ ${d.moraTotal.toFixed(2)}`}
            </span>

            {/* Mora reducida */}
            {moraReducida > 0 && (
                <span className="text-[9px] font-black text-green-600 dark:text-green-400 line-through whitespace-nowrap">
                    -S/ {moraReducida.toFixed(2)} reducida
                </span>
            )}

            {/* Botones */}
            <div className="flex items-center gap-1 mt-0.5">

                <span
                    className={`text-[8px] font-bold whitespace-nowrap transition-colors ${
                        d.moraPend === 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-400 dark:text-dark-text-muted'
                    }`}
                >
                    {d.moraPend === 0
                        ? '✓ Cubierta'
                        : `Original: S/ ${d.moraTotal.toFixed(2)}`}
                </span>

                {/* Historial */}
                {cuota.historial_mora?.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();

                            onHistorialModal?.({
                                nro,
                                historial: cuota.historial_mora,
                                total: d.moraPend
                            });
                        }}
                        className="text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold transition-all p-0.5 rounded-full hover:bg-brand-red-light dark:hover:bg-dark-surface-alt shrink-0"
                        title="Ver historial de mora"
                    >
                        <ClockIcon className="w-3 h-3" />
                    </button>
                )}

                {/* Reducir mora */}
                {!esVistaIntegrante &&
                    d.moraPend > 0 &&
                    onReducirMora && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onReducirMora(cuota);
                            }}
                            className="text-orange-400 dark:text-orange-300 hover:text-orange-600 transition-all p-0.5 rounded-full hover:bg-orange-50 dark:hover:bg-dark-surface-alt shrink-0"
                            title="Reducir mora"
                        >
                            <ScissorsIcon className="w-3 h-3" />
                        </button>
                    )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * SALDO
 * ───────────────────────────────────────────────────────────── */
export const SaldoContent = ({ d }) => {

    if (d.esInactiva) {
        return (
            <span className="text-sm font-black italic text-slate-400 dark:text-dark-text-muted line-through whitespace-nowrap">
                S/ {d.saldo.toFixed(2)}
            </span>
        );
    }

    return (
        <span
            className={`text-sm font-black italic whitespace-nowrap transition-colors ${
                d.saldo > 0
                    ? 'text-brand-red dark:text-red-400 underline'
                    : 'text-green-600 dark:text-green-400'
            }`}
        >
            S/ {d.saldo.toFixed(2)}
        </span>
    );
};