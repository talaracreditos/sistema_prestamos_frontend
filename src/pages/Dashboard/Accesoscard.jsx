import React, { useState } from 'react';
import { useDashboardAccesos } from 'hooks/Dashboard/useDashboardAccesos';
import Pagination from 'components/Shared/Pagination';
import {
    UsersIcon, CheckCircleIcon, XCircleIcon,
    ArrowPathIcon, ClockIcon, UserMinusIcon,
} from '@heroicons/react/24/outline';

// ── Barra de progreso ─────────────────────────────────────────────────────────
const ProgressBar = ({ value }) => (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
            className="h-full rounded-full bg-brand-red transition-all duration-700"
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{label}</p>
            {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

// ── Préstamos vigentes (celda reutilizable, ahora es una lista) ──────────────
const PrestamosVigentesCell = ({ prestamos }) => {
    if (!prestamos || prestamos.length === 0) {
        return <span className="text-[9px] text-slate-300 font-bold uppercase">Sin préstamos</span>;
    }
    return (
        <div className="flex flex-col gap-1.5">
            {prestamos.map((p, idx) => (
                <div key={p.codigo_recaudo ?? idx} className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-700">
                            S/ {Number(p.monto).toFixed(2)}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase ${
                            p.tipo === 'grupal' ? 'bg-brand-gold/20 text-brand-gold' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {p.tipo === 'grupal' ? `Grupal · ${p.grupo ?? 'S/N'}` : 'Individual'}
                        </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light rounded-xl">
                        <UsersIcon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Accesos de Clientes</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Actividad en la plataforma</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <button onClick={refresh} disabled={loading}
                            className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl border border-slate-200 hover:border-brand-red/30 transition-all disabled:opacity-40">
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
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
                            <div className="w-8 h-8 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* ── Stats ── */}
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatBox
                                    label="Total Clientes"
                                    value={resumen.total ?? 0}
                                    icon={UsersIcon}
                                    color={{ bg: 'bg-slate-50', border: 'border-slate-100', icon: 'bg-slate-100 text-slate-500', text: 'text-slate-800' }}
                                />
                                <StatBox
                                    label="Ya ingresaron"
                                    value={resumen.con_acceso ?? 0}
                                    icon={CheckCircleIcon}
                                    sub={`${resumen.porcentaje ?? 0}% del total`}
                                    color={{ bg: 'bg-green-50', border: 'border-green-100', icon: 'bg-green-100 text-green-600', text: 'text-green-700' }}
                                />
                                <StatBox
                                    label="Nunca ingresaron"
                                    value={resumen.sin_acceso ?? 0}
                                    icon={XCircleIcon}
                                    sub={`${resumen.total ? (100 - resumen.porcentaje) : 0}% del total`}
                                    color={{ bg: 'bg-red-50', border: 'border-red-100', icon: 'bg-red-100 text-brand-red', text: 'text-brand-red' }}
                                />
                            </div>

                            {/* ── Barra adopción ── */}
                            <div className="px-6 pb-5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Adopción de la plataforma</span>
                                    <span className="text-[10px] font-black text-brand-red">{resumen.porcentaje ?? 0}%</span>
                                </div>
                                <ProgressBar value={resumen.porcentaje ?? 0} />
                            </div>

                            {/* ── Tabs ── */}
                            <div className="px-6 pb-3 border-t border-slate-50 pt-4">
                                <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-lg w-fit">
                                    <button onClick={() => setTab('recientes')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                            tab === 'recientes' ? 'bg-brand-red text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                        }`}>
                                        <ClockIcon className="w-3 h-3" />
                                        Últimos accesos
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-black">
                                            {recientes.total}
                                        </span>
                                    </button>
                                    <button onClick={() => setTab('nunca')}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                            tab === 'nunca' ? 'bg-brand-red text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
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
                                        <p className="text-center text-xs font-bold text-slate-300 uppercase py-8">Sin accesos registrados</p>
                                    ) : (
                                        <>
                                            <table className="w-full text-left border-collapse mb-4">
                                                <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Cliente</th>
                                                        <th className="px-3 py-2.5">DNI/RUC</th>
                                                        <th className="px-3 py-2.5">Primer acceso</th>
                                                        <th className="px-3 py-2.5">Último acceso</th>
                                                        <th className="px-3 py-2.5">Préstamos vigentes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {recientes.data.map((u, i) => (
                                                        <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                                            <td className="px-3 py-2.5">
                                                                <span className="text-[11px] font-black text-slate-700 uppercase">{u.nombre_completo}</span>
                                                                <span className="block text-[9px] text-slate-400 font-bold">@{u.username}</span>
                                                            </td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500">{u.documento ?? '—'}</td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-green-600">{u.primer_acceso}</td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500">{u.ultimo_acceso}</td>
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
                                        <p className="text-center text-xs font-bold text-slate-300 uppercase py-8">
                                            Todos los clientes ya ingresaron 🎉
                                        </p>
                                    ) : (
                                        <>
                                            <table className="w-full text-left border-collapse mb-4">
                                                <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-3 py-2.5">Cliente</th>
                                                        <th className="px-3 py-2.5">DNI/RUC</th>
                                                        <th className="px-3 py-2.5">Fecha registro</th>
                                                        <th className="px-3 py-2.5">Préstamos vigentes</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {nunca.data.map((u, i) => (
                                                        <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                                                            <td className="px-3 py-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red flex-shrink-0" />
                                                                    <div>
                                                                        <span className="text-[11px] font-black text-slate-700 uppercase">{u.nombre_completo}</span>
                                                                        <span className="block text-[9px] text-slate-400 font-bold">@{u.username}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500">{u.documento ?? '—'}</td>
                                                            <td className="px-3 py-2.5 text-[10px] font-bold text-slate-400">{u.registered}</td>
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