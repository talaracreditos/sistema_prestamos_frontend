import React, { useState } from 'react';
import { useDashboardClientesDni, OPCIONES_DIAS } from 'hooks/Dashboard/useDashboardClientesDni';
import RefreshButton from 'components/Shared/Buttons/RefreshButton';
import Pagination from 'components/Shared/Pagination';
import {
    IdentificationIcon, UserIcon, UserGroupIcon, PhoneIcon,
    MagnifyingGlassIcon, XMarkIcon, ExclamationTriangleIcon, ClockIcon,
} from '@heroicons/react/24/outline';

const textoDias = (dias) => {
    if (dias < 0)  return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    if (dias === 0) return 'Vence hoy';
    return `Vence en ${dias} día${dias !== 1 ? 's' : ''}`;
};

const claseBadge = (dias) => {
    if (dias < 0)   return 'bg-brand-red dark:bg-brand-red-glow text-white border-brand-red dark:border-brand-red-glow';
    if (dias <= 7)  return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30';
    return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
};

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

const FilaCliente = ({ f }) => (
    <tr className="hover:bg-brand-red-light/20 dark:hover:bg-dark-surface-alt transition-colors text-[10px]">
        <td className="px-2 py-3">
            <div className="flex items-start gap-2">
                <div className="p-1.5 bg-slate-100 dark:bg-dark-surface-alt rounded-lg flex-shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500 dark:text-dark-text-muted" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-dark-text uppercase leading-tight">{f.nombre}</p>
                    {f.dni && <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold leading-none mt-1">DNI {f.dni}</p>}
                </div>
            </div>
        </td>
        <td className="px-2 py-3 whitespace-nowrap">
            {f.celular ? (
                <a href={`tel:${f.celular}`} className="inline-flex items-center gap-1 font-black text-slate-600 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold">
                    <PhoneIcon className="w-3 h-3" /> {f.celular}
                </a>
            ) : (
                <span className="text-slate-300 dark:text-dark-text-muted/60">—</span>
            )}
        </td>
        <td className="px-2 py-3 whitespace-nowrap font-black text-slate-600 dark:text-dark-text-muted">{f.fecha_venc_dni}</td>
        <td className="px-2 py-3 whitespace-nowrap">
            <span className={`px-2 py-0.5 rounded-full font-black border ${claseBadge(f.dias)}`}>
                {textoDias(f.dias)}
            </span>
        </td>
        <td className="px-2 py-3">
            <div className="flex flex-col gap-1">
                {f.prestamos.map(p => (
                    <div key={p.prestamo_id} className="flex items-center gap-1.5 whitespace-nowrap">
                        {p.es_grupal
                            ? <UserGroupIcon className="w-3 h-3 text-brand-red dark:text-brand-gold flex-shrink-0" />
                            : <UserIcon className="w-3 h-3 text-slate-400 dark:text-dark-text-muted flex-shrink-0" />}
                        <span className="font-black text-slate-600 dark:text-dark-text-muted">
                            #{String(p.prestamo_id).padStart(5, '0')}
                        </span>
                        {p.codigo_recaudo && (
                            <span className="text-[9px] font-black text-brand-red/70 dark:text-brand-gold/70">{p.codigo_recaudo}</span>
                        )}
                        {p.grupo && (
                            <span className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase">· {p.grupo}</span>
                        )}
                    </div>
                ))}
            </div>
        </td>
        <td className="px-2 py-3 whitespace-nowrap">
            <span className="font-black text-slate-500 dark:text-dark-text-muted uppercase">
                {[...new Set(f.prestamos.map(p => p.asesor))].join(', ')}
            </span>
        </td>
    </tr>
);

const TabBoton = ({ activo, onClick, icon: Icon, label, total, tono }) => {
    const tonos = {
        rojo:  activo
            ? 'bg-brand-red dark:bg-brand-red-glow text-white border-brand-red dark:border-brand-red-glow'
            : 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold border-brand-red/20 dark:border-brand-gold/20 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt',
        ambar: activo
            ? 'bg-amber-500 text-white border-amber-500'
            : 'bg-white dark:bg-dark-surface text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors ${tonos[tono]}`}
        >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activo ? 'bg-white/20' : 'bg-slate-100 dark:bg-dark-surface-alt'}`}>
                {total}
            </span>
        </button>
    );
};

const ClientesDniCard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        loading, alert,
        busqueda, setBusqueda,
        dias, handleCambiarDias,
        tab, setTab,
        pagina, totalVencidos, totalPorVencer, diasAlerta,
        tieneFiltro, handleFiltrar, handleLimpiar,
        handlePageChange, refresh,
    } = useDashboardClientesDni();

    const filas = pagina.data ?? [];

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <IdentificationIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">DNI de Clientes</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                            Préstamos vigentes · {totalVencidos} vencidos · {totalPorVencer} por vencer
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && <RefreshButton onClick={refresh} loading={loading} />}
                    <div className="cursor-pointer" onClick={() => setCollapsed(v => !v)}>
                        <Chevron collapsed={collapsed} />
                    </div>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* Filtros */}
                    <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt/50 flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Buscar cliente / DNI / Grupo / Código</label>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFiltrar()}
                                placeholder="Nombre, DNI, grupo o código de recaudo..."
                                className="w-full p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Por vencer en</label>
                            <select
                                value={dias}
                                onChange={e => handleCambiarDias(e.target.value)}
                                className="p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none"
                            >
                                {OPCIONES_DIAS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
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

                    {/* Pestañas */}
                    <div className="px-6 pt-4 flex flex-wrap gap-2">
                        <TabBoton
                            activo={tab === 'vencidos'}
                            onClick={() => setTab('vencidos')}
                            icon={ExclamationTriangleIcon}
                            label="DNI vencido"
                            total={totalVencidos}
                            tono="rojo"
                        />
                        <TabBoton
                            activo={tab === 'por_vencer'}
                            onClick={() => setTab('por_vencer')}
                            icon={ClockIcon}
                            label={`Por vencer (${diasAlerta} días)`}
                            total={totalPorVencer}
                            tono="ambar"
                        />
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                        {alert?.message && (
                            <p className="mb-3 text-[10px] font-black text-brand-red dark:text-red-400 uppercase">{alert.message}</p>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            </div>
                        ) : filas.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-slate-300 dark:text-dark-text-muted/60 text-xs font-bold uppercase tracking-widest text-center">
                                {tab === 'vencidos'
                                    ? 'Ningún cliente con DNI vencido'
                                    : `Ningún DNI vence en los próximos ${diasAlerta} días`}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="w-full overflow-x-auto">
                                    <table className="min-w-[860px] w-full text-left border-collapse table-auto">
                                        <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                            <tr>
                                                <th className="px-2 py-3">Cliente</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Celular</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Vence DNI</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Estado</th>
                                                <th className="px-2 py-3">Préstamos vigentes</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Asesor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-dark-border bg-white dark:bg-dark-surface">
                                            {filas.map(f => <FilaCliente key={f.cliente_id} f={f} />)}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={pagina.current_page}
                                    totalPages={pagina.last_page}
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

export default ClientesDniCard;