import React, { useMemo } from 'react';
import { useIndex } from 'hooks/Auditoria/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import {
    ClipboardDocumentListIcon,
    UserIcon,
    EyeIcon,
    CalendarDaysIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

// ─── Modal de Detalle JSON ────────────────────────────────────────────────────
const DetalleModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const hasSnapshots = data.datos_anteriores || data.datos_nuevos;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">

                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm">Detalle del Registro</h2>
                            <p className="text-xs text-slate-500">{data.created_at}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <XMarkIcon className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 space-y-4">

                    {/* Info general */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                            <span className="text-slate-400 font-medium uppercase tracking-wide text-[10px]">Nombre</span>
                            <p className="font-bold text-slate-700 text-sm">{data.nombre_completo}</p>
                            <p className="text-xs text-slate-400">{data.usuario}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                            <span className="text-slate-400 font-medium uppercase tracking-wide text-[10px]">IP</span>
                            <p className="font-bold text-slate-700 font-mono text-sm">{data.ip_address || '—'}</p>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-slate-400 font-medium uppercase tracking-wide text-[10px]">Descripción</span>
                        <p className="text-sm text-slate-700 mt-1">{data.descripcion}</p>
                    </div>

                    {/* Snapshots */}
                    {hasSnapshots && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.datos_anteriores && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Datos Anteriores</p>
                                    <pre className="bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] text-red-800 overflow-x-auto whitespace-pre-wrap break-all">
                                        {JSON.stringify(data.datos_anteriores, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {data.datos_nuevos && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Datos Nuevos</p>
                                    <pre className="bg-green-50 border border-green-100 rounded-xl p-3 text-[11px] text-green-800 overflow-x-auto whitespace-pre-wrap break-all">
                                        {JSON.stringify(data.datos_nuevos, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Index ────────────────────────────────────────────────────────────────────
const Index = () => {
    const {
        loading, registros, paginationInfo, filters, alert, setAlert,
        isDetailOpen, setIsDetailOpen, detailData,
        fetchRegistros, handleVerDetalle,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();

    const filterConfig = useMemo(() => [
        {
            name: 'search', type: 'text',
            label: 'Buscar (usuario, descripción, IP)',
            placeholder: 'Ej: admin, desembolsó, 192.168...',
            colSpan: 'col-span-12 md:col-span-8',
        },
        {
            name: 'fecha_desde', type: 'date', label: 'Desde',
            colSpan: 'col-span-12 md:col-span-2',
        },
        {
            name: 'fecha_hasta', type: 'date', label: 'Hasta',
            colSpan: 'col-span-12 md:col-span-2',
        },
    ], []);

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => (
                <span className="font-mono text-[15px] font-black px-2 py-1 rounded text-slate-600">
                    {row.id}
                </span>
            ),
        },
        {
            header: 'Usuario',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-full border border-slate-200">
                        <UserIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{row.nombre_completo}</span>
                        <span className="text-xs text-slate-400">{row.usuario}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Descripción',
            render: (row) => (
                <span className="text-xs text-slate-600 line-clamp-2 max-w-sm">{row.descripcion}</span>
            ),
        },
        {
            header: 'IP',
            render: (row) => (
                <span className="font-mono text-xs text-slate-500">{row.ip_address || '—'}</span>
            ),
        },
        {
            header: 'Fecha',
            render: (row) => (
                <span className="text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                    <CalendarDaysIcon className="w-4 h-4" /> {row.created_at}
                </span>
            ),
        },
        {
            header: 'Detalle',
            render: (row) => (
                <button
                    onClick={() => handleVerDetalle(row)}
                    title="Ver detalle"
                    className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm"
                >
                    <EyeIcon className="w-4 h-4" />
                </button>
            ),
        },
    ], [handleVerDetalle]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Bitácora de Auditoría"
                icon={ClipboardDocumentListIcon}
            />
            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                details={alert?.details}
                onClose={() => setAlert(null)}
            />
            <Table
                columns={columns}
                data={registros}
                loading={loading}
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchRegistros }}
            />
            <DetalleModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                data={detailData}
            />
        </div>
    );
};

export default Index;