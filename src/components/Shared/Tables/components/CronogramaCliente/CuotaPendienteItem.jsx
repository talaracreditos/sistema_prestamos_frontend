import React from 'react';
import { useCuotaData } from '../../hooks/useCuotaData';
import { fmt } from './utils';

/* ─────────────────────────────────────────────────────────────
 * CUOTA PENDIENTE (item de lista) — usa useCuotaData
 * Se usa tanto en la sección de "Atrasadas" como en "Siguientes".
 *
 * La mora TOTAL agregada (d.moraPend) solo tiene sentido en vista
 * personal ("mi saldo"), donde es TU mora. En vista grupal global
 * la mora es individual de cada integrante — nunca se agrega arriba,
 * solo se muestra al costado del nombre de quien la debe.
 * ───────────────────────────────────────────────────────────── */
const CuotaPendienteItem = ({ cuota, i, esVistaIntegrante }) => {

    const d = useCuotaData(cuota, i, esVistaIntegrante);
    const esParcial = cuota.estado === 5;
    const conAtraso = d.diasAtraso > 0;

    const integrantesPendientes = !esVistaIntegrante && cuota.integrantes?.length > 0
        ? cuota.integrantes.filter((int) => !int.pagado)
        : [];

    return (
        <div className={`flex items-center justify-between bg-white dark:bg-dark-surface p-3 rounded-xl border shadow-sm dark:shadow-black/20 transition-colors ${
            conAtraso
                ? 'border-brand-red/30 dark:border-brand-gold/30'
                : esParcial
                ? 'border-orange-300 dark:border-orange-500/40'
                : 'border-slate-100 dark:border-dark-border'
        }`}>
            <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black font-mono rounded-lg px-2 py-1 transition-colors ${
                    conAtraso
                        ? 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400'
                        : esParcial
                        ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400'
                        : 'bg-slate-100 dark:bg-dark-surface-alt text-slate-400 dark:text-dark-text-muted'
                }`}>
                    #{d.nro.toString().padStart(2, '0')}
                </span>
                <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-dark-text transition-colors">{cuota.vencimiento}</p>

                    {conAtraso ? (
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[9px] font-black text-brand-red dark:text-red-400 uppercase">
                                {d.diasAtraso} {d.diasAtraso === 1 ? 'día' : 'días'} de atraso
                                {/* La mora total solo se muestra en vista personal ("mi saldo").
                                    En vista grupal, la mora va individual junto al nombre abajo. */}
                                {esVistaIntegrante && d.moraPend > 0 && ` · Incluye mora: ${fmt(d.moraPend)}`}
                            </p>
                            {esParcial && (
                                integrantesPendientes.length > 0 ? (
                                    <>
                                        <p className="text-[9px] font-black text-brand-red dark:text-red-400 uppercase">
                                            Falta que pague:
                                        </p>
                                        {integrantesPendientes.map((int) => (
                                            <p key={int.id} className="text-[9px] font-bold text-brand-red dark:text-red-400">
                                                - {int.nombre}
                                                {int.mora_pendiente > 0 && (
                                                    <span className="ml-1">
                                                        (Incluye mora: {fmt(int.mora_pendiente)})
                                                    </span>
                                                )}
                                            </p>
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-[9px] font-bold text-brand-red dark:text-red-400">
                                        Abonado: {fmt(d.abonado)}
                                    </p>
                                )
                            )}
                        </div>
                    ) : esParcial ? (
                        integrantesPendientes.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase">
                                    Falta que pague:
                                </p>
                                {integrantesPendientes.map((int) => (
                                    <p key={int.id} className="text-[9px] font-bold text-orange-500 dark:text-orange-400">
                                        - {int.nombre}
                                        {int.mora_pendiente > 0 && (
                                            <span className="text-brand-red dark:text-red-400 ml-1">
                                                (Incluye mora: {fmt(int.mora_pendiente)})
                                            </span>
                                        )}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[9px] font-black text-orange-500 dark:text-orange-400 uppercase">
                                Pago parcial · Abonado: {fmt(d.abonado)}
                            </p>
                        )
                    ) : (
                        <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase">Por pagar</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-black ${
                    conAtraso
                        ? 'text-brand-red dark:text-red-400'
                        : esParcial
                        ? 'text-orange-500 dark:text-orange-400'
                        : 'text-slate-800 dark:text-dark-text'
                }`}>
                    {fmt(d.saldo)}
                </p>
            </div>
        </div>
    );
};

export default CuotaPendienteItem;