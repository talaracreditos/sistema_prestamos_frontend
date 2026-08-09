import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Ciiu/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { TagIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const { can } = useAuth();
    const canStore  = can('ciiu.store');
    const canUpdate = can('ciiu.update');
    const canDelete = can('ciiu.delete');

    const {
        loading, ciius, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete,
        fetchCiius, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();

    const columns = useMemo(() => {
        const base = [
            {
                header: 'Código / Descripción',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border bg-brand-red-light/50 dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20 flex-shrink-0 transition-colors">
                            <TagIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div>
                            <p className="font-black text-slate-800 dark:text-dark-text text-sm transition-colors">{row.codigo}</p>
                            <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase transition-colors">{row.descripcion}</p>
                        </div>
                    </div>
                )
            },
            {
                header: 'Sección',
                render: (row) => (
                    <span className="px-3 py-1 bg-brand-red-light dark:bg-brand-gold/10 text-brand-red dark:text-brand-gold text-[10px] font-black rounded-full border border-brand-red/20 dark:border-brand-gold/20 uppercase transition-colors">
                        {row.seccion}
                    </span>
                )
            },
            {
                header: 'División / Grupo',
                render: (row) => (
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text text-[10px] font-black rounded border border-slate-200 dark:border-dark-border transition-colors">
                            DIV: {row.division}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text text-[10px] font-black rounded border border-slate-200 dark:border-dark-border transition-colors">
                            GRP: {row.grupo}
                        </span>
                    </div>
                )
            },
        ];

        if (canUpdate || canDelete) {
            base.push({
                header: 'Acciones',
                render: (row) => (
                    <div className="flex items-center gap-2 justify-end">
                        {canUpdate && (
                            <Link
                                to={`/ciiu/editar/${row.id}`}
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
    }, [handleAskDelete, canUpdate, canDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader 
                title="Códigos CIIU" 
                icon={TagIcon} 
                buttonText={canStore ? "+ Nuevo CIIU" : null}
                buttonLink={canStore ? "/ciiu/agregar" : null}
            />
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