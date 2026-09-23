import React, { useMemo } from 'react';
import { useIndex } from 'hooks/Kilataje/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { SparklesIcon, PencilSquareIcon, TrashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, kilatajes, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete,
        fetchKilatajes, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

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
            header: 'Kilataje',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre}</span>
                </div>
            )
        },
        {
            header: 'Precio Oro / gr',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-dark-text transition-colors">
                        S/ {Number(row.precio_gramo).toFixed(2)}
                    </span>
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <a
                        href={`/kilataje/editar/${row.id}`}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </a>
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
            <PageHeader title="Precios de Oro por Kilataje" icon={SparklesIcon} buttonText="+ Nuevo Kilataje" buttonLink="/kilataje/agregar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="relative z-10">
                <Table
                    columns={columns} data={kilatajes} loading={loading}
                    filterConfig={[
                        { name: 'search', type: 'text', label: 'Buscar Kilataje', colSpan: 'col-span-12' },
                    ]}
                    filters={filters} onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                    pagination={{ ...paginationInfo, onPageChange: fetchKilatajes }}
                />
            </div>

            {showDelete && <ConfirmModal title="¿Eliminar Kilataje?" message="Esta acción no se puede deshacer." confirmText="Sí, Eliminar" onConfirm={handleConfirmDelete} onCancel={() => setShowDelete(false)} />}
        </div>
    );
};

export default Index;