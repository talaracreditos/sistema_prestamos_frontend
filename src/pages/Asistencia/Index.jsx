import React, { useMemo } from 'react';
import { useIndex } from 'hooks/Asistencia/useIndex';
import { exportar as exportarAsistencias } from 'services/asistenciaService';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ExcelExportButton from 'components/Shared/Buttons/ExcelExportButton';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, asistencias, paginationInfo, filters, appliedFilters, alert, setAlert,
        fetchAsistencias, handleFilterChange, handleFilterSubmit, handleFilterClear, handleUsuarioFilter
    } = useIndex();

    const columns = useMemo(() => [
        {
            header: 'Personal',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border bg-brand-red-light/50 dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20 transition-colors">
                        <UserCircleIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre_completo}</span>
                        <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold italic transition-colors">{row.username}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Fecha',
            render: (row) => (
                <span className="text-sm font-bold text-slate-600 dark:text-dark-text">{row.fecha}</span>
            )
        },
        {
            header: 'Ingreso',
            render: (row) => (
                row.hora_ingreso
                    ? <span className="px-2 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-black rounded-full border border-green-200 dark:border-green-500/20">{row.hora_ingreso}</span>
                    : <span className="text-slate-300 dark:text-dark-text-muted text-xs">—</span>
            )
        },
        {
            header: 'Salida',
            render: (row) => (
                row.hora_salida
                    ? <span className="px-2 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-[10px] font-black rounded-full border border-red-200 dark:border-red-500/20">{row.hora_salida}</span>
                    : <span className="text-slate-300 dark:text-dark-text-muted text-xs">—</span>
            )
        },
    ], []);

    const filterConfig = useMemo(() => [
        {
            name: 'usuario',
            type: 'custom',
            label: 'Empleado',
            colSpan: 'col-span-12 md:col-span-4',
            render: () => (
                <EmpleadoSearchSelect
                    disabled={loading}
                    onSelect={handleUsuarioFilter}
                />
            ),
        },
        { name: 'fecha_desde', type: 'date', label: 'Desde', colSpan: 'col-span-6 md:col-span-3' },
        { name: 'fecha_hasta', type: 'date', label: 'Hasta', colSpan: 'col-span-6 md:col-span-3' },
    ], [loading, handleUsuarioFilter]);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader title="Asistencia de Personal" icon={ClockIcon} buttonText="Registrar Asistencia" buttonLink="/asistencia/registrar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* Botón Excel arriba, esquina derecha de la tabla */}
            <div className="flex justify-end mt-6 mb-3">
                <ExcelExportButton
                    exportService={exportarAsistencias}
                    filters={appliedFilters}
                    filename="reporte_asistencia"
                    label="Excel"
                />
            </div>

            <Table
                columns={columns} data={asistencias} loading={loading}
                filterConfig={filterConfig}
                filters={filters} onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchAsistencias }}
            />
        </div>
    );
};

export default Index;