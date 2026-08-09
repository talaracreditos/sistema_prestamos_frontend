import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDashboardDesembolsoCapital } from 'hooks/Dashboard/useDashboardDesembolsoCapital';
import { exportDesembolsoCapitalDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import {
    CalendarDaysIcon, MagnifyingGlassIcon, XMarkIcon,
    ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';

const fmt  = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
const DIAS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const ASESOR_COLORS = [
    { bg: 'bg-red-100 dark:bg-red-500/20',       text: 'text-red-700 dark:text-red-300',       dot: 'bg-red-500 dark:bg-red-400' },
    { bg: 'bg-blue-100 dark:bg-blue-500/20',     text: 'text-blue-700 dark:text-blue-300',     dot: 'bg-blue-500 dark:bg-blue-400' },
    { bg: 'bg-amber-100 dark:bg-amber-500/20',   text: 'text-amber-700 dark:text-amber-300',   dot: 'bg-amber-500 dark:bg-amber-400' },
    { bg: 'bg-green-100 dark:bg-green-500/20',   text: 'text-green-700 dark:text-green-300',   dot: 'bg-green-500 dark:bg-green-400' },
    { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500 dark:bg-purple-400' },
    { bg: 'bg-pink-100 dark:bg-pink-500/20',     text: 'text-pink-700 dark:text-pink-300',     dot: 'bg-pink-500 dark:bg-pink-400' },
    { bg: 'bg-teal-100 dark:bg-teal-500/20',     text: 'text-teal-700 dark:text-teal-300',     dot: 'bg-teal-500 dark:bg-teal-400' },
    { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500 dark:bg-orange-400' },
];

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

// ── Popup del día — con scroll interno y cierre al click fuera ────────────────
const DayTooltip = ({ dia, eventos, asesorColorMap, anchorRect, onClose }) => {
    const popupRef     = useRef(null);
    const desembolsos  = eventos?.desembolsos    ?? [];
    const pagos        = eventos?.pagos_capital ?? [];
    const totalDesemb  = desembolsos.reduce((s, d) => s + d.monto,   0);
    const totalCapital = pagos.reduce((s, p) => s + p.capital, 0);

    const TIP_W  = 300;
    const MAX_H  = 380;
    const left   = Math.min(anchorRect.left + anchorRect.width / 2 - TIP_W / 2, window.innerWidth - TIP_W - 8);

    const espacioArriba = anchorRect.top;
    const abrirAbajo    = espacioArriba < MAX_H + 16;
    const top = abrirAbajo
        ? anchorRect.bottom + window.scrollY + 8
        : anchorRect.top + window.scrollY - 8;

    const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return createPortal(
        <div ref={popupRef}
            style={{
                position: 'absolute',
                top,
                left: Math.max(8, left),
                width: TIP_W,
                zIndex: 9999,
                transform: abrirAbajo ? 'none' : 'translateY(-100%)',
            }}
            className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl shadow-2xl dark:shadow-black/40 text-left flex flex-col overflow-hidden transition-colors"
        >
            {/* Header fijo */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-slate-100 dark:border-dark-border flex-shrink-0">
                <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">{fmtDate(dia)}</p>
                <button onClick={onClose} className="p-0.5 text-slate-300 dark:text-dark-text-muted/60 hover:text-brand-red dark:hover:text-brand-gold transition-colors">
                    <XMarkIcon className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto px-3 pb-3" style={{ maxHeight: MAX_H }}>
                {desembolsos.length > 0 && (
                    <div className="mb-2">
                        <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest sticky top-0 z-10 bg-white dark:bg-dark-surface pt-2 pb-1 -mx-3 px-3">
                            Desembolsos — S/ {fmt(totalDesemb)} ({desembolsos.length})
                        </p>
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
                        <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest sticky top-0 z-10 bg-white dark:bg-dark-surface pt-2 pb-1 -mx-3 px-3">
                            Capital cobrado — S/ {fmt(totalCapital)} ({pagos.length})
                        </p>
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
            </div>
        </div>,
        document.body
    );
};

// ── Celda del día ─────────────────────────────────────────────────────────────
const DayCell = ({ fecha, eventos, asesorColorMap, esHoy, esMesActual, abierto, onToggle }) => {
    const ref = useRef(null);
    const desembolsos  = eventos?.desembolsos    ?? [];
    const pagos        = eventos?.pagos_capital ?? [];
    const tieneEventos = desembolsos.length > 0 || pagos.length > 0;
    const totalDesemb  = desembolsos.reduce((s, d) => s + d.monto,   0);
    const totalCapital = pagos.reduce((s, p) => s + p.capital, 0);
    const asesoresPresentes = [...new Set([...desembolsos.map(d => d.asesor_id), ...pagos.map(p => p.asesor_id)])];

    const handleClick = useCallback(() => {
        if (!tieneEventos || !ref.current) return;
        onToggle(fecha, ref.current.getBoundingClientRect());
    }, [tieneEventos, fecha, onToggle]);

    return (
        <div ref={ref}
            className={`relative min-h-[72px] p-1.5 border rounded-lg flex flex-col transition-colors
                ${esMesActual ? 'bg-white dark:bg-dark-surface border-slate-100 dark:border-dark-border' : 'bg-slate-200/90 dark:bg-dark-surface-alt/50 border-slate-300/60 dark:border-dark-border opacity-40'}
                ${esHoy ? 'ring-2 ring-brand-red dark:ring-brand-gold ring-offset-1 dark:ring-offset-dark-surface' : ''}
                ${tieneEventos ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-500' : ''}
                ${abierto ? 'border-brand-red/50 dark:border-brand-gold/50 shadow-md' : ''}
            `}
            onClick={handleClick}>
            <span className={`text-base font-black self-end leading-none mb-1 ${esHoy ? 'text-brand-red dark:text-brand-gold' : esMesActual ? 'text-slate-700 dark:text-dark-text' : 'text-slate-300 dark:text-dark-text-muted/60'}`}>
                {new Date(fecha + 'T00:00:00').getDate()}
            </span>
            {tieneEventos && asesoresPresentes.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mb-0.5">
                    {asesoresPresentes.slice(0, 4).map(aid => {
                        const color = asesorColorMap[aid] ?? ASESOR_COLORS[0];
                        return <div key={aid} className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />;
                    })}
                </div>
            )}
            {tieneEventos && (
                <div className="flex flex-col gap-0.5 mt-auto">
                    {totalDesemb  > 0 && <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 leading-none truncate">↑ S/{fmt(totalDesemb)}</span>}
                    {totalCapital > 0 && <span className="text-[11px] font-black text-green-600 dark:text-green-400 leading-none truncate">↓ S/{fmt(totalCapital)}</span>}
                </div>
            )}
        </div>
    );
};

// ── Calendario ────────────────────────────────────────────────────────────────
const Calendario = ({ eventos, asesorColorMap, mes, anio, onMesChange }) => {
    const hoy = new Date();
    const [popupAbierto, setPopupAbierto] = useState(null);

    const handleToggleDia = useCallback((fecha, rect) => {
        setPopupAbierto(prev => prev?.fecha === fecha ? null : { fecha, rect });
    }, []);

    const cerrarPopup = useCallback(() => setPopupAbierto(null), []);

    const prevMes = () => {
        cerrarPopup();
        onMesChange(mes === 1 ? { mes: 12, anio: anio - 1 } : { mes: mes - 1, anio });
    };
    const nextMes = () => {
        cerrarPopup();
        onMesChange(mes === 12 ? { mes: 1, anio: anio + 1 } : { mes: mes + 1, anio });
    };

    const diasDelMes = useMemo(() => {
        const result  = [];
        const primero = new Date(anio, mes - 1, 1);
        const ultimo  = new Date(anio, mes, 0);
        for (let i = 0; i < primero.getDay(); i++) {
            const d = new Date(anio, mes - 1, -primero.getDay() + i + 1);
            const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            result.push({ fecha: dStr, esMesActual: false });
        }
        for (let d = 1; d <= ultimo.getDate(); d++) {
            const fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            result.push({ fecha, esMesActual: true });
        }
        const restantes = 42 - result.length;
        for (let i = 1; i <= restantes; i++) {
            const d = new Date(anio, mes, i);
            const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            result.push({ fecha: dStr, esMesActual: false });
        }
        return result;
    }, [mes, anio]);

    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMes} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-surface-alt transition-colors">
                    <ChevronLeftIcon className="w-4 h-4 text-slate-500 dark:text-dark-text-muted" />
                </button>
                <p className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">
                    {MESES[mes - 1]} {anio}
                </p>
                <button onClick={nextMes} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-surface-alt transition-colors">
                    <ChevronRightIcon className="w-4 h-4 text-slate-500 dark:text-dark-text-muted" />
                </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
                {DIAS.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {diasDelMes.map(({ fecha, esMesActual }) => (
                    <DayCell
                        key={fecha}
                        fecha={fecha}
                        eventos={eventos[fecha]}
                        asesorColorMap={asesorColorMap}
                        esHoy={fecha === hoyStr}
                        esMesActual={esMesActual}
                        abierto={popupAbierto?.fecha === fecha}
                        onToggle={handleToggleDia}
                    />
                ))}
            </div>

            {popupAbierto && eventos[popupAbierto.fecha] && (
                <DayTooltip
                    dia={popupAbierto.fecha}
                    eventos={eventos[popupAbierto.fecha]}
                    asesorColorMap={asesorColorMap}
                    anchorRect={popupAbierto.rect}
                    onClose={cerrarPopup}
                />
            )}

            <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-dark-border">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">↑</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted">Desembolso</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-green-600 dark:text-green-400">↓</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted">Capital cobrado</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted/70">Click en un día para ver el detalle</span>
                </div>
            </div>
        </div>
    );
};

// ── Chip de asesor ────────────────────────────────────────────────────────────
const AsesorChip = ({ nombre, color, desembolsos, capital }) => (
    <div className={`flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl ${color.bg} min-w-[180px]`}>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
            <p className={`text-[11px] font-black uppercase tracking-tight truncate ${color.text}`}>{nombre}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
            <span className={`text-xs font-black ${color.text}`}>↑ S/{fmt(desembolsos)}</span>
            <span className={`text-xs font-black ${color.text} opacity-75`}>↓ S/{fmt(capital)}</span>
        </div>
    </div>
);

// ── Card principal ────────────────────────────────────────────────────────────
const DesembolsoCapitalCard = () => {
    const {
        loading, data,
        mesVisible,
        asesoresSeleccionados,
        handleCambiarMes,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrarAsesor, handleLimpiar,
    } = useDashboardDesembolsoCapital();

    const [collapsed, setCollapsed] = useState(false);
    const [comboKey,  setComboKey]  = useState(Date.now());

    const eventos  = useMemo(() => data?.eventos  ?? {}, [data]);
    const asesores = useMemo(() => data?.asesores ?? [], [data]);

    const asesorColorMap = useMemo(() => {
        const map = {};
        asesores.forEach((a, i) => { map[a.asesor_id] = ASESOR_COLORS[i % ASESOR_COLORS.length]; });
        return map;
    }, [asesores]);

    const acumMesPorAsesor = useMemo(() => {
        const map    = {};
        const prefix = `${mesVisible.anio}-${String(mesVisible.mes).padStart(2, '0')}-`;
        Object.entries(eventos).forEach(([fecha, ev]) => {
            if (!fecha.startsWith(prefix)) return;
            (ev.desembolsos    ?? []).forEach(d => {
                if (!map[d.asesor_id]) map[d.asesor_id] = { desembolsos: 0, capital: 0 };
                map[d.asesor_id].desembolsos += d.monto;
            });
            (ev.pagos_capital ?? []).forEach(p => {
                if (!map[p.asesor_id]) map[p.asesor_id] = { desembolsos: 0, capital: 0 };
                map[p.asesor_id].capital += p.capital;
            });
        });
        return map;
    }, [eventos, mesVisible]);

    const totalesMes = useMemo(() => {
        let desembolsos = 0, capital = 0;
        Object.values(acumMesPorAsesor).forEach(a => { desembolsos += a.desembolsos; capital += a.capital; });
        return { desembolsos, capital };
    }, [acumMesPorAsesor]);

    const exportFilters = {
        mes:  mesVisible.mes,
        anio: mesVisible.anio,
        ...(asesoresSeleccionados.length > 0 ? { asesor_ids: asesoresSeleccionados.map(a => a.id).join(',') } : {}),
    };

    const onLimpiar = () => { setComboKey(Date.now()); handleLimpiar(); };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-visible transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors rounded-t-2xl">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <CalendarDaysIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">
                            Calendario de Desembolsos y Recupero de Capital
                        </h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                            {MESES[mesVisible.mes - 1]} {mesVisible.anio} · Movimientos diarios por asesor
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportDesembolsoCapitalDashboard}
                            filters={exportFilters}
                            filename="reporte_desembolso_capital"
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
                    {/* Filtro asesor */}
                    <>
                        <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt/50 flex flex-wrap items-end gap-3 transition-colors">
                            <div className="flex flex-col gap-1">
                                <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Asesor</label>
                                <EmpleadoSearchSelect
                                    key={comboKey}
                                    rol="ASESOR"
                                    onSelect={handleAgregarAsesor}
                                    clearOnSelect={true}
                                    placeholder="Agregar asesor..."
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button onClick={handleFiltrarAsesor} disabled={loading}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50">
                                    <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                                </button>
                                <button onClick={onLimpiar}
                                    className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all">
                                    <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                                </button>
                            </div>
                        </div>

                        {/* Tags asesores seleccionados */}
                        {asesoresSeleccionados.length > 0 && (
                            <div className="px-6 py-2 border-b border-slate-50 dark:border-dark-border bg-white dark:bg-dark-surface flex flex-wrap gap-2 transition-colors">
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
                    </>

                    {/* Chips por asesor */}
                    {!loading && asesores.length > 0 && (
                        <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-white dark:bg-dark-surface flex flex-wrap gap-2 transition-colors">
                            {asesores.map((a, i) => {
                                const acum = acumMesPorAsesor[a.asesor_id] ?? { desembolsos: 0, capital: 0 };
                                return (
                                    <AsesorChip
                                        key={a.asesor_id}
                                        nombre={a.nombre}
                                        color={ASESOR_COLORS[i % ASESOR_COLORS.length]}
                                        desembolsos={acum.desembolsos}
                                        capital={acum.capital}
                                    />
                                );
                            })}
                            <div className="flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-black min-w-[180px]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted">
                                    Total {MESES[mesVisible.mes - 1]}
                                </p>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-black text-white dark:text-dark-text">↑ S/{fmt(totalesMes.desembolsos)}</span>
                                    <span className="text-xs font-black text-slate-300 dark:text-dark-text-muted">↓ S/{fmt(totalesMes.capital)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calendario */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Calendario
                                eventos={eventos}
                                asesorColorMap={asesorColorMap}
                                mes={mesVisible.mes}
                                anio={mesVisible.anio}
                                onMesChange={handleCambiarMes}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DesembolsoCapitalCard;