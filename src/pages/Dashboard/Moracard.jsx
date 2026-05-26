import React, { useState } from 'react';
import { useDashboardMora } from 'hooks/Dashboard/useDashboardMora';
import { exportMoraDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import { ExclamationTriangleIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const fmt  = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
const fmtN = n => parseInt(n || 0).toLocaleString('es-PE');

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

const TablaAsesor = ({ filas = [], totales = {}, esMonto }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[480px]">
            <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-100">
                <tr>
                    <th className="px-4 py-3">Asesor</th>
                    <th className="px-4 py-3 text-right">Saldo Inicial</th>
                    <th className="px-4 py-3 text-right">Saldo Actual</th>
                    <th className="px-4 py-3 text-right">Variación</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {filas.map((f, i) => {
                    const varPositiva = f.variacion > 0;
                    return (
                        <tr key={f.asesor_id} className={`hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-brand-red-light flex items-center justify-center flex-shrink-0">
                                        <span className="text-[9px] font-black text-brand-red">{f.abrev}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-700 uppercase">{f.nombre}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="text-sm font-black text-slate-600">
                                    {esMonto ? `S/ ${fmt(f.saldo_inicial)}` : fmtN(f.saldo_inicial)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className="text-sm font-black text-slate-900">
                                    {esMonto ? `S/ ${fmt(f.saldo_actual)}` : fmtN(f.saldo_actual)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <span className={`text-sm font-black ${varPositiva ? 'text-brand-red' : f.variacion < 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                    {varPositiva ? '+' : ''}
                                    {esMonto ? `S/ ${fmt(f.variacion)}` : fmtN(f.variacion)}
                                </span>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            <tfoot className="bg-slate-900 text-white">
                <tr>
                    <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">TOTAL</td>
                    <td className="px-4 py-3 text-right text-sm font-black">
                        {esMonto ? `S/ ${fmt(totales.saldo_inicial)}` : fmtN(totales.saldo_inicial)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-black">
                        {esMonto ? `S/ ${fmt(totales.saldo_actual)}` : fmtN(totales.saldo_actual)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-black text-brand-gold">
                        {totales.variacion > 0 ? '+' : ''}
                        {esMonto ? `S/ ${fmt(totales.variacion)}` : fmtN(totales.variacion)}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
);

const MoraCard = () => {
    const { loading, data, fechaInicio, setFechaInicio, fechaFin, setFechaFin, handleFiltrar, handleLimpiar } = useDashboardMora();
    const [collapsed, setCollapsed] = useState(false);
    const rango      = data?.rango ?? {};
    const tieneRango = fechaInicio || fechaFin;

    const exportFilters = {
        ...(fechaInicio ? { fecha_inicio: fechaInicio } : {}),
        ...(fechaFin    ? { fecha_fin:    fechaFin    } : {}),
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light rounded-xl">
                        <ExclamationTriangleIcon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Mora Mayor a 8 Días</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Seguimiento por asesor — saldo inicial vs actual</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportMoraDashboard}
                            filters={exportFilters}
                            filename="reporte_mora"
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
                    {/* Filtros */}
                    <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha Inicial</label>
                            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                                className="p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha Final</label>
                            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                                className="p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                        </div>
                        <button onClick={handleFiltrar} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark transition-all disabled:opacity-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        {tieneRango && (
                            <button onClick={handleLimpiar}
                                className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-brand-red text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:border-brand-red/30 transition-all">
                                <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                            </button>
                        )}
                    </div>

                    {/* Rango actual */}
                    <div className="px-6 py-2 border-b border-slate-50 bg-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100">
                            <div className="w-2 h-2 rounded-full bg-brand-red" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rango:</span>
                            <span className="text-[10px] font-black text-slate-700">{rango.desde}</span>
                            <span className="text-slate-400 text-[10px]">→</span>
                            <span className="text-[10px] font-black text-slate-700">{rango.hasta}</span>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                        Mora Mayor a 8 Días — Saldo (S/)
                                    </p>
                                    <TablaAsesor filas={data?.monto?.filas ?? []} totales={data?.monto?.totales ?? {}} esMonto={true} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                        Número de Clientes con Mora Mayor a 8 Días
                                    </p>
                                    <TablaAsesor filas={data?.cantidad?.filas ?? []} totales={data?.cantidad?.totales ?? {}} esMonto={false} />
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MoraCard;