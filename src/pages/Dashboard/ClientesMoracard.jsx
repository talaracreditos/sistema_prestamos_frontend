import React, { useState } from 'react';
import { useDashboardClientesMora } from 'hooks/Dashboard/useDashboardClientesMora';
import { exportClientesMoraDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import Pagination from 'components/Shared/Pagination';
import {
    UserGroupIcon, UserIcon, ExclamationTriangleIcon,
    ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const FilaCuota = ({ cuota }) => (
    <tr className="bg-slate-50/80 dark:bg-dark-surface-alt/80 border-l-4 border-brand-red/20 dark:border-brand-gold/20 text-[10px]">
        <td className="pl-16 pr-2 py-2 font-bold text-slate-500 dark:text-dark-text-muted whitespace-nowrap">Cuota #{cuota.numero}</td>
        <td className="px-2 py-2" /> {/* Dirección vacía */}
        <td className="px-2 py-2" /> {/* Asesor vacío */}
        <td className="px-2 py-2" /> {/* Desembolsado vacío */}
        <td className="px-2 py-2 text-right whitespace-nowrap" /> {/* Cuotas vacías */}
        <td className="px-2 py-2 text-right font-bold text-slate-500 dark:text-dark-text-muted whitespace-nowrap">S/ {fmt(cuota.monto)}</td>
        <td className="px-2 py-2 text-right font-black text-brand-red dark:text-brand-gold whitespace-nowrap">S/ {fmt(cuota.capital)}</td>
        <td className="px-2 py-2 text-right font-bold text-brand-red/70 dark:text-red-400/70 whitespace-nowrap">
            {cuota.mora > 0 ? `+S/ ${fmt(cuota.mora)}` : '—'}
        </td>
        <td className="px-2 py-2 text-right whitespace-nowrap">
            <span className="px-2 py-0.5 rounded-full font-black border bg-brand-red-light dark:bg-dark-surface-alt text-brand-red dark:text-brand-gold border-brand-red/30 dark:border-brand-gold/30">
                {cuota.dias_mora} días
            </span>
        </td>
        <td className="px-2 py-2 font-bold text-slate-500 dark:text-dark-text-muted whitespace-nowrap">{cuota.fecha_venc}</td>
    </tr>
);

// Fila de préstamo individual (tal cual antes, pero con Total Cuota)
const FilaIndividual = ({ p }) => {
    const [abierta, setAbierta] = useState(false);
    const f = p.integrantes[0];
    const tieneMasDeUnaCuota = f.cuotas_mora.length > 1;

    return (
        <>
            <tr
                className={`hover:bg-brand-red-light/20 dark:hover:bg-dark-surface-alt transition-colors text-[10px] ${tieneMasDeUnaCuota ? 'cursor-pointer' : ''}`}
                onClick={() => tieneMasDeUnaCuota && setAbierta(v => !v)}
            >
                <td className="px-2 py-3 w-1/5">
                    <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-slate-100 dark:bg-dark-surface-alt rounded-lg flex-shrink-0 mt-0.5">
                            <UserIcon className="w-3.5 h-3.5 text-slate-500 dark:text-dark-text-muted" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-800 dark:text-dark-text uppercase leading-tight">{f.nombre}</p>
                            {f.documento && <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold leading-none mt-1">{f.documento}</p>}
                        </div>
                        {tieneMasDeUnaCuota && (
                            <ChevronDownIcon className={`w-3 h-3 text-slate-400 dark:text-dark-text-muted flex-shrink-0 mt-1 transition-transform ${abierta ? 'rotate-180' : ''}`} />
                        )}
                    </div>
                </td>
                <td className="px-2 py-3 w-1/4">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted leading-tight uppercase tracking-tight line-clamp-3">
                        {f.direccion || '—'}
                    </p>
                </td>
                <td className="px-2 py-3 whitespace-nowrap">
                    <span className="font-black text-slate-500 dark:text-dark-text-muted uppercase block">{p.asesor}</span>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold block tracking-tighter">Préstamo #{String(p.prestamo_id).padStart(5, '0')}</span>
                    {p.codigo_recaudo && (
                        <span className="text-[9px] text-brand-red/70 dark:text-brand-gold/70 font-black block tracking-tighter">{p.codigo_recaudo}</span>
                    )}
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap font-black text-slate-600 dark:text-dark-text-muted">
                    S/ {fmt(f.monto_desemb)}
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className="font-black text-slate-600 dark:text-dark-text-muted block">{p.cuotas_pagadas}/{p.total_cuotas}</span>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold block leading-none">pagadas</span>
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className="font-black text-slate-600 dark:text-dark-text-muted block">S/ {fmt(f.total_cuota)}</span>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold block leading-none">
                        {f.cuotas_mora.length > 1 ? `${f.cuotas_mora.length} cuotas` : `Cuota #${f.cuotas_mora[0].numero}`}
                    </span>
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className="text-xs font-black text-brand-red dark:text-brand-gold block">S/ {fmt(f.total_capital)}</span>
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    {f.total_mora > 0
                        ? <span className="text-xs font-black text-brand-red/70 dark:text-red-400/70 block">+S/ {fmt(f.total_mora)}</span>
                        : <span className="text-slate-300 dark:text-dark-text-muted/60 block">—</span>
                    }
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full font-black border ${
                        f.max_dias > 30 ? 'bg-brand-red dark:bg-brand-red-glow text-white border-brand-red dark:border-brand-red-glow' : 'bg-brand-red-light dark:bg-dark-surface-alt text-brand-red dark:text-brand-gold border-brand-red/30 dark:border-brand-gold/30'
                    }`}>{f.max_dias} días</span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-right">
                    <span className="font-bold text-slate-600 dark:text-dark-text-muted block">{f.cuotas_mora[0]?.fecha_venc}</span>
                    {f.cuotas_mora.length > 1 && <span className="text-[8px] text-slate-400 dark:text-dark-text-muted font-black uppercase block leading-none">más antiguo</span>}
                </td>
            </tr>
            {abierta && f.cuotas_mora.map((c, i) => <FilaCuota key={i} cuota={c} />)}
        </>
    );
};

// Fila de un integrante dentro de un grupo expandido
const FilaGrupoIntegrante = ({ f }) => {
    const [abierta, setAbierta] = useState(false);
    const tieneMasDeUnaCuota = f.cuotas_mora.length > 1;

    return (
        <>
            <tr
                className={`bg-white dark:bg-dark-surface hover:bg-brand-red-light/10 dark:hover:bg-dark-surface-alt transition-colors text-[10px] border-l-4 border-slate-100 dark:border-dark-border ${tieneMasDeUnaCuota ? 'cursor-pointer' : ''}`}
                onClick={() => tieneMasDeUnaCuota && setAbierta(v => !v)}
            >
                <td className="pl-10 pr-2 py-2.5 w-1/5">
                    <div className="flex items-start gap-2">
                        <div className="p-1 bg-slate-50 dark:bg-dark-surface-alt rounded-lg flex-shrink-0 mt-0.5">
                            <UserIcon className="w-3 h-3 text-slate-400 dark:text-dark-text-muted" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase leading-tight">{f.nombre}</p>
                            {f.documento && <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold leading-none mt-1">{f.documento}</p>}
                        </div>
                        {tieneMasDeUnaCuota && (
                            <ChevronDownIcon className={`w-3 h-3 text-slate-400 dark:text-dark-text-muted flex-shrink-0 mt-1 transition-transform ${abierta ? 'rotate-180' : ''}`} />
                        )}
                    </div>
                </td>
                <td className="px-2 py-2.5 w-1/4">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted leading-tight uppercase tracking-tight line-clamp-3">
                        {f.direccion || '—'}
                    </p>
                </td>
                <td className="px-2 py-2.5" />
                <td className="px-2 py-2.5 text-right whitespace-nowrap font-black text-slate-600 dark:text-dark-text-muted">
                    S/ {fmt(f.monto_desemb)}
                </td>
                <td className="px-2 py-2.5" />
                <td className="px-2 py-2.5 text-right whitespace-nowrap">
                    <span className="font-black text-slate-600 dark:text-dark-text-muted block">S/ {fmt(f.total_cuota)}</span>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold block leading-none">
                        {f.cuotas_mora.length > 1 ? `${f.cuotas_mora.length} cuotas` : `Cuota #${f.cuotas_mora[0].numero}`}
                    </span>
                </td>
                <td className="px-2 py-2.5 text-right whitespace-nowrap">
                    <span className="text-xs font-black text-brand-red dark:text-brand-gold block">S/ {fmt(f.total_capital)}</span>
                </td>
                <td className="px-2 py-2.5 text-right whitespace-nowrap">
                    {f.total_mora > 0
                        ? <span className="text-xs font-black text-brand-red/70 dark:text-red-400/70 block">+S/ {fmt(f.total_mora)}</span>
                        : <span className="text-slate-300 dark:text-dark-text-muted/60 block">—</span>
                    }
                </td>
                <td className="px-2 py-2.5 text-right whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full font-black border ${
                        f.max_dias > 30 ? 'bg-brand-red dark:bg-brand-red-glow text-white border-brand-red dark:border-brand-red-glow' : 'bg-brand-red-light dark:bg-dark-surface-alt text-brand-red dark:text-brand-gold border-brand-red/30 dark:border-brand-gold/30'
                    }`}>{f.max_dias} días</span>
                </td>
                <td className="px-2 py-2.5 whitespace-nowrap text-right">
                    <span className="font-bold text-slate-600 dark:text-dark-text-muted block">{f.cuotas_mora[0]?.fecha_venc}</span>
                    {f.cuotas_mora.length > 1 && <span className="text-[8px] text-slate-400 dark:text-dark-text-muted font-black uppercase block leading-none">más antiguo</span>}
                </td>
            </tr>
            {abierta && f.cuotas_mora.map((c, i) => <FilaCuota key={i} cuota={c} />)}
        </>
    );
};

// Fila cabecera de un grupo (expandible a integrantes)
const FilaGrupo = ({ p }) => {
    const [abierta, setAbierta] = useState(false);

    return (
        <>
            <tr
                className="hover:bg-brand-red-light/20 dark:hover:bg-dark-surface-alt transition-colors text-[10px] cursor-pointer bg-brand-red-light/10 dark:bg-dark-surface-alt/40"
                onClick={() => setAbierta(v => !v)}
            >
                <td className="px-2 py-3 w-1/5">
                    <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-brand-red-light dark:bg-dark-surface-alt rounded-lg flex-shrink-0 mt-0.5">
                            <UserGroupIcon className="w-3.5 h-3.5 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-brand-red dark:text-brand-gold uppercase leading-tight">GRUPO: {p.grupo}</p>
                            <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold leading-none mt-1">{p.integrantes.length} integrante{p.integrantes.length !== 1 ? 's' : ''} en mora</p>
                        </div>
                        <ChevronDownIcon className={`w-3 h-3 text-brand-red dark:text-brand-gold flex-shrink-0 mt-1 transition-transform ${abierta ? 'rotate-180' : ''}`} />
                    </div>
                </td>
                <td className="px-2 py-3 w-1/4" />
                <td className="px-2 py-3 whitespace-nowrap">
                    <span className="font-black text-slate-500 dark:text-dark-text-muted uppercase block">{p.asesor}</span>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold block tracking-tighter">Préstamo #{String(p.prestamo_id).padStart(5, '0')}</span>
                    {p.codigo_recaudo && (
                        <span className="text-[9px] text-brand-red/70 dark:text-brand-gold/70 font-black block tracking-tighter">{p.codigo_recaudo}</span>
                    )}
                </td>
                <td className="px-2 py-3" />
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className="font-black text-slate-600 dark:text-dark-text-muted block">{p.cuotas_pagadas}/{p.total_cuotas}</span>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold block leading-none">pagadas</span>
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className="font-black text-slate-600 dark:text-dark-text-muted block">S/ {fmt(p.total_cuota)}</span>
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className="text-xs font-black text-brand-red dark:text-brand-gold block">S/ {fmt(p.total_capital)}</span>
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    {p.total_mora > 0
                        ? <span className="text-xs font-black text-brand-red/70 dark:text-red-400/70 block">+S/ {fmt(p.total_mora)}</span>
                        : <span className="text-slate-300 dark:text-dark-text-muted/60 block">—</span>
                    }
                </td>
                <td className="px-2 py-3 text-right whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full font-black border ${
                        p.max_dias > 30 ? 'bg-brand-red dark:bg-brand-red-glow text-white border-brand-red dark:border-brand-red-glow' : 'bg-brand-red-light dark:bg-dark-surface-alt text-brand-red dark:text-brand-gold border-brand-red/30 dark:border-brand-gold/30'
                    }`}>{p.max_dias} días</span>
                </td>
                <td className="px-2 py-3" />
            </tr>
            {abierta && p.integrantes.map((f, i) => <FilaGrupoIntegrante key={i} f={f} />)}
        </>
    );
};

const ClientesMoraCard = ({
    useDashboardHook = useDashboardClientesMora,
    exportService = exportClientesMoraDashboard,
    filename = 'reporte_clientes_mora',
    titulo = 'Clientes en Mora Temprana',
    subtitulo = 'Capital adeudado · ordenado por deuda',
    icon: Icon = ExclamationTriangleIcon,
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        loading, data,
        busqueda,    setBusqueda,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        handleFiltrar, handleLimpiar, handlePageChange,
    } = useDashboardHook();

    const filas       = data?.data ?? [];
    const tieneFiltro = busqueda || fechaInicio || fechaFin;

    const exportFilters = {
        ...(busqueda    ? { busqueda }              : {}),
        ...(fechaInicio ? { fecha_inicio: fechaInicio } : {}),
        ...(fechaFin    ? { fecha_fin:    fechaFin  } : {}),
    };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div
                    className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                    onClick={() => setCollapsed(v => !v)}
                >
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <Icon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">{titulo}</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                            {subtitulo}
                            {data?.total ? ` · ${data.total} préstamos` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportService}
                            filters={exportFilters}
                            filename={filename}
                            label="Excel"
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
                    <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt/50 flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Buscar cliente / DNI / RUC / Grupo</label>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFiltrar()}
                                placeholder="Nombre, DNI, RUC o grupo..."
                                className="w-full p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Vence desde</label>
                            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                                className="p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Vence hasta</label>
                            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                                className="p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none" />
                        </div>
                        <button onClick={handleFiltrar} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        {tieneFiltro && (
                            <button onClick={handleLimpiar}
                                className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all">
                                <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                            </button>
                        )}
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            </div>
                        ) : filas.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-slate-300 dark:text-dark-text-muted/60 text-xs font-bold uppercase tracking-widest">
                                Sin clientes en mora
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="w-full overflow-x-auto">
                                    <table className="min-w-[1000px] text-left border-collapse table-auto">
                                        <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                            <tr>
                                                <th className="px-2 py-3 w-1/5">Cliente</th>
                                                <th className="px-2 py-3 w-1/4">Dirección</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Asesor / Préstamo</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Desembolsado</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Cuotas</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Total Cuota</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Capital Adeudado</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Mora</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Días Atraso</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Vencimiento</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-dark-border bg-white dark:bg-dark-surface">
                                            {filas.map((p) => (
                                                p.es_grupal
                                                    ? <FilaGrupo key={p.prestamo_id} p={p} />
                                                    : <FilaIndividual key={p.prestamo_id} p={p} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={data?.current_page}
                                    totalPages={data?.last_page}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientesMoraCard;