import React, { useState, useEffect } from 'react';
import { useDashboardMaster } from 'hooks/Dashboard/useDashboardMaster';
import { exportMasterDashboard } from 'services/dashboardService';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import Pagination from 'components/Shared/Pagination';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import {
    TableCellsIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';

const fmt  = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });
const fmtN = n => parseInt(n || 0).toLocaleString('es-PE');

const SBS_STYLES = {
    'NORMAL':     'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
    'CPP':        'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    'DEFICIENTE': 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
    'DUDOSO':     'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
    'PÉRDIDA':    'bg-red-100 dark:bg-red-600/20 text-red-900 dark:text-red-400 border-red-300 dark:border-red-500/40',
};

const SITUACION_STYLES = {
    'VIGENTE':   'text-green-600 dark:text-green-400',
    'VENCIDO':   'text-amber-600 dark:text-amber-400',
    'CASTIGADO': 'text-red-600 dark:text-red-400',
};

const ESTADO_LABELS = {
    'ACTIVO':       'ACTIVO',
    'CANCELADO':    'EXTORNADO',
    'LIQUIDADO':    'CANCELADO',
    'REFINANCIADO': 'REFINANCIADO',
};

const ESTADO_STYLES = {
    'ACTIVO':       'text-green-600 dark:text-green-400',
    'CANCELADO':    'text-red-600 dark:text-red-400',
    'LIQUIDADO':    'text-slate-500 dark:text-slate-400',
    'REFINANCIADO': 'text-amber-600 dark:text-amber-400',
};

