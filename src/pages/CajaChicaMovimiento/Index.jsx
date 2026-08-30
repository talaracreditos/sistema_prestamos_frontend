// pages/CajaChicaMovimiento/Index.jsx
import React, { useMemo } from 'react';
import { useIndex } from 'hooks/CajaChicaMovimiento/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { BanknotesIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, movimientos, paginationInfo, filters, alert, setAlert,
        fetchMovimientos,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar concepto', placeholder: 'Ej: Sueldo...', colSpan: 'col-span-12 md:col-span-3' },
        { name: 'fecha_inicio', type: 'date', label: 'Desde', colSpan: 'col-span-6 md:col-span-2' },
        { name: 'fecha_fin', type: 'date', label: 'Hasta', colSpan: 'col-span-6 md:col-span-2' },
        {
            name: 'tipo', type: 'select', label: 'Tipo', colSpan: 'col-span-6 md:col-span-2',
            options: [
                { value: '', label: 'Todos' },
                { value: 'ingreso', label: 'Ingreso' },
                { value: 'egreso', label: 'Egreso' },
            ]
        },
        {
            name: 'medio_pago', type: 'select', label: 'Medio de pago', colSpan: 'col-span-12 md:col-span-3',
            options: [
                { value: '', label: 'Todos' },
                { value: 'efectivo', label: 'Efectivo' },
                { value: 'transferencia', label: 'Transferencia' },
            ]
        },
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Fecha',
            render: (row) => <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted">{row.fecha}</span>
        },
        {
            header: 'Registrado por',
            render: (row) => <span className="text-xs font-semibold text-slate-600 dark:text-dark-text-muted">{row.registrado_por}</span>
        },
        {
            header: 'Concepto',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 dark:text-dark-text text-xs uppercase">{row.concepto}</span>
                    {row.gasto?.nombre && (
                        <span className="text-[10px] text-slate-400 dark:text-dark-text-muted uppercase">{row.gasto.nombre}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Caja',
            render: (row) => (
                <span className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted">
                    {row.caja_nombre}
                </span>
            )
        },
        {
            header: 'Medio',
            render: (row) => <span className="text-xs capitalize text-slate-500 dark:text-dark-text-muted">{row.medio_pago}</span>
        },
        {
            header: 'Monto',
            render: (row) => (
                <span className={`font-black text-xs ${row.tipo === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-brand-red dark:text-red-400'}`}>
                    {row.tipo === 'ingreso' ? '+' : '-'} S/ {Number(row.monto).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Saldo',
            render: (row) => <span className="font-bold text-xs text-slate-700 dark:text-dark-text">S/ {Number(row.saldo).toFixed(2)}</span>
        },
    ], []);

    return (
        <div className="container mx-auto p-4 sm:p-6 animate-in fade-in duration-500 transition-colors">
            <PageHeader
                title="Movimientos de Caja Chica"
                subtitle="Historial de ingresos y egresos, con saldo corrido."
                icon={BanknotesIcon}
            />
            
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="mt-4">
                <Table
                    columns={columns} data={movimientos} loading={loading}
                    pagination={{ ...paginationInfo, onPageChange: fetchMovimientos }}
                    filterConfig={filterConfig} filters={filters}
                    onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                />
            </div>
        </div>
    );
};

export default Index;