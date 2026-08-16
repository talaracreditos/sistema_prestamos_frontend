import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';

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

export default ListaIntegrantes;