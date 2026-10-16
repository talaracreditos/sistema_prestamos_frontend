import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { useMoraEvolucion, RANGOS_RAPIDOS } from 'hooks/Dashboard/useMoraEvolucion';
import {
    AreaChart, Area, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
    ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon,
    ChartBarIcon, TableCellsIcon,
} from '@heroicons/react/24/outline';

const fmt   = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN  = n => parseInt(n || 0, 10).toLocaleString('es-PE');
const fmtK  = n => {
    const v = Number(n || 0);
    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (Math.abs(v) >= 1000)    return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return `${Math.round(v)}`;
};

// Ejes y grilla discretos (sirven en claro y oscuro)
const EJE  = { fontSize: 10, fill: '#94a3b8', fontWeight: 700 };
const GRID = { stroke: '#94a3b8', strokeOpacity: 0.18, vertical: false };

/* ── Tooltip ─────────────────────────────────────────────────────────────── */
const TooltipMora = ({ active, payload, esMonto }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div className="px-3 py-2 rounded-lg shadow-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted">{p.label}</p>
            <p className="text-sm font-black text-slate-900 dark:text-dark-text">
                {esMonto ? `S/ ${fmt(p.capital)}` : `${fmtN(p.personas)} cliente${p.personas === 1 ? '' : 's'}`}
            </p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">
                {esMonto ? `${fmtN(p.personas)} clientes en mora` : `S/ ${fmt(p.capital)} adeudado`}
            </p>
        </div>
    );
};

