import React, { useMemo, useState, useCallback } from 'react';
import { useIndex } from 'hooks/Pago/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ViewModal from 'components/Shared/Modals/ViewModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { BanknotesIcon, PrinterIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FileSearch } from 'lucide-react';

const Index = () => {
    const {
        loading, pagos, paginationInfo, filters, setFilters, alert, setAlert, fetchPagos,
        handleFilterSubmit, handleFilterClear,
        handleViewPdf, pdfLoading, isPdfModalOpen, setIsPdfModalOpen, pdfTitle, pdfBase64,
        isAnularModalOpen, setIsAnularModalOpen, openAnularModal, handleConfirmAnular, anularLoading,
        pagoToAnular,
        esCliente, canVerPdf, canAnular,
    } = useIndex();

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const openVoucher = useCallback((url) => { setSelectedVoucher(url); setIsViewModalOpen(true); }, []);

    const [asesorKey, setAsesorKey] = useState(Date.now());
    const onClearFilters = () => {
        handleFilterClear();
        setAsesorKey(Date.now());
    };

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
        {
            name: 'asesor_id', type: 'custom', label: 'Filtrar por Asesor',
            colSpan: 'col-span-12 md:col-span-3',
            render: () => (
                <EmpleadoSearchSelect
                    key={asesorKey}
                    rol="asesor"
                    onSelect={(a) => setFilters(p => ({ ...p, asesor_id: a ? a.id : '' }))}
                    clearOnSelect={false}
                />
            ),
        },
        { name: 'fecha_inicio', type: 'date', label: 'Fecha Inicio', colSpan: 'col-span-12 md:col-span-2' },
        { name: 'fecha_fin',    type: 'date', label: 'Fecha Fin',    colSpan: 'col-span-12 md:col-span-2' },
        {
            name: 'tipo', type: 'select', label: 'Tipo',
            colSpan: 'col-span-12 md:col-span-2',
            options: [
                { value: '',                      label: 'TODOS'             },
                { value: 'NORMAL',                label: 'NORMAL'            },
                { value: 'EXCEDENTE',             label: 'EXCEDENTE'         },
                { value: 'DESGLOSE_REFINANCIADO', label: 'DESGLOSE REFINANC.' },
                { value: 'RENOVACION',            label: 'RENOVACIÓN'        },
            ]
        },
        {
            name: 'estado', type: 'select', label: 'Estado',
            colSpan: 'col-span-12 md:col-span-2',
            options: [
                { value: '',  label: 'TODOS'     },
                { value: '0', label: 'ANULADOS'  },
                { value: '1', label: 'APROBADOS' },
            ]
        },
        {
            name: 'dia_operativo_fecha', type: 'date', label: 'Fecha Día Operativo',
            colSpan: 'col-span-12 md:col-span-2'
        },
        {
            name: 'registro_extemporaneo', type: 'select', label: 'Extemporáneo',
            colSpan: 'col-span-12 md:col-span-2',
            options: [
                { value: '',  label: 'TODOS' },
                { value: '1', label: 'SI'    },
                { value: '0', label: 'NO'    },
            ]
        },
    ], [asesorKey, setFilters]);

    const columns = useMemo(() => [
        {
            header: 'ID / Fecha',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-mono text-[14px] font-black text-slate-600 dark:text-dark-text">#{row.id}</span>
                    {row.pago_origen_id && (
                        <span className={`text-[11px] font-bold mt-0.5 ${
                            row.tipo === 'DESGLOSE_REFINANCIADO' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-dark-text-muted'
                        }`}>
                            {row.tipo === 'DESGLOSE_REFINANCIADO' ? (
                                <>Saldo refinanciado conservado de Pago <span className="text-blue-600 dark:text-blue-400 font-black">#{row.pago_origen_id}</span></>
                            ) : (
                                <>Excedente de Pago <span className="text-amber-600 dark:text-amber-400 font-black">#{row.pago_origen_id}</span></>
                            )}
                        </span>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold whitespace-nowrap mt-0.5">{row.fecha}</span>
                    {row.dia_operativo_fecha && (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted whitespace-nowrap mt-0.5">
                            Día Operativo: {row.dia_operativo_fecha}
                        </span>
                    )}
                    {row.registro_extemporaneo && (
                        <span className="text-[8px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 w-fit px-1.5 py-0.5 rounded mt-1 uppercase tracking-wider">
                            Extemporáneo
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Comprobante / Op.',
            render: (row) => (
                <div className="flex flex-col">
                    {row.numero_comprobante ? (
                        <span className="font-mono text-[11px] font-black text-brand-red dark:text-brand-gold bg-brand-red-light dark:bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-red/20 dark:border-brand-gold/20 w-fit">
                            {row.numero_comprobante}
                        </span>
                    ) : (
                        <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-surface-alt px-2 py-0.5 rounded border border-slate-100 dark:border-dark-border border-dashed w-fit italic">
                            Sin Recibo
                        </span>
                    )}
                    <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-dark-text-muted mt-1 uppercase">
                        Op: {row.numero_operacion || '---'}
                    </span>
                </div>
            )
        },
        {
            header: 'Titular y Detalle',
            render: (row) => (
                <div className="flex flex-col uppercase">
                    <span className="font-black text-[11px] text-slate-800 dark:text-dark-text leading-tight">
                        <span className="text-slate-400 dark:text-dark-text-muted mr-1.5">{row.numero_prestamo}</span>
                        {row.prestamo}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-dark-text-muted font-bold mt-0.5">
                        Depositó: <span className="text-slate-700 dark:text-dark-text">{row.depositado_por}</span>
                    </span>
                    <span className="text-[9px] font-black text-brand-red dark:text-brand-gold bg-brand-red-light dark:bg-brand-gold/10 border border-brand-red/20 dark:border-brand-gold/20 w-fit px-1.5 py-0.5 rounded mt-1 tracking-wider">
                        CUOTA #{row.cuota_nro}
                    </span>
                    {row.dias_mora > 0 && (
                        <span className="text-[9px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 w-fit px-1.5 py-0.5 rounded mt-1 uppercase tracking-wider">
                            {row.dias_mora} día{row.dias_mora === 1 ? '' : 's'} de mora
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Asesor',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-black dark:text-dark-text w-fit uppercase">
                    {row.asesor}
                </div>
            )
        },
        {
            header: 'Monto y Modalidad',
            render: (row) => (
                <div className="flex flex-col">
                    {esCliente && row.mi_aporte != null ? (
                        <>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                S/ {parseFloat(row.mi_aporte).toFixed(2)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted mt-0.5 whitespace-nowrap">
                                Total grupo: S/ {parseFloat(row.monto).toFixed(2)}
                            </span>
                        </>
                    ) : (
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            S/ {parseFloat(row.monto).toFixed(2)}
                        </span>
                    )}
                    {row.comision && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded border bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 uppercase tracking-widest w-fit mt-1">
                            Comisión: S/ {parseFloat(row.comision).toFixed(2)}
                        </span>
                    )}
                    <span className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted bg-slate-100 dark:bg-dark-surface-alt px-1.5 py-0.5 rounded w-fit mt-1 border border-slate-200 dark:border-dark-border uppercase tracking-widest">
                        {row.modalidad}
                    </span>
                    <TipoBadge tipo={row.tipo} />
                </div>
            )
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
                        {row.estado === 1 ? 'APROBADO' : 'ANULADO'}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-tight mt-0.5">
                        Cajero: <span className="text-slate-600 dark:text-dark-text">{row.registrado_por}</span>
                    </span>
                    {row.estado === 0 && row.observaciones && (
                        <div className="pl-2 border-l-2 border-brand-red dark:border-red-400 max-w-[180px] mt-1">
                            <span className="text-[9px] font-semibold text-brand-red dark:text-red-400 break-words leading-tight block">
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
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-dark-surface-alt rounded-xl border border-transparent hover:border-emerald-100 dark:hover:border-dark-border transition-all shadow-sm">
                            <FileSearch className="w-4 h-4" />
                        </button>
                    )}
                    {canVerPdf(row) && (
                        <button onClick={() => handleViewPdf(row.id)} disabled={pdfLoading} title="Imprimir Recibo"
                            className={`p-2 rounded-xl transition-all border border-transparent shadow-sm ${
                                pdfLoading ? 'bg-slate-50 dark:bg-dark-surface-alt text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt hover:border-brand-red/20 dark:hover:border-brand-gold/20'
                            }`}>
                            <PrinterIcon className={`w-4 h-4 ${pdfLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    {canAnular(row) && (
                        <button onClick={() => openAnularModal(row)} title="Anular Pago"
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-red-500/20 shadow-sm">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
        },
    ], [esCliente, canVerPdf, canAnular, pdfLoading, handleViewPdf, openAnularModal, openVoucher]);

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader title="Control de Pagos" icon={BanknotesIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={pagos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={handleFilterSubmit} onFilterClear={onClearFilters}
                pagination={{ ...paginationInfo, onPageChange: fetchPagos }}
            />

            <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Voucher de Pago">
                <div className="flex justify-center bg-slate-50 dark:bg-dark-surface-alt rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border transition-colors">
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

// ── Badge de tipo de pago ─────────────────────────────────────────────────────
const TIPO_STYLES = {
    NORMAL:                { label: 'NORMAL',                cls: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'    },
    EXCEDENTE:             { label: 'EXCEDENTE',             cls: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'   },
    DESGLOSE_REFINANCIADO: { label: 'DESGLOSE REFINANC.', cls: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'     },
    RENOVACION:            { label: 'RENOVACIÓN',            cls: 'bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' },
};

const TipoBadge = ({ tipo }) => {
    if (!tipo) return null;
    const cfg = TIPO_STYLES[tipo] ?? { label: tipo, cls: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border' };
    return (
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest w-fit mt-1 ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

export default Index;