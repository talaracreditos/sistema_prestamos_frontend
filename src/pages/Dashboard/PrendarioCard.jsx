import React, { useState } from 'react';
import { useDashboardPrendario } from 'hooks/Dashboard/useDashboardPrendario';
import { exportPrendarioDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import Pagination from 'components/Shared/Pagination';
import { ScaleIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const fmt  = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtG = n => `${fmt(n)} g`;

// Estado de la garantía (estado_fisico)
const ESTADO_STYLES = {
    0: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border',
    1: 'bg-brand-gold-light/20 dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border-brand-gold/30 dark:border-brand-gold/20',
    2: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
    3: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    4: 'bg-brand-red-light dark:bg-brand-red/10 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20',
};
const ESTADO_MIXTO = 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';

const inputCls = 'p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none';
const labelCls = 'block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1';

/**
 * Un préstamo = un bloque de filas (una por pieza). Las columnas del préstamo
 * usan rowSpan para no repetirse, igual que en el Excel.
 */
const BloquePrestamo = ({ f, zebra }) => {
    const piezas = f.piezas?.length ? f.piezas : [null];
    const span   = piezas.length;
    const bg     = zebra ? 'bg-slate-50/50 dark:bg-dark-surface-alt/30' : 'bg-white dark:bg-dark-surface';
    const td     = 'px-2 py-2.5 align-top';

    return piezas.map((pz, idx) => (
        <tr key={idx} className={`${bg} text-[10px] hover:bg-brand-red-light/20 dark:hover:bg-dark-surface-alt transition-colors`}>
            {idx === 0 && (
                <>
                    <td rowSpan={span} className={`${td} whitespace-nowrap font-black text-slate-600 dark:text-dark-text-muted uppercase`}>{f.adn}</td>
                    <td rowSpan={span} className={`${td} whitespace-nowrap font-bold text-slate-600 dark:text-dark-text-muted`}>{f.fecha_desembolso}</td>
                    <td rowSpan={span} className={`${td} whitespace-nowrap`}>
                        <span className="font-black text-slate-700 dark:text-dark-text block">#{f.credito}</span>
                        {f.codigo_recaudo && <span className="text-[9px] text-brand-red/70 dark:text-brand-gold/70 font-black block">{f.codigo_recaudo}</span>}
                    </td>
                    <td rowSpan={span} className={`${td} whitespace-nowrap font-bold text-slate-500 dark:text-dark-text-muted`}>{f.tasacion_id ? `#${f.tasacion_id}` : '—'}</td>
                    <td rowSpan={span} className={`${td} min-w-[180px]`}>
                        <span className="font-black text-slate-800 dark:text-dark-text uppercase leading-tight block">{f.cliente_nombre}</span>
                    </td>
                    <td rowSpan={span} className={`${td} whitespace-nowrap font-bold text-slate-500 dark:text-dark-text-muted`}>{f.cliente_dni}</td>
                    <td rowSpan={span} className={`${td} whitespace-nowrap text-right font-black text-brand-red dark:text-brand-gold`}>S/ {fmt(f.monto_desembolsado)}</td>
                    <td rowSpan={span} className={`${td} whitespace-nowrap text-right font-black text-slate-600 dark:text-dark-text-muted`}>S/ {fmt(f.valor_tasacion)}</td>
                </>
            )}

            {/* Datos de la pieza */}
            <td className={`${td} whitespace-nowrap text-right font-bold text-slate-600 dark:text-dark-text-muted`}>{pz ? fmtG(pz.peso_bruto) : '—'}</td>
            <td className={`${td} whitespace-nowrap text-right font-bold text-slate-600 dark:text-dark-text-muted`}>{pz ? fmtG(pz.peso_neto) : '—'}</td>
            <td className={`${td} whitespace-nowrap font-black text-brand-gold-dark dark:text-brand-gold`}>{pz?.kilataje ?? '—'}</td>
            <td className={`${td} min-w-[200px]`}>
                {pz ? (
                    <>
                        <span className="font-bold text-slate-700 dark:text-dark-text uppercase block leading-tight">{pz.descripcion}</span>
                        {pz.detalle && <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold block leading-tight mt-0.5">{pz.detalle}</span>}
                    </>
                ) : '—'}
            </td>

            {idx === 0 && (
                <td rowSpan={span} className={`${td} whitespace-nowrap`}>
                    <span className={`px-2 py-0.5 rounded-full font-black border text-[9px] ${f.estado !== null && f.estado !== undefined ? (ESTADO_STYLES[f.estado] ?? ESTADO_STYLES[0]) : ESTADO_MIXTO}`}>
                        {f.estado_label}
                    </span>
                </td>
            )}
        </tr>
    ));
};

const PrendarioCard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        loading, data,
        documento,   setDocumento,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        kilatajeId,  setKilatajeId,
        estado,      setEstado,
        exportFilters, tieneFiltro,
        handleFiltrar, handleLimpiar, handlePageChange,
    } = useDashboardPrendario();

    const filas     = data?.data ?? [];
    const totales   = data?.totales ?? null;
    const kilatajes = data?.opciones?.kilatajes ?? [];
    const estados   = data?.opciones?.estados ?? [];

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <ScaleIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Reporte Prendario</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">
                            Desembolsos con garantía de joyas
                            {data?.total ? ` · ${data.total} préstamos` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <ExcelExportButton
                            exportService={exportPrendarioDashboard}
                            filters={exportFilters}
                            filename="reporte_prendario"
                            label="Excel"
                            disabled={loading}
                        />
                    )}
                    <div
                        className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted cursor-pointer transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                        onClick={() => setCollapsed(v => !v)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* Filtros */}
                    <div className="px-6 py-3 border-b border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-surface-alt/50 flex flex-wrap items-end gap-3">
                        <div className="min-w-[150px]">
                            <label className={labelCls}>DNI / RUC</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={documento}
                                onChange={e => setDocumento(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={e => e.key === 'Enter' && handleFiltrar()}
                                placeholder="Documento..."
                                maxLength={11}
                                className={`w-full ${inputCls}`}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Desembolso desde</label>
                            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Desembolso hasta</label>
                            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Kilataje</label>
                            <select value={kilatajeId} onChange={e => setKilatajeId(e.target.value)} className={`min-w-[110px] ${inputCls}`}>
                                <option value="">Todos</option>
                                {kilatajes.map(k => <option key={k.id} value={k.id}>{k.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Estado garantía</label>
                            <select value={estado} onChange={e => setEstado(e.target.value)} className={`min-w-[120px] ${inputCls}`}>
                                <option value="">Todos</option>
                                {estados.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleFiltrar}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        {tieneFiltro && (
                            <button
                                onClick={handleLimpiar}
                                className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                            </button>
                        )}
                    </div>

                    {/* Totales */}
                    {totales && totales.prestamos > 0 && !loading && (
                        <div className="px-6 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Monto desembolsado', valor: `S/ ${fmt(totales.monto_desembolsado)}`, cls: 'text-brand-red dark:text-brand-gold' },
                                { label: 'Valor tasación',     valor: `S/ ${fmt(totales.valor_tasacion)}`,     cls: 'text-slate-800 dark:text-dark-text' },
                                { label: 'Gramos brutos',      valor: fmtG(totales.gramos_brutos),             cls: 'text-slate-800 dark:text-dark-text' },
                                { label: 'Gramos netos',       valor: fmtG(totales.gramos_netos),              cls: 'text-slate-800 dark:text-dark-text' },
                            ].map(t => (
                                <div key={t.label} className="p-3 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50/60 dark:bg-dark-surface-alt/40">
                                    <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">{t.label}</p>
                                    <p className={`text-sm font-black mt-0.5 ${t.cls}`}>{t.valor}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Contenido */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            </div>
                        ) : filas.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-slate-300 dark:text-dark-text-muted/60 text-xs font-bold uppercase tracking-widest">
                                Sin préstamos prendarios
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="w-full overflow-x-auto">
                                    <table className="min-w-[1300px] w-full text-left border-collapse table-auto">
                                        <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-100 dark:border-dark-border">
                                            <tr>
                                                <th className="px-2 py-3 whitespace-nowrap">ADN</th>
                                                <th className="px-2 py-3 whitespace-nowrap">F. Desembolso</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Crédito N°</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Tasación</th>
                                                <th className="px-2 py-3">Cliente</th>
                                                <th className="px-2 py-3 whitespace-nowrap">DNI</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Monto Desemb.</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">Valor Tasación</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">G. Brutos</th>
                                                <th className="px-2 py-3 text-right whitespace-nowrap">G. Netos</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Kilataje</th>
                                                <th className="px-2 py-3">Descripción</th>
                                                <th className="px-2 py-3 whitespace-nowrap">Estado Garantía</th>
                                            </tr>
                                        </thead>
                                        {filas.map((f, i) => (
                                            <tbody key={f.prestamo_id} className="border-b border-slate-100 dark:border-dark-border">
                                                <BloquePrestamo f={f} zebra={i % 2 === 1} />
                                            </tbody>
                                        ))}
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={data?.current_page}
                                    totalPages={data?.last_page}
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

export default PrendarioCard;