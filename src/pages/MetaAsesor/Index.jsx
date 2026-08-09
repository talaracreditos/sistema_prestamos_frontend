import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex, MESES, ANIOS } from 'hooks/MetaAsesor/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { ChartBarIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, metas, alert, setAlert,
        filters, showDelete, setShowDelete,
        pagination,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
        handleAskDelete, handleConfirmDelete,
    } = useIndex();

    const columns = useMemo(() => [
        {
            header: 'Asesor',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border bg-brand-red-light/50 dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                        <ChartBarIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre}</span>
                </div>
            )
        },
        {
            header: 'Mes',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted transition-colors">
                    {MESES.find(m => m.value === row.mes)?.label ?? row.mes}
                </span>
            )
        },
        {
            header: 'Año',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted transition-colors">{row.anio}</span>
            )
        },
        {
            header: 'Meta',
            render: (row) => (
                <span className="text-sm font-black text-brand-red dark:text-brand-gold transition-colors">
                    S/ {parseFloat(row.meta_monto).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <Link
                        to={`/meta-asesor/editar/${row.id}`}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleAskDelete(row.id)}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ], [handleAskDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Metas de Asesores"
                icon={ChartBarIcon}
                buttonText="+ Nueva Meta"
                buttonLink="/meta-asesor/agregar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* Filtros */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 p-4 mb-4 transition-colors">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <select
                        value={filters.mes}
                        onChange={e => handleFilterChange('mes', e.target.value)}
                        className="p-2.5 text-sm font-bold text-slate-700 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl outline-none transition-colors"
                    >
                        <option value="">Todos los meses</option>
                        {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>

                    <select
                        value={filters.anio}
                        onChange={e => handleFilterChange('anio', e.target.value)}
                        className="p-2.5 text-sm font-bold text-slate-700 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl outline-none transition-colors"
                    >
                        <option value="">Todos los años</option>
                        {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <EmpleadoSearchSelect
                        rol="asesor"
                        onSelect={emp => handleFilterChange('asesor_id', emp?.id ?? '')}
                        initialName=""
                        clearOnSelect={false}
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleFilterSubmit}
                            className="flex-1 py-2.5 bg-brand-red dark:bg-brand-red-glow text-white text-xs font-black uppercase rounded-xl hover:bg-brand-red-dark dark:hover:brightness-110 transition-all"
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={handleFilterClear}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text text-xs font-black uppercase rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                data={metas}
                loading={loading}
                pagination={{
                    currentPage:  pagination.currentPage,
                    totalPages:   pagination.totalPages,
                    onPageChange: pagination.onPageChange,
                    total:        pagination.total,
                }}
            />

            {showDelete && (
                <ConfirmModal
                    title="¿Eliminar Meta?"
                    message="Se eliminará la meta de este asesor para el período seleccionado."
                    confirmText="Sí, Eliminar"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDelete(false)}
                />
            )}
        </div>
    );
};

export default Index;