import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/EntidadBancaria/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { BuildingLibraryIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const { can } = useAuth();
    const canStore  = can('entidadBancaria.store');
    const canStatus = can('entidadBancaria.status');
    const canUpdate = can('entidadBancaria.update');
    const canDelete = can('entidadBancaria.delete');

    const {
        loading, entidades, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, showDeleteConfirm, setShowDeleteConfirm,
        fetchEntidades, handleAskToggle, handleConfirmToggle, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const columns = useMemo(() => {
        const base = [
            {
                header: 'Entidad Bancaria',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-red-light/50 dark:bg-dark-surface-alt border border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <BuildingLibraryIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                        </div>
                        <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre}</span>
                    </div>
                )
            },
            {
                header: 'Validaciones',
                render: (row) => (
                    <div className="text-xs text-slate-600 dark:text-dark-text-muted font-medium transition-colors">
                        <p>Cta: <b className="text-black dark:text-dark-text">{row.longitud_cuenta} díg.</b></p>
                        <p>CCI: <b className="text-black dark:text-dark-text">{row.longitud_cci} díg.</b></p>
                    </div>
                )
            },
        ];

        if (canStatus) {
            base.push({
                header: 'Estado',
                render: (row) => (
                    <button
                        onClick={() => handleAskToggle(row.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-transform hover:scale-105 shadow-sm border
                            ${row.estado ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20'}`}
                    >
                        {row.estado ? 'Activo' : 'Inactivo'}
                    </button>
                )
            });
        }

        if (canUpdate || canDelete) {
            base.push({
                header: 'Acciones',
                render: (row) => (
                    <div className="flex items-center gap-2 justify-end">
                        {canUpdate && (
                            <Link 
                                to={`/entidadBancaria/editar/${row.id}`}
                                title="Editar"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                        )}
                        {canDelete && (
                            <button 
                                onClick={() => handleAskDelete(row.id)}
                                title="Eliminar"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-red-500/20 shadow-sm"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )
            });
        }

        return base;
    }, [handleAskToggle, handleAskDelete, canStatus, canUpdate, canDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader 
                title="Entidades Bancarias" 
                icon={BuildingLibraryIcon} 
                buttonText={canStore ? "+ Nueva Entidad" : null}
                buttonLink={canStore ? "/entidadBancaria/agregar" : null}
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={entidades} loading={loading}
                filterConfig={[
                    { name: 'search', type: 'text', label: 'Buscar Entidad', colSpan: 'col-span-8' }, 
                    { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-4', options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }] }
                ]} 
                filters={filters} onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchEntidades }}
            />

            {showConfirm && (
                <ConfirmModal
                    message="¿Deseas cambiar el estado de esta entidad?"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            {showDeleteConfirm && (
                <ConfirmModal
                    title="¿Eliminar Banco?"
                    message="Esta acción es irreversible. Si el banco tiene cuentas asociadas, el sistema bloqueará la eliminación."
                    confirmText="Sí, Eliminar"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </div>
    );
};

export default Index;