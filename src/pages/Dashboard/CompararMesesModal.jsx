import React, { useEffect, useMemo, useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import {
    useCompararMeses, mesesDisponibles, PALETA_MESES, PRESETS, MAX_MESES,
} from 'hooks/Dashboard/useCompararMeses';
import {
    LineChart, Line, BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    XMarkIcon, PlusIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon,
} from '@heroicons/react/24/outline';

const fmt  = v => `S/ ${parseFloat(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = v => {
    const n = Number(v || 0);
    if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 1000)    return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return `${Math.round(n)}`;
};

const EJE  = { fontSize: 10, fill: '#94a3b8', fontWeight: 700 };
const GRID = { stroke: '#94a3b8', strokeOpacity: 0.18, vertical: false };

const VISTAS = [
    { id: 'acumulado', label: 'Acumulado' },
    { id: 'diario',    label: 'Por día'   },
    { id: 'mes',       label: 'Total mes' },
];

/** Sigue la clase .dark del <html> (modo oscuro de la app). */
const useIsDark = () => {
    const leer = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const [dark, setDark] = useState(leer);
    useEffect(() => {
        const obs = new MutationObserver(() => setDark(leer()));
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);
    return dark;
};

/* ── Tooltip: todos los meses de ese día ─────────────────────────────────── */
const TooltipDia = ({ active, payload, label, meses, colorDe, campo }) => {
    if (!active || !payload?.length) return null;
    const filas = meses
        .map(m => ({ m, v: m.serie[label - 1]?.[campo] }))
        .filter(x => x.v !== null && x.v !== undefined)
        .sort((a, b) => b.v - a.v);
    if (!filas.length) return null;
    return (
        <div className="px-3 py-2 rounded-lg shadow-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border min-w-[180px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted mb-1">
                Día {label}{campo === 'acumulado' ? ' (acumulado)' : ''}
            </p>
            {filas.map(({ m, v }) => (
                <div key={m.key} className="flex items-center justify-between gap-4 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-dark-text-muted">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorDe(m.key) }} />
                        {m.label_corto}
                    </span>
                    <span className="font-black text-slate-900 dark:text-dark-text">{fmt(v)}</span>
                </div>
            ))}
        </div>
    );
};

const TooltipMes = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div className="px-3 py-2 rounded-lg shadow-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted">{p.label}</p>
            <p className="text-sm font-black text-slate-900 dark:text-dark-text">{fmt(p.total)}</p>
            {p.es_actual && <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted">mes en curso (al día {p.hasta_dia})</p>}
        </div>
    );
};

/* ── Variación: más cobrado = verde, menos = rojo ────────────────────────── */
const Var = ({ actual, anterior }) => {
    if (anterior === null || anterior === undefined || actual === null || actual === undefined) {
        return <span className="text-slate-300 dark:text-dark-text-muted/50">—</span>;
    }
    const diff = actual - anterior;
    const pct  = anterior > 0 ? (diff / anterior) * 100 : null;
    const sube = diff > 0.004, baja = diff < -0.004;
    const Icon = sube ? ArrowTrendingUpIcon : baja ? ArrowTrendingDownIcon : MinusIcon;
    const cls  = sube ? 'text-green-600 dark:text-green-400' : baja ? 'text-brand-red dark:text-red-400' : 'text-slate-400 dark:text-dark-text-muted';
    return (
        <span className={`inline-flex items-center gap-1 font-black ${cls}`}>
            <Icon className="w-3.5 h-3.5" />
            {pct !== null ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : (sube ? '+' : '') + fmt(diff)}
        </span>
    );
};

/* ── Modal ───────────────────────────────────────────────────────────────── */
const CompararMesesModal = ({ isOpen, onClose, concepto = 'interes', titulo }) => {
    const isDark = useIsDark();
    const [vista, setVista] = useState('acumulado');
    const {
        loading, error, data, seleccion, slotDe,
        agregarMes, quitarMes, aplicarPreset,
    } = useCompararMeses({ isOpen, concepto });

    const paleta  = isDark ? PALETA_MESES.dark : PALETA_MESES.light;
    const colorDe = key => paleta[slotDe(key)] ?? paleta[0];

    const disponibles = useMemo(() => mesesDisponibles(), []);
    const elegidos    = new Set(seleccion.map(s => s.key));
    const labelDe     = key => disponibles.find(d => d.key === key)?.label ?? key;

    // Solo los meses que vinieron y que siguen elegidos (evita parpadeo al quitar)
    const meses = (data?.meses ?? []).filter(m => elegidos.has(m.key));
    const diaCorte = data?.dia_corte ?? null;

    // Filas para el gráfico por día: { dia, '2026-09': v, '2026-10': v, ... }
    const campo = vista === 'acumulado' ? 'acumulado' : 'total';
    const filasDia = useMemo(() => Array.from({ length: 31 }, (_, i) => {
        const fila = { dia: i + 1 };
        meses.forEach(m => { fila[m.key] = m.serie[i]?.[campo] ?? null; });
        return fila;
    }), [meses, campo]);

    const nombre = titulo ?? data?.concepto_label ?? 'Comparar meses';

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} title={`Comparar meses — ${nombre}`} size="5xl" hideFooter>
            <div className="space-y-5">

                {/* ── Meses elegidos (también sirven de leyenda) ── */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {[...seleccion].sort((a, b) => a.key.localeCompare(b.key)).map(s => (
                            <span key={s.key}
                                className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-[11px] font-black text-slate-700 dark:text-dark-text uppercase">
                                <span className="w-3 h-3 rounded-full" style={{ background: colorDe(s.key) }} />
                                {labelDe(s.key)}
                                <button onClick={() => quitarMes(s.key)} disabled={seleccion.length <= 1}
                                    title="Quitar mes"
                                    className="p-0.5 rounded-full text-slate-400 hover:text-brand-red dark:hover:text-red-400 disabled:opacity-30">
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}

                        <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-dashed border-slate-300 dark:border-dark-border text-[11px] font-black text-slate-500 dark:text-dark-text-muted">
                            <PlusIcon className="w-3.5 h-3.5" />
                            <select value="" onChange={e => agregarMes(e.target.value)}
                                disabled={seleccion.length >= MAX_MESES}
                                className="bg-transparent outline-none uppercase cursor-pointer disabled:cursor-not-allowed dark:text-dark-text">
                                <option value="">{seleccion.length >= MAX_MESES ? `Máx. ${MAX_MESES} meses` : 'Agregar mes'}</option>
                                {disponibles.filter(d => !elegidos.has(d.key)).map(d => (
                                    <option key={d.key} value={d.key}>{d.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                            {PRESETS.map(p => (
                                <button key={p.id} onClick={() => aplicarPreset(p.id)}
                                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-slate-200 dark:border-dark-border text-slate-500 dark:text-dark-text-muted hover:border-brand-red/40 dark:hover:border-brand-gold/40 hover:text-brand-red dark:hover:text-brand-gold transition-colors">
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-dark-border overflow-hidden">
                            {VISTAS.map(v => (
                                <button key={v.id} onClick={() => setVista(v.id)}
                                    className={`px-3 py-1.5 text-[10px] font-black uppercase ${
                                        vista === v.id
                                            ? 'bg-slate-900 dark:bg-dark-surface-alt text-white dark:text-dark-text'
                                            : 'text-slate-500 dark:text-dark-text-muted hover:bg-slate-50 dark:hover:bg-dark-surface-alt/50'
                                    }`}>
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Gráfico ── */}
                {loading && !meses.length ? (
                    <div className="flex items-center justify-center h-72">
                        <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-xl bg-brand-red-light dark:bg-red-500/10 text-brand-red dark:text-red-400 text-xs font-bold">{error}</div>
                ) : (
                    <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-muted mb-2">
                            {vista === 'acumulado' && 'Cuánto se lleva cobrado en el mes, día a día (S/)'}
                            {vista === 'diario'    && 'Cobrado cada día del mes (S/)'}
                            {vista === 'mes'       && 'Total cobrado en cada mes (S/)'}
                        </p>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {vista === 'mes' ? (
                                    <BarChart data={meses} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid {...GRID} />
                                        <XAxis dataKey="label_corto" tick={EJE} tickLine={false} axisLine={false} />
                                        <YAxis tick={EJE} tickLine={false} axisLine={false} width={44} tickFormatter={fmtK} />
                                        <Tooltip content={<TooltipMes />} cursor={{ fill: '#94a3b8', fillOpacity: 0.08 }} />
                                        <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={56}
                                             stroke={isDark ? '#1e1e1e' : '#ffffff'} strokeWidth={2}>
                                            {meses.map(m => <Cell key={m.key} fill={colorDe(m.key)} />)}
                                        </Bar>
                                    </BarChart>
                                ) : (
                                    <LineChart data={filasDia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid {...GRID} />
                                        <XAxis dataKey="dia" tick={EJE} tickLine={false} axisLine={false} interval={vista === 'diario' ? 1 : 2} />
                                        <YAxis tick={EJE} tickLine={false} axisLine={false} width={44} tickFormatter={fmtK} />
                                        <Tooltip
                                            content={<TooltipDia meses={meses} colorDe={colorDe} campo={campo} />}
                                            cursor={{ stroke: '#94a3b8', strokeOpacity: 0.5, strokeDasharray: '3 3' }} />
                                        {meses.map(m => (
                                            <Line key={m.key} dataKey={m.key} name={m.label}
                                                  type={vista === 'acumulado' ? 'monotone' : 'linear'}
                                                  stroke={colorDe(m.key)}
                                                  strokeWidth={m.es_actual ? 3 : 2}
                                                  dot={false}
                                                  activeDot={{ r: 5, stroke: isDark ? '#1e1e1e' : '#ffffff', strokeWidth: 2 }}
                                                  connectNulls={false}
                                                  isAnimationActive={false} />
                                        ))}
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ── Tabla resumen ── */}
                {meses.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-dark-border">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                            <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase">
                                <tr>
                                    <th className="px-4 py-2">Mes</th>
                                    <th className="px-4 py-2 text-right">Total mes</th>
                                    {diaCorte && <th className="px-4 py-2 text-right">Al día {diaCorte}</th>}
                                    <th className="px-4 py-2 text-right">vs mes anterior</th>
                                    <th className="px-4 py-2 text-right">Días con cobro</th>
                                    <th className="px-4 py-2 text-right">Promedio / día</th>
                                    <th className="px-4 py-2 text-right">Mejor día</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-dark-border text-xs">
                                {meses.map((m, i) => {
                                    const prev = meses[i - 1];
                                    // Con mes en curso se compara "al mismo día"; si no, el total del mes
                                    const actual   = diaCorte ? m.al_corte    : m.total;
                                    const anterior = prev ? (diaCorte ? prev.al_corte : prev.total) : null;
                                    return (
                                        <tr key={m.key} className="hover:bg-slate-50 dark:hover:bg-dark-surface-alt">
                                            <td className="px-4 py-2">
                                                <span className="inline-flex items-center gap-2 font-black text-slate-700 dark:text-dark-text uppercase">
                                                    <span className="w-3 h-3 rounded-full" style={{ background: colorDe(m.key) }} />
                                                    {m.label}
                                                    {m.es_actual && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted">en curso</span>}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-black text-slate-900 dark:text-dark-text">{fmt(m.total)}</td>
                                            {diaCorte && <td className="px-4 py-2 text-right font-black text-slate-900 dark:text-dark-text">{fmt(m.al_corte)}</td>}
                                            <td className="px-4 py-2 text-right"><Var actual={actual} anterior={anterior} /></td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-600 dark:text-dark-text-muted">{m.dias_con_cobro}</td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-600 dark:text-dark-text-muted">{fmt(m.promedio_dia)}</td>
                                            <td className="px-4 py-2 text-right font-bold text-slate-600 dark:text-dark-text-muted">
                                                {m.mejor_dia ? <>día {m.mejor_dia.dia} · {fmt(m.mejor_dia.total)}</> : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {diaCorte && (
                    <p className="text-[10px] text-slate-400 dark:text-dark-text-muted leading-relaxed">
                        Como el mes actual va en curso, la columna <b>"vs mes anterior"</b> compara todos los meses <b>al día {diaCorte}</b>,
                        para que la comparación sea pareja. El total del mes completo está en "Total mes".
                    </p>
                )}
            </div>
        </ViewModal>
    );
};

export default CompararMesesModal;