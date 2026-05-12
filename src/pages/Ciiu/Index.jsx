import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Ciiu/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { TagIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, ciius, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete,
        fetchCiius, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();

    const columns = useMemo(() => [
        {
            header: 'Código / Descripción',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border bg-brand-red-light/50 border-brand-red/20 flex-shrink-0">
                        <TagIcon className="w-5 h-5 text-brand-red" />
                    </div>
                    <div>
                        <p className="font-black text-slate-800 text-sm">{row.codigo}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{row.descripcion}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Sección',
            render: (row) => (
                <span className="px-3 py-1 bg-brand-red-light text-brand-red text-[10px] font-black rounded-full border border-brand-red/20 uppercase">
                    {row.seccion}
                </span>
            )
        },
        {
            header: 'División / Grupo',
            render: (row) => (
                <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded border border-slate-200">
                        DIV: {row.division}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded border border-slate-200">
                        GRP: {row.grupo}
                    </span>
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <Link
                        to={`/ciiu/editar/${row.id}`}
                        title="Editar"
                        className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleAskDelete(row.id)}
                        title="Eliminar"
                        className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], [handleAskDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Códigos CIIU" icon={TagIcon} buttonText="+ Nuevo CIIU" buttonLink="/ciiu/agregar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns}
                data={ciius}
                loading={loading}
                filterConfig={[
                    { name: 'search', type: 'text', label: 'Buscar Código / Descripción / Seccion / Division / Grupo', colSpan: 'col-span-12' },
                ]}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchCiius }}
            />

            {showDelete && (
                <ConfirmModal
                    title="¿Eliminar CIIU?"
                    message="Esta acción no se puede deshacer. Solo se puede eliminar si no está asignado a ningún cliente."
                    confirmText="Sí, Eliminar"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDelete(false)}
                />
            )}
        </div>
    );
};

export default Index;