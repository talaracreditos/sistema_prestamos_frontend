import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Tasacion/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import TasacionModal from './TasacionModal';
import { ScaleIcon, EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

// Debe coincidir con las constantes ESTADO_* del modelo Tasacion en el backend
const ESTADOS = {
    0: { label: 'Pendiente',  classes: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
    1: { label: 'Abandonado', classes: 'bg-slate-50 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border' },
    2: { label: 'Expirado',   classes: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' },
    3: { label: 'Convertida', classes: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' },
};

const Index = () => {
    const {
        loading, tasaciones, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete,
        isViewOpen, setIsViewOpen, viewData, viewLoading, handleView,
        fetchTasaciones, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const columns = useMemo(() => [
        {
            header: 'Cliente / Tasador',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border bg-brand-red-light/50 dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                        <ScaleIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">
                            {row.cliente?.nombre_completo || 'Sin cliente asignado'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold italic transition-colors">
                            Tasador: {row.tasador?.name || '—'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Fecha',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted">
                    {row.fecha_tasacion}
                </span>
            )
        },
        {
            header: 'Joyas / Totales',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted">{row.detalles_count ?? 0} joyas</span>
                    <span className="text-sm font-black text-slate-800 dark:text-dark-text">S/ {fmt(row.total_tasacion)}</span>
                    <span className="text-[10px] font-black text-brand-gold uppercase">Máx: S/ {fmt(row.total_maximo_prestar)}</span>
                </div>
            )
        },
        {
            header: 'Estado',
            render: (row) => {
                const estadoInfo = ESTADOS[row.estado] ?? ESTADOS[0];
                return (
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${estadoInfo.classes}`}>
                        {estadoInfo.label}
                    </span>
                );
            }
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => handleView(row.id)}
                        title="Ver detalle"
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>

                    {row.estado !== 3 && (
                        <Link
                            to={`/tasacion/editar/${row.id}`}
                            title="Editar"
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                    )}

                    {row.estado !== 3 && (
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
        }
    ], [handleAskDelete, handleView]);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader title="Tasaciones" icon={ScaleIcon} buttonText="+ Nueva Tasación" buttonLink="/tasacion/agregar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={tasaciones} loading={loading}
                filterConfig={[
                    { name: 'search', type: 'text', label: 'Buscar por cliente', colSpan: 'col-span-8' },
                    {
                        name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-4',
                        options: [
                            { value: '', label: 'Todos' },
                            { value: '0', label: 'Pendiente' },
                            { value: '1', label: 'Abandonado' },
                            { value: '2', label: 'Expirado' },
                            { value: '3', label: 'Convertida' },
                        ]
                    }
                ]}
                filters={filters} onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchTasaciones }}
            />

            {showDelete && (
                <ConfirmModal
                    title="¿Eliminar tasación?"
                    message="Esta acción no se puede deshacer. Se borrarán también las joyas registradas en ella."
                    confirmText="Sí, eliminar"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDelete(false)}
                />
            )}

            <TasacionModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={viewData}
                isLoading={viewLoading}
            />
        </div>
    );
};

export default Index;