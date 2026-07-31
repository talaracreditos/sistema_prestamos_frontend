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
    { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
    { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
    { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
    { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    { bg: 'bg-pink-100',   text: 'text-pink-700',   dot: 'bg-pink-500'   },
    { bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
    { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
];

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

// ── Popup del día — con scroll interno y cierre al click fuera ────────────────
const DayTooltip = ({ dia, eventos, asesorColorMap, anchorRect, onClose }) => {
    const popupRef     = useRef(null);
    const desembolsos  = eventos?.desembolsos   ?? [];
    const pagos        = eventos?.pagos_capital ?? [];
    const totalDesemb  = desembolsos.reduce((s, d) => s + d.monto,   0);
    const totalCapital = pagos.reduce((s, p) => s + p.capital, 0);

    const TIP_W  = 300;
    const MAX_H  = 380; // altura máxima del popup — el contenido interno scrollea
    const left   = Math.min(anchorRect.left + anchorRect.width / 2 - TIP_W / 2, window.innerWidth - TIP_W - 8);

    // Posicionar arriba de la celda; si no cabe, abajo
    const espacioArriba = anchorRect.top;
    const abrirAbajo    = espacioArriba < MAX_H + 16;
    const top = abrirAbajo
        ? anchorRect.bottom + window.scrollY + 8
        : anchorRect.top + window.scrollY - 8;

    const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

    // ── Cerrar al hacer click fuera ───────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                onClose();
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        // Timeout para que el click que abre el popup no lo cierre inmediatamente
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
            className="bg-white border border-slate-200 rounded-xl shadow-2xl text-left flex flex-col overflow-hidden"
        >
            {/* Header fijo */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{fmtDate(dia)}</p>
                <button onClick={onClose} className="p-0.5 text-slate-300 hover:text-brand-red transition-colors">
                    <XMarkIcon className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto px-3 pb-3" style={{ maxHeight: MAX_H }}>
                {desembolsos.length > 0 && (
                    <div className="mb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 bg-white pt-2 pb-1 -mx-3 px-3">
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
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 bg-white pt-2 pb-1 -mx-3 px-3">
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
    const desembolsos  = eventos?.desembolsos   ?? [];
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
            className={`relative min-h-[72px] p-1.5 border rounded-lg flex flex-col
                ${esMesActual ? 'bg-white border-slate-100' : 'bg-slate-200/90 border-slate-300/60 opacity-40'}
                ${esHoy ? 'ring-2 ring-brand-red ring-offset-1' : ''}
                ${tieneEventos ? 'cursor-pointer hover:border-slate-300 transition-colors' : ''}
                ${abierto ? 'border-brand-red/50 shadow-md' : ''}
            `}
            onClick={handleClick}>
            <span className={`text-base font-black self-end leading-none mb-1 ${esHoy ? 'text-brand-red' : esMesActual ? 'text-slate-700' : 'text-slate-300'}`}>
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
                    {totalDesemb  > 0 && <span className="text-[11px] font-black text-blue-600 leading-none truncate">↑ S/{fmt(totalDesemb)}</span>}
                    {totalCapital > 0 && <span className="text-[11px] font-black text-green-600 leading-none truncate">↓ S/{fmt(totalCapital)}</span>}
                </div>
            )}
        </div>
    );
};

// ── Calendario ────────────────────────────────────────────────────────────────
const Calendario = ({ eventos, asesorColorMap, mes, anio, onMesChange }) => {
    const hoy = new Date();
    // Popup abierto: { fecha, rect } o null
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
                <button onClick={prevMes} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4 text-slate-500" />
                </button>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {MESES[mes - 1]} {anio}
                </p>
                <button onClick={nextMes} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
                {DIAS.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-1">{d}</div>)}
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

            {/* Popup — un solo portal a nivel calendario */}
            {popupAbierto && eventos[popupAbierto.fecha] && (
                <DayTooltip
                    dia={popupAbierto.fecha}
                    eventos={eventos[popupAbierto.fecha]}
                    asesorColorMap={asesorColorMap}
                    anchorRect={popupAbierto.rect}
                    onClose={cerrarPopup}
                />
            )}

            <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-blue-600">↑</span>
                    <span className="text-xs font-semibold text-slate-500">Desembolso</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-green-600">↓</span>
                    <span className="text-xs font-semibold text-slate-500">Capital cobrado</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[10px] font-bold text-slate-400">Click en un día para ver el detalle</span>
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
            (ev.desembolsos   ?? []).forEach(d => {
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-visible">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors rounded-t-2xl">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light rounded-xl">
                        <CalendarDaysIcon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            Calendario de Desembolsos y Recupero de Capital
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
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
                            <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-end gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Asesor</label>
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
                                        className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark transition-all disabled:opacity-50">
                                        <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                                    </button>
                                    <button onClick={onLimpiar}
                                        className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-brand-red text-[10px] font-black uppercase rounded-lg border border-slate-200 hover:border-brand-red/30 transition-all">
                                        <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                                    </button>
                                </div>
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
                    </>

                    {/* Chips por asesor */}
                    {!loading && asesores.length > 0 && (
                        <div className="px-6 py-3 border-b border-slate-50 bg-white flex flex-wrap gap-2">
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
                            <div className="flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 min-w-[180px]">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Total {MESES[mesVisible.mes - 1]}
                                </p>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-black text-white">↑ S/{fmt(totalesMes.desembolsos)}</span>
                                    <span className="text-xs font-black text-slate-300">↓ S/{fmt(totalesMes.capital)}</span>
                                </div>
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