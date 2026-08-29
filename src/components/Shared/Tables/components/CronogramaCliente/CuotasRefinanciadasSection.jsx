import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import CuotaRefinanciadaItem from './CuotaRefinanciadaItem';

/* ─────────────────────────────────────────────────────────────
 * CUOTAS REFINANCIADAS — colapsable, igual patrón que "pagadas".
 * Se muestra tanto en preéstamo individual 100% refinanciado como
 * en "Mi Saldo" de un integrante refinanciado dentro de un grupo.
 * ───────────────────────────────────────────────────────────── */
const CuotasRefinanciadasSection = ({ refinanciadas }) => {
    const [ver, setVer] = useState(false);

    if (!refinanciadas?.length) return null;

    return (
        <div data-tutorial="refinanciadas" className="flex flex-col gap-2">
            <button
                onClick={() => setVer(v => !v)}
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl border border-blue-100 dark:border-blue-500/20 transition-all"
            >
                <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    <ArrowPathRoundedSquareIcon className="w-4 h-4" />
                    Cuotas refinanciadas ({refinanciadas.length})
                </span>
                {ver
                    ? <ChevronUpIcon className="w-4 h-4 text-blue-400" />
                    : <ChevronDownIcon className="w-4 h-4 text-blue-400" />
                }
            </button>
            {ver && refinanciadas.map(({ cuota, i }) => (
                <CuotaRefinanciadaItem key={cuota.nro ?? i} cuota={cuota} i={i} />
            ))}
        </div>
    );
};

export default CuotasRefinanciadasSection;