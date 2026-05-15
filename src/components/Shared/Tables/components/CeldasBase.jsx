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

export const AbonosContent = ({ d, esVistaIntegrante }) => (
    <div className="flex flex-col gap-0.5 items-end min-w-[90px]">
        {d.mostrarRecibido && (
            <span className="text-[9px] font-bold text-brand-red uppercase whitespace-nowrap">Recibido: S/ {d.abonado.toFixed(2)}</span>
        )}
        {esVistaIntegrante && d.acumInd > 0 && (
            <span className="text-[9px] font-bold text-green-700 uppercase whitespace-nowrap">Acumulado: S/ {d.acumInd.toFixed(2)}</span>
        )}
        {!esVistaIntegrante && d.pagoAcumGrupo > 0 && (
            <span className="text-[9px] font-bold text-green-700 uppercase whitespace-nowrap">Acumulado: S/ {d.pagoAcumGrupo.toFixed(2)}</span>
        )}
        {d.moraPagada > 0 && (
            <span className="text-[9px] font-bold text-brand-gold-dark uppercase whitespace-nowrap">Mora cubierta: S/ {d.moraPagada.toFixed(2)}</span>
        )}
        {!d.tieneAbonos && (
            <span className="text-[10px] text-slate-300 font-bold">—</span>
        )}
    </div>
);

/**
 * MoraContent — muestra mora pendiente y, si hay mora_reducida, la tacha en verde.
 * cuota.mora_reducida viene del backend (suma acumulada de reducciones).
 */
export const MoraContent = ({ d, cuota, nro, onHistorialModal }) => {
    if (d.moraTotal <= 0 || d.esInactiva) return <span className="text-slate-300 font-black text-[11px]">—</span>;

    const moraReducida = parseFloat(cuota?.mora_reducida ?? 0);

    return (
        <div className="flex flex-col min-w-[70px]">
            {/* Mora pendiente actual */}
            <span className={`font-black text-[11px] whitespace-nowrap ${d.moraPend > 0 ? 'text-brand-red' : 'text-brand-red line-through'}`}>
                {d.moraPend > 0 ? `+S/ ${d.moraPend.toFixed(2)}` : `S/ ${d.moraTotal.toFixed(2)}`}
            </span>

            {/* Mora reducida — tachada en verde */}
            {moraReducida > 0 && (
                <span className="text-[9px] font-black text-green-600 line-through whitespace-nowrap">
                    -S/ {moraReducida.toFixed(2)} reducida
                </span>
            )}

            <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8px] font-bold whitespace-nowrap ${d.moraPend === 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {d.moraPend === 0 ? '✓ Cubierta' : `De S/ ${d.moraTotal.toFixed(2)}`}
                </span>
                {cuota.historial_mora?.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onHistorialModal?.({ nro, historial: cuota.historial_mora, total: d.moraPend }); }}
                        className="text-slate-400 hover:text-brand-red transition-all p-0.5 rounded-full hover:bg-brand-red-light shrink-0"
                    >
                        <ClockIcon className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const SaldoContent = ({ d }) => {
    if (d.esInactiva) return (
        <span className="text-sm font-black italic text-slate-400 line-through whitespace-nowrap">S/ {d.saldo.toFixed(2)}</span>
    );
    return (
        <>
            <span className={`text-sm font-black italic whitespace-nowrap ${d.saldo > 0 ? 'text-brand-red underline' : 'text-green-600'}`}>
                S/ {d.saldo.toFixed(2)}
            </span>
            {d.moraPend > 0 && d.saldo > 0 && (
                <span className="text-[9px] text-slate-400 font-bold block whitespace-nowrap">
                    Cap: {Math.max(0, d.monto - (d.acumInd || d.pagoAcumGrupo)).toFixed(2)} | Mora: {d.moraPend.toFixed(2)}
                </span>
            )}
        </>
    );
};