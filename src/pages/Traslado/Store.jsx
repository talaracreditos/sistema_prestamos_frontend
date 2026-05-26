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
        <span className="flex items-center gap-0.5 text-[8px] font-black text-red-600 bg-red-50 border border-red-200 rounded px-1 uppercase">
            <ExclamationTriangleIcon className="w-2.5 h-2.5" /> Mora
        </span>
    );
    if (estado === 'liquidado') return (
        <span className="text-[8px] font-black text-green-600 bg-green-50 border border-green-200 rounded px-1 uppercase">Liquidado</span>
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
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full xl:max-w-4xl">
            <PageHeader title="Registrar Traslado" icon={ArrowsRightLeftIcon} buttonText="Ver Historial" buttonLink="/traslado/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">

                {/* ── 1. Asesor Origen ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-brand-red" /> 1. Seleccionar Asesor Origen
                    </h3>
                    <EmpleadoSearchSelect rol="asesor" onSelect={handleSelectAsesorOrigen} clearOnSelect={false} />
                    {formData.asesor_origen_id && (
                        <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Asesor seleccionado
                        </p>
                    )}
                </div>

                {/* ── 2. Préstamos con filtros ── */}
                <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all ${!formData.asesor_origen_id ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4 text-brand-red" /> 2. Seleccionar Préstamos
                        </h3>
                        <div className="flex items-center gap-3">
                            {prestamos.length > 0 && (
                                <button type="button" onClick={handleToggleTodos}
                                    className="text-[10px] font-black uppercase text-brand-red hover:underline">
                                    {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                </button>
                            )}
                            <button type="button" onClick={() => setShowFiltros(v => !v)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all
                                    ${showFiltros ? 'bg-brand-red text-white border-brand-red' : 'text-slate-500 border-slate-200 hover:border-brand-red/30'}`}>
                                <FunnelIcon className="w-3.5 h-3.5" /> Filtrar
                            </button>
                        </div>
                    </div>

                    {/* Panel de filtros */}
                    {showFiltros && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-3">
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Buscar titular / ID</label>
                                    <input type="text" value={filtrosPrestamos.search}
                                        onChange={e => handleFiltroChange('search', e.target.value)}
                                        placeholder="Nombre o #ID..."
                                        className="w-full p-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-red" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Monto mín.</label>
                                    <input type="number" value={filtrosPrestamos.monto_min}
                                        onChange={e => handleFiltroChange('monto_min', e.target.value)}
                                        placeholder="0"
                                        className="w-full p-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-red" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Monto máx.</label>
                                    <input type="number" value={filtrosPrestamos.monto_max}
                                        onChange={e => handleFiltroChange('monto_max', e.target.value)}
                                        placeholder="99999"
                                        className="w-full p-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-red" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Frecuencia</label>
                                    <select value={filtrosPrestamos.frecuencia}
                                        onChange={e => handleFiltroChange('frecuencia', e.target.value)}
                                        className="w-full p-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none">
                                        <option value="">Todas</option>
                                        <option value="SEMANAL">Semanal</option>
                                        <option value="CATORCENAL">Catorcenal</option>
                                        <option value="MENSUAL">Mensual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Tipo</label>
                                    <select value={filtrosPrestamos.tipo}
                                        onChange={e => handleFiltroChange('tipo', e.target.value)}
                                        className="w-full p-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none">
                                        <option value="">Todos</option>
                                        <option value="individual">Individual</option>
                                        <option value="grupal">Grupal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Cuotas pagadas mín.</label>
                                    <input type="number" min="0" value={filtrosPrestamos.cuotas_pagadas_min}
                                        onChange={e => handleFiltroChange('cuotas_pagadas_min', e.target.value)}
                                        placeholder="0"
                                        className="w-full p-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-red" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Cuotas pagadas máx.</label>
                                    <input type="number" min="0" value={filtrosPrestamos.cuotas_pagadas_max}
                                        onChange={e => handleFiltroChange('cuotas_pagadas_max', e.target.value)}
                                        placeholder="99"
                                        className="w-full p-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-red" />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={handleFiltroSubmit}
                                    className="flex-1 py-2 bg-brand-red text-white text-[10px] font-black uppercase rounded-lg hover:bg-brand-red-dark transition-all">
                                    Aplicar Filtros
                                </button>
                                <button type="button" onClick={handleFiltroClear}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-200 transition-all flex items-center gap-1">
                                    <XMarkIcon className="w-3.5 h-3.5" /> Limpiar
                                </button>
                            </div>
                        </div>
                    )}

                    {algunoSeleccionado && (
                        <div className="mb-3 px-3 py-1.5 bg-brand-red-light rounded-lg border border-brand-red/20">
                            <span className="text-[10px] font-black text-brand-red">
                                {selectedIds.length} préstamo{selectedIds.length > 1 ? 's' : ''} seleccionado{selectedIds.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {loadingPrestamos ? (
                        <div className="flex items-center gap-2 py-6 text-slate-400 text-xs font-bold">
                            <div className="w-4 h-4 border-2 border-slate-200 border-t-brand-red rounded-full animate-spin" />
                            Cargando préstamos...
                        </div>
                    ) : prestamos.length === 0 ? (
                        <p className="text-[11px] text-slate-400 font-bold py-4 text-center">
                            {formData.asesor_origen_id ? 'No hay préstamos con los filtros aplicados.' : 'Selecciona un asesor primero.'}
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {prestamos.map((p) => {
                                const seleccionado = selectedIds.includes(p.id);
                                return (
                                    <button key={p.id} type="button" onClick={() => handleTogglePrestamo(p.id)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left
                                            ${seleccionado ? 'border-brand-red bg-brand-red-light/40 shadow-sm' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Checkbox */}
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                ${seleccionado ? 'bg-brand-red border-brand-red' : 'border-slate-300 bg-white'}`}>
                                                {seleccionado && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className={`p-2 rounded-lg flex-shrink-0 ${seleccionado ? 'bg-brand-red text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                <BuildingOfficeIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-700 uppercase">{p.titular}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="font-mono text-[9px] font-bold text-slate-400">#{p.codigo}</span>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{p.frecuencia}</span>
                                                    {/* Cuotas pagadas */}
                                                    <span className="text-[9px] font-black text-slate-600 bg-slate-100 rounded px-1">
                                                        {p.cuotas_label} cuotas
                                                    </span>
                                                    {p.es_grupal && (
                                                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 border border-blue-200 rounded px-1">GRUPAL</span>
                                                    )}
                                                    <EstadoCarteraBadge estado={p.estado_cartera} />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-slate-700 flex-shrink-0 ml-2">
                                            S/ {parseFloat(p.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── 3. Asesor Destino ── */}
                <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all ${!algunoSeleccionado ? 'opacity-40 pointer-events-none' : ''}`}>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ChevronRightIcon className="w-4 h-4 text-brand-red" /> 3. Seleccionar Asesor Destino
                    </h3>
                    <EmpleadoSearchSelect rol="asesor" onSelect={handleSelectAsesorDestino} clearOnSelect={false} />
                    {formData.asesor_destino_id && (
                        <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Asesor de destino seleccionado
                        </p>
                    )}
                </div>

                {/* ── 4. Motivo ── */}
                <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all ${!formData.asesor_destino_id ? 'opacity-40 pointer-events-none' : ''}`}>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-brand-red" /> 4. Motivo del Traslado (Opcional)
                    </h3>
                    <textarea value={formData.motivo} onChange={(e) => handleChange('motivo', e.target.value)}
                        rows={3} placeholder="Ej: Reasignación por zona, solicitud del cliente..."
                        className="w-full p-3.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none transition-all resize-none" />
                </div>

                {/* ── Botón ── */}
                <div className="flex justify-end pt-2">
                    <button type="submit"
                        disabled={loading || !algunoSeleccionado || !formData.asesor_destino_id}
                        className="w-full sm:w-auto bg-brand-red text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 hover:bg-brand-red-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                    >
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Procesando...</>
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