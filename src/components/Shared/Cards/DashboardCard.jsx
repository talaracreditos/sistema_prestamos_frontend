import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    BanknotesIcon, CheckCircleIcon, CalendarDaysIcon,
    DocumentTextIcon, ChartBarIcon, ClockIcon,
    ExclamationTriangleIcon, MagnifyingGlassIcon, XMarkIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import Pagination from 'components/Shared/Pagination';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';

const ICONS = {
    'banknotes':    BanknotesIcon,
    'check-circle': CheckCircleIcon,
    'calendar':     CalendarDaysIcon,
    'document':     DocumentTextIcon,
    'chart':        ChartBarIcon,
    'clock':        ClockIcon,
    'warning':      ExclamationTriangleIcon,
    'exclamation':  ExclamationTriangleIcon,
    'briefcase':    BriefcaseIcon,
};

const CustomTooltip = ({ active, payload, label, moneyKey = 'total' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl text-xs">
            <p className="font-black text-slate-300 uppercase tracking-wider mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-bold">
                    {p.name === moneyKey
                        ? `S/ ${parseFloat(p.value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                        : `${p.value}`}
                </p>
            ))}
        </div>
    );
};

const fmtMoney = v => `S/ ${parseFloat(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

/**
 * Popup de desglose que aparece al hacer hover (desktop) o click/tap
 * (móvil) sobre una card "padre". `breakdown` = [{ label, valor, signo:
 * '+' | '-' }], en el orden que se quiere mostrar la fórmula. El total
 * (valor de la propia card) se muestra al final como resultado.
 */
const BreakdownPopup = ({ breakdown, total }) => (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-30 w-64 bg-slate-900 text-white rounded-xl shadow-2xl px-4 py-3 text-xs animate-in fade-in zoom-in-95 duration-150">
        <p className="font-black text-slate-300 uppercase tracking-wider mb-2 text-[10px]">Cómo se compone</p>
        <div className="space-y-1">
            {breakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">{b.signo === '-' ? '−' : '+'} {b.label}</span>
                    <span className="font-black">{fmtMoney(b.valor)}</span>
                </div>
            ))}
        </div>
        <div className="border-t border-white/10 mt-2 pt-2 flex items-center justify-between">
            <span className="font-black uppercase text-[10px] tracking-wider text-brand-gold">Total</span>
            <span className="font-black text-brand-gold">{fmtMoney(total)}</span>
        </div>
        {/* Flechita apuntando hacia abajo */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 bg-slate-900 rotate-45 -mt-1.5" />
    </div>
);

// ── StatRow: hover (desktop) + click/tap (móvil) para mostrar el popup ─────
const StatRow = ({ label, valor, tipo, icon, alerta = false, breakdown = null }) => {
    const [showPopup, setShowPopup] = useState(false);
    const containerRef = useRef(null);
    const Icon = ICONS[icon] || BanknotesIcon;
    const formatted = tipo === 'monto'
        ? fmtMoney(valor)
        : tipo === 'fecha' ? (valor ?? 'N/A') : (valor?.toLocaleString() ?? '0');

    // Cierra el popup al tocar fuera de la card (necesario para el modo click/tap)
    useEffect(() => {
        if (!showPopup) return;
        const handleOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowPopup(false);
            }
        };
        document.addEventListener('touchstart', handleOutside);
        document.addEventListener('mousedown', handleOutside);
        return () => {
            document.removeEventListener('touchstart', handleOutside);
            document.removeEventListener('mousedown', handleOutside);
        };
    }, [showPopup]);

    const handleClick = () => {
        if (!breakdown) return;
        setShowPopup(v => !v);
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => breakdown && setShowPopup(true)}
            onMouseLeave={() => breakdown && setShowPopup(false)}
            onClick={handleClick}
            className={`relative flex items-center gap-4 bg-white rounded-2xl border px-5 py-4 shadow-sm transition-all
                ${alerta ? 'border-brand-red/30 bg-brand-red-light/20' : 'border-slate-100'}
                ${breakdown ? 'cursor-help hover:shadow-md hover:border-brand-red/20 active:scale-[0.98]' : 'hover:shadow-md'}`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${alerta ? 'bg-brand-red text-white' : 'bg-brand-red-light text-brand-red'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className={`text-2xl font-black tracking-tight leading-none ${alerta ? 'text-brand-red' : 'text-slate-900'}`}>{formatted}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
            {alerta && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-red animate-pulse" />}
            {breakdown && (
                <span className="absolute top-3 right-3 text-slate-300 text-[10px] font-black select-none">ⓘ</span>
            )}

            {breakdown && showPopup && (
                <BreakdownPopup breakdown={breakdown} total={valor} />
            )}
        </div>
    );
};

const TablaLista = ({ paginationData, renderFila, onPageChange, emptyText = 'Sin datos' }) => {
    const data = paginationData?.data ?? [];
    if (!data.length) return (
        <div className="flex items-center justify-center h-32 text-slate-300 text-xs font-bold uppercase tracking-widest">
            {emptyText}
        </div>
    );
    return (
        <div className="flex flex-col gap-2">
            {data.map((item, i) => (
                <React.Fragment key={item.id ?? i}>{renderFila(item)}</React.Fragment>
            ))}
            <Pagination
                currentPage={paginationData?.current_page}
                totalPages={paginationData?.last_page}
                onPageChange={onPageChange}
            />
        </div>
    );
};

const GraficaArea = ({ data, xKey, dataKey = 'total', label, color = '#8B1A1A', height = 200 }) => (
    <div>
        {label && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>}
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                    <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `S/${v}`} />
                <Tooltip content={<CustomTooltip moneyKey={dataKey} />} />
                <Area type="monotone" dataKey={dataKey} name={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad_${dataKey})`} dot={{ r: 2, fill: color }} activeDot={{ r: 4 }} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const GraficaBarra = ({ data, xKey, dataKey = 'total', label, color = '#8B1A1A', isMoney = true, height = 180 }) => (
    <div>
        {label && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>}
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false}
                    tickFormatter={isMoney ? v => `S/${v}` : undefined} allowDecimals={false} />
                <Tooltip content={<CustomTooltip moneyKey={isMoney ? dataKey : '__none__'} />} />
                <Bar dataKey={dataKey} name={dataKey} fill={color} radius={[5, 5, 0, 0]} maxBarSize={36} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

/**
 * Enriquece las cards con `breakdown` cuando corresponda a un grupo
 * configurado en `groups`. groups = [{ parent: [keywords], children:
 * [{ keywords: [...], signo: '+'|'-' }] }]. Matching por substring
 * case-insensitive contra card.label. Cada card busca el primer grupo
 * cuyo `parent` matchee — asegúrate de que las keywords de distintos
 * grupos no se solapen (ej. usa 'capital cobrado hoy' en vez de 'capital
 * cobrado' si existe también 'Capital Cobrado al Mes').
 */
const enrichCardsWithBreakdown = (cards, groups) => {
    if (!groups?.length) return cards;

    return cards.map(card => {
        const grupo = groups.find(g =>
            g.parent.some(kw => card.label?.toLowerCase().includes(kw.toLowerCase()))
        );
        if (!grupo) return card;

        const breakdown = grupo.children
            .map(child => {
                const found = cards.find(c =>
                    c !== card && child.keywords.some(kw => c.label?.toLowerCase().includes(kw.toLowerCase()))
                );
                return found ? { label: found.label, valor: found.valor, signo: child.signo ?? '+' } : null;
            })
            .filter(Boolean);

        return breakdown.length > 0 ? { ...card, breakdown } : card;
    });
};

const DashboardCard = ({
    title, subtitle, icon = 'banknotes', loading = false,
    cards = [], graficas = [], tabs, tabActivo,
    conFiltros = false,
    fechaInicio = '', setFechaInicio,
    fechaFin    = '', setFechaFin,
    onFiltrar, onLimpiar,
    tablas = {}, extraContent = {}, cardsPorTab = {},
    exportService = null, exportFilename = 'reporte', exportLabel = 'Excel',
    cardGroups = [],
}) => {
    const Icon        = ICONS[icon] || BanknotesIcon;
    const tabsFinales = tabs ?? [{ id: 'cards', label: 'Resumen' }];

    const primerTab = tabsFinales[0]?.id ?? 'cards';
    const [tab,       setTab]       = useState(tabActivo ?? primerTab);
    const [collapsed, setCollapsed] = useState(false);

    const tieneRango     = fechaInicio || fechaFin;
    const graficasDelTab = graficas.filter(g => !g.tab || g.tab === tab);
    const tablaActual    = tablas[tab];

    const getCardsActuales = () => {
        const tieneCardsPorTab = Object.keys(cardsPorTab).length > 0;
        if (tieneCardsPorTab) return cardsPorTab[tab] ?? [];
        if (tab === primerTab) return cards;
        return [];
    };
    const cardsActuales = getCardsActuales();

    // Breakdown SOLO se aplica en el tab Resumen (primerTab)
    const esTabResumen = tab === primerTab;
    const cardsConBreakdown = useMemo(
        () => esTabResumen ? enrichCardsWithBreakdown(cardsActuales, cardGroups) : cardsActuales,
        [cardsActuales, cardGroups, esTabResumen]
    );

    const exportFilters = {
        ...(fechaInicio ? { fecha_inicio: fechaInicio } : {}),
        ...(fechaFin    ? { fecha_fin:    fechaFin    } : {}),
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light rounded-xl flex-shrink-0">
                        <Icon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{title}</h2>
                        {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {exportService && !collapsed && (
                        <ExcelExportButton
                            exportService={exportService}
                            filters={exportFilters}
                            filename={exportFilename}
                            label={exportLabel}
                            disabled={loading}
                        />
                    )}
                    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 cursor-pointer transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                        onClick={() => setCollapsed(v => !v)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {!collapsed && tabsFinales.length > 1 && (
                <div className="px-4 py-2 border-b border-slate-100 overflow-x-auto scrollbar-none">
                    <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-lg w-fit">
                        {tabsFinales.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    tab === t.id ? 'bg-brand-red text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                }`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filtros */}
            {!collapsed && conFiltros && (
                <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Desde</label>
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio?.(e.target.value)}
                            className="p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hasta</label>
                        <input type="date" value={fechaFin} onChange={e => setFechaFin?.(e.target.value)}
                            className="p-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                    </div>
                    <button onClick={onFiltrar} disabled={loading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark transition-all disabled:opacity-50">
                        <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                    </button>
                    {tieneRango && (
                        <button onClick={onLimpiar}
                            className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-brand-red text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:border-brand-red/30 transition-all">
                            <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                        </button>
                    )}
                    {tieneRango && (
                        <span className="text-[9px] font-black text-brand-red uppercase tracking-widest bg-brand-red-light px-2 py-1 rounded-lg border border-brand-red/20">
                            Rango personalizado
                        </span>
                    )}
                </div>
            )}

            {/* Contenido */}
            {!collapsed && (
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-8 h-8 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Cards */}
                            {cardsConBreakdown.length > 0 && (
                                <div className={`grid gap-3 ${cardsConBreakdown.length > 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                                    {cardsConBreakdown.map((card, i) => <StatRow key={i} {...card} />)}
                                </div>
                            )}

                            {/* Tabla paginada */}
                            {tablaActual && (
                                <TablaLista
                                    paginationData={tablaActual.data}
                                    renderFila={tablaActual.renderFila}
                                    onPageChange={tablaActual.onPageChange}
                                    emptyText={tablaActual.emptyText}
                                />
                            )}

                            {/* JSX libre */}
                            {!tablaActual && extraContent[tab] && (
                                <div>{extraContent[tab]}</div>
                            )}

                            {/* Sin datos */}
                            {graficasDelTab.length === 0 && tab !== primerTab && tab !== 'cards' && tab !== 'resumen' && !tablaActual && !extraContent[tab] && cardsConBreakdown.length === 0 && (
                                <div className="flex items-center justify-center h-40 text-slate-300 text-xs font-bold uppercase tracking-widest">
                                    Sin datos en este período
                                </div>
                            )}

                            {/* Gráficas */}
                            {graficasDelTab.map((g, i) => (
                                g.tipo === 'area'
                                    ? <GraficaArea key={i} data={g.data} xKey={g.xKey} dataKey={g.dataKey} label={g.label} color={g.color} height={g.height} />
                                    : <GraficaBarra key={i} data={g.data} xKey={g.xKey} dataKey={g.dataKey} label={g.label} color={g.color} isMoney={g.isMoney} height={g.height} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export { StatRow, GraficaArea, GraficaBarra, CustomTooltip, TablaLista };
export default DashboardCard;