import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/TipoJoya/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { SparklesIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, tiposJoyas, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear , fetchTiposJoyas
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
            header: 'Descripción',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">
                        {row.descripcion}
                    </span>
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <Link
                        to={`/tipo-joya/editar/${row.id}`}
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
            <PageHeader title="Tipos de Joyas" icon={SparklesIcon} buttonText="+ Nuevo Tipo" buttonLink="/tipo-joya/agregar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="relative z-10">
                <Table
                    columns={columns}
                    data={tiposJoyas}
                    loading={loading}
                    filterConfig={[
                        { name: 'search', type: 'text', label: 'Buscar Descripción', colSpan: 'col-span-12' }
                    ]}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onFilterSubmit={handleFilterSubmit}
                    onFilterClear={handleFilterClear}
                    pagination={{ ...paginationInfo, onPageChange: fetchTiposJoyas }}
                />
            </div>

            {showDelete && (
                <ConfirmModal
                    title="¿Eliminar Tipo de Joya?"
                    message="Esta acción no se puede deshacer. ¿Desea continuar?"
                    confirmText="Sí, Eliminar"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDelete(false)}
                />
            )}
        </div>
    );
};

export default Index;