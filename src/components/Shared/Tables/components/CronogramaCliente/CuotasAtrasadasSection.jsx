import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import CuotaPendienteItem from './CuotaPendienteItem';

/* ─────────────────────────────────────────────────────────────
 * CUOTAS ATRASADAS (sección de alerta, siempre arriba de todo)
 * Agrupa lo más urgente: vencidas completas + parciales con atraso.
 *
 * El texto "ponte al día" es personal — aplica tanto en préstamo
 * individual como en vista de un integrante específico dentro de
 * un grupo (esVistaPersonal cubre ambos casos). En vista grupal
 * global no todos están atrasados (algunos ya pagaron), así que el
 * título solo indica que hay atraso en el grupo, sin imperativo.
 * ───────────────────────────────────────────────────────────── */
const CuotasAtrasadasSection = ({ atrasadas, esVistaPersonal, esVistaIntegrante }) => {
    if (!atrasadas.length) return null;
    return (
        <div
            data-tutorial="atrasadas"
            className="flex flex-col gap-2 p-3 bg-brand-red-light/40 dark:bg-red-950/30 border border-brand-red/30 dark:border-red-500/30 rounded-2xl transition-colors"
        >
            <p className="flex items-center gap-1.5 text-[10px] font-black text-brand-red dark:text-red-400 uppercase tracking-widest px-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {esVistaPersonal
                    ? `Cuotas atrasadas — ponte al día (${atrasadas.length})`
                    : `Cuotas atrasadas del grupo (${atrasadas.length})`}
            </p>
            {atrasadas.map(({ cuota, i }) => (
                <CuotaPendienteItem
                    key={cuota.nro ?? i}
                    cuota={cuota}
                    i={i}
                    esVistaIntegrante={esVistaIntegrante}
                />
            ))}
        </div>
    );
};

export default CuotasAtrasadasSection;