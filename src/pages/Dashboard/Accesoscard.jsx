import React, { useState } from 'react';
import { useDashboardAccesos } from 'hooks/Dashboard/useDashboardAccesos';
import { exportAccesosDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import Pagination from 'components/Shared/Pagination';
import {
    UsersIcon, CheckCircleIcon, XCircleIcon,
    ArrowPathIcon, ClockIcon, UserMinusIcon,
} from '@heroicons/react/24/outline';

// ── Barra de progreso ─────────────────────────────────────────────────────────
const ProgressBar = ({ value }) => (
    <div className="w-full bg-slate-100 dark:bg-dark-surface-alt rounded-full h-2 overflow-hidden">
        <div
            className="h-full rounded-full bg-brand-red dark:bg-brand-gold transition-all duration-700"
            style={{ width: `${Math.min(100, value)}%` }}
        />
    </div>
);

// ── Stat box ──────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, icon: Icon, color, sub }) => (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${color.bg} ${color.border}`}>
        <div className={`p-2.5 rounded-xl ${color.icon}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
            <p className={`text-2xl font-black leading-none ${color.text}`}>{value}</p>
            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-wider mt-1">{label}</p>
            {sub && <p className="text-[9px] text-slate-400 dark:text-dark-text-muted mt-0.5">{sub}</p>}
        </div>
    </div>
);

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

// ── Préstamos vigentes (celda reutilizable, ahora es una lista) ──────────────
const PrestamosVigentesCell = ({ prestamos }) => {
    if (!prestamos || prestamos.length === 0) {
        return <span className="text-[9px] text-slate-300 dark:text-dark-text-muted/60 font-bold uppercase">Sin préstamos</span>;
    }
    return (
        <div className="flex flex-col gap-1.5">
            {prestamos.map((p, idx) => (
                <div key={p.codigo_recaudo ?? idx} className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-700 dark:text-dark-text">
                            S/ {Number(p.monto).toFixed(2)}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase ${
                            p.tipo === 'grupal' ? 'bg-brand-gold/20 text-brand-gold' : 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted'
                        }`}>
                            {p.tipo === 'grupal' ? `Grupal · ${p.grupo ?? 'S/N'}` : 'Individual'}
                        </span>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">
                        {p.asesor ?? 'Sin asesor'} · {p.fecha}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ── Card principal ────────────────────────────────────────────────────────────
const AccesosCard = () => {
    const {
        loading, resumen,
        recientes, nunca,
        refresh,
        handlePageRecientes,
        handlePageNunca,
    } = useDashboardAccesos();

    const [collapsed, setCollapsed] = useState(false);
    const [tab,       setTab]       = useState('recientes');

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <UsersIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Accesos de Clientes</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">Actividad en la plataforma</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <>
                            <ExcelExportButton
                                exportService={exportAccesosDashboard}
                                filters={{}}
                                filename="reporte_accesos"
                                label="Excel"
                                disabled={loading}
                            />
                            <button onClick={refresh} disabled={loading}
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all disabled:opacity-40">
                                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </>
                    )}
                    <div className="cursor-pointer" onClick={() => setCollapsed(v => !v)}>
                        <Chevron collapsed={collapsed} />
                    </div>
                </div>
            </div>

            {!collapsed && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* ── Stats ── */}
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatBox
                                    label="Total Clientes"
                                    value={resumen.total ?? 0}
                                    icon={UsersIcon}
                                    color={{ bg: 'bg-slate-50 dark:bg-dark-surface-alt', border: 'border-slate-100 dark:border-dark-border', icon: 'bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-muted', text: 'text-slate-800 dark:text-dark-text' }}
                                />
                                <StatBox
                                    label="Ya ingresaron"
                                    value={resumen.con_acceso ?? 0}
                                    icon={CheckCircleIcon}
                                    sub={`${resumen.porcentaje ?? 0}% del total`}
                                    color={{ bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-100 dark:border-green-900/40', icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400', text: 'text-green-700 dark:text-green-400' }}
                                />
                                <StatBox
                                    label="Nunca ingresaron"
                                    value={resumen.sin_acceso ?? 0}
                                    icon={XCircleIcon}
                                    sub={`${resumen.porcentaje_sin_acceso ?? 0}% del total`}
                                    color={{ bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-100 dark:border-red-900/30', icon: 'bg-red-100 dark:bg-red-900/30 text-brand-red dark:text-red-400', text: 'text-brand-red dark:text-red-400' }}
                                />
                            </div>

                            {/* ── Barra adopción ── */}
                            <div className="px-6 pb-5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Adopción de la plataforma</span>
                                    <span className="text-[10px] font-black text-brand-red dark:text-brand-gold">{resumen.porcentaje ?? 0}%</span>
                                </div>
                                <ProgressBar value={resumen.porcentaje ?? 0} />
                            </div>

                            {/* ── Tabs ── */}
                            <div className="px-6 pb-3 border-t border-slate-50 dark:border-dark-border pt-4">
                                <div className="flex gap-0.5 bg-slate-100 dark:bg-dark-surface-alt p-0.5 rounded-lg w-fit">
                                    <button onClick={() => setTab('recientes')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                            tab === 'recientes' ? 'bg-brand-red dark:bg-brand-red-glow text-white shadow-sm' : 'text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text'
                                        }`}>
                                        <ClockIcon className="w-3 h-3" />
                                        Últimos accesos
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-black">
                                            {recientes.total}
                                        </span>
                                    </button>
                                    <button onClick={() => setTab('nunca')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                            tab === 'nunca' ? 'bg-brand-red dark:bg-brand-red-glow text-white shadow-sm' : 'text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text'
                                        }`}>
                                        <UserMinusIcon className="w-3 h-3" />
                                        Sin acceso
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-black">
                                            {nunca.total}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* ── Tabla recientes ── */}
                            {tab === 'recientes' && (
                                <div className="px-6 pb-6">
                                    {recientes.data.length === 0 ? (
                                        <p className="text-center text-xs font-bold text-slate-300 dark:text-dark-text-muted/60 uppercase py-8">Sin accesos registrados</p>
                                    ) : (
                                        <>
                                            <table className="w-full text-left border-collapse mb-4">
                                                <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Cliente</th>
                                                        <th className="px-3 py-2.5">DNI/RUC</th>
                                                        <th className="px-3 py-2.5">Primer acceso</th>
                                                        <th className="px-3 py-2.5">Último acceso</th>
                                                        <th className="px-3 py-2.5">Préstamos vigentes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                                    {recientes.data.map((u, i) => (
                                                        <tr key={u.id} className={i % 2 === 0 ? 'bg-white dark:bg-dark-surface' : 'bg-slate-50/40 dark:bg-dark-surface-alt/40'}>
                                                            <td className="px-3 py-2.5">
                                                                <span className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase">{u.nombre_completo}</span>
                                                                <span className="block text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">@{u.username}</span>
                                                            </td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">{u.documento ?? '—'}</td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-green-600 dark:text-green-400">{u.primer_acceso}</td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">{u.ultimo_acceso}</td>
                                                            <td className="px-3 py-2.5">
                                                                <PrestamosVigentesCell prestamos={u.prestamos_vigentes} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <Pagination
                                                currentPage={recientes.current_page}
                                                totalPages={recientes.last_page}
                                                onPageChange={handlePageRecientes}
                                            />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ── Tabla sin acceso ── */}
                            {tab === 'nunca' && (
                                <div className="px-6 pb-6">
                                    {nunca.data.length === 0 ? (
                                        <p className="text-center text-xs font-bold text-slate-300 dark:text-dark-text-muted/60 uppercase py-8">
                                            Todos los clientes ya ingresaron 🎉
                                        </p>
                                    ) : (
                                        <>
                                            <table className="w-full text-left border-collapse mb-4">
                                                <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Cliente</th>
                                                        <th className="px-3 py-2.5">DNI/RUC</th>
                                                        <th className="px-3 py-2.5">Fecha registro</th>
                                                        <th className="px-3 py-2.5">Préstamos vigentes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                                                    {nunca.data.map((u, i) => (
                                                        <tr key={u.id} className={i % 2 === 0 ? 'bg-white dark:bg-dark-surface' : 'bg-slate-50/40 dark:bg-dark-surface-alt/40'}>
                                                            <td className="px-3 py-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red dark:bg-brand-gold flex-shrink-0" />
                                                                    <div>
                                                                        <span className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase">{u.nombre_completo}</span>
                                                                        <span className="block text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">@{u.username}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">{u.documento ?? '—'}</td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-400 dark:text-dark-text-muted">{u.registered}</td>
                                                            <td className="px-3 py-2.5">
                                                                <PrestamosVigentesCell prestamos={u.prestamos_vigentes} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <Pagination
                                                currentPage={nunca.current_page}
                                                totalPages={nunca.last_page}
                                                onPageChange={handlePageNunca}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default AccesosCard;