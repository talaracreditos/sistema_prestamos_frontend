import React from 'react';
import { XMarkIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

const HistorialMoraModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const totalCargos     = (data.historial ?? []).filter(h => h.tipo !== 'reduccion').reduce((s, h) => s + parseFloat(h.monto_agregado ?? 0), 0);
    const totalReducciones = (data.historial ?? []).filter(h => h.tipo === 'reduccion').reduce((s, h) => s + Math.abs(parseFloat(h.monto_agregado ?? 0)), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
            <div className="bg-white dark:bg-dark-surface rounded-[24px] shadow-2xl dark:shadow-black/50 w-full max-w-sm overflow-hidden border border-slate-100 dark:border-dark-border animate-in zoom-in-95 duration-200 transition-colors">

                <div className="p-5 bg-slate-50 dark:bg-dark-surface-alt border-b border-slate-100 dark:border-dark-border flex items-center justify-between transition-colors">
                    <h3 className="font-black text-slate-800 dark:text-dark-text uppercase text-xs tracking-widest transition-colors">
                        Historial Mora — Cuota #{data.nro}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {(data.historial ?? []).map((h, i) => {
                            const esReduccion = h.tipo === 'reduccion';
                            const monto       = Math.abs(parseFloat(h.monto_agregado ?? 0));

                            return (
                                <div key={i} className={`flex items-start justify-between text-xs p-3 rounded-xl border gap-2 transition-colors
                                    ${esReduccion 
                                        ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' 
                                        : 'bg-slate-50 dark:bg-dark-surface-alt border-slate-100 dark:border-dark-border'}`}>
                                    <div className="flex items-start gap-2 min-w-0">
                                        <div className={`mt-0.5 p-1 rounded-full shrink-0 ${esReduccion ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                                            {esReduccion
                                                ? <ArrowDownIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                : <ArrowUpIcon   className="w-3 h-3 text-red-500 dark:text-red-400" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-bold truncate ${esReduccion ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-dark-text'}`}>
                                                {h.fecha}
                                            </p>
                                            <p className={`text-[9px] font-black uppercase mt-0.5
                                                ${esReduccion ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                {esReduccion ? 'Reducción aplicada' : `${h.dias_atraso} días de atraso`}
                                            </p>
                                            {h.motivo && (
                                                <p className="text-[8px] text-slate-400 dark:text-dark-text-muted font-bold mt-0.5 italic truncate">{h.motivo}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {esReduccion ? (
                                            <>
                                                <p className="font-black text-green-600 dark:text-green-400 line-through text-[11px]">-S/ {monto.toFixed(2)}</p>
                                                <p className="text-[9px] font-bold text-green-500 dark:text-green-400">Reducida</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-black text-red-600 dark:text-red-400">+S/ {monto.toFixed(2)}</p>
                                                <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted">Escala: S/ {parseFloat(h.tarifa_total ?? 0).toFixed(2)}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {(!data.historial || data.historial.length === 0) && (
                            <p className="text-center text-[10px] text-slate-400 dark:text-dark-text-muted font-bold py-4">Sin historial</p>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border space-y-1.5 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted">Total cargado</span>
                            <span className="text-sm font-black text-red-600 dark:text-red-400">+S/ {totalCargos.toFixed(2)}</span>
                        </div>
                        {totalReducciones > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-green-600 dark:text-green-400">Total reducido</span>
                                <span className="text-sm font-black text-green-600 dark:text-green-400 line-through">-S/ {totalReducciones.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-dark-border transition-colors">
                            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-dark-text-muted">Mora actual</span>
                            <span className="text-lg font-black text-red-600 dark:text-red-400">S/ {parseFloat(data.total ?? 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorialMoraModal;