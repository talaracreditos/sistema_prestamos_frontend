import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Empleado/useIndex';
import { useAuth } from 'context/AuthContext';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import ViewModal from 'components/Shared/Modals/ViewModal';
import RolSearchSelect from 'components/Shared/Comboboxes/RolSearchSelect';

import { 
    UserIcon, PencilSquareIcon, PhoneIcon, IdentificationIcon, 
    BriefcaseIcon, EyeIcon, MapPinIcon, CalendarDaysIcon
} from '@heroicons/react/24/outline';

const Index = () => {
    const { can } = useAuth();
    const canStore  = can('empleado.store');
    const canShow   = can('empleado.show');
    const canUpdate = can('empleado.update');
    const canStatus = can('empleado.status');

    const {
        loading, empleados, paginationInfo, filters, setFilters, alert, setAlert,
        isViewOpen, setIsViewOpen, viewData, viewLoading,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchEmpleados, handleView, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { 
            name: 'search', type: 'text', label: 'Buscar (Nombre/DNI)', 
            placeholder: 'Ej: Juan, 12345678...', colSpan: 'col-span-12 md:col-span-4' 
        },
        {
            name: 'rol_id', type: 'custom', label: '', colSpan: 'col-span-12 md:col-span-4',
            render: () => <RolSearchSelect form={filters} setForm={setFilters} isFilter={true} />
        },
        {
            name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
            options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }]
        }
    ], [filters, setFilters]);

    const columns = useMemo(() => {
        const base = [
            { 
                header: 'ID', 
                render: (row) => (
                    <span className="font-mono text-[15px] font-black px-2 py-1 rounded text-slate-600 dark:text-dark-text transition-colors">
                        {row.id}
                    </span>
                )
            },
            {
                header: 'Empleado',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-red-light/50 dark:bg-dark-surface-alt p-2.5 rounded-xl border border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <UserIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre_completo}</span>
                            <span className="text-xs text-slate-500 dark:text-dark-text-muted font-bold flex items-center gap-1 transition-colors">
                                <UserIcon className="w-3 h-3"/> {row.usuario?.username || 'Sin usuario'}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                header: 'Documento / Contacto',
                render: (row) => (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-dark-text flex items-center gap-1 transition-colors">
                            <IdentificationIcon className="w-3 h-3 text-slate-400 dark:text-dark-text-muted"/> {row.dni}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-dark-text-muted flex items-center gap-1 transition-colors">
                            <PhoneIcon className="w-3 h-3 text-slate-400 dark:text-dark-text-muted"/> {row.telefono}
                        </span>
                    </div>
                )
            },
            {
                header: 'Rol',
                render: (row) => (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase font-black border shadow-sm transition-colors ${
                        row.rol === 'Administrador' 
                        ? 'bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border-brand-gold/30 dark:border-brand-gold/20' 
                        : 'bg-slate-50 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'
                    }`}>
                        <BriefcaseIcon className="w-3 h-3"/>
                        {row.rol || 'Sin Rol'}
                    </span>
                )
            },
        ];

        if (canStatus) {
            base.push({
                header: 'Estado',
                render: (row) => (
                    <button 
                        onClick={() => handleAskToggle(row.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform shadow-sm border
                            ${row.estado ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20'}`}
                    >
                        {row.estado ? 'Activo' : 'Inactivo'}
                    </button>
                )
            });
        }

        if (canShow || canUpdate) {
            base.push({
                header: 'Acciones',
                render: (row) => (
                    <div className="flex items-center gap-2 justify-end">
                        {canShow && (
                            <button 
                                onClick={() => handleView(row.id)}
                                title="Ver Detalle"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                            >
                                <EyeIcon className="w-4 h-4" />
                            </button>
                        )}
                        {canUpdate && (
                            <Link 
                                to={`/empleado/editar/${row.id}`} 
                                title="Editar Empleado"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                )
            });
        }

        return base;
    }, [handleAskToggle, handleView, canStatus, canShow, canUpdate]);

    return (
        <div className="container mx-auto p-4 sm:p-6 animate-in fade-in duration-500 transition-colors">
            <PageHeader 
                title="Gestión de Empleados" 
                icon={UserIcon} 
                buttonText={canStore ? "+ Nuevo Empleado" : null}
                buttonLink={canStore ? "/empleado/agregar" : null}
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="mt-4">
                <Table
                    columns={columns} data={empleados} loading={loading}
                    filterConfig={filterConfig} filters={filters}
                    onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                    pagination={{ ...paginationInfo, onPageChange: fetchEmpleados }}
                />
            </div>

            {showConfirm && (
                <ConfirmModal 
                    message="¿Estás seguro de cambiar el acceso al sistema de este empleado? Si lo desactivas, no podrá iniciar sesión."
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}

            <ViewModal 
                isOpen={isViewOpen} 
                onClose={() => setIsViewOpen(false)} 
                title="Ficha del Empleado"
                isLoading={viewLoading}
                hideFooter={true}
            >
                {viewData && (
                    <div className="space-y-6 transition-colors">
                        <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 dark:border-dark-border pb-6 transition-colors">
                            <div className="w-16 h-16 bg-brand-red-light/50 dark:bg-dark-surface-alt rounded-2xl flex items-center justify-center border border-brand-red/20 dark:border-brand-gold/20 shrink-0 shadow-sm transition-colors">
                                <UserIcon className="w-8 h-8 text-brand-red dark:text-brand-gold"/>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Nombre Completo</h4>
                                <p className="text-slate-800 dark:text-dark-text font-black text-xl uppercase leading-tight transition-colors">
                                    {viewData.nombre} {viewData.apellidoPaterno} {viewData.apellidoMaterno}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border transition-colors">
                                        <IdentificationIcon className="w-4 h-4 text-brand-red dark:text-brand-gold"/> {viewData.dni}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border transition-colors">
                                        <PhoneIcon className="w-4 h-4 text-brand-red dark:text-brand-gold"/> {viewData.telefono}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Fecha Nacimiento</h4>
                                <div className="flex items-center gap-2 text-slate-800 dark:text-dark-text font-bold text-sm transition-colors">
                                    <CalendarDaysIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted"/>
                                    {viewData.fechaNacimiento}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Estado Civil</h4>
                                <p className="text-slate-800 dark:text-dark-text font-bold text-sm uppercase transition-colors">{viewData.estadoCivil}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Sexo</h4>
                                <p className="text-slate-800 dark:text-dark-text font-bold text-sm uppercase transition-colors">{viewData.sexo}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Dirección</h4>
                                <div className="flex items-start gap-2 text-slate-800 dark:text-dark-text font-bold text-sm uppercase transition-colors">
                                    <MapPinIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted mt-0.5 shrink-0"/>
                                    {viewData.direccion}
                                </div>
                            </div>
                        </div>

                        {viewData.usuario && (
                            <div className="bg-slate-50 dark:bg-dark-surface-alt p-5 rounded-2xl border border-slate-200 dark:border-dark-border mt-4 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-sm font-black text-slate-700 dark:text-dark-text uppercase flex items-center gap-2 transition-colors">
                                        <BriefcaseIcon className="w-4 h-4 text-brand-gold-dark dark:text-brand-gold"/> Acceso al Sistema
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm transition-colors ${viewData.usuario.estado ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20'}`}>
                                        {viewData.usuario.estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Usuario</p>
                                        <p className="font-bold text-slate-800 dark:text-dark-text text-sm transition-colors">{viewData.usuario.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Rol Asignado</p>
                                        <p className="font-bold text-brand-gold-dark dark:text-brand-gold text-sm uppercase transition-colors">
                                            {viewData.usuario.rol ? viewData.usuario.rol.nombre : 'Sin Rol'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ViewModal>
        </div>
    );
};

export default Index;