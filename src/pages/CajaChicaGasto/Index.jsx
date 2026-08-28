// pages/CajaChicaGasto/Index.jsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/CajaChicaGasto/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { ReceiptPercentIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const { can } = useAuth();
    const canStore  = can('cajaChicaGasto.store');
    const canUpdate = can('cajaChicaGasto.update');
    const canDelete = can('cajaChicaGasto.delete');

    const { 
        loading, gastos, paginationInfo, filters, alert, setAlert, 
        fetchGastos,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
        isDeleteModalOpen, openDeleteModal, closeDeleteModal, handleConfirmDelete
    } = useIndex();

    const filterConfig = useMemo(() => [
        { 
            name: 'search', type: 'text', label: 'Buscar gasto', 
            placeholder: 'Ej: Sueldos, Bonificaciones...', colSpan: 'col-span-12' 
        }
    ], []);

    const columns = useMemo(() => {
        const base = [
            {
                header: 'Gasto',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-red-light/50 dark:bg-dark-surface-alt border border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <ReceiptPercentIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 dark:text-dark-text uppercase text-xs tracking-tight transition-colors">
                                {row.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold tracking-widest uppercase transition-colors">
                                ID: #{row.id.toString().padStart(3, '0')}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                header: 'Descripción',
                render: (row) => (
                    <span className="text-xs text-slate-500 dark:text-dark-text-muted transition-colors">
                        {row.descripcion || '—'}
                    </span>
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
                                to={`/caja-chica-gasto/editar/${row.id}`} 
                                title="Editar gasto"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                        )}
                        {canDelete && (
                            <button 
                                onClick={() => openDeleteModal(row.id)} 
                                title="Eliminar gasto"
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
    }, [openDeleteModal, canUpdate, canDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6 animate-in fade-in duration-500 transition-colors">
            <PageHeader 
                title="Gastos Administrativos" 
                subtitle="Catálogo de conceptos usados al registrar movimientos de caja chica."
                icon={ReceiptPercentIcon} 
                buttonText={canStore ? "+ Nuevo Gasto" : null}
                buttonLink={canStore ? "/caja-chica-gasto/agregar" : null}
            />
            
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            
            <div className="mt-4">
                <Table 
                    columns={columns} data={gastos} loading={loading}
                    pagination={{ ...paginationInfo, onPageChange: fetchGastos }}
                    filterConfig={filterConfig} filters={filters}
                    onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                />
            </div>

            {isDeleteModalOpen && (
                <ConfirmModal 
                    title="¿Eliminar Gasto?"
                    message="¿Estás seguro de que deseas eliminar este concepto de gasto? Si ya fue usado en movimientos de caja chica, no se podrá eliminar."
                    confirmText="Sí, eliminar gasto"
                    cancelText="No, mantener"
                    onConfirm={handleConfirmDelete}
                    onCancel={closeDeleteModal}
                />
            )}
        </div>
    );
};

export default Index;