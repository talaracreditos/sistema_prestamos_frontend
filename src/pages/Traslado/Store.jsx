import React, { useState } from 'react';
import { useStore } from 'hooks/Traslado/useStore';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import {
    ArrowsRightLeftIcon, UserIcon, DocumentTextIcon,
    ChevronRightIcon, BuildingOfficeIcon, CheckCircleIcon,
    FunnelIcon, XMarkIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const EstadoCarteraBadge = ({ estado }) => {
    if (estado === 'mora') return (
        <span className="flex items-center gap-0.5 text-[8px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded px-1 uppercase transition-colors">
            <ExclamationTriangleIcon className="w-2.5 h-2.5" /> Mora
        </span>
    );
    if (estado === 'liquidado') return (
        <span className="text-[8px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded px-1 uppercase transition-colors">Liquidado</span>
    );
    return null;
};

const Store = () => {
    const {
        loading, loadingPrestamos, alert, setAlert,
        formData, prestamos, selectedIds,
        filtrosPrestamos, showPinModal, setShowPinModal,
        handleSelectAsesorOrigen, handleSelectAsesorDestino,
        handleTogglePrestamo, handleToggleTodos,
        handleFiltroChange, handleFiltroSubmit, handleFiltroClear,
        handleChange, handleSubmit, handleConfirmConPin,
    } = useStore();

    const [showFiltros, setShowFiltros] = useState(false);
    const todosSeleccionados = prestamos.length > 0 && selectedIds.length === prestamos.length;
    const algunoSeleccionado = selectedIds.length > 0;

    return (
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full xl:max-w-4xl transition-colors">
            <PageHeader title="Registrar Traslado" icon={ArrowsRightLeftIcon} buttonText="Ver Historial" buttonLink="/traslado/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">

                {/* ── 1. Asesor Origen ── */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 p-6 transition-colors">
                    <h3 className="text-xs font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> 1. Seleccionar Asesor Origen
                    </h3>
                    <EmpleadoSearchSelect rol="asesor" onSelect={handleSelectAsesorOrigen} clearOnSelect={false} />
                    {formData.asesor_origen_id && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-2 flex items-center gap-1 transition-colors">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Asesor seleccionado
                        </p>
                    )}
                </div>

                {/* ── 2. Préstamos con filtros ── */}
                <div className={`bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 p-6 transition-all ${!formData.asesor_origen_id ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest flex items-center gap-2 transition-colors">
                            <DocumentTextIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> 2. Seleccionar Préstamos
                        </h3>
                        <div className="flex items-center gap-3">
                            {prestamos.length > 0 && (
                                <button type="button" onClick={handleToggleTodos}
                                    className="text-[10px] font-black uppercase text-brand-red dark:text-brand-gold hover:underline transition-colors">
                                    {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                </button>
                            )}
                            <button type="button" onClick={() => setShowFiltros(v => !v)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all
                                    ${showFiltros ? 'bg-brand-red dark:bg-brand-red-glow text-white border-brand-red dark:border-transparent' : 'text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30'}`}>
                                <FunnelIcon className="w-3.5 h-3.5" /> Filtrar
                            </button>
                        </div>
                    </div>

                    {/* Panel de filtros */}
                    {showFiltros && (
                        <div className="mb-4 p-4 bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border space-y-3 transition-colors">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-3">
                                    <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">Buscar titular / ID</label>
                                    <input type="text" value={filtrosPrestamos.search}
                                        onChange={e => handleFiltroChange('search', e.target.value)}
                                        placeholder="Nombre o #ID..."
                                        className="w-full p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg outline-none focus:ring-1 focus:ring-brand-red dark:focus:ring-brand-gold transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">Monto mín.</label>
                                    <input type="number" value={filtrosPrestamos.monto_min}
                                        onChange={e => handleFiltroChange('monto_min', e.target.value)}
                                        placeholder="0"
                                        className="w-full p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg outline-none focus:ring-1 focus:ring-brand-red dark:focus:ring-brand-gold transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">Monto máx.</label>
                                    <input type="number" value={filtrosPrestamos.monto_max}
                                        onChange={e => handleFiltroChange('monto_max', e.target.value)}
                                        placeholder="99999"
                                        className="w-full p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg outline-none focus:ring-1 focus:ring-brand-red dark:focus:ring-brand-gold transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">Frecuencia</label>
                                    <select value={filtrosPrestamos.frecuencia}
                                        onChange={e => handleFiltroChange('frecuencia', e.target.value)}
                                        className="w-full p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg outline-none transition-colors">
                                        <option value="">Todas</option>
                                        <option value="SEMANAL">Semanal</option>
                                        <option value="CATORCENAL">Catorcenal</option>
                                        <option value="MENSUAL">Mensual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">Tipo</label>
                                    <select value={filtrosPrestamos.tipo}
                                        onChange={e => handleFiltroChange('tipo', e.target.value)}
                                        className="w-full p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg outline-none transition-colors">
                                        <option value="">Todos</option>
                                        <option value="individual">Individual</option>
                                        <option value="grupal">Grupal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">Cuotas pagadas mín.</label>
                                    <input type="number" min="0" value={filtrosPrestamos.cuotas_pagadas_min}
                                        onChange={e => handleFiltroChange('cuotas_pagadas_min', e.target.value)}
                                        placeholder="0"
                                        className="w-full p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg outline-none focus:ring-1 focus:ring-brand-red dark:focus:ring-brand-gold transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">Cuotas pagadas máx.</label>
                                    <input type="number" min="0" value={filtrosPrestamos.cuotas_pagadas_max}
                                        onChange={e => handleFiltroChange('cuotas_pagadas_max', e.target.value)}
                                        placeholder="99"
                                        className="w-full p-2 text-xs font-bold text-slate-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg outline-none focus:ring-1 focus:ring-brand-red dark:focus:ring-brand-gold transition-colors" />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={handleFiltroSubmit}
                                    className="flex-1 py-2 bg-brand-red dark:bg-brand-red-glow text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark dark:hover:brightness-110 transition-all">
                                    Aplicar Filtros
                                </button>
                                <button type="button" onClick={handleFiltroClear}
                                    className="px-4 py-2 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text text-[10px] font-black uppercase rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1">
                                    <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                                </button>
                            </div>
                        </div>
                    )}

                    {algunoSeleccionado && (
                        <div className="mb-3 px-3 py-1.5 bg-brand-red-light dark:bg-brand-gold/10 rounded-lg border border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <span className="text-[10px] font-black text-brand-red dark:text-brand-gold">
                                {selectedIds.length} préstamo{selectedIds.length > 1 ? 's' : ''} seleccionado{selectedIds.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {loadingPrestamos ? (
                        <div className="flex items-center gap-2 py-6 text-slate-400 dark:text-dark-text-muted text-xs font-bold transition-colors">
                            <div className="w-4 h-4 border-2 border-slate-200 dark:border-dark-border border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            Cargando préstamos...
                        </div>
                    ) : prestamos.length === 0 ? (
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted/60 font-bold py-4 text-center transition-colors">
                            {formData.asesor_origen_id ? 'No hay préstamos con los filtros aplicados.' : 'Selecciona un asesor primero.'}
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {prestamos.map((p) => {
                                const seleccionado = selectedIds.includes(p.id);
                                return (
                                    <button key={p.id} type="button" onClick={() => handleTogglePrestamo(p.id)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left
                                            ${seleccionado 
                                                ? 'border-brand-red dark:border-brand-gold bg-brand-red-light/40 dark:bg-brand-gold/10 shadow-sm' 
                                                : 'border-slate-100 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-dark-surface-alt bg-white dark:bg-dark-surface'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Checkbox */}
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                ${seleccionado ? 'bg-brand-red dark:bg-brand-gold border-brand-red dark:border-brand-gold text-white dark:text-black' : 'border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface'}`}>
                                                {seleccionado && (
                                                    <svg className="w-3 h-3 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${seleccionado ? 'bg-brand-red dark:bg-brand-gold text-white dark:text-black' : 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted'}`}>
                                                <BuildingOfficeIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase transition-colors">{p.titular}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-dark-text-muted">#{p.codigo}</span>
                                                    <span className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted uppercase">{p.frecuencia}</span>
                                                    {/* Cuotas pagadas */}
                                                    <span className="text-[9px] font-black text-slate-600 dark:text-dark-text bg-slate-100 dark:bg-dark-surface-alt rounded px-1 transition-colors">
                                                        {p.cuotas_label} cuotas
                                                    </span>
                                                    {p.es_grupal && (
                                                        <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded px-1 transition-colors">GRUPAL</span>
                                                    )}
                                                    <EstadoCarteraBadge estado={p.estado_cartera} />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-700 dark:text-dark-text flex-shrink-0 ml-2 transition-colors">
                                            S/ {parseFloat(p.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── 3. Asesor Destino ── */}
                <div className={`bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 p-6 transition-all ${!algunoSeleccionado ? 'opacity-40 pointer-events-none' : ''}`}>
                    <h3 className="text-xs font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors">
                        <ChevronRightIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> 3. Seleccionar Asesor Destino
                    </h3>
                    <EmpleadoSearchSelect rol="asesor" onSelect={handleSelectAsesorDestino} clearOnSelect={false} />
                    {formData.asesor_destino_id && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-2 flex items-center gap-1 transition-colors">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Asesor de destino seleccionado
                        </p>
                    )}
                </div>

                {/* ── 4. Motivo ── */}
                <div className={`bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 p-6 transition-all ${!formData.asesor_destino_id ? 'opacity-40 pointer-events-none' : ''}`}>
                    <h3 className="text-xs font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors">
                        <DocumentTextIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> 4. Motivo del Traslado (Opcional)
                    </h3>
                    <textarea value={formData.motivo} onChange={(e) => handleChange('motivo', e.target.value)}
                        rows={3} placeholder="Ej: Reasignación por zona, solicitud del cliente..."
                        className="w-full p-3.5 text-sm font-medium text-slate-700 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all resize-none placeholder-slate-400 dark:placeholder-dark-text-muted/60" />
                </div>

                {/* ── Botón ── */}
                <div className="flex justify-end pt-2">
                    <button type="submit"
                        disabled={loading || !algunoSeleccionado || !formData.asesor_destino_id}
                        className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow text-white dark:text-black px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                    >
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" /> Procesando...</>
                            : <><ArrowsRightLeftIcon className="w-4 h-4" /> Confirmar Traslado{selectedIds.length > 1 ? ` (${selectedIds.length})` : ''}</>
                        }
                    </button>
                </div>
            </form>

            {showPinModal && (
                <ConfirmModal
                    title="Autorizar Traslado"
                    message={`Se trasladarán ${selectedIds.length} préstamo${selectedIds.length > 1 ? 's' : ''}. Ingresa el PIN para confirmar.`}
                    confirmText="Confirmar Traslado"
                    requirePin={true}
                    onConfirm={handleConfirmConPin}
                    onCancel={() => setShowPinModal(false)}
                />
            )}
        </div>
    );
};

export default Store;