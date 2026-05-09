import React, { useMemo } from 'react';
import { useIndex } from 'hooks/Rol/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ShieldCheckIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon, ArrowLeftIcon, MagnifyingGlassIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, roles, paginationInfo, alert, setAlert, fetchRoles,
        isEditing, editLoading, selectedRole, allPermisos,
        checkedPermisos, permisoBloqueados, togglePermission, toggleTodos, toggleModulo,
        handleManage, handleSave, handleCancel, isSaving,
        moduleFilter, setModuleFilter,
    } = useIndex();

    const columns = useMemo(() => [
        {
            header: 'Rol',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black uppercase text-slate-800">{row.nombre}</span>
                    <span className="text-[10px] text-slate-400">{row.descripcion || 'Sin descripción'}</span>
                </div>
            )
        },
        {
            header: 'Permisos Habilitados',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-brand-gold-dark" />
                    <span className="font-bold text-sm bg-brand-gold-light text-brand-gold-dark px-2 py-0.5 rounded-md border border-brand-gold/30 shadow-sm">
                        {row.permisos_count} permisos
                    </span>
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <button
                    onClick={() => handleManage(row.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red text-white hover:bg-brand-red-dark rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                    Gestionar
                </button>
            )
        }
    ], [handleManage]);

    const groupedPermisos = useMemo(() => {
        return allPermisos.reduce((acc, perm) => {
            const [modulo] = perm.nombre.split('.');
            if (!acc[modulo]) acc[modulo] = [];
            acc[modulo].push(perm);
            return acc;
        }, {});
    }, [allPermisos]);

    const filteredGroupedPermisos = useMemo(() => {
        if (!moduleFilter) return groupedPermisos;
        const lowerFilter = moduleFilter.toLowerCase();
        const filtered = {};
        Object.entries(groupedPermisos).forEach(([modulo, permisos]) => {
            if (modulo.toLowerCase().includes(lowerFilter)) filtered[modulo] = permisos;
        });
        return filtered;
    }, [groupedPermisos, moduleFilter]);

    const todosIds           = allPermisos.map(p => p.id);
    const todosSeleccionados = todosIds.length > 0 && todosIds.every(id => checkedPermisos.includes(id));
    const algunoSeleccionado = todosIds.some(id => checkedPermisos.includes(id)) && !todosSeleccionados;

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Gestión de Roles y Permisos" icon={ShieldCheckIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {!isEditing ? (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-6">
                    <Table
                        columns={columns}
                        data={roles}
                        loading={loading}
                        pagination={{ ...paginationInfo, onPageChange: fetchRoles }}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-6 flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-brand-red hover:bg-brand-red-light rounded-full transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-lg font-black uppercase text-slate-800">
                                    Permisos: <span className="text-brand-red">{selectedRole?.nombre}</span>
                                </h2>
                                <p className="text-sm text-slate-500 font-medium mt-0.5">
                                    Marca o desmarca las casillas para asignar o revocar accesos.
                                    {permisoBloqueados.length > 0 && (
                                        <span className="ml-2 text-brand-gold-dark font-black">
                                            🔒 Algunos permisos son obligatorios y no pueden removerse.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar módulo..."
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                    className="pl-9 pr-4 py-2.5 text-sm font-bold text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none w-full md:w-64 transition-all"
                                />
                                <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>

                            <button
                                onClick={toggleTodos}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all border ${
                                    todosSeleccionados
                                        ? 'bg-brand-red text-white border-brand-red hover:bg-brand-red-dark'
                                        : 'bg-white text-slate-600 border-slate-300 hover:border-brand-red/40 hover:text-brand-red'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={todosSeleccionados}
                                    ref={el => { if (el) el.indeterminate = algunoSeleccionado; }}
                                    className="w-3.5 h-3.5 accent-brand-red pointer-events-none"
                                />
                                {todosSeleccionados ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </button>

                            <span className="text-xs font-black bg-brand-red-light/50 text-brand-red px-3 py-2.5 rounded-xl border border-brand-red/20 whitespace-nowrap">
                                {checkedPermisos.length} activos
                            </span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="p-6 bg-slate-50 min-h-[400px]">
                        {editLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-red rounded-full animate-spin mb-4" />
                                <p className="font-bold text-sm uppercase tracking-widest">Cargando configuración...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.keys(filteredGroupedPermisos).length > 0 ? (
                                    Object.entries(filteredGroupedPermisos).map(([modulo, permisos]) => {
                                        const idsModulo    = permisos.map(p => p.id);
                                        const todosActivos = idsModulo.every(id => checkedPermisos.includes(id));
                                        const algunoActivo = idsModulo.some(id => checkedPermisos.includes(id)) && !todosActivos;
                                        const moduloBloqueado = idsModulo.every(id => permisoBloqueados.includes(id));

                                        return (
                                            <div key={modulo} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit hover:shadow-md hover:border-brand-red/30 transition-all">

                                                <div
                                                    className={`px-5 py-3 flex items-center justify-between border-b border-brand-gold/20 select-none ${moduloBloqueado ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900 cursor-pointer'}`}
                                                    onClick={() => !moduloBloqueado && toggleModulo(permisos)}
                                                >
                                                    <div className="flex items-center gap-2.5 flex-1">
                                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                                            todosActivos
                                                                ? 'bg-brand-red border-brand-red'
                                                                : algunoActivo
                                                                    ? 'bg-brand-red/40 border-brand-red'
                                                                    : 'border-slate-500 bg-transparent'
                                                        }`}>
                                                            {todosActivos && (
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                            {algunoActivo && (
                                                                <div className="w-1.5 h-0.5 bg-white rounded" />
                                                            )}
                                                        </div>
                                                        <span className="font-black uppercase text-[11px] tracking-[0.2em] text-brand-gold">{modulo}</span>
                                                        {moduloBloqueado && (
                                                            <span className="ml-1 text-[9px] font-black text-brand-gold/60 uppercase tracking-widest flex items-center gap-1">
                                                                <LockClosedIcon className="w-3 h-3" /> bloqueado
                                                            </span>
                                                        )}
                                                    </div>
                                                    <CheckBadgeIcon className="w-4 h-4 text-brand-gold opacity-70 flex-shrink-0" />
                                                </div>

                                                <div className="p-3 space-y-1.5">
                                                    {permisos.map(perm => {
                                                        const bloqueado = permisoBloqueados.includes(perm.id);
                                                        return (
                                                            <label
                                                                key={perm.id}
                                                                className={`flex items-start gap-3 p-2.5 rounded-xl border border-transparent transition-colors group ${
                                                                    bloqueado
                                                                        ? 'opacity-60 cursor-not-allowed bg-slate-50'
                                                                        : 'hover:bg-brand-red-light/30 hover:border-brand-red/10 cursor-pointer'
                                                                }`}
                                                            >
                                                                {bloqueado ? (
                                                                    <LockClosedIcon className="mt-0.5 w-4 h-4 text-slate-400 flex-shrink-0" />
                                                                ) : (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checkedPermisos.includes(perm.id)}
                                                                        onChange={() => togglePermission(perm.id)}
                                                                        className="mt-0.5 w-4 h-4 text-brand-red rounded border-slate-300 focus:ring-brand-red cursor-pointer accent-brand-red"
                                                                    />
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className={`text-[11px] font-black transition-colors ${checkedPermisos.includes(perm.id) ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                                                        {perm.nombre}
                                                                    </span>
                                                                    <span className="text-[10px] font-medium text-slate-400 leading-tight mt-0.5">
                                                                        {perm.descripcion}
                                                                    </span>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full text-center py-10 text-slate-400">
                                        <p className="font-bold uppercase tracking-widest text-xs">No se encontraron módulos para "{moduleFilter}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-5 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-8 py-3 text-xs font-black uppercase text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || editLoading}
                            className="px-10 py-3 text-xs font-black uppercase text-white bg-brand-red hover:bg-brand-red-dark rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 tracking-wide active:scale-95"
                        >
                            {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;