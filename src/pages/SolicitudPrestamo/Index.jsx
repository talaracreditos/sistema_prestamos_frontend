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
        // Código de recaudo
        isCodigoRecaudoOpen, selectedForCodigo, codigoRecaudoLoading, codigoRecaudoAlert,
        openCodigoRecaudoModal, handleCloseCodigoRecaudoModal, handleAsignarCodigoRecaudo,
    } = useIndex();

    const { can } = useAuth();

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => <span className="font-black text-slate-600">#{row.id}</span>
        },
        {
            header: 'Sujeto / Grupo',
            render: (row) => (
                <div className="flex flex-col">
                    <span className={`font-bold text-xs uppercase ${row.es_grupal ? 'text-brand-red' : 'text-slate-800'}`}>
                        {row.cliente_nombre}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">ASESOR: {row.asesor_nombre}</span>
                </div>
            )
        },
        {
            header: 'Monto',
            render: (row) => <span className="font-black text-brand-red italic underline">S/ {row.monto_solicitado}</span>
        },
        {
            header: 'Estado',
            render: (row) => {
                const colors = {
                    1: 'bg-brand-gold-light text-brand-gold-dark border border-brand-gold/30',
                    2: 'bg-green-100 text-green-700 border border-green-200',
                    3: 'bg-brand-red-light text-brand-red border border-brand-red/30',
                };
                const labels = { 1: 'PENDIENTE', 2: 'APROBADO', 3: 'RECHAZADO' };
                return (
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black w-fit ${colors[row.estado]}`}>
                        {labels[row.estado]}
                    </span>
                );
            }
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex gap-1 justify-end items-center flex-wrap">

                    <button onClick={() => handleView(row.id)}
                        className="p-1.5 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4" />
                    </button>

                    {row.estado === 1 && (
                        <>
                            {can('solicitudPrestamo.update') && (
                                <Link to={`/solicitudPrestamo/editar/${row.id}`}
                                    className="p-1.5 text-slate-400 hover:text-brand-gold-dark hover:bg-brand-gold-light rounded-lg transition-colors">
                                    <PencilSquareIcon className="w-4 h-4" />
                                </Link>
                            )}

                            {/* Botón contrato — aplica a AMBOS tipos */}
                            {can('solicitudPrestamo.generatePDF') && (
                                <button
                                    onClick={() => handleVerContrato(row)}
                                    disabled={contratoLoading === row.id}
                                    title={row.es_grupal ? 'Ver contrato grupal' : 'Ver contrato individual'}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    {contratoLoading === row.id
                                        ? <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                                        : <DocumentArrowDownIcon className="w-4 h-4" />
                                    }
                                </button>
                            )}

                            {/* Botón código de recaudo — digitador */}
                            {!row.codigo_recaudo && can('solicitudPrestamo.codigoRecaudo') && (
                                <button
                                    onClick={() => openCodigoRecaudoModal(row)}
                                    title="Asignar código de recaudo"
                                    className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                >
                                    <IdentificationIcon className="w-4 h-4" />
                                </button>
                            )}

                            {/* Marcar conforme — aplica a AMBOS tipos */}
                            {can('solicitudPrestamo.contratoConforme') && (
                                <button
                                    onClick={() => !row.contrato_conforme && handleMarcarConforme(row.id)}
                                    disabled={row.contrato_conforme || conformeLoading === row.id}
                                    title={row.contrato_conforme ? 'Contrato conforme' : 'Marcar conforme'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        row.contrato_conforme
                                            ? 'text-green-600 bg-green-50 cursor-default'
                                            : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                                    }`}
                                >
                                    {conformeLoading === row.id
                                        ? <div className="w-4 h-4 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin" />
                                        : <CheckBadgeIcon className="w-4 h-4" />
                                    }
                                </button>
                            )}

                            {can('solicitudPrestamo.status') && (
                                <>
                                    <button
                                        onClick={() => openApproveModal(row)}
                                        disabled={!row.codigo_recaudo}
                                        title={!row.codigo_recaudo ? 'Asigna un código de recaudo primero' : 'Aprobar'}
                                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleUpdateStatus(row.id, 3)}
                                        className="p-1.5 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-lg transition-colors">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            )
        },
    ], [handleView, openApproveModal, handleUpdateStatus, handleVerContrato,
        contratoLoading, handleMarcarConforme, conformeLoading, openCodigoRecaudoModal, can]);

    if (loading && solicitudes.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
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

            {/* Selector de contrato (grupal + integrantes) */}
            <ContratoSelectorModal
                isOpen={isContratoSelectorOpen}
                onClose={handleCloseContratoSelector}
                data={contratoSelectorData}
                onSelectContrato={handleSelectContrato}
            />

            {/* Visor del PDF elegido */}
            <PdfModal
                isOpen={isPdfOpen}
                onClose={() => setIsPdfOpen(false)}
                title={contratoPdfTitle}
                pdfUrl={contratoPdf}
            />

            {/* 🔥 Modal de código de recaudo */}
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