import React from 'react';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { fmt } from './utils';

/* ─────────────────────────────────────────────────────────────
 * CUOTA REFINANCIADA (item de lista) — solo lectura
 * Esta cuota ya no es exigible: su deuda pasó a otro préstamo
 * (o, en vista de integrante dentro de grupo, a su propio
 * préstamo individual de refinanciamiento).
 * ───────────────────────────────────────────────────────────── */
const CuotaRefinanciadaItem = ({ cuota, i }) => {
    const nro   = cuota.nro ?? i + 1;
    const monto = parseFloat(cuota.total_cuota ?? cuota.monto ?? 0);

    return (
        <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20 opacity-80 transition-colors">
            <div className="flex items-center gap-3">
                <ArrowPathRoundedSquareIcon className="w-5 h-5 text-blue-400 dark:text-blue-400 shrink-0" />
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-dark-text-muted line-through transition-colors">
                        Cuota #{nro.toString().padStart(2, '0')} · {cuota.vencimiento}
                    </p>
                    <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase">
                        Refinanciada
                    </p>
                </div>
            </div>
            <p className="text-sm font-black text-blue-400 dark:text-blue-400 line-through">
                {fmt(monto)}
            </p>
        </div>
    );
};

export default CuotaRefinanciadaItem;