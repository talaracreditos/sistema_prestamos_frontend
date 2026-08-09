import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Producto/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { ShoppingBagIcon, PencilSquareIcon, TrashIcon, CircleStackIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const { can } = useAuth();
    const canStore  = can('producto.store');
    const canStatus = can('producto.status');
    const canUpdate = can('producto.update');
    const canDelete = can('producto.delete');

    const { 
        loading, productos, paginationInfo, filters, alert, setAlert, 
        handleToggleStatus, fetchProductos,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
        isDeleteModalOpen, openDeleteModal, closeDeleteModal, handleConfirmDelete
    } = useIndex();

    const filterConfig = useMemo(() => [
        { 
            name: 'search', type: 'text', label: 'Buscar producto', 
            placeholder: 'Ej: Consumo, Microempresas...', colSpan: 'col-span-12 md:col-span-8' 
        },
        { 
            name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
            options: [
                { value: '', label: 'Todos los estados' },
                { value: '1', label: 'Activos' },
                { value: '0', label: 'Inactivos' }
            ]
        }
    ], []);

    const columns = useMemo(() => {
        const base = [
            {
                header: 'Producto',
                render: (row) => (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-red-light/50 dark:bg-dark-surface-alt border border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                            <CircleStackIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
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
                header: 'Tasa Referencial',
                render: (row) => (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold font-black text-xs border border-brand-gold/30 dark:border-brand-gold/20 shadow-sm transition-colors">
                        {row.rango_tasa}%
                    </span>
                )
            },
        ];

        if (canStatus) {
            base.push({
                header: 'Estado',
                render: (row) => (
                    <button 
                        onClick={() => handleToggleStatus(row.id)} 
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-sm border
                            ${row.estado 
                                ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20 hover:scale-105' 
                                : 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20 hover:scale-105'}`}
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
                                to={`/producto/editar/${row.id}`} 
                                title="Editar parámetros"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                        )}
                        {canDelete && (
                            <button 
                                onClick={() => openDeleteModal(row.id)} 
                                title="Dar de baja"
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
    }, [handleToggleStatus, openDeleteModal, canStatus, canUpdate, canDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6 animate-in fade-in duration-500 transition-colors">
            <PageHeader 
                title="Productos Financieros" 
                subtitle="Configuración de tasas y catálogo de créditos disponibles."
                icon={ShoppingBagIcon} 
                buttonText={canStore ? "+ Nuevo Producto" : null}
                buttonLink={canStore ? "/producto/agregar" : null}
            />
            
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            
            <div className="mt-4">
                <Table 
                    columns={columns} data={productos} loading={loading}
                    pagination={{ ...paginationInfo, onPageChange: fetchProductos }}
                    filterConfig={filterConfig} filters={filters}
                    onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                />
            </div>

            {isDeleteModalOpen && (
                <ConfirmModal 
                    title="¿Eliminar Producto?"
                    message="¿Estás seguro de que deseas eliminar este producto? Esta acción podría afectar la visualización histórica de préstamos asociados si no se maneja con cuidado."
                    confirmText="Sí, eliminar producto"
                    cancelText="No, mantener"
                    onConfirm={handleConfirmDelete}
                    onCancel={closeDeleteModal}
                />
            )}
        </div>
    );
};

export default Index;