const Chevron = ({ collapsed }) => (
    <div className={`w-6 h-6 flex items-center justify-center text-slate-400 dark:text-dark-text-muted flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
    </div>
);

const inputCls = "p-2 text-xs text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none";
const labelCls = "block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1";

const MasterCard = () => {
    const {
        loading, data,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar, handlePageChange,
        documento,       setDocumento,
        codRecaudo,      setCodRecaudo,
        estadoCredito,   setEstadoCredito,
        situacion,       setSituacion,
        calificacionSbs, setCalificacionSbs,
    } = useDashboardMaster();

    const [collapsed,    setCollapsed]    = useState(false);
    const [comboKey,     setComboKey]     = useState(Date.now());
    const [isFullScreen, setIsFullScreen] = useState(false);

    const filas   = data?.data   ?? [];
    const totales = data?.totales ?? {};

    const exportFilters = {
        ...(fechaInicio       ? { fecha_inicio:      fechaInicio }                                  : {}),
        ...(fechaFin          ? { fecha_fin:         fechaFin }                                     : {}),
        ...(documento         ? { documento }                                                       : {}),
        ...(codRecaudo        ? { cod_recaudo:       codRecaudo }                                   : {}),
        ...(estadoCredito     ? { estado_credito:    estadoCredito }                                : {}),
        ...(situacion         ? { situacion }                                                       : {}),
        ...(calificacionSbs   ? { calificacion_sbs:  calificacionSbs }                              : {}),
        ...(asesoresSeleccionados.length > 0
            ? { asesor_ids: asesoresSeleccionados.map(a => a.id).join(',') }
            : {}),
    };

    const onLimpiar = () => { setComboKey(Date.now()); handleLimpiar(); };

    useEffect(() => {
        if (isFullScreen) {
            document.body.style.overflow = 'hidden';
            setCollapsed(false);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isFullScreen]);

    return (
        <div className={
            isFullScreen
                ? 'fixed inset-0 z-[100] bg-slate-100 dark:bg-black/90 flex flex-col w-screen h-screen overflow-hidden animate-in fade-in zoom-in-95 duration-200'
                : 'bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors duration-300'
        }>
            {/* ── Header ── */}
            <div className={`flex items-center justify-between px-6 py-4 border-b transition-colors flex-shrink-0 ${isFullScreen ? 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border shadow-sm' : 'border-slate-100 dark:border-dark-border hover:bg-slate-50/60 dark:hover:bg-dark-surface-alt/60'}`}>
                <div className="flex items-center gap-2.5 flex-1 cursor-pointer select-none" onClick={() => !isFullScreen && setCollapsed(v => !v)}>
                    <div className="p-2 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                        <TableCellsIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Reporte Master Global</h2>
                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">Detalle por persona — cartera completa</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {!collapsed && (
                        <>
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className={`p-2 rounded-xl border transition-all ${isFullScreen ? 'bg-brand-red dark:bg-brand-gold text-white dark:text-black border-brand-red dark:border-brand-gold shadow-md shadow-brand-red/20 dark:shadow-brand-gold/20' : 'text-slate-400 dark:text-dark-text-muted border-slate-200 dark:border-dark-border hover:text-brand-red dark:hover:text-brand-gold hover:border-brand-red/30 dark:hover:border-brand-gold/30 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt'}`}
                                title={isFullScreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
                            >
                                {isFullScreen ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
                            </button>
                            <ExcelExportButton
                                exportService={exportMasterDashboard}
                                filters={exportFilters}
                                filename="reporte_master"
                                label="Excel"
                                disabled={loading}
                            />
                        </>
                    )}
                    {!isFullScreen && (
                        <div className="cursor-pointer ml-1" onClick={() => setCollapsed(v => !v)}>
                            <Chevron collapsed={collapsed} />
                        </div>
                    )}
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* ── Filtros ── */}
                    <div className={`px-6 py-3 border-b flex flex-wrap items-end gap-3 flex-shrink-0 transition-colors ${isFullScreen ? 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border' : 'bg-slate-50/50 dark:bg-dark-surface-alt/50 border-slate-50 dark:border-dark-border'}`}>
                        {/* Fechas */}
                        <div>
                            <label className={labelCls}>Desde</label>
                            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Hasta</label>
                            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className={inputCls} />
                        </div>

                        {/* DNI / RUC */}
                        <div>
                            <label className={labelCls}>DNI / RUC</label>
                            <input type="text" value={documento} onChange={e => setDocumento(e.target.value)}
                                placeholder="Buscar documento..." className={`${inputCls} w-36`} />
                        </div>

                        {/* Cód. Recaudo */}
                        <div>
                            <label className={labelCls}>Cód. Recaudo</label>
                            <input type="text" value={codRecaudo} onChange={e => setCodRecaudo(e.target.value)}
                                placeholder="Cód. recaudo..." className={`${inputCls} w-32`} />
                        </div>

                        {/* Estado */}
                        <div>
                            <label className={labelCls}>Estado</label>
                            <select value={estadoCredito} onChange={e => setEstadoCredito(e.target.value)} className={inputCls}>
                                <option value="">Todos</option>
                                <option value="VIGENTE">Activo</option>
                                <option value="LIQUIDADO">Cancelado</option>
                                <option value="CANCELADO">Extornado</option>
                                <option value="REFINANCIADO">Refinanciado</option>
                            </select>
                        </div>

                        {/* Situación */}
                        <div>
                            <label className={labelCls}>Situación</label>
                            <select value={situacion} onChange={e => setSituacion(e.target.value)} className={inputCls}>
                                <option value="">Todas</option>
                                <option value="VIGENTE">Vigente</option>
                                <option value="VENCIDO">Vencido</option>
                                <option value="CASTIGADO">Castigado</option>
                            </select>
                        </div>

                        {/* Calif. SBS */}
                        <div>
                            <label className={labelCls}>Calif. SBS</label>
                            <select value={calificacionSbs} onChange={e => setCalificacionSbs(e.target.value)} className={inputCls}>
                                <option value="">Todas</option>
                                <option value="NORMAL">Normal</option>
                                <option value="CPP">CPP</option>
                                <option value="DEFICIENTE">Deficiente</option>
                                <option value="DUDOSO">Dudoso</option>
                                <option value="PÉRDIDA">Pérdida</option>
                            </select>
                        </div>

                        {/* Asesor */}
                        <div className="flex flex-col gap-1">
                            <label className={labelCls}>Asesor</label>
                            <EmpleadoSearchSelect
                                key={comboKey}
                                rol="ASESOR"
                                onSelect={handleAgregarAsesor}
                                clearOnSelect={true}
                                placeholder="Agregar asesor..."
                            />
                        </div>

                        <button onClick={handleFiltrar} disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5" /> Filtrar
                        </button>
                        <button onClick={onLimpiar}
                            className="flex items-center gap-1 px-3 py-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all">
                            <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                        </button>
                    </div>

                    {/* ── Tags asesores ── */}
                    {asesoresSeleccionados.length > 0 && (
                        <div className={`px-6 py-2 border-b flex flex-wrap gap-2 flex-shrink-0 transition-colors ${isFullScreen ? 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border' : 'bg-white dark:bg-dark-surface border-slate-50 dark:border-dark-border'}`}>
                            {asesoresSeleccionados.map(a => (
                                <span key={a.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-red-light dark:bg-dark-surface-alt border border-brand-red/20 dark:border-brand-gold/20 rounded-full text-[10px] font-black text-brand-red dark:text-brand-gold uppercase">
                                    {a.nombre}
                                    <button onClick={() => handleQuitarAsesor(a.id)} className="hover:text-brand-red-dark dark:hover:text-red-400">
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ── Totales ── */}
                    {!loading && (
                        <div className={`px-6 py-2 border-b flex flex-wrap gap-2 flex-shrink-0 transition-colors ${isFullScreen ? 'bg-slate-50 dark:bg-dark-surface-alt/50 border-slate-200 dark:border-dark-border' : 'bg-white dark:bg-dark-surface border-slate-50 dark:border-dark-border'}`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border text-[10px] font-black uppercase text-slate-600 dark:text-dark-text-muted">
                                {fmtN(data?.total ?? totales.personas)} personas
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border text-[10px] font-black uppercase text-slate-600 dark:text-dark-text-muted">
                                Desembolsado: S/ {fmt(totales.monto_desembolso)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 text-[10px] font-black uppercase text-green-700 dark:text-green-400">
                                Cobrado: S/ {fmt(totales.total_pagado)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red-light dark:bg-brand-gold/10 border border-brand-red/20 dark:border-brand-gold/20 text-[10px] font-black uppercase text-brand-red dark:text-brand-gold">
                                Saldo K: S/ {fmt(totales.capital_adeudado)}
                            </span>
                        </div>
                    )}

                    {/* ── Tabla ── */}
                    <div className={`p-6 flex flex-col transition-colors ${isFullScreen ? 'flex-1 overflow-hidden' : ''}`}>
                        {loading ? (
                            <div className="flex items-center justify-center h-40 flex-shrink-0">
                                <div className="w-8 h-8 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className={`flex flex-col ${isFullScreen ? 'h-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden' : ''}`}>
                                <div className="overflow-auto flex-1">
                                    <table className="w-full text-left border-collapse min-w-[2400px]">
                                        <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase border-b border-slate-200 dark:border-dark-border sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-3 py-3">Cliente</th>
                                                <th className="px-3 py-3">Cod. Recaudo</th>
                                                <th className="px-3 py-3">F. Desemb.</th>
                                                <th className="px-3 py-3">Tipo Desemb.</th>
                                                <th className="px-3 py-3">Estado</th>
                                                <th className="px-3 py-3">Situación</th>
                                                <th className="px-3 py-3 text-right">Ciclo</th>
                                                <th className="px-3 py-3">Grupo</th>
                                                <th className="px-3 py-3">Cargo</th>
                                                <th className="px-3 py-3 text-right">Cuota Grupo</th>
                                                <th className="px-3 py-3">Celular</th>
                                                <th className="px-3 py-3">Zona</th>
                                                <th className="px-3 py-3">Asesor</th>
                                                <th className="px-3 py-3 text-right">Monto Desemb.</th>
                                                <th className="px-3 py-3 text-right">Cuota Ind.</th>
                                                <th className="px-3 py-3 text-right">Seguro</th>
                                                <th className="px-3 py-3 text-right">Tasa %</th>
                                                <th className="px-3 py-3 text-center">Día Pago</th>
                                                <th className="px-3 py-3 text-right">N° Pagadas</th>
                                                <th className="px-3 py-3 text-right">Total Pagado</th>
                                                <th className="px-3 py-3 text-right">Mora Pagada</th>
                                                <th className="px-3 py-3 text-right">Capital Pag.</th>
                                                <th className="px-3 py-3 text-right">Interés Perc.</th>
                                                <th className="px-3 py-3 text-right">Saldo K</th>
                                                <th className="px-3 py-3 text-right">Interés Mes</th>
                                                <th className="px-3 py-3 text-right">Días Atraso</th>
                                                <th className="px-3 py-3 text-center">Calif. SBS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                                            {filas.map((f, i) => (
                                                <tr key={`${f.prestamo_id}-${i}`} className={`hover:bg-slate-100 dark:hover:bg-dark-surface-alt transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-dark-surface' : 'bg-slate-50/50 dark:bg-dark-surface-alt/30'}`}>
                                                    <td className="px-3 py-2.5">
                                                        <span className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase whitespace-nowrap">
                                                            {f.apellido_paterno !== '—'
                                                                ? `${f.apellido_paterno} ${f.apellido_materno}, ${f.nombres}`
                                                                : f.nombres}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted whitespace-nowrap">{f.cod_recaudo}</td>
                                                    <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted whitespace-nowrap">{f.fecha_desembolso}</td>
                                                    <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase whitespace-nowrap">{f.tipo_desembolso}</td>
                                                    <td className={`px-3 py-2.5 text-[10px] font-black uppercase ${ESTADO_STYLES[f.estado_credito] ?? 'text-slate-600 dark:text-dark-text-muted'}`}>
                                                        {ESTADO_LABELS[f.estado_credito] ?? f.estado_credito}
                                                    </td>
                                                    <td className={`px-3 py-2.5 text-[10px] font-black uppercase ${SITUACION_STYLES[f.situacion_credito] ?? 'text-slate-500 dark:text-dark-text-muted'}`}>
                                                        {f.situacion_credito}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-black text-slate-600 dark:text-dark-text-muted">{f.ciclo}</td>
                                                    <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase whitespace-nowrap">{f.nombre_grupo}</td>
                                                    <td className="px-3 py-2.5 text-[10px] font-black text-brand-gold-dark dark:text-brand-gold uppercase whitespace-nowrap">{f.cargo}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-600 dark:text-dark-text-muted whitespace-nowrap">S/ {fmt(f.cuota_grupo)}</td>
                                                    <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted whitespace-nowrap">{f.celular}</td>
                                                    <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase whitespace-nowrap">{f.zona}</td>
                                                    <td className="px-3 py-2.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase whitespace-nowrap">{f.usuario}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-black text-slate-800 dark:text-dark-text whitespace-nowrap">S/ {fmt(f.monto_individual)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-600 dark:text-dark-text-muted whitespace-nowrap">S/ {fmt(f.cuota_individual)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-600 dark:text-dark-text-muted whitespace-nowrap">S/ {fmt(f.cobertura)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-brand-gold-dark dark:text-brand-gold">{fmt(f.tasa)}%</td>
                                                    <td className="px-3 py-2.5 text-center text-[10px] font-black text-slate-600 dark:text-dark-text-muted uppercase whitespace-nowrap">{f.dia_pago}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-black text-slate-600 dark:text-dark-text-muted">{f.nro_cuotas_pagadas}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-black text-green-700 dark:text-green-400 whitespace-nowrap">S/ {fmt(f.total_pagado)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">S/ {fmt(f.mora_pagada)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-600 dark:text-dark-text-muted whitespace-nowrap">S/ {fmt(f.capital_pagado)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-600 dark:text-dark-text-muted whitespace-nowrap">S/ {fmt(f.interes_percibido)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-black text-brand-red dark:text-red-400 whitespace-nowrap">S/ {fmt(f.capital_adeudado)}</td>
                                                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-600 dark:text-dark-text-muted whitespace-nowrap">S/ {fmt(f.interes_mes)}</td>
                                                    <td className={`px-3 py-2.5 text-right text-[11px] font-black ${f.dias_atraso > 0 ? 'text-brand-red dark:text-red-400' : 'text-slate-400 dark:text-dark-text-muted/60'}`}>
                                                        {f.dias_atraso}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black border whitespace-nowrap ${SBS_STYLES[f.calificacion_sbs] ?? 'bg-slate-50 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'}`}>
                                                            {f.calificacion_sbs}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filas.length === 0 && (
                                                <tr>
                                                    <td colSpan={27} className="px-4 py-10 text-center text-xs font-bold text-slate-300 dark:text-dark-text-muted/60 uppercase">Sin registros</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className={`flex-shrink-0 transition-colors ${isFullScreen ? 'border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt' : ''}`}>
                                    <Pagination
                                        currentPage={data?.current_page}
                                        totalPages={data?.last_page}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MasterCard;