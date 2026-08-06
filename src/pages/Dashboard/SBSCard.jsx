import React, { useState } from 'react';
import { useDashboardSBS } from 'hooks/Dashboard/useDashboardSBS';
import { exportSBSDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import Pagination from 'components/Shared/Pagination';
import { ShieldCheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CAL_LABEL = ['NORMAL', 'CPP', 'DEFICIENTE', 'DUDOSO', 'PÉRDIDA'];
const CAL_COLOR = [
    'bg-green-100 text-green-700 border-green-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-red-100 text-red-600 border-red-200',
    'bg-slate-900 text-white border-slate-700',
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
        mes,            setMes,
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                <div
                    className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                    onClick={() => setCollapsed(v => !v)}
                >
                    <div className="p-2 bg-red-50 rounded-xl">
                        <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            Reporte Riesgo Crediticio (SBS)
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
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
                        className={`w-6 h-6 flex items-center justify-center text-slate-400 cursor-pointer transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
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
                    <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Buscar (nombre / DNI / RUC / apellidos)
                            </label>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFiltrar()}
                                placeholder="Ej: García, 12345678..."
                                className="w-full p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        {/* NUEVO: Selector de Mes */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Mes
                            </label>
                            <input
                                type="month"
                                value={mes}
                                onChange={e => setMes(e.target.value)}
                                className="w-32 p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Calificación
                            </label>
                            <select
                                value={calificacion}
                                onChange={e => setCalificacion(e.target.value)}
                                className="p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                {CAL_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                # Crédito
                            </label>
                            <input
                                type="number"
                                value={nroCredito}
                                onChange={e => setNroCredito(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFiltrar()}
                                placeholder="Ej: 415"
                                className="w-28 p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleFiltrar}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        {tieneFiltro && (
                            <button
                                onClick={handleLimpiar}
                                className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-red-600 text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:border-red-300 transition-all"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                            </button>
                        )}
                    </div>

                    <div className="p-6 space-y-5">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Resumen por calificación */}
                                <div className="grid grid-cols-5 gap-2">
                                    {CAL_LABEL.map((label, i) => (
                                        <div
                                            key={i}
                                            onClick={() => { setCalificacion(String(i)); handleFiltrar(); }}
                                            className={`rounded-xl border px-3 py-2.5 text-center cursor-pointer hover:opacity-80 transition-opacity ${CAL_COLOR[i]} ${calificacion === String(i) ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                                        >
                                            <p className="text-[9px] font-black uppercase tracking-wider mb-0.5">{label}</p>
                                            <p className="text-xl font-black leading-none">
                                                {resumen[['normal','cpp','deficiente','dudoso','perdida'][i]] ?? 0}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Total saldo */}
                                <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Saldo Total Cartera Activa
                                    </p>
                                    <p className="text-lg font-black text-slate-900">S/ {fmt(data?.total_saldo)}</p>
                                </div>

                                {/* Tabla */}
                                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="bg-slate-900 text-white">
                                                {['Mes','Entidad','Crédito','T.Doc','N° Doc','Ap. Paterno','Ap. Materno','Nombres','T.Per','T.Crd','MN Vigente','Cal.','Días Mora'].map((h, i) => (
                                                    <th key={i} className="px-3 py-2 text-left font-black text-[9px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filas.length === 0 ? (
                                                <tr>
                                                    <td colSpan={13} className="text-center py-8 text-slate-300 text-xs font-bold uppercase">
                                                        Sin registros
                                                    </td>
                                                </tr>
                                            ) : filas.map((f, i) => (
                                                <tr key={i} className={`border-b border-slate-50 ${
                                                    f.calificacion === 4 ? 'bg-red-50' :
                                                    f.calificacion === 3 ? 'bg-red-50/50' :
                                                    f.calificacion === 2 ? 'bg-orange-50/50' :
                                                    f.calificacion === 1 ? 'bg-yellow-50/30' :
                                                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                                }`}>
                                                    <td className="px-3 py-2 font-bold text-slate-500">{f.mes}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-600">{f.cod_entidad}</td>
                                                    <td className="px-3 py-2 font-black text-slate-800">#{f.nro_credito}</td>
                                                    <td className="px-3 py-2 text-slate-500">{f.tipo_doc}</td>
                                                    <td className="px-3 py-2 font-mono font-bold text-slate-700">{f.nro_doc}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-800 uppercase">{f.apellido_pat}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-800 uppercase">{f.apellido_mat}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-800 uppercase">{f.nombres}</td>
                                                    <td className="px-3 py-2 text-slate-500">{f.tipo_persona}</td>
                                                    <td className="px-3 py-2 text-slate-500">{f.tipo_credito}</td>
                                                    <td className="px-3 py-2 font-black text-slate-900">S/ {fmt(f.mn_vigente)}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${CAL_COLOR[f.calificacion]}`}>
                                                            {CAL_LABEL[f.calificacion]}
                                                        </span>
                                                    </td>
                                                    <td className={`px-3 py-2 font-black ${f.dias_mora > 30 ? 'text-red-600' : 'text-slate-700'}`}>
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