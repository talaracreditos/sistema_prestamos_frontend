import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

export const CeldaFinanciera = ({ total, pagado, pendiente }) => (
    <div className="flex flex-col min-w-[80px]">
        <span className="text-[11px] font-black text-slate-800 whitespace-nowrap">S/ {parseFloat(total).toFixed(2)}</span>
        {parseFloat(pagado) > 0 && (
            <span className="text-[9px] font-bold text-green-700 whitespace-nowrap">PAGADO: S/ {parseFloat(pagado).toFixed(2)}</span>
        )}
        {parseFloat(pendiente) > 0 && (
            <span className="text-[9px] font-bold text-brand-red whitespace-nowrap">PENDIENTE: S/ {parseFloat(pendiente).toFixed(2)}</span>
        )}
    </div>
);

const CronogramaTable = ({ cronograma = [], esVistaIntegrante = false, onHistorialModal, extraColumns = [] }) => {

    const getStatusBadge = (estado) => {
        const styles = {
            0: 'bg-slate-100 text-slate-400 border-slate-200',   // ← CANCELADO
            1: 'bg-yellow-50 text-yellow-700 border-yellow-100',
            2: 'bg-green-50 text-green-700 border-green-100',
            3: 'bg-brand-gold-light text-brand-gold-dark border-brand-gold/30',
            4: 'bg-brand-red-light text-brand-red border-brand-red/30',
            5: 'bg-orange-50 text-orange-700 border-orange-100',
            6: 'bg-blue-50 text-blue-700 border-blue-100',
        };
        const labels = {
            0: 'CANCELADO',
            1: 'PENDIENTE',
            2: 'PAGADO',
            3: 'VENCE HOY',
            4: 'VENCIDO',
            5: 'PARCIAL',
            6: 'REFINANCIADO',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border whitespace-nowrap ${styles[estado] ?? styles[1]}`}>
                {labels[estado] ?? 'PENDIENTE'}
            </span>
        );
    };

    return (
        <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
                <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">
                    <tr>
                        <th className="px-3 py-4 text-center">N°</th>
                        <th className="px-3 py-4">Vencimiento</th>
                        <th className="px-3 py-4">Cuota</th>
                        <th className="px-3 py-4">Capital</th>
                        <th className="px-3 py-4">Interés</th>
                        <th className="px-3 py-4">Seguro</th>
                        <th className="px-3 py-4">Mora</th>
                        <th className="px-3 py-4">Abonos</th>
                        <th className="px-3 py-4">Saldo Real</th>
                        <th className="px-3 py-4 text-center">Estado</th>
                        {extraColumns.map((col) => (
                            <th key={col.header} className="px-3 py-4 text-center">{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {cronograma.map((cuota, i) => {
                        const nro        = cuota.nro ?? (i + 1);
                        const monto      = parseFloat(cuota.total_cuota ?? cuota.monto ?? 0);
                        const capital    = parseFloat(cuota.capital ?? 0);
                        const interes    = parseFloat(cuota.interes ?? 0);

                        const seguro     = parseFloat(cuota.seguro ?? 0);
                        let segPagado    = parseFloat(cuota.seguro_pagado ?? 0);
                        if (!esVistaIntegrante && cuota.integrantes?.length > 0) {
                            segPagado = cuota.integrantes.reduce((sum, int) => sum + parseFloat(int.seguro_pagado || 0), 0);
                        }
                        const segPend    = Math.max(0, seguro - segPagado);

                        const capPagado  = parseFloat(cuota.capital_pagado ?? 0);
                        const intPagado  = parseFloat(cuota.interes_pagado ?? 0);
                        const capPend    = parseFloat(cuota.capital_pendiente ?? Math.max(0, capital - capPagado));
                        const intPend    = parseFloat(cuota.interes_pendiente ?? Math.max(0, interes - intPagado));

                        const moraTotal  = parseFloat(cuota.mora_total ?? cuota.mora ?? 0);
                        const moraPagada = parseFloat(cuota.mora_pagada ?? 0);
                        const moraPend   = Math.max(0, moraTotal - moraPagada);

                        const abonado    = esVistaIntegrante
                            ? parseFloat(cuota.pago_total_real ?? cuota.pago_acumulado ?? 0)
                            : parseFloat(cuota.pago_realizado  ?? cuota.pago_acumulado ?? 0);
                        const acumInd    = esVistaIntegrante ? parseFloat(cuota.pago_acumulado ?? 0) : 0;
                        const saldo      = parseFloat(cuota.saldo_pendiente ?? cuota.saldo_real ?? 0);
                        const diasAtraso = cuota.dias_atraso || 0;

                        const excAnt     = esVistaIntegrante
                            ? parseFloat(cuota.excedente_aplicado || 0)
                            : (parseFloat(cuota.excedente_consumido || 0) > 0
                                ? parseFloat(cuota.excedente_consumido)
                                : parseFloat(cuota.excedente_anterior || 0));
                        const excConsInd = esVistaIntegrante ? parseFloat(cuota.excedente_consumido || 0) : 0;
                        const excGen     = parseFloat(cuota.excedente_generado || 0);

                        const esCancelada    = cuota.estado === 0;   // ← NUEVO
                        const esRefinanciada = cuota.estado === 6;
                        const esInactiva     = esCancelada || esRefinanciada; // ← agrupa ambos casos visuales

                        let estadoGlobal = cuota.estado;
                        if (!esVistaIntegrante && cuota.integrantes?.length > 0 && !esInactiva) {
                            if (saldo <= 0) estadoGlobal = 2;
                            else if (abonado > 0 && saldo > 0) estadoGlobal = 5;
                        }

                        const mostrarRecibido = abonado > 0;

                        return (
                            <tr key={nro} className={`transition-colors ${
                                esCancelada
                                    ? 'bg-slate-50/80 opacity-50' 
                                    : esRefinanciada
                                        ? 'bg-blue-50/60 opacity-60'
                                        : 'hover:bg-brand-red-light/30'
                            }`}>

                                {/* N° */}
                                <td className="px-3 py-4 text-xs font-black text-slate-400 text-center font-mono">
                                    #{nro.toString().padStart(2, '0')}
                                </td>

                                {/* Vencimiento */}
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <span className={`text-xs font-bold block ${esInactiva ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                        {cuota.vencimiento}
                                    </span>
                                    {diasAtraso > 0 && !esInactiva && (
                                        <span className="text-[9px] font-black text-brand-red uppercase">{diasAtraso} días atraso</span>
                                    )}
                                </td>

                                {/* Cuota */}
                                <td className="px-3 py-4 whitespace-nowrap">
                                    <span className={`text-sm font-black ${esInactiva ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        S/ {monto.toFixed(2)}
                                    </span>
                                    {esCancelada && (
                                        <span className="block text-[9px] font-black text-slate-400 uppercase">Cancelado</span>
                                    )}
                                    {esRefinanciada && (
                                        <span className="block text-[9px] font-black text-blue-500 uppercase">Refinanciado</span>
                                    )}
                                </td>

                                {/* Capital */}
                                <td className="px-3 py-4">
                                    <CeldaFinanciera total={capital} pagado={capPagado} pendiente={esInactiva ? 0 : capPend} />
                                </td>

                                {/* Interés */}
                                <td className="px-3 py-4">
                                    <CeldaFinanciera total={interes} pagado={intPagado} pendiente={esInactiva ? 0 : intPend} />
                                </td>

                                {/* Seguro */}
                                <td className="px-3 py-4">
                                    <CeldaFinanciera total={seguro} pagado={segPagado} pendiente={esInactiva ? 0 : segPend} />
                                </td>

                                {/* Mora */}
                                <td className="px-3 py-4">
                                    {moraTotal <= 0 || esInactiva ? (
                                        <span className="text-slate-300 font-black text-[11px]">—</span>
                                    ) : (
                                        <div className="flex flex-col min-w-[70px]">
                                            <span className={`font-black text-[11px] whitespace-nowrap ${moraPend > 0 ? 'text-brand-red' : 'text-brand-red line-through'}`}>
                                                {moraPend > 0 ? `+S/ ${moraPend.toFixed(2)}` : `S/ ${moraTotal.toFixed(2)}`}
                                            </span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className={`text-[8px] font-bold whitespace-nowrap ${moraPend === 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                                    {moraPend === 0 ? '✓ Cubierta' : `De S/ ${moraTotal.toFixed(2)}`}
                                                </span>
                                                {cuota.historial_mora?.length > 0 && (
                                                    <button
                                                        onClick={() => onHistorialModal?.({ nro, historial: cuota.historial_mora, total: moraTotal })}
                                                        className="text-slate-400 hover:text-brand-red transition-all p-0.5 rounded-full hover:bg-brand-red-light shrink-0"
                                                    >
                                                        <ClockIcon className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </td>

                                {/* Abonos */}
                                <td className="px-3 py-4">
                                    <div className="flex flex-col gap-0.5 min-w-[90px]">
                                        {mostrarRecibido && (
                                            <span className="text-[9px] font-bold text-brand-red uppercase whitespace-nowrap">
                                                Recibido: S/ {abonado.toFixed(2)}
                                            </span>
                                        )}
                                        {esVistaIntegrante && acumInd > 0 && (
                                            <span className="text-[9px] font-bold text-green-700 uppercase whitespace-nowrap">
                                                Acumulado: S/ {acumInd.toFixed(2)}
                                            </span>
                                        )}
                                        {!esVistaIntegrante && parseFloat(cuota.pago_acumulado || 0) > 0 && (
                                            <span className="text-[9px] font-bold text-green-700 uppercase whitespace-nowrap">
                                                Acumulado: S/ {parseFloat(cuota.pago_acumulado).toFixed(2)}
                                            </span>
                                        )}
                                        {moraPagada > 0 && (
                                            <span className="text-[9px] font-bold text-brand-gold-dark uppercase whitespace-nowrap">
                                                Mora cubierta: S/ {moraPagada.toFixed(2)}
                                            </span>
                                        )}
                                        {excAnt > 0 && (
                                            <span className="text-[9px] font-bold text-purple-600 uppercase whitespace-nowrap">
                                                {esVistaIntegrante ? 'Excedente. aplicado' : 'Excedente. usado'}: -S/ {excAnt.toFixed(2)}
                                            </span>
                                        )}
                                        {esVistaIntegrante && excConsInd > 0 && (
                                            <span className="text-[9px] font-bold text-purple-600 uppercase whitespace-nowrap">
                                                Excedente. usado: -S/ {excConsInd.toFixed(2)}
                                            </span>
                                        )}
                                        {excGen > 0 && (
                                            <span className="text-[9px] font-bold text-orange-500 uppercase whitespace-nowrap">
                                                Excedente: S/ {excGen.toFixed(2)}
                                            </span>
                                        )}
                                        {!mostrarRecibido && acumInd === 0 && excAnt === 0 && moraPagada === 0 && excGen === 0 && excConsInd === 0 && !(!esVistaIntegrante && parseFloat(cuota.pago_acumulado || 0) > 0) && (
                                            <span className="text-[10px] text-slate-300 font-bold">—</span>
                                        )}
                                    </div>
                                </td>

                                {/* Saldo Real */}
                                <td className="px-3 py-4">
                                    {esInactiva ? (
                                        <span className="text-sm font-black italic text-slate-400 line-through whitespace-nowrap">
                                            S/ {saldo.toFixed(2)}
                                        </span>
                                    ) : (
                                        <>
                                            <span className={`text-sm font-black italic whitespace-nowrap ${saldo > 0 ? 'text-brand-red underline' : 'text-green-600'}`}>
                                                S/ {saldo.toFixed(2)}
                                            </span>
                                            {moraPend > 0 && saldo > 0 && (
                                                <span className="text-[9px] text-slate-400 font-bold block whitespace-nowrap">
                                                    Cap: {Math.max(0, monto - (esVistaIntegrante ? acumInd : parseFloat(cuota.pago_acumulado || 0))).toFixed(2)} | Mora: {moraPend.toFixed(2)}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </td>

                                {/* Estado */}
                                <td className="px-3 py-4 text-center">{getStatusBadge(estadoGlobal)}</td>

                                {/* Columnas extra */}
                                {extraColumns.map((col) => (
                                    <td key={col.header} className="px-3 py-4 text-center">
                                        {col.render(cuota, i, cronograma)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CronogramaTable;