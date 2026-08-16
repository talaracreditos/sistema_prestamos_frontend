import React from 'react';
import { CheckCircleIcon as CheckSolidIcon } from '@heroicons/react/24/solid';
import { useCuotaData } from '../../hooks/useCuotaData';
import { fmt } from './utils';

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

export default CuotaPagadaItem;