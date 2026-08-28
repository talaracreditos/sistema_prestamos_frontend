import React, { useState } from 'react';
import { useDashboardEstructuraCartera } from 'hooks/Dashboard/useDashboardEstructuraCartera';
import { exportEstructuraCarteraDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { Square3Stack3DIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtS = n =>
    'S/ ' + parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Chevron collapse
const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

// Barra de % catorcenal / cartera
const PctBar = ({ pct }) => {
    if (pct === null || pct === undefined) return <span className="text-[10px] text-slate-400 dark:text-dark-text-muted/60 font-bold">—</span>;
    const val    = parseFloat(pct);
    const barPct = Math.min(Math.max(val, 0), 100);

    return (
        <div className="flex items-center gap-2 justify-end">
            <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-dark-surface-alt overflow-hidden flex-shrink-0">
                <div
                    className="h-full rounded-full bg-brand-red dark:bg-brand-gold transition-all duration-500"
                    style={{ width: `${barPct}%` }}
                />
            </div>
            <span className="text-xs font-black tabular-nums text-slate-600 dark:text-dark-text-muted">
                {val.toFixed(2)}%
            </span>
        </div>
    );
};

// ── Card ──────────────────────────────────────────────────────────────────────
const EstructuraCarteraCard = () => {
    const {
        loading, data,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar,
    } = useDashboardEstructuraCartera();

    const [collapsed, setCollapsed] = useState(false);
    const [comboKey,  setComboKey]  = useState(Date.now());

    const asesores = data?.asesores ?? [];
    const totales  = data?.totales  ?? {};
    const filtro   = data?.filtro   ?? {};

    const exportFilters = {
        ...(asesoresSeleccionados.length > 0
            ? { asesor_ids: asesoresSeleccionados.map(a => a.id).join(',') }
            : {}),
    };

    const onLimpiar = () => { setComboKey(Date.now()); handleLimpiar(); };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <Square3Stack3DIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Estructura de Cartera</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                            Clientes y saldo capital vigente por asesor — semanal vs. catorcenal
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportEstructuraCarteraDashboard}
                            filters={exportFilters}
                            filename="estructura_cartera"
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

                    {/* ── Corte ─────────────────────────────────────────────── */}
                    {filtro.fecha_corte && (
                        <div className="px-6 py-2 border-b border-slate-50 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-dark-surface-alt">
                                <div className="w-2 h-2 rounded-full bg-brand-red dark:bg-brand-gold" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-muted">Corte:</span>
                                <span className="text-[10px] font-black text-slate-700 dark:text-dark-text">{filtro.fecha_corte}</span>
                            </div>
                        </div>
                    )}

                    {/* ── KPIs resumen ──────────────────────────────────────── */}
                    {!loading && totales.total_saldo_capital_cartera !== undefined && (
                        <div className="px-6 pt-4 pb-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <KpiChip label="Clientes Semanal"    value={totales.creditos_semanales}                 color="slate" />
                            <KpiChip label="Saldo Semanal"       value={fmtS(totales.saldo_capital_semanal)}        color="slate" />
                            <KpiChip label="Clientes Catorcenal" value={totales.creditos_catorcenales}               color="slate" />
                            <KpiChip label="Saldo Catorcenal"    value={fmtS(totales.saldo_capital_catorcenal)}     color="slate" />
                            <KpiChip label="Total Clientes"      value={totales.total_creditos_cartera}              color="slate" bold />
                            <KpiChip label="Total Saldo Capital" value={fmtS(totales.total_saldo_capital_cartera)}  color="slate" bold />
                            <KpiChip
                                label="% Catorcenal / Cartera"
                                value={`${parseFloat(totales.porcentaje_catorcenal_cartera ?? 0).toFixed(2)}%`}
                                color={totales.porcentaje_catorcenal_cartera >= 50 ? 'green' : 'slate'}
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
                                <table className="w-full text-left border-collapse min-w-[820px]">
                                    <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                        <tr>
                                            <th className="px-4 py-3">Asesor</th>
                                            <th className="px-4 py-3 text-right">N° Clientes Semanal</th>
                                            <th className="px-4 py-3 text-right">Saldo Capital Semanal</th>
                                            <th className="px-4 py-3 text-right">N° Clientes Catorcenal</th>
                                            <th className="px-4 py-3 text-right">Saldo Capital Catorcenal</th>
                                            <th className="px-4 py-3 text-right">Total Clientes</th>
                                            <th className="px-4 py-3 text-right">Total Saldo Capital</th>
                                            <th className="px-4 py-3 text-right">% Catorcenal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                        {asesores.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-400 dark:text-dark-text-muted/60 italic">
                                                    Sin registros
                                                </td>
                                            </tr>
                                        ) : asesores.map((a, i) => {
                                            return (
                                                <tr key={a.asesor_id} className={`hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-dark-surface-alt/30'}`}>
                                                    {/* Nombre */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-slate-700 dark:text-dark-text uppercase">{a.nombre}</span>
                                                        </div>
                                                    </td>

                                                    {/* Clientes semanal */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted tabular-nums">{a.creditos_semanales}</span>
                                                    </td>

                                                    {/* Saldo semanal */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted tabular-nums">{fmtS(a.saldo_capital_semanal)}</span>
                                                    </td>

                                                    {/* Clientes catorcenal */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted tabular-nums">{a.creditos_catorcenales}</span>
                                                    </td>

                                                    {/* Saldo catorcenal */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-xs font-bold text-slate-500 dark:text-dark-text-muted tabular-nums">{fmtS(a.saldo_capital_catorcenal)}</span>
                                                    </td>

                                                    {/* Total clientes */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-xs font-black text-slate-700 dark:text-dark-text tabular-nums">{a.total_creditos_cartera}</span>
                                                    </td>

                                                    {/* Total saldo capital */}
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm font-black text-slate-900 dark:text-dark-text tabular-nums">{fmtS(a.total_saldo_capital_cartera)}</span>
                                                    </td>

                                                    {/* % catorcenal */}
                                                    <td className="px-4 py-3 text-right">
                                                        <PctBar pct={a.porcentaje_catorcenal_cartera} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                    {/* Totales */}
                                    <tfoot className="bg-slate-900 dark:bg-black text-white">
                                        <tr>
                                            <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">TOTAL</td>
                                            <td className="px-4 py-3 text-right text-xs font-black tabular-nums">{totales.creditos_semanales}</td>
                                            <td className="px-4 py-3 text-right text-xs font-black tabular-nums">{fmtS(totales.saldo_capital_semanal)}</td>
                                            <td className="px-4 py-3 text-right text-xs font-black tabular-nums">{totales.creditos_catorcenales}</td>
                                            <td className="px-4 py-3 text-right text-xs font-black tabular-nums">{fmtS(totales.saldo_capital_catorcenal)}</td>
                                            <td className="px-4 py-3 text-right text-xs font-black tabular-nums">{totales.total_creditos_cartera}</td>
                                            <td className="px-4 py-3 text-right text-sm font-black tabular-nums">{fmtS(totales.total_saldo_capital_cartera)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <PctBar pct={totales.porcentaje_catorcenal_cartera} />
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Glosario ──────────────────────────────────────────── */}
                    <div className="px-6 pb-4 space-y-1">
                        <p className="text-[11px] text-slate-500 dark:text-dark-text-muted font-black uppercase tracking-widest mb-1">Glosario</p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">N° Clientes:</span> Cantidad de clientes con crédito vigente del asesor en esa frecuencia de pago (semanal / catorcenal). En préstamos grupales cuenta cada integrante activo (no refinanciado), no el préstamo como una unidad.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Saldo Capital:</span> Capital pendiente de cobro a la fecha de corte, solo de préstamos vigentes en esa frecuencia.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">Total Cartera:</span> Suma de TODAS las frecuencias (semanal, catorcenal, mensual, etc.), no solo las dos mostradas. Si un cliente tiene crédito en más de una frecuencia con el mismo asesor, se cuenta una sola vez.
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/80">
                            <span className="font-black text-slate-600 dark:text-dark-text">% Catorcenal:</span> Saldo Capital Catorcenal ÷ Total Saldo Capital de la cartera del asesor.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

// ── KPI chip pequeño ──────────────────────────────────────────────────────────
const KpiChip = ({ label, value, color = 'slate', bold = false }) => {
    const colorMap = {
        slate: 'bg-slate-50 dark:bg-dark-surface-alt border-slate-100 dark:border-dark-border text-slate-700 dark:text-dark-text',
        green: 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400',
    };
    return (
        <div className={`rounded-xl border px-3 py-2.5 transition-colors ${colorMap[color]}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted mb-0.5">{label}</p>
            <p className={`text-sm font-black tabular-nums truncate ${bold ? 'text-slate-900 dark:text-dark-text' : ''}`}>
                {value}
            </p>
        </div>
    );
};

export default EstructuraCarteraCard;