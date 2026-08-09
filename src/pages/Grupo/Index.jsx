import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Grupo/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import ZonaSearchSelect from 'components/Shared/Comboboxes/ZonaSearchSelect';
import { UserGroupIcon, PencilSquareIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, grupos, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete,
        fetchGrupos, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const [zonaKey, setZonaKey] = useState(Date.now());

    const onClearFilters = () => {
        handleFilterClear();
        setZonaKey(Date.now());
    };

    const columns = useMemo(() => [
        { 
            header: 'ID', 
            render: (row) => (
                <span className="font-mono text-[15px] font-black px-2 py-1 rounded text-slate-600 dark:text-dark-text transition-colors">
                    {row.id}
                </span>
            )
        },
        {
            header: 'Grupo Solidario',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border bg-slate-100 dark:bg-dark-surface-alt border-slate-200 dark:border-dark-border transition-colors">
                        <UserGroupIcon className="w-5 h-5 text-slate-600 dark:text-dark-text-muted" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Zona Operativa',
            render: (row) => (
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-500/20 uppercase transition-colors">
                    {row.zona}
                </span>
            )
        },
        {
            header: 'Ciclos',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                    <span className="text-xs font-bold text-slate-600 dark:text-dark-text transition-colors">
                        {row.ciclos_count} Ciclos
                    </span>
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <Link 
                        to={`/grupo/editar/${row.id}`}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button 
                        onClick={() => handleAskDelete(row.id)}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-red-500/20 shadow-sm"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], [handleAskDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader title="Grupos Solidarios" icon={UserGroupIcon} buttonText="+ Nuevo Grupo" buttonLink="/grupo/agregar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="relative z-10">
                <Table
                    columns={columns} data={grupos} loading={loading}
                    filterConfig={[
                        { name: 'search', type: 'text', label: 'Buscar Grupo o Recaudo', colSpan: 'col-span-12 md:col-span-8' }, 
                        { 
                            name: 'zona_id', 
                            type: 'custom', 
                            label: 'Filtrar por Zona', 
                            colSpan: 'col-span-12 md:col-span-4 relative z-20', 
                            render: () => (
                                <ZonaSearchSelect 
                                    key={zonaKey}
                                    onSelect={(zona) => handleFilterChange('zona_id', zona ? zona.id : '')}
                                />
                            )
                        }
                    ]} 
                    filters={filters} onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={onClearFilters}
                    pagination={{ ...paginationInfo, onPageChange: fetchGrupos }}
                />
            </div>
            
            {showDelete && <ConfirmModal title="¿Eliminar Grupo?" message="Esta acción solo es posible si el grupo no tiene historial de préstamos." confirmText="Sí, Eliminar" onConfirm={handleConfirmDelete} onCancel={() => setShowDelete(false)} />}
        </div>
    );
};

export default Index;