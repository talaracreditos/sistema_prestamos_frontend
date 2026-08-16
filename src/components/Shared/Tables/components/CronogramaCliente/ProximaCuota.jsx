import React from 'react';
import { CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCuotaData } from '../../hooks/useCuotaData';
import { fmt } from './utils';

/* ─────────────────────────────────────────────────────────────
 * PRÓXIMA CUOTA (destacada) — usa useCuotaData
 * Esta tarjeta SOLO recibe cuotas completas y NO atrasadas desde el
 * componente padre — las atrasadas (completas o parciales) van en
 * la sección de alerta arriba de todo, para no confundir a quien
 * ya pagó o para priorizar lo más urgente.
 * ───────────────────────────────────────────────────────────── */
const ProximaCuota = ({ cuota, i, esVistaIntegrante, esVistaPersonal }) => {

    const d = useCuotaData(cuota, i, esVistaIntegrante);

    const esVencida  = cuota.estado === 4;
    const esVenceHoy = cuota.estado === 3;
    const conAtraso  = esVencida && d.diasAtraso > 0;

    return (
        <div data-tutorial="proxima" className={`p-5 rounded-2xl shadow-xl dark:shadow-black/50 text-white dark:text-dark-text transition-colors ${
            conAtraso
                ? 'bg-brand-red dark:bg-red-950/80 border dark:border-red-500/30 shadow-brand-red/30'
                : 'bg-slate-800 dark:bg-dark-surface border dark:border-dark-border shadow-slate-800/20'
        }`}>
            <div className="flex items-center gap-2 mb-3">
                {conAtraso
                    ? <ExclamationTriangleIcon className="w-5 h-5 text-brand-gold" />
                    : <CalendarDaysIcon className="w-5 h-5 text-brand-gold" />
                }
                <p className="text-[14px] font-black uppercase tracking-widest text-white/70 dark:text-dark-text-muted">
                    {conAtraso
                        ? 'Cuota atrasada — ponte al día'
                        : esVenceHoy
                        ? '¡La cuota vence hoy!'
                        : esVistaPersonal ? 'Tu próximo pago' : 'Próximo pago del grupo'}
                </p>
            </div>

            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <p className="text-3xl font-black">{fmt(d.saldo)}</p>
                    <p className="text-[14px] font-bold text-white/70 dark:text-dark-text-muted mt-1">
                        Cuota #{d.nro.toString().padStart(2, '0')} · Vence: {cuota.vencimiento}
                    </p>
                </div>
                {conAtraso && (
                    <div className="text-right">
                        <p className="text-[15px] font-black uppercase text-brand-gold">
                            {d.diasAtraso} {d.diasAtraso === 1 ? 'día' : 'días'} de atraso
                        </p>
                        {d.moraPend > 0 && (
                            <p className="text-[13px] font-bold text-white/80 dark:text-dark-text-muted">
                                Incluye mora: {fmt(d.moraPend)}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {d.excAnterior > 0 && (
                <p className="text-[11px] font-bold text-white/70 dark:text-dark-text-muted mt-2">
                    ✓ Ya se descontó {fmt(d.excAnterior)} que {esVistaPersonal ? 'tenías' : 'tenía el grupo'} a favor
                </p>
            )}
        </div>
    );
};

export default ProximaCuota;