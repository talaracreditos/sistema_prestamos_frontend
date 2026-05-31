import React, { useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDashboardSaldoCapital } from 'hooks/Dashboard/useDashboardSaldoCapital';
import { exportSaldoCapitalDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { ChartBarIcon, MagnifyingGlassIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const fmt   = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
const DIAS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const ASESOR_COLORS = [
    { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    bar: 'bg-red-500'    },
    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   bar: 'bg-blue-500'   },
    { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  bar: 'bg-amber-500'  },
    { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  bar: 'bg-green-500'  },
    { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', bar: 'bg-purple-500' },
    { bg: 'bg-pink-100',   text: 'text-pink-700',   dot: 'bg-pink-500',   bar: 'bg-pink-500'   },
    { bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500',   bar: 'bg-teal-500'   },
    { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', bar: 'bg-orange-500' },
];

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

// ── Tooltip portal ────────────────────────────────────────────────────────────
const DayTooltip = ({ dia, eventos, asesorColorMap, anchorRect }) => {
    const desembolsos  = eventos?.desembolsos   ?? [];
    const pagos        = eventos?.pagos_capital ?? [];
    const totalDesemb  = desembolsos.reduce((s, d) => s + d.monto,   0);
    const totalCapital = pagos.reduce((s, p) => s + p.capital, 0);
    const TIP_W = 288;
    const left  = Math.min(anchorRect.left + anchorRect.width / 2 - TIP_W / 2, window.innerWidth - TIP_W - 8);
    const top   = anchorRect.top + window.scrollY - 8;
    const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

    return createPortal(
        <div style={{ position: 'absolute', top, left: Math.max(8, left), width: TIP_W, zIndex: 9999, transform: 'translateY(-100%)' }}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl p-3 text-left pointer-events-none">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{fmtDate(dia)}</p>
            {desembolsos.length > 0 && (
                <div className="mb-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Desembolsos — S/ {fmt(totalDesemb)}</p>
                    {desembolsos.map((d, i) => {
                        const color = asesorColorMap[d.asesor_id] ?? ASESOR_COLORS[0];
                        return (
                            <div key={i} className={`flex items-center justify-between px-2 py-1 rounded-lg mb-0.5 ${color.bg}`}>
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-[9px] font-black ${color.text} opacity-60`}>{d.prestamo_label}</span>
                                    <span className={`text-[10px] font-bold truncate ${color.text}`}>{d.cliente}</span>
                                </div>
                                <span className={`text-[10px] font-black ml-2 flex-shrink-0 ${color.text}`}>+S/ {fmt(d.monto)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
            {pagos.length > 0 && (
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital cobrado — S/ {fmt(totalCapital)}</p>
                    {pagos.map((p, i) => {
                        const color = asesorColorMap[p.asesor_id] ?? ASESOR_COLORS[0];
                        return (
                            <div key={i} className={`flex items-center justify-between px-2 py-1 rounded-lg mb-0.5 ${color.bg}`}>
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-[9px] font-black ${color.text} opacity-60`}>{p.prestamo_label} · C{p.numero_cuota}</span>
                                    <span className={`text-[10px] font-bold truncate ${color.text}`}>{p.cliente}</span>
                                </div>
                                <span className={`text-[9px] font-black ml-1 flex-shrink-0 ${color.text}`}>−S/ {fmt(p.capital)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>,
        document.body
    );
};

// ── Celda del día ─────────────────────────────────────────────────────────────
const DayCell = ({ fecha, eventos, asesorColorMap, esHoy, esMesActual }) => {
    const [anchorRect, setAnchorRect] = useState(null);
    const ref = useRef(null);
    const desembolsos  = eventos?.desembolsos   ?? [];
    const pagos        = eventos?.pagos_capital ?? [];
    const tieneEventos = desembolsos.length > 0 || pagos.length > 0;
    const totalDesemb  = desembolsos.reduce((s, d) => s + d.monto,   0);
    const totalCapital = pagos.reduce((s, p) => s + p.capital, 0);
    const asesoresPresentes = [...new Set([...desembolsos.map(d => d.asesor_id), ...pagos.map(p => p.asesor_id)])];
    const handleMouseEnter = useCallback(() => { if (!tieneEventos || !ref.current) return; setAnchorRect(ref.current.getBoundingClientRect()); }, [tieneEventos]);
    const handleMouseLeave = useCallback(() => setAnchorRect(null), []);

    return (
        <div ref={ref}
            className={`relative min-h-[72px] p-1.5 border border-slate-100 rounded-lg flex flex-col
                ${esMesActual ? 'bg-white' : 'bg-slate-50/50'}
                ${esHoy ? 'ring-2 ring-brand-red ring-offset-1' : ''}
                ${tieneEventos ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''}
            `}
            onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <span className={`text-[11px] font-black self-end leading-none mb-1 ${esHoy ? 'text-brand-red' : esMesActual ? 'text-slate-700' : 'text-slate-300'}`}>
                {new Date(fecha + 'T00:00:00').getDate()}
            </span>
            {asesoresPresentes.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mb-0.5">
                    {asesoresPresentes.slice(0, 4).map(aid => {
                        const color = asesorColorMap[aid] ?? ASESOR_COLORS[0];
                        return <div key={aid} className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />;
                    })}
                </div>
            )}
            {tieneEventos && (
                <div className="flex flex-col gap-0.5 mt-auto">
                    {totalDesemb  > 0 && <span className="text-[9px] font-black text-blue-600 leading-none truncate">↑ S/{fmt(totalDesemb)}</span>}
                    {totalCapital > 0 && <span className="text-[9px] font-black text-green-600 leading-none truncate">↓ S/{fmt(totalCapital)}</span>}
                </div>
            )}
            {anchorRect && tieneEventos && (
                <DayTooltip dia={fecha} eventos={eventos} asesorColorMap={asesorColorMap} anchorRect={anchorRect} />
            )}
        </div>
    );
};

// ── Calendario ────────────────────────────────────────────────────────────────
const Calendario = ({ eventos, asesorColorMap, onMesChange }) => {
    const hoy = new Date();
    const [mes, setMes] = useState({ year: hoy.getFullYear(), month: hoy.getMonth() });

    const cambiarMes = useCallback((nuevoMes) => {
        setMes(nuevoMes);
        onMesChange?.(nuevoMes);
    }, [onMesChange]);

    const diasDelMes = useMemo(() => {
        const result  = [];
        const primero = new Date(mes.year, mes.month, 1);
        const ultimo  = new Date(mes.year, mes.month + 1, 0);
        for (let i = 0; i < primero.getDay(); i++) {
            const d = new Date(mes.year, mes.month, -primero.getDay() + i + 1);
            result.push({ fecha: d.toISOString().split('T')[0], esMesActual: false });
        }
        for (let d = 1; d <= ultimo.getDate(); d++) {
            const fecha = `${mes.year}-${String(mes.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            result.push({ fecha, esMesActual: true });
        }
        const restantes = 42 - result.length;
        for (let i = 1; i <= restantes; i++) {
            const d = new Date(mes.year, mes.month + 1, i);
            result.push({ fecha: d.toISOString().split('T')[0], esMesActual: false });
        }
        return result;
    }, [mes]);

    const hoyStr = hoy.toISOString().split('T')[0];

    const totalesMes = useMemo(() => {
        let desemb = 0, capital = 0;
        diasDelMes.filter(d => d.esMesActual).forEach(({ fecha }) => {
            const ev = eventos[fecha];
            if (!ev) return;
            desemb  += (ev.desembolsos   ?? []).reduce((s, d) => s + d.monto,   0);
            capital += (ev.pagos_capital ?? []).reduce((s, p) => s + p.capital, 0);
        });
        return { desemb, capital };
    }, [diasDelMes, eventos]);

    const prevMes = () => cambiarMes(mes.month === 0  ? { year: mes.year - 1, month: 11 } : { ...mes, month: mes.month - 1 });
    const nextMes = () => cambiarMes(mes.month === 11 ? { year: mes.year + 1, month: 0  } : { ...mes, month: mes.month + 1 });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMes} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                </button>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{MESES[mes.month]} {mes.year}</p>
                    <div className="flex items-center justify-center gap-3 mt-0.5">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">↑ Desembolsos S/ {fmt(totalesMes.desemb)}</span>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">↓ Capital S/ {fmt(totalesMes.capital)}</span>
                    </div>
                </div>
                <button onClick={nextMes} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
                {DIAS.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {diasDelMes.map(({ fecha, esMesActual }) => (
                    <DayCell key={fecha} fecha={fecha} eventos={eventos[fecha]}
                        asesorColorMap={asesorColorMap} esHoy={fecha === hoyStr} esMesActual={esMesActual} />
                ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-blue-600">↑</span>
                    <span className="text-[9px] text-slate-500">Desembolso</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-green-600">↓</span>
                    <span className="text-[9px] text-slate-500">Capital cobrado</span>
                </div>
            </div>
        </div>
    );
};

// ── Chip de asesor ────────────────────────────────────────────────────────────
const AsesorChip = ({ asesor, color, desembolsadoMes, meta }) => {
    const pct      = meta > 0 ? Math.min(100, Math.round((desembolsadoMes / meta) * 100)) : null;
    const completa = pct !== null && pct >= 100;

    return (
        <div className={`flex flex-col gap-1.5 px-3 py-2 rounded-xl ${color.bg} min-w-[160px]`}>
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
                <p className={`text-[10px] font-black uppercase tracking-tight truncate ${color.text}`}>{asesor.nombre}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-black ${color.text}`}>↑ S/{fmt(desembolsadoMes)}</span>
                {meta > 0 && (
                    <span className={`text-[9px] font-black flex-shrink-0 ${completa ? 'text-green-600' : color.text}`}>
                        {completa ? '✓' : ''} {pct}% de S/{fmt(meta)}
                    </span>
                )}
            </div>
            {meta > 0 && (
                <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${completa ? 'bg-green-500' : color.bar}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
            {meta === 0 && (
                <span className={`text-[9px] ${color.text} opacity-50`}>Sin meta configurada</span>
            )}
        </div>
    );
};

// ── Card principal ─────────────────────────────────────────────────────────────
const SaldoCapitalCard = () => {
    const hoy = new Date();
    const {
        loading, data,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar,
    } = useDashboardSaldoCapital();

    const [collapsed,  setCollapsed]  = useState(false);
    const [comboKey,   setComboKey]   = useState(Date.now());
    const [mesVisible, setMesVisible] = useState({ year: hoy.getFullYear(), month: hoy.getMonth() });

    const eventos  = useMemo(() => data?.eventos  ?? {}, [data]);
    const asesores = useMemo(() => data?.asesores ?? [], [data]);
    const metas    = useMemo(() => data?.metas    ?? {}, [data]);

    const asesorColorMap = useMemo(() => {
        const map = {};
        asesores.forEach((a, i) => { map[a.asesor_id] = ASESOR_COLORS[i % ASESOR_COLORS.length]; });
        return map;
    }, [asesores]);

    // Desembolsado por asesor en el mes visible
    const desembolsadoMesPorAsesor = useMemo(() => {
        const map  = {};
        const year = mesVisible.year;
        const month = String(mesVisible.month + 1).padStart(2, '0');
        const prefix = `${year}-${month}-`;

        Object.entries(eventos).forEach(([fecha, ev]) => {
            if (!fecha.startsWith(prefix)) return;
            (ev.desembolsos ?? []).forEach(d => {
                map[d.asesor_id] = (map[d.asesor_id] ?? 0) + d.monto;
            });
        });
        return map;
    }, [eventos, mesVisible]);

    // Total desembolsado global del mes
    const totalDesembolsadoMes = useMemo(() =>
        Object.values(desembolsadoMesPorAsesor).reduce((s, v) => s + v, 0),
    [desembolsadoMesPorAsesor]);

    const totalMetaMes = useMemo(() =>
        asesores.reduce((s, a) => {
            const key = `${a.asesor_id}_${mesVisible.month + 1}_${mesVisible.year}`;
            return s + (metas[key] ?? 0);
        }, 0),
    [asesores, metas, mesVisible]);

    const exportFilters = {
        ...(asesoresSeleccionados.length > 0
            ? { asesor_ids: asesoresSeleccionados.map(a => a.id).join(',') }
            : {}),
    };

    const onLimpiar = () => { setComboKey(Date.now()); handleLimpiar(); };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-visible">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors rounded-t-2xl">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light rounded-xl">
                        <ChartBarIcon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Saldo Capital</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calendario de desembolsos y cobros de capital</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton exportService={exportSaldoCapitalDashboard} filters={exportFilters} filename="reporte_saldo_capital" label="Excel" disabled={loading} />
                    )}
                    <div className="cursor-pointer" onClick={() => setCollapsed(v => !v)}><Chevron collapsed={collapsed} /></div>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* Filtro asesor */}
                    <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Asesor</label>
                            <EmpleadoSearchSelect key={comboKey} rol="ASESOR" onSelect={handleAgregarAsesor} clearOnSelect={true} placeholder="Agregar asesor..." />
                        </div>
                        <button onClick={handleFiltrar} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark transition-all disabled:opacity-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        <button onClick={onLimpiar}
                            className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-brand-red text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:border-brand-red/30 transition-all">
                            <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                        </button>
                    </div>

                    {/* Tags asesores seleccionados */}
                    {asesoresSeleccionados.length > 0 && (
                        <div className="px-6 py-2 border-b border-slate-50 bg-white flex flex-wrap gap-2">
                            {asesoresSeleccionados.map((a, i) => {
                                const color = ASESOR_COLORS[i % ASESOR_COLORS.length];
                                return (
                                    <span key={a.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${color.bg} ${color.text}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                                        {a.nombre}
                                        <button onClick={() => handleQuitarAsesor(a.id)} className="hover:opacity-70">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Chips por asesor — desembolsos del mes visible vs meta */}
                    {asesores.length > 0 && (
                        <div className="px-6 py-3 border-b border-slate-50 bg-white flex flex-wrap gap-2">
                            {asesores.map((a, i) => {
                                const color        = ASESOR_COLORS[i % ASESOR_COLORS.length];
                                const desemb       = desembolsadoMesPorAsesor[a.asesor_id] ?? 0;
                                const metaKey      = `${a.asesor_id}_${mesVisible.month + 1}_${mesVisible.year}`;
                                const meta         = metas[metaKey] ?? 0;
                                return (
                                    <AsesorChip
                                        key={a.asesor_id}
                                        asesor={a}
                                        color={color}
                                        desembolsadoMes={desemb}
                                        meta={meta}
                                    />
                                );
                            })}

                            {/* Total global del mes */}
                            <div className="flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-slate-900 min-w-[160px]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Total {MESES[mesVisible.month]}
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-black text-white">↑ S/{fmt(totalDesembolsadoMes)}</span>
                                    {totalMetaMes > 0 && (
                                        <span className="text-[9px] font-black text-slate-300 flex-shrink-0">
                                            de S/{fmt(totalMetaMes)}
                                        </span>
                                    )}
                                </div>
                                {totalMetaMes > 0 && (
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-brand-gold transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.round((totalDesembolsadoMes / totalMetaMes) * 100))}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Calendario */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Calendario
                                eventos={eventos}
                                asesorColorMap={asesorColorMap}
                                onMesChange={setMesVisible}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SaldoCapitalCard;