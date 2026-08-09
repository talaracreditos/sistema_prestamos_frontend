import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Zona/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { MapIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const { can } = useAuth();
    const canStatus = can('zona.status');
    const canUpdate = can('zona.update');
    const canDelete = can('zona.delete');
    const canStore  = can('zona.store');

    const {
        loading, zonas, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, showDelete, setShowDelete,
        fetchZonas, handleAskStatus, handleConfirmStatus, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const columns = useMemo(() => {
        const base = [
            {
                header: 'Zona Comercial',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border bg-brand-red-light/50 dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <MapIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre}</span>
                        </div>
                    </div>
                )
            },
        ];

        if (canStatus) {
            base.push({
                header: 'Estado',
                render: (row) => (
                    <button onClick={() => handleAskStatus(row.id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all hover:scale-105
                            ${row.activo ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20'}`}>
                        {row.activo ? 'Activa' : 'Inactiva'}
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
                                to={`/zona/editar/${row.id}`}
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
    }, [handleAskStatus, handleAskDelete, canStatus, canUpdate, canDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader 
                title="Gestión de Zonas" 
                icon={MapIcon} 
                buttonText={canStore ? "+ Nueva Zona" : null}
                buttonLink={canStore ? "/zona/agregar" : null}
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={zonas} loading={loading}
                filterConfig={[
                    { name: 'search', type: 'text', label: 'Buscar Zona', colSpan: 'col-span-8' }, 
                    { name: 'activo', type: 'select', label: 'Estado', colSpan: 'col-span-4', options: [{ value: '', label: 'Todas' }, { value: '1', label: 'Activas' }, { value: '0', label: 'Inactivas' }] }
                ]} 
                filters={filters} onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchZonas }}
            />

            {showConfirm && <ConfirmModal message="¿Cambiar el estado de esta zona?" onConfirm={handleConfirmStatus} onCancel={() => setShowConfirm(false)} />}
            {showDelete && <ConfirmModal title="¿Eliminar Zona?" message="Esta acción no se puede deshacer. No podrás eliminarla si tiene clientes asignados." confirmText="Sí, Eliminar" onConfirm={handleConfirmDelete} onCancel={() => setShowDelete(false)} />}
        </div>
    );
};

export default Index;