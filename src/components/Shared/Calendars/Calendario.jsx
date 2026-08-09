import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Calendario mensual grid clásico adaptado con clases Tailwind + soporte Dark Mode.
 */
const Calendario = ({ mode = 'single', selected, onSelect, feriados = [] }) => {
    const hoy = new Date();
    const [mes, setMes] = useState(() => {
        if (selected && typeof selected === 'string' && selected.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return new Date(selected + 'T12:00:00');
        }
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    });

    const anio     = mes.getFullYear();
    const mesIndex = mes.getMonth();

    const primerDia = new Date(anio, mesIndex, 1);
    let offsetLunes = primerDia.getDay() - 1;
    if (offsetLunes < 0) offsetLunes = 6;

    const diasEnMes = new Date(anio, mesIndex + 1, 0).getDate();

    const celdas = [];
    for (let i = 0; i < offsetLunes; i++) celdas.push(null);
    for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
    while (celdas.length % 7 !== 0) celdas.push(null);

    const feriadoMap = {};
    feriados.forEach(f => { feriadoMap[f.fecha] = f.descripcion; });

    const toISO = (d) => {
        const mm = String(mesIndex + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${anio}-${mm}-${dd}`;
    };

    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const prevMes = () => setMes(new Date(anio, mesIndex - 1, 1));
    const nextMes = () => setMes(new Date(anio, mesIndex + 1, 1));

    const semanas = [];
    for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));

    return (
        <div className="bg-white dark:bg-dark-surface rounded-[24px] border border-slate-100 dark:border-dark-border shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] dark:shadow-black/50 p-6 select-none w-full max-w-[720px] transition-colors">
            {/* Cabecera mes + flechas */}
            <div className="flex items-center justify-between mb-5">
                <button type="button" onClick={prevMes} className="bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-[10px] p-2 cursor-pointer flex items-center text-slate-600 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-[15px] font-black tracking-[2px] text-slate-800 dark:text-dark-text uppercase transition-colors">{MESES[mesIndex]} {anio}</span>
                <button type="button" onClick={nextMes} className="bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-[10px] p-2 cursor-pointer flex items-center text-slate-600 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Cabecera días */}
                {DIAS_SEMANA.map((d, i) => (
                    <div key={d} className={`text-center text-[10px] font-extrabold uppercase py-2 tracking-[1px] transition-colors ${i === 6 ? 'text-red-500' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                        {d}
                    </div>
                ))}

                {/* Semanas */}
                {semanas.map((semana, si) =>
                    semana.map((dia, di) => {
                        if (!dia) return <div key={`e-${si}-${di}`} className="min-h-[64px] rounded-xl bg-slate-50/50 dark:bg-dark-surface-alt/40 border border-slate-100 dark:border-dark-border/50 transition-colors" />;

                        const iso       = toISO(dia);
                        const esFeriado = !!feriadoMap[iso];
                        const esHoy     = iso === `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
                        const esSel     = iso === selected;
                        const esDomingo = di === 6;
                        const esSelec   = mode === 'single' && !esDomingo && !esFeriado;

                        let cellClass = "min-h-[64px] rounded-xl border p-2 cursor-pointer flex flex-col gap-1 transition-all bg-white dark:bg-dark-surface border-slate-100 dark:border-dark-border";
                        
                        if (esFeriado)  cellClass = "min-h-[64px] rounded-xl p-2 flex flex-col gap-1 transition-all bg-orange-50 dark:bg-orange-500/10 border-[1.5px] border-orange-200 dark:border-orange-500/20 cursor-default";
                        if (esHoy)      cellClass = "min-h-[64px] rounded-xl p-2 flex flex-col gap-1 transition-all border-2 border-red-500 bg-red-50 dark:bg-red-500/10 shadow-[0_0_0_1px_#ef4444]";
                        if (esSel)      cellClass = "min-h-[64px] rounded-xl p-2 flex flex-col gap-1 transition-all bg-brand-red dark:bg-brand-red-glow border-2 border-red-600 dark:border-transparent shadow-[0_8px_16px_-4px_rgba(239,68,68,0.4)] text-white";
                        if (esDomingo && !esFeriado) cellClass += " opacity-35 cursor-default";

                        return (
                            <div
                                key={iso}
                                className={cellClass}
                                title={esFeriado ? feriadoMap[iso] : ''}
                                onClick={() => esSelec && onSelect && onSelect(iso)}
                            >
                                <span className={`text-[13px] font-extrabold leading-none transition-colors ${esSel ? 'text-white' : 'text-slate-700 dark:text-dark-text'}`}>{dia}</span>
                                {esFeriado && (
                                    <span className="text-[8px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-[0.3px] leading-tight overflow-hidden line-clamp-2 transition-colors">
                                        {feriadoMap[iso]}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Calendario;