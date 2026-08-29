import React from 'react';
import { UsersIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

/* ─────────────────────────────────────────────────────────────
 * LISTA DE INTEGRANTES (solo lectura — nombre y cargo)
 * Incluye también a los integrantes que ya fueron refinanciados
 * (su deuda pasó a otro préstamo individual): antes eran invisibles
 * para el cliente en la vista de grupo.
 * ───────────────────────────────────────────────────────────── */
const ListaIntegrantes = ({ integrantes, miIntegranteId, integrantesRefinanciados = [] }) => {
    if (!integrantes?.length && !integrantesRefinanciados?.length) return null;
    return (
        <div data-tutorial="integrantes" className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest mb-3 transition-colors">
                <UsersIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" />
                Integrantes del grupo ({integrantes.length + integrantesRefinanciados.length})
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

                {integrantesRefinanciados.map((int) => {
                    const soyYo = int.id === miIntegranteId;
                    return (
                        <div
                            key={int.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border bg-blue-50/50 dark:bg-blue-500/10 opacity-80 transition-colors ${
                                soyYo
                                    ? 'border-blue-300 dark:border-blue-400 ring-1 ring-blue-300/50'
                                    : 'border-blue-100 dark:border-blue-500/20'
                            }`}
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-dark-text-muted line-through">
                                    {int.nombre} {soyYo && '(Tú)'}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500 dark:text-blue-400">
                                    <ArrowPathRoundedSquareIcon className="w-3 h-3" />
                                    Refinanciado
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ListaIntegrantes;