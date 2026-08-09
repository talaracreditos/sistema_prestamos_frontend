import React, { useMemo } from 'react';
import { useIndex } from 'hooks/SolicitudPrestamo/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { 
    DocumentTextIcon, CheckIcon, XMarkIcon, 
    PencilSquareIcon, EyeIcon, DocumentArrowDownIcon, CheckBadgeIcon,
    IdentificationIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import ViewSolicitudModal from './ViewSolicitudModal';
import ApproveSolicitudModal from 'components/Shared/Modals/ApproveSolicitudModal';
import ContratoSelectorModal from './ContratoSelectorModal';
import CodigoRecaudoModal from './CodigoRecaudoModal';

const Index = () => {
    const {
        loading, solicitudes, paginationInfo, filters, alert, setAlert,
        handleUpdateStatus, handleFilterChange, handleFilterSubmit,
        handleFilterClear, fetchSolicitudes, handleView,
        isViewOpen, setIsViewOpen, viewData, viewLoading,
        isApproveOpen, selectedSolicitud, openApproveModal, handleCloseApproveModal,
        modalAlert, setModalAlert,
        handleVerContrato, contratoLoading,
        isPdfOpen, setIsPdfOpen, contratoPdf, contratoPdfTitle,
        handleMarcarConforme, conformeLoading,
        isContratoSelectorOpen, contratoSelectorData,
        handleCloseContratoSelector, handleSelectContrato,
        isCodigoRecaudoOpen, selectedForCodigo, codigoRecaudoLoading, codigoRecaudoAlert,
        openCodigoRecaudoModal, handleCloseCodigoRecaudoModal, handleAsignarCodigoRecaudo,
    } = useIndex();

    const { can } = useAuth();

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => <span className="font-black text-slate-600 dark:text-dark-text">#{row.id}</span>
        },
        {
            header: 'Sujeto / Grupo',
            render: (row) => (
                <div className="flex flex-col">
                    <span className={`font-bold text-xs uppercase ${row.es_grupal ? 'text-brand-red dark:text-brand-gold' : 'text-slate-800 dark:text-dark-text'}`}>
                        {row.cliente_nombre}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-medium">ASESOR: {row.asesor_nombre}</span>
                </div>
            )
        },
        {
            header: 'Monto',
            render: (row) => <span className="font-black text-brand-red dark:text-brand-gold italic underline">S/ {row.monto_solicitado}</span>
        },
        {
            header: 'Estado',
            render: (row) => {
                const colors = {
                    1: 'bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border border-brand-gold/30 dark:border-brand-gold/20',
                    2: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30',
                    3: 'bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border border-brand-red/30 dark:border-red-500/30',
                };
                const labels = { 1: 'PENDIENTE', 2: 'APROBADO', 3: 'RECHAZADO' };
                return (
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black w-fit transition-colors ${colors[row.estado]}`}>
                        {labels[row.estado]}
                    </span>
                );
            }
        },
        {
            header: 'Acciones',
            render: (row) => {
                const puedeAprobar = !!row.codigo_recaudo && !!row.contrato_conforme;
                const motivoBloqueo = !row.codigo_recaudo && !row.contrato_conforme
                    ? 'Asigna el código de recaudo y marca el contrato conforme primero'
                    : !row.codigo_recaudo
                        ? 'Asigna un código de recaudo primero'
                        : !row.contrato_conforme
                            ? 'Marca el contrato como conforme primero'
                            : 'Aprobar';

                return (
                    <div className="flex gap-1 justify-end items-center flex-wrap">

                        <button onClick={() => handleView(row.id)}
                            className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4" />
                        </button>

                        {row.estado === 1 && (
                            <>
                                {can('solicitudPrestamo.update') && (
                                    <Link to={`/solicitudPrestamo/editar/${row.id}`}
                                        className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-gold-dark dark:hover:text-brand-gold hover:bg-brand-gold-light dark:hover:bg-dark-surface-alt rounded-lg transition-colors">
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </Link>
                                )}

                                {can('solicitudPrestamo.generatePDF') && (
                                    <button
                                        onClick={() => handleVerContrato(row)}
                                        disabled={contratoLoading === row.id}
                                        title={row.es_grupal ? 'Ver contrato grupal' : 'Ver contrato individual'}
                                        className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-surface-alt rounded-lg transition-colors"
                                    >
                                        {contratoLoading === row.id
                                            ? <div className="w-4 h-4 border-2 border-slate-300 dark:border-dark-border border-t-blue-500 rounded-full animate-spin" />
                                            : <DocumentArrowDownIcon className="w-4 h-4" />
                                        }
                                    </button>
                                )}

                                {!row.codigo_recaudo && can('solicitudPrestamo.codigoRecaudo') && (
                                    <button
                                        onClick={() => openCodigoRecaudoModal(row)}
                                        title="Asignar código de recaudo"
                                        className="p-1.5 rounded-lg transition-colors text-slate-400 dark:text-dark-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-dark-surface-alt"
                                    >
                                        <IdentificationIcon className="w-4 h-4" />
                                    </button>
                                )}

                                {can('solicitudPrestamo.contratoConforme') && (
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
                                        {conformeLoading === row.id
                                            ? <div className="w-4 h-4 border-2 border-slate-300 dark:border-dark-border border-t-green-500 rounded-full animate-spin" />
                                            : <CheckBadgeIcon className="w-4 h-4" />
                                        }
                                    </button>
                                )}

                                {can('solicitudPrestamo.status') && (
                                    <>
                                        <button
                                            onClick={() => openApproveModal(row)}
                                            disabled={!puedeAprobar}
                                            title={motivoBloqueo}
                                            className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-dark-surface-alt rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleUpdateStatus(row.id, 3)}
                                            className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-lg transition-colors">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                );
            }
        },
    ], [handleView, openApproveModal, handleUpdateStatus, handleVerContrato,
        contratoLoading, handleMarcarConforme, conformeLoading, openCodigoRecaudoModal, can]);

    if (loading && solicitudes.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader
                title="Solicitudes"
                icon={DocumentTextIcon}
                buttonText={can('solicitudPrestamo.store') ? '+ Nueva' : null}
                buttonLink={can('solicitudPrestamo.store') ? '/solicitudPrestamo/agregar' : null}
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

            <ViewSolicitudModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={viewData}
                isLoading={viewLoading}
            />

            <ContratoSelectorModal
                isOpen={isContratoSelectorOpen}
                onClose={handleCloseContratoSelector}
                data={contratoSelectorData}
                onSelectContrato={handleSelectContrato}
            />

            <PdfModal
                isOpen={isPdfOpen}
                onClose={() => setIsPdfOpen(false)}
                title={contratoPdfTitle}
                pdfUrl={contratoPdf}
            />

            <CodigoRecaudoModal
                isOpen={isCodigoRecaudoOpen}
                onClose={handleCloseCodigoRecaudoModal}
                solicitud={selectedForCodigo}
                onConfirm={handleAsignarCodigoRecaudo}
                loading={codigoRecaudoLoading}
                alert={codigoRecaudoAlert}
                onClearAlert={() => {}}
            />

            {isApproveOpen && (
                <ApproveSolicitudModal
                    isOpen={isApproveOpen}
                    onClose={handleCloseApproveModal}
                    onConfirm={handleUpdateStatus}
                    solicitud={selectedSolicitud}
                    loading={loading}
                    alert={modalAlert}
                    onClearAlert={() => setModalAlert(null)}
                />
            )}
        </div>
    );
};

export default Index;