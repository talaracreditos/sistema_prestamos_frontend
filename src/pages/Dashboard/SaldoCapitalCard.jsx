import React, { useState } from 'react';
import { useDashboardSaldoCapital } from 'hooks/Dashboard/useDashboardSaldoCapital';
import { exportSaldoCapitalDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { BanknotesIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtS = n =>
    'S/ ' + parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MESES = [
    { v: 1,  l: 'Enero' },     { v: 2,  l: 'Febrero' },  { v: 3,  l: 'Marzo' },
    { v: 4,  l: 'Abril' },     { v: 5,  l: 'Mayo' },     { v: 6,  l: 'Junio' },
    { v: 7,  l: 'Julio' },     { v: 8,  l: 'Agosto' },   { v: 9,  l: 'Septiembre' },
    { v: 10, l: 'Octubre' },   { v: 11, l: 'Noviembre' },{ v: 12, l: 'Diciembre' },
];

const anioActual = new Date().getFullYear();
const ANIOS = Array.from({ length: 5 }, (_, i) => anioActual - i);

// Chevron collapse
const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

// Barra de progreso de meta
const MetaBar = ({ avance }) => {
    if (avance === null || avance === undefined) return <span className="text-[10px] text-slate-400 dark:text-dark-text-muted/60 font-bold">—</span>;
    const pct    = Math.min(Math.max(parseFloat(avance), 0), 150); // clamp visual a 150%
    const over   = parseFloat(avance) >= 100;
    const barPct = Math.min(pct, 100);

    return (
        <div className="flex items-center gap-2 justify-end">
            <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-dark-surface-alt overflow-hidden flex-shrink-0">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-green-500 dark:bg-green-400' : 'bg-brand-red dark:bg-brand-gold'}`}
                    style={{ width: `${barPct}%` }}
                />
            </div>
            <span className={`text-xs font-black tabular-nums ${over ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-dark-text-muted'}`}>
                {parseFloat(avance).toFixed(1)}%
            </span>
        </div>
    );
};

// ── Card ──────────────────────────────────────────────────────────────────────
const SaldoCapitalCard = () => {
    const {
        loading, data,
        mes,     setMes,
        anio,    setAnio,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar,
    } = useDashboardSaldoCapital();

    const [collapsed, setCollapsed] = useState(false);
    const [comboKey,  setComboKey]  = useState(Date.now());

    const asesores = data?.asesores ?? [];
    const totales  = data?.totales  ?? {};
    const filtro   = data?.filtro   ?? {};

    const exportFilters = {
        mes:  mes,
        anio: anio,
        ...(asesoresSeleccionados.length > 0
            ? { asesor_ids: asesoresSeleccionados.map(a => a.id).join(',') }
            : {}),
    };

    const onLimpiar = () => { setComboKey(Date.now()); handleLimpiar(); };

    // ── KPIs de totales
    const varTotal  = parseFloat(totales.variacion ?? 0);
    const varPos    = varTotal >= 0;

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <BanknotesIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Saldo Capital</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                            Capital inicial vs actual por asesor — avance de meta
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportSaldoCapitalDashboard}
                            filters={exportFilters}
                            filename="saldo_capital"
                            label="Excel"
                            disabled={loading}
                        />
                    )}
                    <div className="cursor-pointer" onClick={() => setCollapsed(v => !v)}>
                        <Chevron collapsed={collapsed} />
                    </div>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* ── Filtros ───────────────────────────────────────────── */}
                    <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt/50 flex flex-wrap items-end gap-3 transition-colors">
                        {/* Mes */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Mes</label>
                            <select
                                value={mes}
                                onChange={e => setMes(parseInt(e.target.value))}
                                className="p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none"
                            >
                                {MESES.map(m => (
                                    <option key={m.v} value={m.v}>{m.l}</option>
                                ))}
                            </select>
                        </div>

                        {/* Año */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Año</label>
                            <select
                                value={anio}
                                onChange={e => setAnio(parseInt(e.target.value))}
                                className="p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none"
                            >
                                {ANIOS.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>

                        {/* Asesor */}
                        <div className="flex flex-col gap-1">
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Asesor</label>
                            <EmpleadoSearchSelect
                                key={comboKey}
                                rol="ASESOR"
                                onSelect={handleAgregarAsesor}
                                clearOnSelect={true}
                                placeholder="Agregar asesor..."
                            />
                        </div>

                        <button
                            onClick={handleFiltrar}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        <button
                            onClick={onLimpiar}
                            className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all"
                        >
                            <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                        </button>
                    </div>

                    {/* ── Tags asesores ─────────────────────────────────────── */}
                    {asesoresSeleccionados.length > 0 && (
                        <div className="px-6 py-2 border-b border-slate-50 dark:border-dark-border bg-white dark:bg-dark-surface flex flex-wrap gap-2 transition-colors">
                            {asesoresSeleccionados.map(a => (
                                <span key={a.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-red-light dark:bg-dark-surface-alt border border-brand-red/20 dark:border-brand-gold/20 rounded-full text-[10px] font-black text-brand-red dark:text-brand-gold uppercase">
                                    {a.nombre}
                                    <button onClick={() => handleQuitarAsesor(a.id)} className="hover:text-brand-red-dark dark:hover:text-red-400">
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ── Rango del periodo ─────────────────────────────────── */}
                    {filtro.mes_label && (
                        <div className="px-6 py-2 border-b border-slate-50 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-dark-surface-alt">
                                <div className="w-2 h-2 rounded-full bg-brand-red dark:bg-brand-gold" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-muted">Periodo:</span>
                                <span className="text-[10px] font-black text-slate-700 dark:text-dark-text">{filtro.mes_label}</span>
                                <span className="text-slate-400 dark:text-dark-text-muted/60 text-[10px]">|</span>
                                <span className="text-[10px] text-slate-500 dark:text-dark-text-muted">{filtro.inicio_mes}</span>
                                <span className="text-slate-400 dark:text-dark-text-muted/60 text-[10px]">→</span>
                                <span className="text-[10px] text-slate-500 dark:text-dark-text-muted">{filtro.fin_mes}</span>
                            </div>
                        </div>
                    )}

                    {/* ── KPIs resumen ──────────────────────────────────────── */}
                    {!loading && totales.saldo_actual !== undefined && (
                        <div className="px-6 pt-4 pb-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <KpiChip label="Saldo Inicial" value={fmtS(totales.saldo_inicial)} color="slate" />
                            <KpiChip label="Saldo Actual"  value={fmtS(totales.saldo_actual)}  color="slate" bold />
                            <KpiChip
                                label="Variación"
                                value={(varPos ? '+' : '') + fmtS(totales.variacion)}
                                color={varPos ? 'green' : 'red'}
                            />
                            <KpiChip
                                label={`Avance meta ${totales.avance !== null ? totales.avance?.toFixed(1) + '%' : '—'}`}
                                value={fmtS(totales.saldo_actual) + ' / ' + fmtS(totales.objetivo)}
                                color={totales.avance >= 100 ? 'green' : 'slate'}
                                sub
                            />
                        </div>
                    )}

                    {/* ── Tabla ─────────────────────────────────────────────── */}
                    <div className="p-6 pt-3">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[680px]">
                                    <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                        <tr>
                                            <th className="px-4 py-3">Asesor</th>
                                            <th className="px-4 py-3 text-right">Saldo Inicial</th>
                                            <th className="px-4 py-3 text-right">Saldo Actual</th>
                                            <th className="px-4 py-3 text-right">Variación</th>
                                            <th className="px-4 py-3 text-right">Meta Crecim.</th>
                                            <th className="px-4 py-3 text-right">Objetivo</th>
                                            <th className="px-4 py-3 text-right">Avance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                        {asesores.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400 dark:text-dark-text-muted/60 italic">
                                                    Sin registros para el periodo seleccionado
                                                </td>
                                            </tr>
                                        ) : asesores.map((a, i) => {
                                            const variacion = parseFloat(a.variacion ?? 0);
                                            const varPos    = variacion >= 0;
                                            const ajuste    = parseFloat(a.ajuste ?? 0);
                                            return (
                                                <tr key={a.asesor_id} className={`hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-dark-surface-alt/30'}`}>
                                                    {/* Nombre */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-slate-700 dark:text-dark-text uppercase">{a.nombre}</span>
                                                        </div>
                                                    </td>

                                                    {/* Saldo inicial */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted tabular-nums">{fmtS(a.saldo_inicial)}</span>
                                                    </td>

                                                    {/* Saldo actual */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm font-black text-slate-900 dark:text-dark-text tabular-nums">{fmtS(a.saldo_actual)}</span>
                                                    </td>

                                                    {/* Variación */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={`text-xs font-black tabular-nums ${varPos ? 'text-green-600 dark:text-green-400' : 'text-brand-red dark:text-red-400'}`}>
                                                            {varPos ? '+' : ''}{fmtS(a.variacion)}
                                                        </span>
                                                        {Math.abs(ajuste) > 0.009 && (
                                                            <div
                                                                className="text-[9px] text-slate-400 dark:text-dark-text-muted/70 font-bold mt-0.5 cursor-help underline decoration-dotted underline-offset-2"
                                                                title="Monto de refinanciamientos/renovaciones del periodo que no pasó por caja (ni desembolso ni cobro), por eso no aparece en el calendario Desembolso/Capital cobrado."
                                                            >
                                                                {ajuste >= 0 ? '+' : '−'} {fmtS(Math.abs(ajuste))} por refinanciamiento/renovación
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Meta crecimiento */}
                                                    <td className="px-4 py-3 text-right">
                                                        {a.meta > 0
                                                            ? <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted tabular-nums">{fmtS(a.meta)}</span>
                                                            : <span className="text-[10px] text-slate-300 dark:text-dark-text-muted/60 font-bold">—</span>
                                                        }
                                                    </td>

                                                    {/* Objetivo (saldo_inicial + meta) */}
                                                    <td className="px-4 py-3 text-right">
                                                        {a.objetivo > 0
                                                            ? <span className="text-xs font-bold text-slate-600 dark:text-dark-text tabular-nums">{fmtS(a.objetivo)}</span>
                                                            : <span className="text-[10px] text-slate-300 dark:text-dark-text-muted/60 font-bold">—</span>
                                                        }
                                                    </td>

                                                    {/* Avance barra */}
                                                    <td className="px-4 py-3 text-right">
                                                        <MetaBar avance={a.avance} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                    {/* Totales */}
                                    <tfoot className="bg-slate-900 dark:bg-black text-white">
                                        <tr>
                                            <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">TOTAL</td>
                                            <td className="px-4 py-3 text-right text-xs font-black tabular-nums">{fmtS(totales.saldo_inicial)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-black tabular-nums">{fmtS(totales.saldo_actual)}</td>
                                            <td className="px-4 py-3 text-right text-xs font-black tabular-nums">
                                                <span className={varPos ? 'text-green-400' : 'text-red-400'}>
                                                    {varPos ? '+' : ''}{fmtS(totales.variacion)}
                                                </span>
                                                {Math.abs(parseFloat(totales.ajuste_refinanciamiento ?? 0)) > 0.009 && (
                                                    <div
                                                        className="text-[9px] text-slate-500 font-bold mt-0.5 cursor-help underline decoration-dotted underline-offset-2"
                                                        title="Monto de refinanciamientos/renovaciones del periodo que no pasó por caja (ni desembolso ni cobro), por eso no aparece en el calendario Desembolso/Capital cobrado."
                                                    >
                                                        {totales.ajuste_refinanciamiento >= 0 ? '+' : '−'} {fmtS(Math.abs(totales.ajuste_refinanciamiento))} por refinanciamiento/renovación
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-slate-400 dark:text-dark-text-muted">
                                                {totales.meta > 0 ? fmtS(totales.meta) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-slate-400 dark:text-dark-text-muted">
                                                {totales.objetivo > 0 ? fmtS(totales.objetivo) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <MetaBar avance={totales.avance} />
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Nota meta ─────────────────────────────────────────── */}
                    <div className="px-6 pb-4 space-y-1">
                        <p className="text-[11px] text-slate-500 dark:text-dark-text-muted font-black uppercase tracking-widest mb-1">Glosario</p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Saldo Inicial:</span> Capital pendiente de cobro al cierre del mes anterior — cuotas no pagadas de préstamos desembolsados antes del inicio del mes.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Saldo Actual:</span> Capital pendiente de cobro a la fecha de corte — cuotas no pagadas de todos los préstamos activos del periodo.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Variación:</span> Saldo Actual − Saldo Inicial. Positivo = cartera creció, negativo = cartera se redujo.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Meta Crecim.:</span> Monto objetivo de crecimiento de cartera fijado para el asesor en el mes.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Objetivo:</span> Saldo Inicial + Meta — cartera total que debe alcanzar el asesor al cierre del mes.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Avance:</span> (Saldo Actual ÷ Objetivo) × 100. Verde = meta alcanzada o superada.
                        </p>
                    </div>

                </>
            )}
        </div>
    );
};

// ── KPI chip pequeño ──────────────────────────────────────────────────────────
const KpiChip = ({ label, value, color = 'slate', bold = false, sub = false }) => {
    const colorMap = {
        slate: 'bg-slate-50 dark:bg-dark-surface-alt border-slate-100 dark:border-dark-border text-slate-700 dark:text-dark-text',
        green: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400',
        red:   'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-brand-red dark:text-red-400',
    };
    return (
        <div className={`rounded-xl border px-3 py-2.5 transition-colors ${colorMap[color]}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted mb-0.5">{label}</p>
            <p className={`${sub ? 'text-[10px]' : 'text-sm'} font-black tabular-nums truncate ${bold ? 'text-slate-900 dark:text-dark-text' : ''}`}>
                {value}
            </p>
        </div>
    );
};

export default SaldoCapitalCard;