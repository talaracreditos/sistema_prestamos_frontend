import React from 'react';
import { ClockIcon, ScissorsIcon } from '@heroicons/react/24/outline';

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

export const InteresContent = ({ d, cuota, nro, onHistorialInteresModal }) => {
    const interes   = d.esPrendario ? d.interes : parseFloat(cuota?.interes ?? 0);
    const pagado    = parseFloat(cuota?.interes_pagado ?? 0);
    const reducido  = parseFloat(cuota?.interes_reducido ?? 0);
    const original  = cuota?.interes_original;   
    const historial = cuota?.historial_interes_reducido ?? [];

    if (interes <= 0 && reducido <= 0) return <span className="text-slate-300 dark:text-dark-text-muted/60 font-black text-[11px]">—</span>;

    return (
        <div className="flex flex-col min-w-[80px]">
            <CeldaFinanciera total={interes} pagado={pagado} pendiente={d.esInactiva ? 0 : d.intPend} />
            {(reducido > 0 || historial.length > 0) && (
                <div className="flex items-center gap-1 mt-0.5">
                    {reducido > 0 && (
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-green-600 dark:text-green-400 whitespace-nowrap">-S/ {reducido.toFixed(2)} reducido</span>
                            {original != null && <span className="text-[8px] font-bold text-slate-400 dark:text-dark-text-muted whitespace-nowrap">Original: S/ {parseFloat(original).toFixed(2)}</span>}
                        </div>
                    )}
                    {historial.length > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); onHistorialInteresModal?.({ nro, historial, total: d.intPend }); }} className="text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold transition-all p-0.5 rounded-full hover:bg-brand-red-light shrink-0">
                            <ClockIcon className="w-3 h-3" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export const CustodiaContent = ({ d }) => {
    if (d.custodia <= 0) return <span className="text-slate-300 dark:text-dark-text-muted/60 font-black text-[11px]">—</span>;
    return (
        <div className="flex flex-col min-w-[80px]">
            <CeldaFinanciera total={d.custodia} pagado={d.custodiaPagada} pendiente={d.esInactiva ? 0 : d.custodiaPend} />
        </div>
    );
};

export const AbonosContent = ({ d, esVistaIntegrante }) => (
    <div className="flex flex-col gap-0.5 items-end min-w-[100px]">
        {d.mostrarRecibido && <span className="text-[9px] font-bold text-brand-red dark:text-red-400 uppercase whitespace-nowrap">Pago directo: S/ {d.abonado.toFixed(2)}</span>}
        {esVistaIntegrante && d.acumInd > 0 && <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase whitespace-nowrap">Total aplicado: S/ {d.acumInd.toFixed(2)}</span>}
        {!esVistaIntegrante && d.pagoAcumGrupo > 0 && <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase whitespace-nowrap">Total aplicado: S/ {d.pagoAcumGrupo.toFixed(2)}</span>}
        {d.excAplicado > 0 && <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase whitespace-nowrap">Cubierto con excedente: S/ {d.excAplicado.toFixed(2)}</span>}
        {d.moraPagada > 0 && <span className="text-[9px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase whitespace-nowrap">Mora cubierta: S/ {d.moraPagada.toFixed(2)}</span>}
        {!d.tieneAbonos && <span className="text-[10px] text-slate-300 dark:text-dark-text-muted/60 font-bold">—</span>}
    </div>
);

export const MoraContent = ({ d, cuota, nro, onHistorialModal, onReducirMora, esVistaIntegrante }) => {
    if (d.moraTotal <= 0 || d.esInactiva) return <span className="text-slate-300 dark:text-dark-text-muted/60 font-black text-[11px]">—</span>;
    const moraReducida = parseFloat(cuota?.mora_reducida ?? 0);

    return (
        <div className="flex flex-col min-w-[70px]">
            <span className={`font-black text-[11px] whitespace-nowrap transition-colors ${d.moraPend > 0 ? 'text-brand-red dark:text-red-400' : 'text-brand-red dark:text-red-400 line-through'}`}>
                {d.moraPend > 0 ? `+S/ ${d.moraPend.toFixed(2)}` : `S/ ${d.moraTotal.toFixed(2)}`}
            </span>
            {moraReducida > 0 && <span className="text-[9px] font-black text-green-600 dark:text-green-400 line-through whitespace-nowrap">-S/ {moraReducida.toFixed(2)} reducida</span>}
            
            <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8px] font-bold whitespace-nowrap transition-colors ${d.moraPend === 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                    {d.moraPend === 0 ? '✓ Cubierta' : `Original: S/ ${d.moraTotal.toFixed(2)}`}
                </span>
                {cuota.historial_mora?.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); onHistorialModal?.({ nro, historial: cuota.historial_mora, total: d.moraPend }); }} className="text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold transition-all p-0.5 rounded-full hover:bg-brand-red-light shrink-0">
                        <ClockIcon className="w-3 h-3" />
                    </button>
                )}
                {!esVistaIntegrante && d.moraPend > 0 && onReducirMora && (
                    <button onClick={(e) => { e.stopPropagation(); onReducirMora(cuota); }} className="text-orange-400 dark:text-orange-300 hover:text-orange-600 transition-all p-0.5 rounded-full hover:bg-orange-50 shrink-0">
                        <ScissorsIcon className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const SaldoContent = ({ d }) => {
    if (d.esInactiva) return <span className="text-sm font-black italic text-slate-400 dark:text-dark-text-muted line-through whitespace-nowrap">S/ {d.saldo.toFixed(2)}</span>;
    return <span className={`text-sm font-black italic whitespace-nowrap transition-colors ${d.saldo > 0 ? 'text-brand-red dark:text-red-400 underline' : 'text-green-600 dark:text-green-400'}`}>S/ {d.saldo.toFixed(2)}</span>;
};