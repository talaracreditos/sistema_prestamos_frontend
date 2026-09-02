import React, { useState } from 'react';
import { useDashboardInteresGrupo } from 'hooks/Dashboard/useDashboardInteresGrupo';
import { exportInteresGrupoDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import Pagination from 'components/Shared/Pagination';
import { BanknotesIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const fmtMonto = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

const InteresGrupoCard = () => {
    const {
        loading, data,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        codigoRecaudo, setCodigoRecaudo,
        handleFiltrar, handleLimpiar, handlePageChange,
    } = useDashboardInteresGrupo();

    const [collapsed, setCollapsed] = useState(false);

    const filas       = data?.data          ?? [];
    const rango       = data?.rango         ?? {};
    const total       = data?.total_interes ?? 0;
    const currentPage = data?.current_page  ?? 1;
    const totalPages  = data?.last_page     ?? 1;

    const exportFilters = { fecha_inicio: fechaInicio, fecha_fin: fechaFin, codigo_recaudo: codigoRecaudo };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <BanknotesIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Interés Percibido por Grupo</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">Intereses cobrados por grupo en el rango</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton exportService={exportInteresGrupoDashboard} filters={exportFilters} filename="reporte_interes_grupo" label="Excel" disabled={loading} />
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
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Cód. Recaudo</label>
                            <input 
                                type="text" 
                                placeholder="Ej: CR-001"
                                value={codigoRecaudo} 
                                onChange={e => setCodigoRecaudo(e.target.value)}
                                className="p-2 w-32 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none" 
                            />
                        </div>
                        <button onClick={handleFiltrar} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        <button onClick={handleLimpiar}
                            className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all">
                            <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                        </button>
                    </div>

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
                        ) : filas.length === 0 ? (
                            <p className="text-center text-xs font-bold text-slate-400 dark:text-dark-text-muted py-10 uppercase">Sin datos en este rango</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                            <tr>
                                                <th className="px-4 py-3">F. Desembolso</th>
                                                <th className="px-4 py-3">Grupo</th>
                                                <th className="px-4 py-3">Cód. Recaudo</th>
                                                <th className="px-4 py-3">Presidenta</th>
                                                <th className="px-4 py-3">DNI</th>
                                                <th className="px-4 py-3">Correo</th>
                                                <th className="px-4 py-3 text-right">Interés Percibido</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                            {filas.map((f, i) => (
                                                <tr key={f.prestamo_id} className={`hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-dark-surface-alt/30'}`}>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-dark-text-muted">{f.fecha_desembolso}</td>
                                                    <td className="px-4 py-3 text-xs font-black text-slate-800 dark:text-dark-text uppercase">{f.grupo_nombre}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-dark-text-muted">{f.codigo_recaudo}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-dark-text uppercase">{f.presidenta_nombre}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-dark-text-muted">{f.presidenta_dni}</td>
                                                    <td className="px-4 py-3 text-[9px] font-bold text-slate-600 dark:text-dark-text-muted">{f.presidenta_correo}</td>
                                                    <td className="px-4 py-3 text-right text-sm font-black text-slate-900 dark:text-dark-text">S/ {fmtMonto(f.interes_percibido)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-900 dark:bg-black text-white">
                                            <tr>
                                                <td colSpan={6} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">TOTAL DEL RANGO</td>
                                                <td className="px-4 py-3 text-right text-sm font-black text-brand-gold">S/ {fmtMonto(total)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default InteresGrupoCard;