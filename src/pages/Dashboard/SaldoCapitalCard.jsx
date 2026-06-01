import React, { useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDashboardSaldoCapital } from 'hooks/Dashboard/useDashboardSaldoCapital';
import { exportSaldoCapitalDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import {
    ChartBarIcon, MagnifyingGlassIcon, XMarkIcon,
    ChevronLeftIcon, ChevronRightIcon, ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const fmt    = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
const fmtVar = n => { const v = parseFloat(n || 0); return (v >= 0 ? '+' : '') + v.toLocaleString('es-PE', { minimumFractionDigits: 2 }); };
const DIAS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

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
            className={`relative min-h-[72px] p-1.5 border rounded-lg flex flex-col
                ${esMesActual ? 'bg-white border-slate-100' : 'bg-slate-200/90 border-slate-300/60 opacity-40'}
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
const AsesorChip = ({ asesor, color, mesVisible, metas }) => {
    const metaKey  = `${asesor.asesor_id}_${mesVisible.month + 1}_${mesVisible.year}`;
    const meta     = metas[metaKey] ?? 0;
    const desemb   = asesor.desembolsos ?? 0;
    const pct      = meta > 0 ? Math.min(100, Math.round((desemb / meta) * 100)) : null;
    const completa = pct !== null && pct >= 100;

    return (
        <div className={`flex flex-col gap-1.5 px-3 py-2 rounded-xl ${color.bg} min-w-[160px]`}>
            <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
                <p className={`text-[10px] font-black uppercase tracking-tight truncate ${color.text}`}>{asesor.nombre}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-black ${color.text}`}>↑ S/{fmt(desemb)}</span>
                {meta > 0 && (
                    <span className={`text-[9px] font-black flex-shrink-0 ${completa ? 'text-green-600' : color.text}`}>
                        {completa ? '✓ ' : ''}{pct}% de S/{fmt(meta)}
                    </span>
                )}
            </div>
            {meta > 0 && (
                <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${completa ? 'bg-green-500' : color.bar}`}
                        style={{ width: `${pct}%` }} />
                </div>
            )}
            {meta === 0 && <span className={`text-[9px] ${color.text} opacity-50`}>Sin meta configurada</span>}
        </div>
    );
};

// ── Tarjeta de saldo ──────────────────────────────────────────────────────────
// isDark=true  → fondo oscuro (saldo global)
// isDark=false → fondo colorido (por asesor)
const SaldoCard = ({ label, inicial, actual, variacion, desembolsos, capital, color, isDark = false }) => {
    const varPositiva   = parseFloat(variacion) >= 0;
    const subLabelColor = isDark ? 'text-slate-500'  : 'text-slate-400';
    const valueColor    = isDark ? 'text-white'       : (color?.text ?? 'text-slate-900');
    const labelColor    = isDark ? 'text-slate-400'   : (color?.text ?? 'text-slate-500');
    const dividerColor  = isDark ? 'border-white/10'  : 'border-slate-200/60';
    const footerDesemb  = isDark ? 'text-blue-400'    : 'text-blue-600';
    const footerCap     = isDark ? 'text-emerald-400' : 'text-emerald-600';

    return (
        <div className={`flex flex-col px-4 py-3 rounded-2xl border w-full
            ${color?.border ?? 'border-slate-100'}
            ${color?.bg     ?? 'bg-white'}
        `}>
            {/* Nombre asesor */}
            {label && (
                <div className="flex items-center gap-1.5 mb-3">
                    {color?.dot && <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />}
                    <p className={`text-[10px] font-black uppercase tracking-widest truncate ${labelColor}`}>{label}</p>
                </div>
            )}

            {/* Métricas apiladas verticalmente — label a la izquierda, valor a la derecha */}
            <div className="flex flex-col gap-2">
                {/* Inicial */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${subLabelColor}`}>Inicial</span>
                    <span className={`text-sm font-black ${valueColor}`}>S/ {fmt(inicial)}</span>
                </div>
                {/* Separador */}
                <div className={`h-px ${dividerColor} bg-current opacity-20`} />
                {/* Actual */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${subLabelColor}`}>Actual</span>
                    <span className={`text-sm font-black ${valueColor}`}>S/ {fmt(actual)}</span>
                </div>
                {/* Separador */}
                <div className={`h-px ${dividerColor} bg-current opacity-20`} />
                {/* Variación */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${subLabelColor}`}>Variación</span>
                    <span className={`text-sm font-black flex items-center gap-1 ${varPositiva ? 'text-emerald-400' : 'text-red-400'}`}>
                        {varPositiva
                            ? <ArrowTrendingUpIcon   className="w-3.5 h-3.5 flex-shrink-0" />
                            : <ArrowTrendingDownIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                        S/ {fmtVar(variacion)}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-3 pt-2 border-t ${dividerColor}`}>
                <span className={`text-[9px] font-black whitespace-nowrap ${footerDesemb}`}>↑ Desemb. S/{fmt(desembolsos)}</span>
                <span className={`text-[9px] font-black whitespace-nowrap ${footerCap}`}>↓ Capital S/{fmt(capital)}</span>
            </div>
        </div>
    );
};

// ── Selector de meses ─────────────────────────────────────────────────────────
// El loop va de -36 a +6 relativo al mes actual, por lo que en 2027, 2028, etc.
// los botones se generan automáticamente sin cambiar nada.
// Calculado una sola vez al cargar el módulo — no cambia durante la sesión
const _HOY_MES_REF = new Date();
const _ITEMS_MESES = (() => {
    const arr = [];
    for (let i = -36; i <= 6; i++) {
        const d = new Date(_HOY_MES_REF.getFullYear(), _HOY_MES_REF.getMonth() + i, 1);
        arr.push({ mes: d.getMonth() + 1, anio: d.getFullYear() });
    }
    return arr;
})();

const MesSelector = ({ mesesSeleccionados, onToggle }) => {
    const isSelected = ({ mes, anio }) =>
        mesesSeleccionados.some(m => m.mes === mes && m.anio === anio);

    return (
        <div className="flex flex-col gap-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Rango de meses</label>
            <div className="flex flex-wrap gap-1 max-w-lg">
                {_ITEMS_MESES.map(({ mes, anio }) => {
                    const sel = isSelected({ mes, anio });
                    return (
                        <button
                            key={`${anio}-${mes}`}
                            onClick={() => onToggle({ mes, anio })}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all
                                ${sel
                                    ? 'bg-brand-red text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            {MESES_CORTO[mes - 1]} {anio}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ── Card principal ─────────────────────────────────────────────────────────────
const SaldoCapitalCard = () => {
    const hoy = new Date();
    const {
        loading, data,
        asesoresSeleccionados,
        mesesSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleToggleMes, handleQuitarMes,
        handleFiltrar, handleLimpiar,
    } = useDashboardSaldoCapital();

    const [collapsed,  setCollapsed]  = useState(false);
    const [comboKey,   setComboKey]   = useState(Date.now());
    const [mesVisible, setMesVisible] = useState({ year: hoy.getFullYear(), month: hoy.getMonth() });

    const eventos  = useMemo(() => data?.eventos  ?? {}, [data]);
    const asesores = useMemo(() => data?.asesores ?? [], [data]);
    const metas    = useMemo(() => data?.metas    ?? {}, [data]);
    const saldo    = useMemo(() => data?.saldo    ?? { inicial: 0, actual: 0, variacion: 0, desembolsos: 0, capital: 0 }, [data]);

    const asesorColorMap = useMemo(() => {
        const map = {};
        asesores.forEach((a, i) => { map[a.asesor_id] = ASESOR_COLORS[i % ASESOR_COLORS.length]; });
        return map;
    }, [asesores]);

    const desembolsadoMesPorAsesor = useMemo(() => {
        const map    = {};
        const year   = mesVisible.year;
        const month  = String(mesVisible.month + 1).padStart(2, '0');
        const prefix = `${year}-${month}-`;
        Object.entries(eventos).forEach(([fecha, ev]) => {
            if (!fecha.startsWith(prefix)) return;
            (ev.desembolsos ?? []).forEach(d => {
                map[d.asesor_id] = (map[d.asesor_id] ?? 0) + d.monto;
            });
        });
        return map;
    }, [eventos, mesVisible]);

    const totalDesembolsadoMes = useMemo(() =>
        Object.values(desembolsadoMesPorAsesor).reduce((s, v) => s + v, 0),
    [desembolsadoMesPorAsesor]);

    const totalMetaMes = useMemo(() =>
        asesores.reduce((s, a) => {
            const key = `${a.asesor_id}_${mesVisible.month + 1}_${mesVisible.year}`;
            return s + (metas[key] ?? 0);
        }, 0),
    [asesores, metas, mesVisible]);

    const asesoresConDesembolso = useMemo(() =>
        asesores.map(a => ({ ...a, desembolsos: desembolsadoMesPorAsesor[a.asesor_id] ?? 0 })),
    [asesores, desembolsadoMesPorAsesor]);

    const tieneFiltroMeses       = mesesSeleccionados.length > 0;
    const tieneAsesoresFiltrados = asesoresSeleccionados.length > 0;

    const exportFilters = {
        ...(tieneAsesoresFiltrados ? { asesor_ids: asesoresSeleccionados.map(a => a.id).join(',') } : {}),
        ...(tieneFiltroMeses       ? { meses: JSON.stringify(mesesSeleccionados) }                  : {}),
    };

    const onLimpiar = () => { setComboKey(Date.now()); handleLimpiar(); };

    const labelRangoMeses = tieneFiltroMeses
        ? [...mesesSeleccionados]
            .sort((a, b) => a.anio * 100 + a.mes - (b.anio * 100 + b.mes))
            .map(m => `${MESES_CORTO[m.mes - 1]} ${m.anio}`)
            .join(', ')
        : null;

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
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Calendario de desembolsos y cobros de capital
                            {labelRangoMeses && <span className="ml-1 text-brand-red">· {labelRangoMeses}</span>}
                        </p>
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
                    {/* Filtros */}
                    <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-end gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Asesor</label>
                            <EmpleadoSearchSelect key={comboKey} rol="ASESOR" onSelect={handleAgregarAsesor} clearOnSelect={true} placeholder="Agregar asesor..." />
                        </div>
                        <MesSelector mesesSeleccionados={mesesSeleccionados} onToggle={handleToggleMes} />
                        <div className="flex items-end gap-2">
                            <button onClick={handleFiltrar} disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark transition-all disabled:opacity-50">
                                <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                            </button>
                            <button onClick={onLimpiar}
                                className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-brand-red text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:border-brand-red/30 transition-all">
                                <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Tags asesores */}
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

                    {/* Tags meses */}
                    {mesesSeleccionados.length > 0 && (
                        <div className="px-6 py-2 border-b border-slate-50 bg-white flex flex-wrap gap-2 items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rango:</span>
                            {[...mesesSeleccionados]
                                .sort((a, b) => a.anio * 100 + a.mes - (b.anio * 100 + b.mes))
                                .map(m => (
                                    <span key={`${m.anio}-${m.mes}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-brand-red/10 text-brand-red">
                                        {MESES_CORTO[m.mes - 1]} {m.anio}
                                        <button onClick={() => handleQuitarMes(m)} className="hover:opacity-70">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                        </div>
                    )}

                    {/* ── Saldo global ───────────────────────────────────────── */}
                    {!loading && (
                        <div className="px-6 py-4 border-b border-slate-50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Saldo global {tieneFiltroMeses ? `· ${labelRangoMeses}` : '(total cartera)'}
                            </p>
                            <SaldoCard
                                inicial={saldo.inicial}
                                actual={saldo.actual}
                                variacion={saldo.variacion}
                                desembolsos={saldo.desembolsos}
                                capital={saldo.capital}
                                color={{ bg: 'bg-slate-900', border: 'border-slate-700' }}
                                isDark
                            />
                        </div>
                    )}

                    {/* ── Saldo por asesor ───────────────────────────────────── */}
                    {!loading && asesores.length > 0 && (
                        <div className="px-6 py-4 border-b border-slate-50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Saldo por asesor {tieneFiltroMeses ? `· ${labelRangoMeses}` : '(total cartera)'}
                            </p>
                            {/*
                                1 col  < 640px
                                2 cols 640–1023px
                                3 cols 1024–1279px
                                4 cols ≥ 1280px
                            */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {asesores.map((a, i) => {
                                    const color = ASESOR_COLORS[i % ASESOR_COLORS.length];
                                    return (
                                        <SaldoCard
                                            key={a.asesor_id}
                                            label={a.nombre}
                                            inicial={a.saldo_inicial}
                                            actual={a.saldo_actual}
                                            variacion={a.variacion}
                                            desembolsos={a.desembolsos}
                                            capital={a.capital}
                                            color={{ ...color, border: 'border-slate-100' }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Chips meta ─────────────────────────────────────────── */}
                    {asesores.length > 0 && (
                        <div className="px-6 py-3 border-b border-slate-50 bg-white flex flex-wrap gap-2">
                            {asesoresConDesembolso.map((a, i) => {
                                const color = ASESOR_COLORS[i % ASESOR_COLORS.length];
                                return (
                                    <AsesorChip
                                        key={a.asesor_id}
                                        asesor={a}
                                        color={color}
                                        mesVisible={mesVisible}
                                        metas={metas}
                                    />
                                );
                            })}
                            <div className="flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-slate-900 min-w-[160px]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    Total {MESES[mesVisible.month]}
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-black text-white">↑ S/{fmt(totalDesembolsadoMes)}</span>
                                    {totalMetaMes > 0 && (
                                        <span className="text-[9px] font-black text-slate-300 flex-shrink-0">de S/{fmt(totalMetaMes)}</span>
                                    )}
                                </div>
                                {totalMetaMes > 0 && (
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-brand-gold transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.round((totalDesembolsadoMes / totalMetaMes) * 100))}%` }} />
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