import React from 'react';

/* ─────────────────────────────────────────────────────────────
 * EXCEDENTE GENERAL
 * ───────────────────────────────────────────────────────────── */
export const ExcedenteContent = ({
    excAnterior,
    excAplicado,
    excConsumido,
    excGenerado,
    label = 'Excedente'
}) => {

    const hayAlgo =
        excAnterior > 0 ||
        excAplicado > 0 ||
        excConsumido > 0 ||
        excGenerado > 0;

    if (!hayAlgo) {
        return (
            <span className="text-[10px] text-slate-300 dark:text-dark-text-muted/60 font-bold">
                —
            </span>
        );
    }

    return (
        <div className="flex flex-col gap-0.5 items-end">

            {excAnterior > 0 && (
                <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase whitespace-nowrap transition-colors">
                    Disponible anterior: S/ {excAnterior.toFixed(2)}
                </span>
            )}

            {excAplicado > 0 && (
                <span className="text-[9px] font-bold text-purple-700 dark:text-purple-400 uppercase whitespace-nowrap transition-colors">
                    Aplicado a cuota: -S/ {excAplicado.toFixed(2)}
                </span>
            )}

            {excConsumido > 0 && (
                <span className="text-[9px] font-bold text-purple-500 dark:text-purple-400 uppercase whitespace-nowrap transition-colors">
                    Consumido: S/ {excConsumido.toFixed(2)}
                </span>
            )}

            {excGenerado > 0 && (
                <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase whitespace-nowrap transition-colors">
                    Nuevo excedente: S/ {excGenerado.toFixed(2)}
                </span>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
 * EXCEDENTES POR INTEGRANTE
 * ───────────────────────────────────────────────────────────── */
export const ExcedentesIntegrantes = ({ integrantes }) => {

    const conExcedente = integrantes?.filter(
        int =>
            int.excedente_anterior > 0 ||
            int.excedente_generado > 0 ||
            int.excedente_aplicado > 0 ||
            int.excedente_consumido > 0
    );

    if (!conExcedente?.length) return null;

    return (
        <div className="flex flex-col gap-1 items-end">

            {conExcedente.map(int => (
                <div
                    key={int.id}
                    className="flex flex-col items-end"
                >

                    <span className="text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase transition-colors">
                        {int.nombre}
                    </span>

                    {int.excedente_anterior > 0 && (
                        <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap transition-colors">
                            Disponible: S/ {parseFloat(int.excedente_anterior).toFixed(2)}
                        </span>
                    )}

                    {int.excedente_aplicado > 0 && (
                        <span className="text-[9px] font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap transition-colors">
                            Aplicado a cuota: -S/ {parseFloat(int.excedente_aplicado).toFixed(2)}
                        </span>
                    )}

                    {int.excedente_consumido > 0 && (
                        <span className="text-[9px] font-bold text-purple-400 dark:text-purple-400 whitespace-nowrap transition-colors">
                            Consumido: S/ {parseFloat(int.excedente_consumido).toFixed(2)}
                        </span>
                    )}

                    {int.excedente_generado > 0 && (
                        <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 whitespace-nowrap transition-colors">
                            Nuevo excedente: S/ {parseFloat(int.excedente_generado).toFixed(2)}
                        </span>
                    )}

                </div>
            ))}
        </div>
    );
};