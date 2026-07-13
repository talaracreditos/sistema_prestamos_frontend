import React, { useState } from 'react';
import { useDashboardCuotaDia } from 'hooks/Dashboard/useDashboardCuotaDia';
import { exportCuotaDiaDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import { CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon} from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

const CuotaDiaCard = () => {
    const {
        loading, data,
        fecha,    setFecha,
        asesorId, setAsesorId,
        handleFiltrar, handleLimpiar,
    } = useDashboardCuotaDia();

    const [collapsed, setCollapsed] = useState(false);

    const porAsesor    = data?.por_asesor    ?? [];
    const totalGeneral = data?.total_general ?? 0;
    const totalCuotas  = data?.total_cuotas  ?? 0;
    const fechaLabel   = data?.fecha         ?? '—';
    const asesoresDisp = data?.asesores_disponibles ?? [];

    const exportFilters = {
        fecha,
        ...(asesorId ? { asesor_id: asesorId } : {}),
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                <div
                    className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                    onClick={() => setCollapsed(v => !v)}
                >
                    <div className="p-2 bg-brand-red-light rounded-xl">
                        <CalendarDaysIcon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Cuotas del Día</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {fechaLabel} · {totalCuotas} cuota{totalCuotas !== 1 ? 's' : ''} · S/ {fmt(totalGeneral)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportCuotaDiaDashboard}
                            filters={exportFilters}
                            filename="cuotas_dia"
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
                        {/* Fecha */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={e => setFecha(e.target.value)}
                                className="p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none"
                            />
                        </div>

                        {/* Asesor (select dinámico con opciones del response) */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Asesor</label>
                            <select
                                value={asesorId}
                                onChange={e => setAsesorId(e.target.value)}
                                className="p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none min-w-[160px]"
                            >
                                <option value="">Todos los asesores</option>
                                {asesoresDisp.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleFiltrar}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark transition-all disabled:opacity-50"
                        >
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>

                        <button
                            onClick={handleLimpiar}
                            className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-brand-red text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:border-brand-red/30 transition-all"
                        >
                            <XMarkIcon className="w-3.5 h-3.5" /> Hoy
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin" />
                            </div>
                        ) : porAsesor.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-slate-300 text-xs font-bold uppercase tracking-widest">
                                Sin cuotas para esta fecha
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[760px]">
                                    <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3">Asesor</th>
                                            <th className="px-4 py-3">Nombre / Grupo</th>
                                            <th className="px-4 py-3 text-right">N° Préstamo</th>
                                            <th className="px-4 py-3 text-right">Cód. Recaudo</th>
                                            <th className="px-4 py-3 text-center">Tipo</th>
                                            <th className="px-4 py-3 text-right">Frecuencia</th>
                                            <th className="px-4 py-3 text-right">N° Cuota</th>
                                            <th className="px-4 py-3 text-right">Cuota (S/)</th>
                                            <th className="px-4 py-3 text-right">Mora (S/)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {porAsesor.map((asesor) => (
                                            <React.Fragment key={asesor.asesor_id}>
                                                {asesor.filas.map((f, j) => {
                                                    const vencida = [4, 5].includes(f.estado_cuota);
                                                    return (
                                                        <tr key={f.cuota_id}
                                                            className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                                                                vencida ? 'bg-brand-red-light/10' : j % 2 === 0 ? '' : 'bg-slate-50/40'
                                                            }`}>
                                                            {j === 0 ? (
                                                                <td className="px-4 py-3 align-top" rowSpan={asesor.filas.length}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-7 h-7 rounded-lg bg-brand-red-light flex items-center justify-center flex-shrink-0">
                                                                            <span className="text-[9px] font-black text-brand-red">{asesor.abrev}</span>
                                                                        </div>
                                                                        <span className="text-xs font-black text-slate-800 uppercase">{asesor.nombre}</span>
                                                                    </div>
                                                                </td>
                                                            ) : null}
                                                            <td className="px-4 py-3 text-xs text-slate-700 font-bold">{f.nombre}</td>
                                                            <td className="px-4 py-3 text-right text-xs text-slate-500 font-bold">{f.numero_prestamo}</td>
                                                            <td className="px-4 py-3 text-right text-xs text-slate-500 font-bold">
                                                                {f.codigo_recaudo || <span className="text-slate-300">—</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                                                    f.tipo === 'Grupal'
                                                                        ? 'bg-brand-red-light text-brand-red border-brand-red/20'
                                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                                }`}>{f.tipo}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-xs text-slate-500 capitalize">{f.frecuencia}</td>
                                                            <td className="px-4 py-3 text-right text-xs text-slate-600 font-bold">{f.numero_cuota}</td>
                                                            <td className="px-4 py-3 text-right text-sm font-black text-slate-900">
                                                                S/ {fmt(f.cuota_monto)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-xs font-bold">
                                                                {f.cargo_mora > 0
                                                                    ? <span className="text-brand-red">+S/ {fmt(f.cargo_mora)}</span>
                                                                    : <span className="text-slate-300">—</span>
                                                                }
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* Subtotal asesor */}
                                                <tr className="bg-brand-red-light/30 border-t border-brand-red/20">
                                                    <td colSpan={7} className="px-4 py-2 text-[10px] font-black text-brand-red uppercase tracking-widest text-right">
                                                        Subtotal {asesor.nombre}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-sm font-black text-brand-red">
                                                        S/ {fmt(asesor.total_cuota)}
                                                    </td>
                                                    <td />
                                                </tr>
                                                {/* Separador */}
                                                <tr><td colSpan={9} className="h-2 bg-white" /></tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-900 text-white">
                                        <tr>
                                            <td colSpan={7} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-right">
                                                Total General · {totalCuotas} cuotas
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-black text-brand-gold">
                                                S/ {fmt(totalGeneral)}
                                            </td>
                                            <td />
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

export default CuotaDiaCard;