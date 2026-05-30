import React, { useMemo } from 'react';
import { useIndex } from 'hooks/CajaSesion/useIndex';
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
            header: 'Caja / Turno',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-[11px] uppercase tracking-tighter">
                        {/* 🔥 ID resaltado en color de marca */}
                        {row.caja_nombre} <span className="text-brand-red ml-1">Sesion #{row.id}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold truncate max-w-[180px]">
                        {row.caja_desc}
                    </span>
                </div>
            )
        },
        {
            header: 'Responsable',
            render: (row) => <div className="text-[11px] font-bold uppercase text-slate-600">{row.cajero}</div>
        },
        {
            header: 'Apertura',
            render: (row) => <div className="text-[11px] text-slate-500 font-bold leading-tight">{row.fecha_apertura}</div>
        },
        {
            header: 'Cierre',
            render: (row) => (
                <div className="text-[11px] font-bold leading-tight">
                    {row.fecha_cierre
                        ? <span className="text-slate-500">{row.fecha_cierre}</span>
                        : <span className="text-green-600 italic">En curso</span>
                    }
                </div>
            )
        },
        {
            header: 'Monto Inicial',
            render: (row) => (
                <div className="text-xs font-black italic text-right text-slate-700">
                    S/ {parseFloat(row.monto_apertura).toFixed(2)}
                </div>
            )
        },
        {
            header: 'Saldo Esperado',
            render: (row) => (
                <div className="text-xs font-black italic text-right text-slate-700">
                    {row.saldo_esperado != null
                        ? `S/ ${parseFloat(row.saldo_esperado).toFixed(2)}`
                        : <span className="text-slate-300">—</span>
                    }
                </div>
            )
        },
        {
            header: 'Estado',
            render: (row) => (
                <div className="flex flex-col gap-1 items-start">
                    <span className={`px-2 py-1 text-[9px] font-black rounded-full border uppercase ${
                        row.estado === 1 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                        {row.estado === 1 ? 'Abierta' : 'Cerrada'}
                    </span>
                    {row.estado === 2 && row.cuadro !== null && (
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border uppercase ${
                            row.cuadro ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                            {row.cuadro ? '✓ Cuadró' : '✗ No cuadró'}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: '',
            render: (row) => (
                <div className="flex justify-end">
                    {/* 🔥 Hover corporativo */}
                    <button
                        onClick={() => handleVerDetalle(row.id)}
                        className="p-1.5 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-lg border border-transparent hover:border-brand-red/20 transition-all shadow-sm"
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
        <div className="container mx-auto p-6">
            <PageHeader title="Historial de Turnos de Caja" icon={ClockIcon} buttonText="Ir a Caja" buttonLink="/operacion/caja" />
            <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />
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