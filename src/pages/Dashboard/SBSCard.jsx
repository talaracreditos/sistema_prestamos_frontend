import React, { useState } from 'react';
import { useDashboardSBS } from 'hooks/Dashboard/useDashboardSBS';
import { exportSBSDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import Pagination from 'components/Shared/Pagination';
import { ShieldCheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CAL_LABEL = ['NORMAL', 'CPP', 'DEFICIENTE', 'DUDOSO', 'PÉRDIDA'];
const CAL_COLOR = [
    'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
    'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
    'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
    'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
    'bg-slate-900 dark:bg-black text-white dark:text-dark-text border-slate-700 dark:border-dark-border',
];
const CAL_OPTIONS = [
    { value: '',  label: 'Todas' },
    { value: '0', label: 'Normal' },
    { value: '1', label: 'CPP' },
    { value: '2', label: 'Deficiente' },
    { value: '3', label: 'Dudoso' },
    { value: '4', label: 'Pérdida' },
];

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const SBSCard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        loading, data,
        busqueda,     setBusqueda,
        calificacion, setCalificacion,
        nroCredito,   setNroCredito,
        mes,          setMes,
        handleFiltrar, handleLimpiar, handlePageChange,
    } = useDashboardSBS();

    const resumen    = data?.por_calificacion ?? {};
    const filas      = data?.filas ?? [];
    const tieneFiltro = busqueda || calificacion !== '' || nroCredito || mes;

    const exportFilters = {
        ...(busqueda          ? { busqueda }                : {}),
        ...(calificacion !== '' ? { calificacion }          : {}),
        ...(nroCredito        ? { nro_credito: nroCredito } : {}),
        ...(mes               ? { mes }                     : {}), // AGREGAMOS A EXCEL
    };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div
                    className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                    onClick={() => setCollapsed(v => !v)}
                >
                    <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl transition-colors">
                        <ShieldCheckIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">
                            Reporte Riesgo Crediticio (SBS)
                        </h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                            Cartera activa · {data?.total_registros ?? '—'} registros
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportSBSDashboard}
                            filters={exportFilters}
                            filename="reporte_sbs"
                            label="Excel SBS"
                            disabled={loading}
                        />
                    )}
                    <div
                        className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted cursor-pointer transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                        onClick={() => setCollapsed(v => !v)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* Filtros */}
                    <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt/50 flex flex-wrap items-end gap-3 transition-colors">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">
                                Buscar (nombre / DNI / RUC / apellidos)
                            </label>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFiltrar()}
                                placeholder="Ej: García, 12345678..."
                                className="w-full p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 outline-none transition-colors"
                            />
                        </div>
                        {/* NUEVO: Selector de Mes */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">
                                Mes
                            </label>
                            <input
                                type="month"
                                value={mes}
                                onChange={e => setMes(e.target.value)}
                                className="w-32 p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">
                                Calificación
                            </label>
                            <select
                                value={calificacion}
                                onChange={e => setCalificacion(e.target.value)}
                                className="p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 outline-none transition-colors"
                            >
                                {CAL_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">
                                # Crédito
                            </label>
                            <input
                                type="number"
                                value={nroCredito}
                                onChange={e => setNroCredito(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFiltrar()}
                                placeholder="Ej: 415"
                                className="w-28 p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 outline-none transition-colors"
                            />
                        </div>
                        <button
                            onClick={handleFiltrar}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 dark:bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        {tieneFiltro && (
                            <button
                                onClick={handleLimpiar}
                                className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-red-600 dark:hover:text-red-400 text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-red-300 dark:hover:border-red-500/30 transition-all"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                            </button>
                        )}
                    </div>

                    <div className="p-6 space-y-5">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-red-100 dark:border-dark-surface-alt border-t-red-600 dark:border-t-red-500 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Resumen por calificación */}
                                <div className="grid grid-cols-5 gap-2">
                                    {CAL_LABEL.map((label, i) => (
                                        <div
                                            key={i}
                                            onClick={() => { setCalificacion(String(i)); handleFiltrar(); }}
                                            className={`rounded-xl border px-3 py-2.5 text-center cursor-pointer hover:opacity-80 transition-all ${CAL_COLOR[i]} ${calificacion === String(i) ? 'ring-2 ring-offset-1 dark:ring-offset-dark-surface ring-slate-400 dark:ring-slate-500' : ''}`}
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-wider mb-0.5">{label}</p>
                                            <p className="text-xl font-black leading-none">
                                                {resumen[['normal','cpp','deficiente','dudoso','perdida'][i]] ?? 0}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Total saldo */}
                                <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border px-4 py-3 flex items-center justify-between transition-colors">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted">
                                        Saldo Total Cartera Activa
                                    </p>
                                    <p className="text-lg font-black text-slate-900 dark:text-dark-text">S/ {fmt(data?.total_saldo)}</p>
                                </div>

                                {/* Tabla */}
                                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-dark-border transition-colors">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="bg-slate-900 dark:bg-black text-white dark:text-dark-text transition-colors">
                                                {['Mes','Entidad','Crédito','T.Doc','N° Doc','Ap. Paterno','Ap. Materno','Nombres','T.Per','T.Crd','MN Vigente','Cal.','Días Mora'].map((h, i) => (
                                                    <th key={i} className="px-3 py-2 text-left font-black text-[9px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filas.length === 0 ? (
                                                <tr>
                                                    <td colSpan={13} className="text-center py-8 text-slate-300 dark:text-dark-text-muted/60 text-xs font-bold uppercase transition-colors">
                                                        Sin registros
                                                    </td>
                                                </tr>
                                            ) : filas.map((f, i) => (
                                                <tr key={i} className={`border-b border-slate-50 dark:border-dark-border transition-colors hover:opacity-90 ${
                                                    f.calificacion === 4 ? 'bg-red-50 dark:bg-red-500/10' :
                                                    f.calificacion === 3 ? 'bg-red-50/50 dark:bg-red-500/5' :
                                                    f.calificacion === 2 ? 'bg-orange-50/50 dark:bg-orange-500/10' :
                                                    f.calificacion === 1 ? 'bg-yellow-50/30 dark:bg-yellow-500/10' :
                                                    i % 2 === 0 ? 'bg-white dark:bg-dark-surface' : 'bg-slate-50/50 dark:bg-dark-surface-alt/30'
                                                }`}>
                                                    <td className="px-3 py-2 font-bold text-slate-500 dark:text-dark-text-muted">{f.mes}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-600 dark:text-dark-text-muted/80">{f.cod_entidad}</td>
                                                    <td className="px-3 py-2 font-black text-slate-800 dark:text-dark-text">#{f.nro_credito}</td>
                                                    <td className="px-3 py-2 text-slate-500 dark:text-dark-text-muted">{f.tipo_doc}</td>
                                                    <td className="px-3 py-2 font-mono font-bold text-slate-700 dark:text-dark-text-muted">{f.nro_doc}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-dark-text uppercase">{f.apellido_pat}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-dark-text uppercase">{f.apellido_mat}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-dark-text uppercase">{f.nombres}</td>
                                                    <td className="px-3 py-2 text-slate-500 dark:text-dark-text-muted">{f.tipo_persona}</td>
                                                    <td className="px-3 py-2 text-slate-500 dark:text-dark-text-muted">{f.tipo_credito}</td>
                                                    <td className="px-3 py-2 font-black text-slate-900 dark:text-dark-text">S/ {fmt(f.mn_vigente)}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${CAL_COLOR[f.calificacion]}`}>
                                                            {CAL_LABEL[f.calificacion]}
                                                        </span>
                                                    </td>
                                                    <td className={`px-3 py-2 font-black ${f.dias_mora > 30 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-dark-text-muted'}`}>
                                                        {f.dias_mora}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <Pagination
                                    currentPage={data?.current_page}
                                    totalPages={data?.last_page}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SBSCard;