import React, { useState } from 'react';
import { useDashboardGruposAsesor } from 'hooks/Dashboard/useDashboardGruposAsesor';
import { exportGruposAsesorDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { UserGroupIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const fmtN = n => parseInt(n || 0).toLocaleString('es-PE');

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

const GruposAsesorCard = () => {
    const {
        loading, data,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar,
    } = useDashboardGruposAsesor();

    const [collapsed, setCollapsed] = useState(false);
    const [comboKey,  setComboKey]  = useState(Date.now());

    const filas   = data?.filas   ?? [];
    const totales = data?.totales ?? {};
    const rango   = data?.rango   ?? {};

    const exportFilters = {
        fecha_inicio: fechaInicio,
        fecha_fin:    fechaFin,
        ...(asesoresSeleccionados.length > 0
            ? { asesor_ids: asesoresSeleccionados.map(a => a.id).join(',') }
            : {}),
    };

    const onLimpiar = () => { setComboKey(Date.now()); handleLimpiar(); };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <UserGroupIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Grupos por Asesor</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">Seguimiento por asesor — grupos inicial vs actual</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton exportService={exportGruposAsesorDashboard} filters={exportFilters} filename="reporte_grupos_asesor" label="Excel" disabled={loading} />
                    )}
                    <div className="cursor-pointer" onClick={() => setCollapsed(v => !v)}>
                        <Chevron collapsed={collapsed} />
                    </div>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* Filtros */}
                    <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt/50 flex flex-wrap items-end gap-3 transition-colors">
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Fecha Inicial</label>
                            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                                className="p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Fecha Final</label>
                            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                                className="p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Asesor</label>
                            <EmpleadoSearchSelect key={comboKey} rol="ASESOR" onSelect={handleAgregarAsesor} clearOnSelect={true} placeholder="Agregar asesor..." />
                        </div>
                        <button onClick={handleFiltrar} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        <button onClick={onLimpiar}
                            className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all">
                            <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                        </button>
                    </div>

                    {/* Tags asesores */}
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

                    {/* Rango */}
                    <div className="px-6 py-2 border-b border-slate-50 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-dark-surface-alt">
                            <div className="w-2 h-2 rounded-full bg-brand-red dark:bg-brand-gold" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-muted">Rango:</span>
                            <span className="text-[10px] font-black text-slate-700 dark:text-dark-text">{rango.desde ?? fechaInicio}</span>
                            <span className="text-slate-400 dark:text-dark-text-muted/60 text-[10px]">→</span>
                            <span className="text-[10px] font-black text-slate-700 dark:text-dark-text">{rango.hasta ?? fechaFin}</span>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[480px]">
                                    <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                        <tr>
                                            <th className="px-4 py-3">Asesor</th>
                                            <th className="px-4 py-3 text-right">Saldo Inicial</th>
                                            <th className="px-4 py-3 text-right">Saldo Actual</th>
                                            <th className="px-4 py-3 text-right">Variación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                        {filas.map((f, i) => (
                                            <tr key={f.asesor_id} className={`hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-dark-surface-alt/30'}`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-brand-red-light dark:bg-dark-surface-alt flex items-center justify-center flex-shrink-0">
                                                            <span className="text-[9px] font-black text-brand-red dark:text-brand-gold">{f.abrev}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-slate-700 dark:text-dark-text uppercase">{f.nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right"><span className="text-sm font-black text-slate-600 dark:text-dark-text-muted">{fmtN(f.saldo_inicial)}</span></td>
                                                <td className="px-4 py-3 text-right"><span className="text-sm font-black text-slate-900 dark:text-dark-text">{fmtN(f.saldo_actual)}</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`text-sm font-black ${f.variacion > 0 ? 'text-green-600 dark:text-green-400' : f.variacion < 0 ? 'text-brand-red dark:text-red-400' : 'text-slate-400 dark:text-dark-text-muted/60'}`}>
                                                        {f.variacion > 0 ? '+' : ''}{fmtN(f.variacion)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-900 dark:bg-black text-white">
                                        <tr>
                                            <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">TOTAL</td>
                                            <td className="px-4 py-3 text-right text-sm font-black">{fmtN(totales.saldo_inicial)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-black">{fmtN(totales.saldo_actual)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-black text-brand-gold">
                                                {totales.variacion > 0 ? '+' : ''}{fmtN(totales.variacion)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default GruposAsesorCard;