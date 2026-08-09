import React from 'react';

const BarraRiesgoCrediticio = ({ titulo, sbs }) => {
    const niveles = [
        { id: 'NORMAL',     label: 'NORMAL',  bgColor: 'bg-green-500'  },
        { id: 'CPP',        label: 'CPP',     bgColor: 'bg-yellow-400' },
        { id: 'DEFICIENTE', label: 'DEFIC.',   bgColor: 'bg-orange-500' },
        { id: 'DUDOSO',     label: 'DUDOSO',   bgColor: 'bg-red-500'    },
        { id: 'PERDIDA',    label: 'PÉRDIDA',  bgColor: 'bg-slate-900 dark:bg-black'  },
    ];

    if (!sbs) {
        return (
            <div className="flex flex-col items-center justify-center bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/25 w-full h-full transition-colors">
                <h4 className="text-[11px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.2em] mb-6 text-center">
                    {titulo}
                </h4>
                <div className="w-full max-w-[280px] flex flex-col">
                    <div className="flex w-full mb-1.5 h-3" />
                    <div className="flex w-full h-3.5 rounded-sm overflow-hidden shadow-inner opacity-20">
                        {niveles.map((n) => (
                            <div key={n.id} className={`flex-1 ${n.bgColor}`} />
                        ))}
                    </div>
                    <div className="flex w-full mt-2">
                        {niveles.map((n) => (
                            <div key={n.id} className="flex-1 text-center text-[9px] font-bold text-slate-300 dark:text-dark-text-muted/60 uppercase tracking-tight">
                                {n.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 text-center flex flex-col items-center">
                    <span className="text-[10px] px-4 py-1.5 rounded-lg font-black uppercase border shadow-sm bg-slate-100 dark:bg-dark-surface-alt text-slate-400 dark:text-dark-text-muted border-slate-200 dark:border-dark-border">
                        SIN DATOS
                    </span>
                    <span className="text-xs text-slate-400 dark:text-dark-text-muted font-bold mt-2.5 uppercase tracking-wide">
                        Sin préstamos registrados
                    </span>
                </div>
            </div>
        );
    }

    const { calificacion, dias_atraso, color, prestamo_id, numero_cuota, es_grupal, grupo_nombre } = sbs;

    return (
        <div className="flex flex-col items-center justify-center bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/25 relative hover:shadow-md transition-all w-full h-full">
            <h4 className="text-[11px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.2em] mb-6 text-center">
                {titulo}
            </h4>

            <div className="w-full max-w-[280px] flex flex-col">
                {/* Fila de flechas */}
                <div className="flex w-full mb-1.5 h-3">
                    {niveles.map((nivel) => (
                        <div key={`arrow-${nivel.id}`} className="flex-1 flex justify-center items-end">
                            {calificacion === nivel.id && (
                                <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-slate-800 dark:border-t-dark-text animate-in slide-in-from-top-3 fade-in duration-500" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Barra principal */}
                <div className="flex w-full h-3.5 rounded-sm overflow-hidden shadow-inner">
                    {niveles.map((nivel) => (
                        <div key={`bar-${nivel.id}`} className={`flex-1 ${nivel.bgColor}`} />
                    ))}
                </div>

                {/* Etiquetas */}
                <div className="flex w-full mt-2">
                    {niveles.map((nivel) => (
                        <div key={`label-${nivel.id}`} className="flex-1 text-center text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-tight">
                            {nivel.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Badge y días */}
            <div className="mt-6 text-center flex flex-col items-center">
                <span className={`text-[10px] px-4 py-1.5 rounded-lg font-black uppercase border shadow-sm ${color}`}>
                    {calificacion}
                </span>
                <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold mt-2.5 uppercase tracking-wide">
                    {dias_atraso} Días de atraso
                </span>
            </div>

            {/* Contexto préstamo */}
            {prestamo_id && (
                <div className="mt-3 text-center text-[11px] text-slate-700 dark:text-dark-text font-bold space-y-0.5 border-t border-slate-100 dark:border-dark-border pt-3 w-full transition-colors">
                    <p>
                        Préstamo #{String(prestamo_id).padStart(5, '0')}
                        {es_grupal && grupo_nombre && (
                            <span className="ml-1 text-slate-700 dark:text-dark-text"> — GRUPO: {grupo_nombre}</span>
                        )}
                    </p>
                    <p>Cuota N° {numero_cuota}</p>
                </div>
            )}
        </div>
    );
};

export default BarraRiesgoCrediticio;