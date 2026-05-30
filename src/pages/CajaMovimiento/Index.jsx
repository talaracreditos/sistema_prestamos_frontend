import React, { useMemo } from 'react';
import { useIndex } from 'hooks/CajaMovimiento/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { DocumentTextIcon, ArrowDownRightIcon, ArrowUpRightIcon, PrinterIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const { can } = useAuth();

    const {
        loading, movimientos, paginationInfo, filters, alert, setAlert,
        fetchMovimientos, handleFilterChange, handleFilterSubmit, handleFilterClear,
        handleViewPdf, isPdfModalOpen, setIsPdfModalOpen, pdfTitle, pdfBase64, pdfLoading,
    } = useIndex();

    const canGeneratePdf = can('cajaMovimiento.generatePDF');

    const columns = useMemo(() => {
        const baseColumns = [
            {
                header: 'Tipo y Cód.',
                render: (row) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            {row.categoria === 'desembolso' ? (
                                <div className="p-1 rounded-md border bg-red-50 border-red-200">
                                    <ArrowUpRightIcon className="w-3.5 h-3.5 text-red-600" />
                                </div>
                            ) : (
                                <div className="p-1 rounded-md border bg-green-50 border-green-200">
                                    <ArrowDownRightIcon className="w-3.5 h-3.5 text-green-600" />
                                </div>
                            )}
                            <span className={`font-black text-[10px] uppercase tracking-wide ${row.categoria === 'desembolso' ? 'text-red-700' : 'text-green-700'}`}>
                                {row.categoria === 'desembolso' ? 'Desemb.' : 'Cobro'}
                            </span>
                        </div>
                        <span className="font-mono text-[12px] font-bold px-1.5 py-0.5 rounded w-fit text-slate-600 bg-slate-100 border border-slate-200">
                            {row.numero_comprobante}
                        </span>
                    </div>
                )
            },
            {
                header: 'Detalle',
                render: (row) => (
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold truncate max-w-[160px] lg:max-w-[280px] xl:max-w-[350px] text-slate-800" title={row.motivo}>
                            {row.motivo}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {row.prestamo_id && (
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono">
                                    Prestamo #{String(row.prestamo_id).padStart(5, '0')}
                                </span>
                            )}
                            {row.numero_cuota && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                                    Cuota #{row.numero_cuota}
                                </span>
                            )}
                            {row.pago_id && (
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5 font-mono">
                                    Pago #{row.pago_id}
                                </span>
                            )}
                        </div>
                        {row.pagos_cascada?.length > 0 && (
                            <div className="mt-1.5 flex flex-col gap-1">
                                {row.pagos_cascada.map(hijo => (
                                    <div key={hijo.pago_id} className="flex items-center gap-1.5">
                                        <span className="text-[7px] font-black text-amber-500 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase">
                                            Excedente
                                        </span>
                                        <span className="text-[9px] font-bold text-amber-700 font-mono">Pago #{hijo.pago_id}</span>
                                        <span className="text-[9px] text-slate-400 font-bold">Cuota #{hijo.cuota_nro}</span>
                                        <span className="text-[9px] font-black text-emerald-600">S/ {parseFloat(hijo.monto).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            },
            {
                header: 'Cajero',
                render: (row) => (
                    <div className="text-[10px] font-bold uppercase truncate max-w-[100px] lg:max-w-[140px] text-slate-600" title={row.cajero}>
                        {row.cajero === 'SISTEMA AUTOMATIZADO PRESTAMOS' ? 'SISTEMA AUTO.' : row.cajero}
                    </div>
                )
            },
            {
                header: 'Fecha',
                render: (row) => {
                    const d = new Date(row.fecha);
                    return (
                        <div className="text-[10px] text-slate-500">
                            <span className="font-bold block whitespace-nowrap">
                                {d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <span className="uppercase font-medium whitespace-nowrap">
                                {d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
                    );
                }
            },
            {
                header: 'Monto',
                render: (row) => (
                    <div className={`text-[13px] font-black italic text-right whitespace-nowrap ${row.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                        {row.tipo === 'ingreso' ? '+' : '-'} S/ {parseFloat(row.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </div>
                )
            }
        ];

        if (canGeneratePdf) {
            baseColumns.push({
                header: 'Acciones',
                render: (row) => (
                    <div className="flex items-center gap-1.5 justify-end">
                        <button
                            onClick={() => handleViewPdf(row.id)}
                            disabled={pdfLoading}
                            title="Ver Comprobante"
                            className="p-1.5 rounded-lg transition-all border border-transparent shadow-sm text-slate-500 hover:text-brand-red hover:bg-brand-red-light hover:border-brand-red/20"
                        >
                            <PrinterIcon className={`w-4 h-4 ${pdfLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                )
            });
        }

        return baseColumns;
    }, [handleViewPdf, pdfLoading, canGeneratePdf]);

    const filterConfig = [
        { name: 'search', type: 'text', label: 'Buscar por Código o Motivo', colSpan: 'col-span-12 sm:col-span-8' },
        { name: 'tipo', type: 'select', label: 'Filtrar Tipo', colSpan: 'col-span-12 sm:col-span-4', options: [
            { value: '',           label: 'Todos los Movimientos' },
            { value: 'desembolso', label: 'Solo Desembolsos' },
            { value: 'cobro',      label: 'Solo Cobros' },
        ]}
    ];

    return (
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full xl:max-w-7xl">
            <PageHeader
                title="Historial de Movimientos"
                icon={DocumentTextIcon}
                buttonText={can('operacion.store') ? "Ir a Caja Operativa" : null}
                buttonLink={can('operacion.store') ? "/operacion/caja" : null}
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <Table
                columns={columns} data={movimientos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchMovimientos }}
            />
            <PdfModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} title={pdfTitle} base64={pdfBase64} />
        </div>
    );
};

export default Index;