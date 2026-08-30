import React, { useMemo } from 'react';
import { useIndex } from 'hooks/CajaChicaSesion/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import DetalleTurnoModal from './DetalleTurnoModal';
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, sesiones, paginationInfo, filters, alert, setAlert,
        fetchSesiones, handleFilterChange, handleFilterSubmit, handleFilterClear,
        isModalOpen, setIsModalOpen, detalleSesion, loadingDetalle, handleVerDetalle
    } = useIndex();

    const columns = useMemo(() => [
        {
            header: 'Caja',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 dark:text-dark-text text-[11px] uppercase tracking-tighter transition-colors">
                        {row.caja_nombre} <span className="text-brand-red dark:text-brand-gold ml-1">Sesion #{row.id}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold truncate max-w-[180px] transition-colors">
                        {row.caja_desc}
                    </span>
                </div>
            )
        },
        {
            header: 'Responsable',
            render: (row) => <div className="text-[11px] font-bold uppercase text-slate-600 dark:text-dark-text transition-colors">{row.cajero}</div>
        },
        {
            header: 'Apertura',
            render: (row) => <div className="text-[11px] text-slate-500 dark:text-dark-text-muted font-bold leading-tight transition-colors">{row.fecha_apertura}</div>
        },
        {
            header: 'Cierre',
            render: (row) => (
                <div className="text-[11px] font-bold leading-tight">
                    {row.fecha_cierre
                        ? <span className="text-slate-500 dark:text-dark-text-muted transition-colors">{row.fecha_cierre}</span>
                        : <span className="text-green-600 dark:text-green-400 italic">En curso</span>
                    }
                </div>
            )
        },
        {
            header: 'Monto Inicial',
            render: (row) => (
                <div className="text-xs font-black italic text-right text-slate-700 dark:text-dark-text transition-colors">
                    S/ {parseFloat(row.monto_apertura).toFixed(2)}
                </div>
            )
        },
        {
            header: 'Saldo Actual/Cierre',
            render: (row) => (
                <div className="text-xs font-black italic text-right text-slate-700 dark:text-dark-text transition-colors">
                    {row.saldo_esperado != null
                        ? `S/ ${parseFloat(row.saldo_esperado).toFixed(2)}`
                        : <span className="text-slate-300 dark:text-dark-text-muted/60">—</span>
                    }
                </div>
            )
        },
        {
            header: 'Estado',
            render: (row) => (
                <span className={`px-2 py-1 text-[9px] font-black rounded-full border uppercase transition-colors ${
                    row.estado === 1 ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'
                }`}>
                    {row.estado === 1 ? 'Abierta' : 'Cerrada'}
                </span>
            )
        },
        {
            header: '',
            render: (row) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleVerDetalle(row.id)}
                        className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-lg border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 transition-all shadow-sm"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], [handleVerDetalle]);

    const filterConfig = [
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-6', options: [{ value: '', label: 'Todos los turnos' }, { value: '1', label: 'Abiertos' }, { value: '2', label: 'Cerrados' }] },
        { name: 'fecha', type: 'date', label: 'Fecha de Apertura', colSpan: 'col-span-12 md:col-span-6' }
    ];

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader title="Historial de Sesiones de Caja Chica" icon={ClockIcon} buttonText="Ir a Caja Chica" buttonLink="/operacion/caja-chica" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details}  onClose={() => setAlert(null)} />
            <Table
                columns={columns} data={sesiones} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchSesiones }}
            />
            <DetalleTurnoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                detalle={detalleSesion}
                loading={loadingDetalle}
            />
        </div>
    );
};

export default Index;