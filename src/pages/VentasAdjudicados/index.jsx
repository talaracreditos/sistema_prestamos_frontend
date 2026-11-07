import React, { useMemo } from 'react';
import { useIndex } from 'hooks/VentasAdjudicados/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { ShoppingBagIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';

const money = (n) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0);

const fecha = (iso) =>
    iso ? new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—';

const Index = () => {
    const {
        loading, ventas, paginationInfo, filters, setFilters, alert, setAlert,
        fetchVentas, handleFilterSubmit, handleFilterClear,
        isAnularModalOpen, setIsAnularModalOpen, openAnularModal,
        handleConfirmAnular, anularLoading, ventaToAnular,
        canAnular, canVerRecibo, mostrarAcciones,
        handleViewRecibo, pdfLoading, isPdfModalOpen, setIsPdfModalOpen, pdfBase64, pdfTitle,
    } = useIndex();

    const filterConfig = useMemo(() => [
        {
            name: 'search', type: 'text', label: 'Buscar',
            placeholder: 'Comprador, documento, operación, ID...',
            colSpan: 'col-span-12 md:col-span-4',
        },
        { name: 'fecha_inicio', type: 'date', label: 'Fecha Inicio', colSpan: 'col-span-12 md:col-span-2' },
        { name: 'fecha_fin',    type: 'date', label: 'Fecha Fin',    colSpan: 'col-span-12 md:col-span-2' },
        {
            name: 'estado', type: 'select', label: 'Estado',
            colSpan: 'col-span-12 md:col-span-2',
            options: [
                { value: '',  label: 'TODOS'    },
                { value: '1', label: 'ACTIVAS'  },
                { value: '0', label: 'ANULADAS' },
            ],
        },
        {
            name: 'metodo_pago', type: 'select', label: 'Método',
            colSpan: 'col-span-12 md:col-span-2',
            options: [
                { value: '',        label: 'TODOS'    },
                { value: 'EFECTIVO', label: 'EFECTIVO' },
                { value: 'BANCO',    label: 'BANCO'    },
                { value: 'YAPE',     label: 'YAPE'     },
            ],
        },
    ], []);

    const columnasBase = useMemo(() => [
        {
            header: 'ID / Fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-[14px] font-black text-slate-600 dark:text-dark-text">#{row.id}</span>
                    <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold whitespace-nowrap mt-0.5">
                        {fecha(row.fecha)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Operación',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-black text-slate-500 dark:text-dark-text-muted">
                        Op: {row.numero_operacion || '---'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mt-1">
                        {row.metodo_pago || '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Comprador',
            render: (row) => (
                <div className="flex flex-col uppercase">
                    <span className="font-black text-[10px] text-slate-800 dark:text-dark-text">{row.comprador}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted mt-0.5">
                        DOC: {row.comprador_documento || '—'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Lotes / Préstamos',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-dark-text">Lotes: {row.lotes}</span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted mt-0.5">
                        Préstamos: {row.prestamos}
                    </span>
                </div>
            ),
        },
        {
            header: 'Total / Tasado',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{money(row.total)}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted mt-0.5">
                        Tasado: {money(row.total_tasado)}
                    </span>
                </div>
            ),
        },
        {
            header: 'Estado / Cajero',
            render: (row) => (
                <div className="flex flex-col items-start gap-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${
                        row.estado === 1
                            ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                            : 'bg-red-100 dark:bg-red-500/10 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20'
                    }`}>
                        {row.estado === 1 ? 'ACTIVA' : 'ANULADA'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-tight">
                        Cajero: <span className="text-slate-600 dark:text-dark-text">{row.cajero}</span>
                    </span>
                </div>
            ),
        },
    ], []);

    const columnaAcciones = useMemo(() => ({
        header: 'Acciones',
        render: (row) => {
            const verRecibo = canVerRecibo(row);
            const anular    = canAnular(row);

            if (!verRecibo && !anular) return null;

            return (
                <div className="flex gap-2 items-center justify-end">
                    {verRecibo && (
                        <button onClick={() => handleViewRecibo(row.id)}
                            disabled={pdfLoading} title="Imprimir Recibo"
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent shadow-sm disabled:opacity-40">
                            <PrinterIcon className={`w-4 h-4 ${pdfLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    {anular && (
                        <button onClick={() => openAnularModal(row)} title="Anular Venta"
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-red-500/20 shadow-sm">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            );
        },
    }), [canVerRecibo, canAnular, handleViewRecibo, openAnularModal, pdfLoading]);

    // La columna Acciones solo existe si el usuario tiene algún permiso de acción
    const columns = useMemo(
        () => (mostrarAcciones ? [...columnasBase, columnaAcciones] : columnasBase),
        [mostrarAcciones, columnasBase, columnaAcciones]
    );

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader title="Ventas de Adjudicados" icon={ShoppingBagIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={ventas} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters((p) => ({ ...p, [n]: v }))}
                onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchVentas }}
            />

            {isAnularModalOpen && (
                <ConfirmModal
                    title="¿Anular Venta de Adjudicado?"
                    message={`La venta #${ventaToAnular?.id} por ${money(ventaToAnular?.total)} será anulada. Se registra un extorno en caja por el mismo monto y la venta sale de los reportes. La adjudicación del préstamo no cambia.`}
                    confirmText={anularLoading ? 'Anulando...' : 'Sí, Anular Venta'}
                    requirePin={true}
                    loading={anularLoading}
                    onConfirm={(pin) => handleConfirmAnular(pin)}
                    onCancel={() => !anularLoading && setIsAnularModalOpen(false)}
                />
            )}

            <PdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} title={pdfTitle} base64={pdfBase64} />
        </div>
    );
};

export default Index;