/* ── Tarjeta resumen ─────────────────────────────────────────────────────── */
const Variacion = ({ valor, esMonto }) => {
    const sube = valor > 0, baja = valor < 0;
    const Icon = sube ? ArrowTrendingUpIcon : baja ? ArrowTrendingDownIcon : MinusIcon;
    // Más mora = malo (rojo), menos mora = bueno (verde)
    const cls  = sube ? 'text-brand-red dark:text-red-400' : baja ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-dark-text-muted';
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-black ${cls}`}>
            <Icon className="w-4 h-4" />
            {sube ? '+' : ''}{esMonto ? `S/ ${fmt(valor)}` : fmtN(valor)}
            <span className="sr-only">{sube ? '(subió)' : baja ? '(bajó)' : '(sin cambio)'}</span>
        </span>
    );
};

const Stat = ({ titulo, desde, hasta, variacion, esMonto }) => (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-dark-surface-alt/60">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted mb-1">{titulo}</p>
        <p className="text-xl font-black text-slate-900 dark:text-dark-text leading-tight">
            {esMonto ? `S/ ${fmt(hasta)}` : fmtN(hasta)}
        </p>
        <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted">
                antes {esMonto ? `S/ ${fmt(desde)}` : fmtN(desde)}
            </span>
            <Variacion valor={variacion} esMonto={esMonto} />
        </div>
    </div>
);

/* ── Gráfico de una sola serie ───────────────────────────────────────────── */
const Grafico = ({ titulo, puntos, campo, esMonto, colorCls, gradId, tipo = 'area' }) => {
    const pocos = puntos.length <= 31;
    const comunes = (
        <>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="label" tick={EJE} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis tick={EJE} tickLine={false} axisLine={false} width={esMonto ? 44 : 30}
                   allowDecimals={!esMonto ? false : true}
                   tickFormatter={esMonto ? fmtK : v => fmtN(v)} />
            <Tooltip content={<TooltipMora esMonto={esMonto} />}
                     cursor={{ stroke: '#94a3b8', strokeOpacity: 0.5, strokeDasharray: '3 3' }} />
        </>
    );
    const dot       = pocos ? { r: 2.5, strokeWidth: 0, fill: 'currentColor' } : false;
    const activeDot = { r: 5, stroke: 'var(--chart-ring, #fff)', strokeWidth: 2, fill: 'currentColor' };

    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-dark-text-muted mb-2">{titulo}</p>
            <div className={`h-56 w-full ${colorCls} [--chart-ring:#fff] dark:[--chart-ring:#1e1e1e]`}>
                <ResponsiveContainer width="100%" height="100%">
                    {tipo === 'area' ? (
                        <AreaChart data={puntos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor="currentColor" stopOpacity={0.22} />
                                    <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            {comunes}
                            <Area type="monotone" dataKey={campo} stroke="currentColor" strokeWidth={2}
                                  fill={`url(#${gradId})`} dot={dot} activeDot={activeDot} isAnimationActive={false} />
                        </AreaChart>
                    ) : (
                        <LineChart data={puntos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            {comunes}
                            <Line type="stepAfter" dataKey={campo} stroke="currentColor" strokeWidth={2}
                                  dot={dot} activeDot={activeDot} isAnimationActive={false} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

/* ── Tabla (vista alternativa) ───────────────────────────────────────────── */
const TablaEvolucion = ({ puntos }) => (
    <div className="max-h-96 overflow-auto rounded-xl border border-slate-100 dark:border-dark-border">
        <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase">
                <tr>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2 text-right">Capital adeudado</th>
                    <th className="px-4 py-2 text-right">Var. capital</th>
                    <th className="px-4 py-2 text-right">Clientes</th>
                    <th className="px-4 py-2 text-right">Var. clientes</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-dark-border">
                {puntos.map((p, i) => {
                    const prev = puntos[i - 1];
                    const vc = prev ? p.capital - prev.capital : 0;
                    const vp = prev ? p.personas - prev.personas : 0;
                    const col = v => v > 0 ? 'text-brand-red dark:text-red-400' : v < 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-300 dark:text-dark-text-muted/50';
                    return (
                        <tr key={p.fecha} className="text-xs hover:bg-slate-50 dark:hover:bg-dark-surface-alt">
                            <td className="px-4 py-2 font-black text-slate-700 dark:text-dark-text">{p.label}</td>
                            <td className="px-4 py-2 text-right font-black text-slate-900 dark:text-dark-text">S/ {fmt(p.capital)}</td>
                            <td className={`px-4 py-2 text-right font-black ${col(vc)}`}>{prev ? `${vc > 0 ? '+' : ''}${fmt(vc)}` : '—'}</td>
                            <td className="px-4 py-2 text-right font-black text-slate-900 dark:text-dark-text">{fmtN(p.personas)}</td>
                            <td className={`px-4 py-2 text-right font-black ${col(vp)}`}>{prev ? `${vp > 0 ? '+' : ''}${vp}` : '—'}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

/* ── Modal ───────────────────────────────────────────────────────────────── */
/**
 * @param asesor  { ids: number[], nombre: string } — ids vacío = todos
 */
const MoraEvolucionModal = ({ isOpen, onClose, asesor, filtroInicio, filtroFin }) => {
    const [vista, setVista] = useState('grafico');
    const { loading, error, data, rangoKey, setRangoKey } = useMoraEvolucion({
        isOpen,
        asesorIds: asesor?.ids ?? [],
        filtroInicio,
        filtroFin,
    });

    const puntos  = data?.puntos  ?? [];
    const resumen = data?.resumen ?? {};
    const titulo  = `Evolución de mora > 8 días — ${asesor?.nombre ?? ''}`;

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} title={titulo} size="5xl" hideFooter>
            <div className="space-y-5">
                {/* Controles: un solo renglón */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {RANGOS_RAPIDOS.map(r => (
                            <button key={r.key} onClick={() => setRangoKey(r.key)} disabled={loading}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all disabled:opacity-50 ${
                                    rangoKey === r.key
                                        ? 'bg-brand-red dark:bg-brand-red-glow text-white border-transparent'
                                        : 'text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border hover:border-brand-red/40 dark:hover:border-brand-gold/40'
                                }`}>
                                {r.label}
                            </button>
                        ))}
                    </div>
                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-dark-border overflow-hidden">
                        {[['grafico', ChartBarIcon, 'Gráfico'], ['tabla', TableCellsIcon, 'Tabla']].map(([k, Icon, l]) => (
                            <button key={k} onClick={() => setVista(k)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase ${
                                    vista === k
                                        ? 'bg-slate-900 dark:bg-dark-surface-alt text-white dark:text-dark-text'
                                        : 'text-slate-500 dark:text-dark-text-muted hover:bg-slate-50 dark:hover:bg-dark-surface-alt/50'
                                }`}>
                                <Icon className="w-3.5 h-3.5" /> {l}
                            </button>
                        ))}
                    </div>
                </div>

                {data?.rango && (
                    <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                        {data.rango.desde} → {data.rango.hasta} · {data.granularidad === 'dia' ? 'un punto por día' : 'cierre de cada mes'}
                    </p>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-72">
                        <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-xl bg-brand-red-light dark:bg-red-500/10 text-brand-red dark:text-red-400 text-xs font-bold">{error}</div>
                ) : puntos.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 dark:text-dark-text-muted py-16">Sin datos para este rango.</p>
                ) : (
                    <>
                        {/* Resumen */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Stat titulo="Capital adeudado" esMonto
                                  desde={resumen.capital_inicial} hasta={resumen.capital_final} variacion={resumen.variacion_capital} />
                            <Stat titulo="Clientes en mora" esMonto={false}
                                  desde={resumen.personas_inicial} hasta={resumen.personas_final} variacion={resumen.variacion_personas} />
                            <div className="p-4 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-dark-surface-alt/60">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-muted mb-1">Pico de capital</p>
                                <p className="text-xl font-black text-slate-900 dark:text-dark-text leading-tight">S/ {fmt(resumen.capital_max)}</p>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted mt-1">{resumen.fecha_max ?? '—'}</p>
                            </div>
                        </div>

                        {vista === 'grafico' ? (
                            <div className="space-y-6">
                                <Grafico titulo="Capital adeudado (S/)" puntos={puntos} campo="capital" esMonto
                                         colorCls="text-brand-red dark:text-red-400" gradId="moraEvoCapital" tipo="area" />
                                <Grafico titulo="Clientes con mora > 8 días" puntos={puntos} campo="personas" esMonto={false}
                                         colorCls="text-slate-700 dark:text-brand-gold" gradId="moraEvoPersonas" tipo="line" />
                            </div>
                        ) : (
                            <TablaEvolucion puntos={puntos} />
                        )}

                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted leading-relaxed">
                            Cada punto muestra cómo estaba la cartera <b>en esa fecha</b>, con los pagos registrados hasta ese día.
                            Por eso el valor inicial puede diferir un poco de la columna "Capital Inicial" de la tabla.
                        </p>
                    </>
                )}
            </div>
        </ViewModal>
    );
};

export default MoraEvolucionModal;