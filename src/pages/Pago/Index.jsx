import React, { useMemo, useState } from 'react';
import { useIndex } from 'hooks/Pago/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ViewModal from 'components/Shared/Modals/ViewModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { BanknotesIcon, PrinterIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FileSearch } from 'lucide-react';

const Index = () => {
    const {
        loading, pagos, paginationInfo, filters, setFilters, alert, setAlert, fetchPagos,
        handleFilterSubmit, handleFilterClear,
        handleViewPdf, pdfLoading, isPdfModalOpen, setIsPdfModalOpen, pdfTitle, pdfBase64,
        isAnularModalOpen, setIsAnularModalOpen, openAnularModal, handleConfirmAnular, anularLoading,
        pagoToAnular,
    } = useIndex();

    const { can, user } = useAuth();
    const esCliente = user?.rol === 'cliente';
    const canDelete  = can('pago.delete');

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const openVoucher = (url) => { setSelectedVoucher(url); setIsViewModalOpen(true); };

    const filterConfig = useMemo(() => [
        {
            name: 'search', type: 'text', label: 'Pago',
            placeholder: 'Comprobante / Op / Observación...',
            colSpan: 'col-span-12 md:col-span-3'
        },
        {
            name: 'prestamo_id', type: 'text', label: 'N° Préstamo',
            placeholder: 'Ej: 23',
            colSpan: 'col-span-12 md:col-span-2'
        },
        {
            name: 'cliente', type: 'text', label: 'Cliente / Grupo',
            placeholder: 'Nombre, DNI, RUC...',
            colSpan: 'col-span-12 md:col-span-3'
        },
        { name: 'fecha_inicio', type: 'date', label: 'Fecha Inicio', colSpan: 'col-span-12 md:col-span-2' },
        { name: 'fecha_fin',    type: 'date', label: 'Fecha Fin',    colSpan: 'col-span-12 md:col-span-2' },
        {
            name: 'estado', type: 'select', label: 'Estado',
            colSpan: 'col-span-12 md:col-span-2',
            options: [
                { value: '',  label: 'TODOS'     },
                { value: '0', label: 'ANULADOS'  },
                { value: '1', label: 'APROBADOS' },
            ]
        }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'ID / Fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-[14px] font-black text-slate-600">#{row.id}</span>
                    {row.pago_origen_id && (
                        <span className={`text-[11px] font-bold mt-0.5 ${
                            row.tipo === 'DESGLOSE_REFINANCIADO'
                                ? 'text-blue-500'
                                : 'text-slate-400'
                        }`}>
                            {row.tipo === 'DESGLOSE_REFINANCIADO' ? (
                                <>Saldo refinanciado conservado de Pago <span className="text-blue-600 font-black">#{row.pago_origen_id}</span></>
                            ) : (
                                <>Excedente de Pago <span className="text-amber-600 font-black">#{row.pago_origen_id}</span></>
                            )}
                        </span>
                    )}
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap mt-0.5">{row.fecha}</span>
                </div>
            )
        },
        {
            header: 'Comprobante / Op.',
            render: (row) => (
                <div className="flex flex-col">
                    {row.numero_comprobante ? (
                        <span className="font-mono text-[11px] font-black text-brand-red bg-brand-red-light px-2 py-0.5 rounded border border-brand-red/20 w-fit">
                            {row.numero_comprobante}
                        </span>
                    ) : (
                        <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 border-dashed w-fit italic">
                            Sin Recibo
                        </span>
                    )}
                    <span className="font-mono text-[9px] font-bold text-slate-400 mt-1 uppercase">
                        Op: {row.numero_operacion || '---'}
                    </span>
                </div>
            )
        },
        {
            header: 'Titular y Detalle',
            render: (row) => (
                <div className="flex flex-col uppercase">
                    <span className="font-black text-[11px] text-slate-800 leading-tight">
                        <span className="text-slate-400 mr-1.5">{row.numero_prestamo}</span>
                        {row.prestamo}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold mt-0.5">
                        Depositó: <span className="text-slate-700">{row.depositado_por}</span>
                    </span>
                    <span className="text-[9px] font-black text-brand-red bg-brand-red-light border border-brand-red/20 w-fit px-1.5 py-0.5 rounded mt-1 tracking-wider">
                        CUOTA #{row.cuota_nro}
                    </span>
                </div>
            )
        },
        {
            header: 'Monto y Modalidad',
            render: (row) => (
                <div className="flex flex-col">
                    {esCliente && row.mi_aporte != null ? (
                        <>
                            <span className="font-black text-emerald-600 text-sm">
                                S/ {parseFloat(row.mi_aporte).toFixed(2)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                                Total grupo: S/ {parseFloat(row.monto).toFixed(2)}
                            </span>
                        </>
                    ) : (
                        <span className="font-black text-emerald-600 text-sm">
                            S/ {parseFloat(row.monto).toFixed(2)}
                        </span>
                    )}
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1 border border-slate-200 uppercase tracking-widest">
                        {row.modalidad}
                    </span>
                </div>
            )
        },
        {
            header: 'Estado / Cajero',
            render: (row) => (
                <div className="flex flex-col items-start gap-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${
                        row.estado === 1
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-brand-red border-brand-red/30'
                    }`}>
                        {row.estado === 1 ? 'APROBADO' : 'ANULADO'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                        Cajero: <span className="text-slate-600">{row.registrado_por}</span>
                    </span>
                    {row.estado === 0 && row.observaciones && (
                        <div className="pl-2 border-l-2 border-brand-red max-w-[180px] mt-1">
                            <span className="text-[9px] font-semibold text-brand-red break-words leading-tight block">
                                {row.observaciones}
                            </span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-2 items-center justify-end">
                    {row.comprobante_url && (
                        <button onClick={() => openVoucher(row.comprobante_url)} title="Ver Voucher"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100 transition-all shadow-sm">
                            <FileSearch className="w-4 h-4" />
                        </button>
                    )}
                    {row.estado === 1 && can('pago.generatePDF') && (
                        <button onClick={() => handleViewPdf(row.id)} disabled={pdfLoading} title="Imprimir Recibo"
                            className={`p-2 rounded-xl transition-all border border-transparent shadow-sm ${
                                pdfLoading ? 'bg-slate-50 text-slate-300' : 'text-slate-400 hover:text-brand-red hover:bg-brand-red-light hover:border-brand-red/20'
                            }`}>
                            <PrinterIcon className={`w-4 h-4 ${pdfLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    {row.estado === 1 && !row.pago_origen_id && canDelete && (
                        <button onClick={() => openAnularModal(row)} title="Anular Pago"
                            className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        }
    ], [can, canDelete, esCliente, pdfLoading, handleViewPdf, openAnularModal]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Control de Pagos" icon={BanknotesIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={pagos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={handleFilterSubmit} onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchPagos }}
            />

            <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Voucher de Pago">
                <div className="flex justify-center bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                    <img src={selectedVoucher} alt="Voucher" className="max-w-full h-auto object-contain" style={{ maxHeight: '70vh' }} />
                </div>
            </ViewModal>

            <PdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} title={pdfTitle} base64={pdfBase64} />

            {isAnularModalOpen && (
                <ConfirmModal
                    title="¿Anular Pago?"
                    message={`El pago #${pagoToAnular?.id} será revertido. Las cuotas de integrantes vigentes volverán a su estado anterior. Los refinanciados no se tocan.`}
                    confirmText={anularLoading ? 'Anulando...' : 'Sí, Anular Pago'}
                    requirePin={true}
                    loading={anularLoading}
                    onConfirm={(pin) => handleConfirmAnular(pin)}
                    onCancel={() => !anularLoading && setIsAnularModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Index;