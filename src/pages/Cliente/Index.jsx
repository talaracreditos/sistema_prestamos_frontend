import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Cliente/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import FichaClienteModal from './FichaClienteModal';
import {
    UserGroupIcon, PencilSquareIcon, IdentificationIcon,
    BriefcaseIcon, EyeIcon, CalendarDaysIcon, BuildingOfficeIcon, UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from 'context/AuthContext';

const Index = () => {
    const { can } = useAuth(); 
    const {
        loading, clientes, paginationInfo, filters, alert, setAlert,
        isViewOpen, setIsViewOpen, viewData, viewLoading,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchClientes, handleView, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar (Nombre/DNI/RUC/Razón Social)', placeholder: 'Ej: Juan, 12345678, Empresa SAC...', colSpan: 'col-span-12 md:col-span-5' },
        { name: 'tipo',   type: 'select', label: 'Tipo', colSpan: 'col-span-12 md:col-span-3',
          options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Persona Natural' }, { value: '2', label: 'Empresa' }] },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
          options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }] }
    ], []);

    const columns = useMemo(() => {
        const canShow   = can('cliente.show');
        const canUpdate = can('cliente.update');
        const canStatus = can('cliente.status');

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
                header: 'Cliente',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full border transition-colors ${row.tipo === 2 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-brand-red-light dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20'}`}>
                            {row.tipo === 2
                                ? <BuildingOfficeIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                : <UserIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" />
                            }
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-dark-text text-sm transition-colors">{row.nombre_completo}</span>
                            <span className="text-xs text-slate-500 dark:text-dark-text-muted flex items-center gap-1 transition-colors">
                                <BriefcaseIcon className="w-3 h-3"/> {row.usuario || 'Sin usuario'}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                header: 'Tipo / Documento',
                render: (row) => (
                    <div className="flex flex-col gap-1">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border w-fit transition-colors ${
                            row.tipo === 2
                                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                                : 'bg-brand-red-light dark:bg-brand-gold/15 text-brand-red dark:text-brand-gold border-brand-red/20 dark:border-brand-gold/20'
                        }`}>
                            {row.tipo === 2 ? 'Empresa' : 'Persona Natural'}
                        </span>
                        <span className="text-sm font-bold text-slate-600 dark:text-dark-text-muted flex items-center gap-1 transition-colors">
                            <IdentificationIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted"/>
                            {row.documento || 'S/N'}
                        </span>
                    </div>
                )
            },
            {
                header: 'Registro',
                render: (row) => (
                    <span className="text-xs text-slate-500 dark:text-dark-text-muted flex items-center gap-1 transition-colors">
                        <CalendarDaysIcon className="w-4 h-4"/> {row.created_at?.split(' ')[0]}
                    </span>
                )
            },
        ];

        if (canStatus) {
            base.push({
                header: 'Acceso Sistema',
                render: (row) => (
                    <button
                        onClick={() => handleAskToggle(row.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform shadow-sm
                            ${row.estado ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30' : 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border border-brand-red/30 dark:border-red-500/30'}`}
                    >
                        {row.estado ? 'Activo' : 'Bloqueado'}
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
                                to={`/cliente/editar/${row.id}`}
                                title="Editar"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-slate-800 dark:hover:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-dark-border shadow-sm"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                )
            });
        }

        return base;
    }, [handleAskToggle, handleView, can]);

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader
                title="Gestión de Clientes"
                icon={UserGroupIcon}
                buttonText={can('cliente.store') ? "+ Nuevo Cliente" : null}
                buttonLink={can('cliente.store') ? "/cliente/agregar" : null}
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <Table
                columns={columns} data={clientes} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchClientes }}
            />
            {showConfirm && (
                <ConfirmModal
                    message="¿Estás seguro de cambiar el acceso al sistema de este cliente?"
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}
            <FichaClienteModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={viewData}
                isLoading={viewLoading}
            />
        </div>
    );
};

export default Index;