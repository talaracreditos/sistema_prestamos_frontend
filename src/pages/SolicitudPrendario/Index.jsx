import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/SolicitudPrendario/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import PdfModal from 'components/Shared/Modals/PdfModal';
import ApproveSolicitudModal from 'components/Shared/Modals/ApproveSolicitudModal';
import CodigoRecaudoModal from 'pages/SolicitudPrestamo/CodigoRecaudoModal';
import ViewSolicitudPrendarioModal from './ViewSolicitudPrendarioModal';
import {
    ScaleIcon, CheckIcon, XMarkIcon, PencilSquareIcon, EyeIcon,
    DocumentArrowDownIcon, CheckBadgeIcon, IdentificationIcon,
} from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const ESTADOS = {
    1: { label: 'PENDIENTE', color: 'bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border border-brand-gold/30 dark:border-brand-gold/20' },
    2: { label: 'APROBADO',  color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30' },
    3: { label: 'RECHAZADO', color: 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border border-brand-red/30 dark:border-red-500/30' },
};

const motivoBloqueoAprobar = (row) => {
    if (!row.codigo_recaudo && !row.contrato_conforme) return 'Asigna el código de recaudo y marca el contrato conforme primero';
    if (!row.codigo_recaudo)    return 'Asigna un código de recaudo primero';
    if (!row.contrato_conforme) return 'Marca el contrato como conforme primero';
    return 'Aprobar';
};

const Spinner = ({ color }) => (
    <div className={`w-4 h-4 border-2 border-slate-300 dark:border-dark-border ${color} rounded-full animate-spin`} />
);

const Index = () => {
    const {
        loading, solicitudes, paginationInfo, filters, alert, setAlert, fetchSolicitudes,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
        isViewOpen, setIsViewOpen, viewData, viewLoading, handleView,
        isApproveOpen, selectedSolicitud, openApproveModal, handleCloseApproveModal,
        handleUpdateStatus, statusLoading, modalAlert, setModalAlert,
        handleVerContrato, contratoLoading, isPdfOpen, handleClosePdf, contratoPdf, contratoPdfTitle,
        handleMarcarConforme, conformeLoading,
        isCodigoRecaudoOpen, selectedForCodigo, codigoRecaudoLoading, codigoRecaudoAlert, setCodigoRecaudoAlert,
        openCodigoRecaudoModal, handleCloseCodigoRecaudoModal, handleAsignarCodigoRecaudo,
    } = useIndex();

    const { can } = useAuth();

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => <span className="font-black text-slate-600 dark:text-dark-text">#{row.id}</span>,
        },
        {
            header: 'Cliente',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs uppercase text-slate-800 dark:text-dark-text">{row.cliente_nombre}</span>
                    {row.cliente_documento && (
                        <span className="text-[12px] text-slate-400 dark:text-dark-text-muted font-bold">{row.cliente_documento}</span>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-dark-text-muted font-medium">TASADOR: {row.tasador_nombre}</span>
                </div>
            ),
        },
        {
            header: 'Monto',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-brand-red dark:text-brand-gold italic underline">S/ {fmt(row.monto_solicitado)}</span>
                    {row.total_maximo_prestar != null && (
                        <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">Máx. tasado: S/ {fmt(row.total_maximo_prestar)}</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Tasación',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[15px] font-black text-amber-700 dark:text-amber-400">#{row.tasacion_id ?? '—'}</span>
                    <span className="text-[11px] text-slate-400 dark:text-dark-text-muted font-bold">Custodia: S/ {fmt(row.monto_custodia)}</span>
                </div>
            ),
        },
        {
            header: 'Estado',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-[9px] font-black w-fit ${ESTADOS[row.estado]?.color}`}>
                    {ESTADOS[row.estado]?.label}
                </span>
            ),
        },
        {
            header: 'Acciones',
            render: (row) => {
                const puedeAprobar = !!row.codigo_recaudo && !!row.contrato_conforme;

                return (
                    <div className="flex gap-1 justify-end items-center flex-wrap">
                        <button onClick={() => handleView(row.id)} title="Ver detalle"
                            className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4" />
                        </button>

                        {row.estado === 1 && (
                            <>
                                {can('solicitudPrendario.update') && (
                                    <Link to={`/solicitudPrendario/editar/${row.id}`} title="Editar"
                                        className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-gold-dark dark:hover:text-brand-gold hover:bg-brand-gold-light dark:hover:bg-dark-surface-alt rounded-lg transition-colors">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </Link>
                                )}

                                {can('solicitudPrendario.generatePDF') && (
                                    <button onClick={() => handleVerContrato(row)} disabled={contratoLoading === row.id} title="Ver contrato prendario"
                                        className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-surface-alt rounded-lg transition-colors">
                                        {contratoLoading === row.id ? <Spinner color="border-t-blue-500" /> : <DocumentArrowDownIcon className="w-4 h-4" />}
                                    </button>
                                )}

                                {!row.codigo_recaudo && can('solicitudPrendario.codigoRecaudo') && (
                                    <button onClick={() => openCodigoRecaudoModal(row)} title="Asignar código de recaudo"
                                        className="p-1.5 rounded-lg transition-colors text-slate-400 dark:text-dark-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-surface-alt">
                                        <IdentificationIcon className="w-4 h-4" />
                                    </button>
                                )}

                                {can('solicitudPrendario.contratoConforme') && (
                                    <button
                                        onClick={() => !row.contrato_conforme && handleMarcarConforme(row.id)}
                                        disabled={row.contrato_conforme || conformeLoading === row.id}
                                        title={row.contrato_conforme ? 'Contrato conforme' : 'Marcar conforme'}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                            row.contrato_conforme
                                                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 cursor-default'
                                                : 'text-slate-400 dark:text-dark-text-muted hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-dark-surface-alt'
                                        }`}
                                    >
                                        {conformeLoading === row.id ? <Spinner color="border-t-green-500" /> : <CheckBadgeIcon className="w-4 h-4" />}
                                    </button>
                                )}

                                {can('solicitudPrendario.status') && (
                                    <>
                                        <button onClick={() => openApproveModal(row)} disabled={!puedeAprobar} title={motivoBloqueoAprobar(row)}
                                            className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-dark-surface-alt rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleUpdateStatus(row.id, 3)} title="Rechazar"
                                            className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-lg transition-colors">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                );
            },
        },
    ], [handleView, handleVerContrato, contratoLoading, openCodigoRecaudoModal,
        handleMarcarConforme, conformeLoading, openApproveModal, handleUpdateStatus, can]);

    if (loading && solicitudes.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader
                title="Solicitudes Prendarias"
                icon={ScaleIcon}
                buttonText={can('solicitudPrendario.store') ? '+ Nueva' : null}
                buttonLink={can('solicitudPrendario.store') ? '/solicitudPrendario/agregar' : null}
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns}
                data={solicitudes}
                loading={loading}
                pagination={{ ...paginationInfo, onPageChange: fetchSolicitudes }}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                filters={filters}
                filterConfig={[
                    { name: 'search', type: 'text', label: 'Buscar...', colSpan: 'col-span-8' },
                    { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-4',
                      options: [
                          { value: '1', label: 'PENDIENTES' },
                          { value: '2', label: 'APROBADAS' },
                          { value: '3', label: 'RECHAZADAS' },
                      ]},
                ]}
            />

            <ViewSolicitudPrendarioModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={viewData}
                isLoading={viewLoading}
            />

            <PdfModal isOpen={isPdfOpen} onClose={handleClosePdf} title={contratoPdfTitle} pdfUrl={contratoPdf} />

            <CodigoRecaudoModal
                isOpen={isCodigoRecaudoOpen}
                onClose={handleCloseCodigoRecaudoModal}
                solicitud={selectedForCodigo}
                onConfirm={handleAsignarCodigoRecaudo}
                loading={codigoRecaudoLoading}
                alert={codigoRecaudoAlert}
                onClearAlert={() => setCodigoRecaudoAlert(null)}
            />

            {isApproveOpen && (
                <ApproveSolicitudModal
                    isOpen={isApproveOpen}
                    onClose={handleCloseApproveModal}
                    onConfirm={handleUpdateStatus}
                    solicitud={selectedSolicitud}
                    loading={statusLoading}
                    alert={modalAlert}
                    onClearAlert={() => setModalAlert(null)}
                />
            )}
        </div>
    );
};

export default Index;