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
                    <div className="p-2.5 rounded-xl border bg-brand-red-light/50 border-brand-red/20">
                        <ChartBarIcon className="w-5 h-5 text-brand-red" />
                    </div>
                    <span className="font-black text-slate-800 text-sm uppercase">{row.nombre}</span>
                </div>
            )
        },
        {
            header: 'Mes',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600">
                    {MESES.find(m => m.value === row.mes)?.label ?? row.mes}
                </span>
            )
        },
        {
            header: 'Año',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600">{row.anio}</span>
            )
        },
        {
            header: 'Meta',
            render: (row) => (
                <span className="text-sm font-black text-brand-red">
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
                        className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleAskDelete(row.id)}
                        className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ], [handleAskDelete]);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader
                title="Metas de Asesores"
                icon={ChartBarIcon}
                buttonText="+ Nueva Meta"
                buttonLink="/meta-asesor/agregar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* Filtros */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <select
                        value={filters.mes}
                        onChange={e => handleFilterChange('mes', e.target.value)}
                        className="p-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                        <option value="">Todos los meses</option>
                        {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>

                    <select
                        value={filters.anio}
                        onChange={e => handleFilterChange('anio', e.target.value)}
                        className="p-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
                            className="flex-1 py-2.5 bg-brand-red text-white text-xs font-black uppercase rounded-xl hover:bg-brand-red-dark transition-all"
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={handleFilterClear}
                            className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-black uppercase rounded-xl hover:bg-slate-200 transition-all"
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