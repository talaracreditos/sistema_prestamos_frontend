import React, { useMemo } from 'react';
import { useIndex } from 'hooks/GarantiaPrendaria/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import GarantiaPrendariaModal, {
    EstadoGarantiaBadge, ESTADOS_PRESTAMO,
} from './GarantiaPrendariaModal';
import { SparklesIcon, EyeIcon } from '@heroicons/react/24/outline';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const Index = () => {
    const {
        loading, garantias, paginationInfo, filters, setFilters, alert, setAlert,
        fetchGarantias, handleFilterSubmit, handleFilterClear,
        handleView, isViewModalOpen, closeViewModal, viewData, viewLoading,
        canShow,
    } = useIndex();

    const filterConfig = useMemo(() => [
        {
            name: 'search', type: 'text', label: 'Garantía',
            placeholder: 'ID / Lote / Descripción...',
            colSpan: 'col-span-12 md:col-span-3',
        },
        {
            name: 'prestamo_id', type: 'text', label: 'N° Préstamo',
            placeholder: 'Ej: 23',
            colSpan: 'col-span-12 md:col-span-2',
        },
        {
            name: 'cliente', type: 'text', label: 'Cliente',
            placeholder: 'Nombre, DNI, RUC...',
            colSpan: 'col-span-12 md:col-span-4',
        },
        {
            name: 'estado', type: 'select', label: 'Estado',
            colSpan: 'col-span-12 md:col-span-3',
            options: [
                { value: '',  label: 'TODOS'       },
                { value: '0', label: 'PENDIENTE'   },
                { value: '1', label: 'EN CUSTODIA' },
                { value: '2', label: 'ENTREGADO'   },
                { value: '3', label: 'SUBASTADO'   },
                { value: '4', label: 'ADJUDICADO'  },
            ],
        },
    ], []);

    const columns = useMemo(() => [
        {
            header: 'ID / Lote',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-[14px] font-black text-slate-600 dark:text-dark-text">#{row.id}</span>
                    {row.numero_lote ? (
                        <span className="font-mono text-[10px] font-black text-brand-red dark:text-brand-gold bg-brand-red-light dark:bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-red/20 dark:border-brand-gold/20 w-fit mt-1">
                            {row.numero_lote}
                        </span>
                    ) : (
                        <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-surface-alt px-2 py-0.5 rounded border border-slate-100 dark:border-dark-border border-dashed w-fit italic mt-1">
                            Sin lote
                        </span>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold whitespace-nowrap mt-1">{row.fecha_registro}</span>
                </div>
            ),
        },
        {
            header: 'Joya',
            render: (row) => (
                <div className="flex flex-col uppercase max-w-[260px]">
                    <span className="font-black text-[10px] text-slate-800 dark:text-dark-text leading-tight">
                        {[row.tipo_joya, row.subtipo_joya].filter(Boolean).join(' · ') || 'Sin clasificar'}
                    </span>
                    {row.descripcion && (
                        <span className="text-[9px] text-slate-500 dark:text-dark-text-muted font-bold mt-0.5 normal-case truncate">
                            {row.descripcion}
                        </span>
                    )}
                    <span className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted bg-slate-100 dark:bg-dark-surface-alt px-1.5 py-0.5 rounded w-fit mt-1 border border-slate-200 dark:border-dark-border tracking-widest">
                        {row.kilataje || 'S/K'} · {fmt(row.peso_neto)} gr
                    </span>
                </div>
            ),
        },
        {
            header: 'Cliente',
            render: (row) => (
                <div className="flex flex-col uppercase">
                    <span className="font-black text-[10px] text-slate-800 dark:text-dark-text leading-tight">{row.cliente}</span>
                    {row.documento && (
                        <span className="text-[9px] text-slate-500 dark:text-dark-text-muted font-bold mt-0.5">{row.documento}</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Préstamo',
            render: (row) => row.prestamo_id ? (
                <div className="flex flex-col">
                    <span className="font-mono text-[12px] font-black text-slate-700 dark:text-dark-text">{row.numero_prestamo}</span>
                    {row.codigo_recaudo && (
                        <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-dark-text-muted mt-0.5">
                            Recaudo: {row.codigo_recaudo}
                        </span>
                    )}
                    <span className="text-[9px] font-black text-slate-500 dark:text-dark-text-muted bg-slate-100 dark:bg-dark-surface-alt px-1.5 py-0.5 rounded w-fit mt-1 border border-slate-200 dark:border-dark-border uppercase tracking-wider">
                        {ESTADOS_PRESTAMO[row.prestamo_estado] ?? `Estado ${row.prestamo_estado}`}
                    </span>
                </div>
            ) : (
                <span className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted italic">
                    Sin préstamo{row.solicitud_id ? ` (sol. #${row.solicitud_id})` : ''}
                </span>
            ),
        },
        {
            header: 'Valor',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 dark:text-dark-text text-sm">S/ {fmt(row.valor_tasado)}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted mt-0.5 whitespace-nowrap">
                        Máx. prestar: S/ {fmt(row.maximo_prestar)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Estado',
            render: (row) => (
                <div className="flex flex-col items-start gap-1">
                    <EstadoGarantiaBadge estado={row.estado_fisico} />
                    {row.fecha_adjudicacion && (
                        <span className="text-[8px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-tight">
                            Adjudicada: {row.fecha_adjudicacion}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2 items-center justify-end">
                    {canShow && (
                        <button onClick={() => handleView(row.id)} title="Ver detalle"
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm">
                            <EyeIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ], [canShow, handleView]);

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader title="Garantías Prendarias" icon={SparklesIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="mt-6">
                <Table
                    columns={columns} data={garantias} loading={loading}
                    filterConfig={filterConfig} filters={filters}
                    onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                    onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                    pagination={{ ...paginationInfo, onPageChange: fetchGarantias }}
                />
            </div>

            <GarantiaPrendariaModal
                isOpen={isViewModalOpen}
                onClose={closeViewModal}
                data={viewData}
                isLoading={viewLoading}
            />
        </div>
    );
};

export default Index;