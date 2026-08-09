// Index.jsx
import React, { useMemo } from 'react';
import { useIndex } from 'hooks/CajaMovimiento/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { DocumentTextIcon, ArrowDownRightIcon, ArrowUpRightIcon, ArrowUturnLeftIcon, PrinterIcon } from '@heroicons/react/24/outline';

const CATEGORIA_CONFIG = {
    desembolso: {
        bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20',
        iconColor: 'text-red-600 dark:text-red-400', labelColor: 'text-red-700 dark:text-red-400',
        label: 'Desemb.', Icon: ArrowUpRightIcon,
    },
    extorno: {
        bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400', labelColor: 'text-amber-700 dark:text-amber-400',
        label: 'Extorno', Icon: ArrowUturnLeftIcon,
    },
    default: {
        bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/20',
        iconColor: 'text-green-600 dark:text-green-400', labelColor: 'text-green-700 dark:text-green-400',
        label: 'Cobro', Icon: ArrowDownRightIcon,
    },
};

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
                render: (row) => {
                    const cfg = CATEGORIA_CONFIG[row.categoria] ?? CATEGORIA_CONFIG.default;
                    const { bg, border, iconColor, labelColor, label, Icon } = cfg;
                    return (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                <div className={`p-1 rounded-md border ${bg} ${border} transition-colors`}>
                                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                                </div>
                                <span className={`font-black text-[10px] uppercase tracking-wide ${labelColor} transition-colors`}>
                                    {label}
                                </span>
                            </div>
                            <span className="font-mono text-[12px] font-bold px-1.5 py-0.5 rounded w-fit text-slate-600 dark:text-dark-text bg-slate-100 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border transition-colors">
                                {row.numero_comprobante ?? '—'}
                            </span>
                        </div>
                    );
                }
            },
            {
                header: 'Detalle',
                render: (row) => (
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold truncate max-w-[160px] lg:max-w-[280px] xl:max-w-[350px] text-slate-800 dark:text-dark-text transition-colors" title={row.motivo}>
                            {row.motivo}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {row.prestamo_id && (
                                <span className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted bg-slate-100 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded px-1.5 py-0.5 font-mono transition-colors">
                                    Prestamo #{String(row.prestamo_id).padStart(5, '0')}
                                </span>
                            )}
                            {row.numero_cuota && (
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded px-1.5 py-0.5 transition-colors">
                                    Cuota #{row.numero_cuota}
                                </span>
                            )}
                            {row.pago_id && (
                                <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded px-1.5 py-0.5 font-mono transition-colors">
                                    Pago #{row.pago_id}
                                </span>
                            )}
                        </div>
                        {row.pagos_cascada?.length > 0 && (
                            <div className="mt-1.5 flex flex-col gap-1">
                                {row.pagos_cascada.map(hijo => (
                                    <div key={hijo.pago_id} className="flex items-center gap-1.5">
                                        {hijo.tipo === 'DESGLOSE_REFINANCIADO' ? (
                                            <span className="text-[7px] font-black text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-1.5 py-0.5 rounded uppercase transition-colors">
                                                Refinanciado
                                            </span>
                                        ) : (
                                            <span className="text-[7px] font-black text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.5 rounded uppercase transition-colors">
                                                Excedente
                                            </span>
                                        )}
                                        <span className={`text-[9px] font-bold font-mono transition-colors ${
                                            hijo.tipo === 'DESGLOSE_REFINANCIADO' ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'
                                        }`}>
                                            Pago #{hijo.pago_id}
                                        </span>
                                        <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold transition-colors">Cuota #{hijo.cuota_nro}</span>
                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 transition-colors">
                                            S/ {parseFloat(hijo.monto).toFixed(2)}
                                        </span>
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
                    <div className="text-[10px] font-bold uppercase truncate max-w-[100px] lg:max-w-[140px] text-slate-600 dark:text-dark-text-muted transition-colors" title={row.cajero}>
                        {row.cajero === 'SISTEMA AUTOMATIZADO PRESTAMOS' ? 'SISTEMA AUTO.' : row.cajero}
                    </div>
                )
            },
            {
                header: 'Fecha',
                render: (row) => {
                    const d = new Date(row.fecha);
                    return (
                        <div className="text-[10px] text-slate-500 dark:text-dark-text-muted transition-colors">
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
                    <div className={`text-[13px] font-black italic text-right whitespace-nowrap transition-colors ${row.tipo === 'ingreso' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
                            className="p-1.5 rounded-lg transition-all border border-transparent shadow-sm text-slate-500 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt hover:border-brand-red/20 dark:hover:border-brand-gold/20"
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
        { name: 'search',       type: 'text',   label: 'Label por Código o Motivo',   colSpan: 'col-span-12 sm:col-span-4' },
        { name: 'fecha_inicio', type: 'date',   label: 'Fecha Inicio',                colSpan: 'col-span-12 sm:col-span-2' },
        { name: 'fecha_fin',    type: 'date',   label: 'Fecha Fin',                   colSpan: 'col-span-12 sm:col-span-2' },
        { name: 'tipo',         type: 'select', label: 'Filtrar Tipo',                colSpan: 'col-span-12 sm:col-span-4',
        options: [
            { value: '',             label: 'Todos los Movimientos' },
            { value: 'desembolso', label: 'Solo Desembolsos' },
            { value: 'cobro',      label: 'Solo Cobros' },
            { value: 'extorno',    label: 'Solo Extornos' },
        ]}
    ];
    
    return (
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full transition-colors">
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