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
                    <span className="font-mono text-[15px] font-black px-2 py-1 rounded text-slate-600">
                        {row.id}
                    </span>
                )
            },
            {
                header: 'Empleado',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-red-light/50 p-2.5 rounded-xl border border-brand-red/20">
                            <UserIcon className="w-5 h-5 text-brand-red" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-sm uppercase">{row.nombre_completo}</span>
                            <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
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
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            <IdentificationIcon className="w-3 h-3 text-slate-400"/> {row.dni}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3 text-slate-400"/> {row.telefono}
                        </span>
                    </div>
                )
            },
            {
                header: 'Rol',
                render: (row) => (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase font-black border shadow-sm ${
                        row.rol === 'Administrador' 
                        ? 'bg-brand-gold-light text-brand-gold-dark border-brand-gold/30' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
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
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform shadow-sm
                            ${row.estado ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-red-light text-brand-red border border-brand-red/30'}`}
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
                                className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm"
                            >
                                <EyeIcon className="w-4 h-4" />
                            </button>
                        )}
                        {canUpdate && (
                            <Link 
                                to={`/empleado/editar/${row.id}`} 
                                title="Editar Empleado"
                                className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm"
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
        <div className="container mx-auto p-4 sm:p-6 animate-in fade-in duration-500">
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
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 border-b border-slate-100 pb-6">
                            <div className="w-16 h-16 bg-brand-red-light/50 rounded-2xl flex items-center justify-center border border-brand-red/20 shrink-0 shadow-sm">
                                <UserIcon className="w-8 h-8 text-brand-red"/>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</h4>
                                <p className="text-slate-800 font-black text-xl uppercase leading-tight">
                                    {viewData.nombre} {viewData.apellidoPaterno} {viewData.apellidoMaterno}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                                        <IdentificationIcon className="w-4 h-4 text-brand-red"/> {viewData.dni}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                                        <PhoneIcon className="w-4 h-4 text-brand-red"/> {viewData.telefono}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha Nacimiento</h4>
                                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                                    <CalendarDaysIcon className="w-4 h-4 text-slate-400"/>
                                    {viewData.fechaNacimiento}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado Civil</h4>
                                <p className="text-slate-800 font-bold text-sm uppercase">{viewData.estadoCivil}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sexo</h4>
                                <p className="text-slate-800 font-bold text-sm uppercase">{viewData.sexo}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirección</h4>
                                <div className="flex items-start gap-2 text-slate-800 font-bold text-sm uppercase">
                                    <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"/>
                                    {viewData.direccion}
                                </div>
                            </div>
                        </div>

                        {viewData.usuario && (
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mt-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-sm font-black text-slate-700 uppercase flex items-center gap-2">
                                        <BriefcaseIcon className="w-4 h-4 text-brand-gold-dark"/> Acceso al Sistema
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border shadow-sm ${viewData.usuario.estado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-brand-red-light text-brand-red border-brand-red/30'}`}>
                                        {viewData.usuario.estado ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Usuario</p>
                                        <p className="font-bold text-slate-800 text-sm">{viewData.usuario.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rol Asignado</p>
                                        <p className="font-bold text-brand-gold-dark text-sm uppercase">
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