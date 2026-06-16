import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import HistorialMoraModal from 'components/Shared/Modals/HistorialMoraModal';
import RefinanciamientoModal from './RefinanciamientoModal';
import ReducirMoraModal from './ReducirMoraModal';
import CambiarPresidenteModal from './CambiarPresidenteModal';
import CronogramaTable from 'components/Shared/Tables/CronogramaTable';
import {
    CalendarIcon, UserIcon, UserGroupIcon,
    InformationCircleIcon, UsersIcon,
    ArrowPathIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathRoundedSquareIcon, StarIcon } from '@heroicons/react/24/outline';
import { useViewPrestamoModal } from 'hooks/Prestamo/useViewPrestamoModal';

const ViewPrestamoModal = ({ isOpen, onClose, data, isLoading, onRefresh }) => {

    const [reducirMoraOpen, setReducirMoraOpen]             = useState(false);
    const [cuotaParaReducir, setCuotaParaReducir]           = useState(null);
    const [cambiarPresidenteOpen, setCambiarPresidenteOpen] = useState(false);
    const [refreshing, setRefreshing]                       = useState(false);

    const {
        canRefinanciar, canGeneratePdf, canReducirMora, canCambiarPresidente,
        canCastigar, loadingCastigo, handleCastigar, integranteSeleccionado,
        loadingIntegrante,
        pdfOpen, pdfBase64, pdfTitle, loadingPdf,
        historialModal,
        refModalOpen, refData,
        esVistaIntegrante,
        cronogramaActivo,
        integranteRefinanciado,
        integranteYaRefinanciado,
        integranteNombre,
        prestamoCancelado,
        tieneIntegrantes,
        eco,
        handleSelectIntegrante,
        handleDescargarCronograma,
        handleCerrarPdf,
        handleClose,
        handleAbrirRefinanciamiento,
        handleSuccessRefinanciamiento,
        setHistorialModal,
        setRefModalOpen,
    } = useViewPrestamoModal({ data, onClose, onRefresh });

    const integranteTienePendientes = esVistaIntegrante
        ? (cronogramaActivo ?? []).some(c => ![2, 6, 0].includes(c.estado))
        : false;

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setRefreshing(true);
        try { await onRefresh(); } finally { setRefreshing(false); }
    };

    const handleAbrirReducirMora = (cuota) => {
        setCuotaParaReducir(cuota);
        setReducirMoraOpen(true);
    };

    const handleSuccessReducirMora = () => {
        setReducirMoraOpen(false);
        setCuotaParaReducir(null);
        if (onRefresh) onRefresh();
    };

    return (
        <>
            <ViewModal
                isOpen={isOpen}
                onClose={handleClose}
                title={`Detalle de Préstamo #${data?.id?.toString().padStart(5, '0')}`}
                isLoading={isLoading}
                size="xl"
                hideFooter = {true}
            >
                {data && (
                    <div className="space-y-6">

                        {/* 1. Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl shadow-sm ${data.es_grupal ? 'bg-brand-red text-white' : 'bg-white text-slate-500'}`}>
                                    {data.es_grupal ? <UserGroupIcon className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {data.es_grupal ? 'Grupo Solidario' : 'Cliente Titular'}
                                    </p>
                                    <p className="text-sm font-black uppercase text-slate-800">{data.cliente?.nombre}</p>
                                    <p className="text-[10px] font-bold text-brand-red">Documento: {data.cliente?.documento}</p>
                                    {!data.es_grupal && (
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className={`text-[9px] font-black uppercase ${
                                                data.situacion === 'CASTIGADO' ? 'text-red-600' :
                                                data.situacion === 'VENCIDO'   ? 'text-amber-600' :
                                                'text-green-600'
                                            }`}>
                                                ● {data.situacion ?? 'VIGENTE'}
                                            </span>
                                            {canCastigar && data.estado === 1 && !prestamoCancelado && (
                                                <button
                                                    onClick={() => handleCastigar(data.detalle_id, !data.castigado)}
                                                    disabled={loadingCastigo}
                                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg transition-all border disabled:opacity-40 ${
                                                        data.castigado
                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {loadingCastigo ? '...' : data.castigado ? '✓ Quitar Castigo' : '✕ Marcar Castigado'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-500">
                                    <InformationCircleIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desembolso</p>
                                    <p className="text-sm font-black text-slate-800 uppercase">{data.datos_economicos?.modalidad_label ?? data.datos_economicos?.modalidad}</p>
                                    <p className="text-[10px] font-bold text-slate-500">Vía: {data.datos_economicos?.abonado_por}</p>
                                </div>
                            </div>
                        </div>

                        {/* Banner cancelado */}
                        {prestamoCancelado && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl">
                                <span className="text-[9px] font-black text-slate-500 uppercase">
                                    🚫 Préstamo Cancelado — Las cuotas ya no son exigibles
                                </span>
                            </div>
                        )}

                        {/* 2. Integrantes */}
                        {data.es_grupal && tieneIntegrantes && (
                            <div className="bg-brand-red-light/40 p-4 rounded-xl border border-brand-red/10">
                                <h4 className="flex items-center gap-2 text-xs font-black text-brand-red-dark uppercase mb-1">
                                    <UsersIcon className="w-4 h-4" /> Desglose de Integrantes
                                </h4>
                                <p className="text-[9px] text-brand-red/70 font-bold mb-3 italic">
                                    Haz click en un socio para ver su cronograma individual
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {data.integrantes.map((int) => (
                                        <div key={int.id} className="flex flex-col gap-1">
                                            <div onClick={() => handleSelectIntegrante(int.id)}
                                                className={`flex justify-between items-center bg-white p-2 rounded border shadow-sm cursor-pointer transition-all
                                                    ${integranteSeleccionado === int.id
                                                        ? 'border-brand-red ring-1 ring-brand-red/50 bg-brand-red-light'
                                                        : 'border-slate-100 hover:border-brand-red/30'}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-700 uppercase">{int.nombre}</span>
                                                    <span className="text-[10px] text-brand-gold-dark font-bold">CARGO: {int.cargo}</span>
                                                    <span className={`text-[9px] font-black uppercase mt-0.5 ${
                                                        int.situacion === 'CASTIGADO' ? 'text-red-600' :
                                                        int.situacion === 'VENCIDO'   ? 'text-amber-600' :
                                                        'text-green-600'
                                                    }`}>
                                                        ● {int.situacion ?? 'VIGENTE'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-black text-brand-red bg-white px-2 py-1 rounded-lg border border-brand-red/20 shadow-sm">
                                                    S/ {int.monto}
                                                </span>
                                            </div>
                                            {canCastigar && integranteSeleccionado === int.id && data.estado === 1 && !prestamoCancelado && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCastigar(int.detalle_id, !int.castigado); }}
                                                    disabled={loadingCastigo}
                                                    className={`w-full text-[9px] font-black uppercase px-2 py-1 rounded-lg transition-all border disabled:opacity-40 ${
                                                        int.castigado
                                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {loadingCastigo ? '...' : int.castigado ? '✓ Quitar Castigo' : '✕ Marcar Castigado'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {data.integrantes_refinanciados?.map((int) => (
                                        <div key={int.id} onClick={() => handleSelectIntegrante(int.id)}
                                            className={`flex justify-between items-center bg-blue-50 p-2 rounded border shadow-sm cursor-pointer transition-all opacity-70
                                                ${integranteSeleccionado === int.id
                                                    ? 'border-blue-400 ring-1 ring-blue-400/50 opacity-100'
                                                    : 'border-blue-100 hover:border-blue-300'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-500 uppercase line-through">{int.nombre}</span>
                                                <span className="text-[10px] text-blue-500 font-black uppercase">Refinanciado</span>
                                                <span className="text-[9px] text-slate-400 font-bold">CARGO: {int.cargo}</span>
                                            </div>
                                            <span className="text-xs font-black text-blue-400 bg-white px-2 py-1 rounded-lg border border-blue-100 shadow-sm line-through">
                                                S/ {int.monto}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Banner liquidado */}
                        {data.estado === 3 && !loadingIntegrante && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                                <span className="text-[9px] font-black text-green-700 uppercase">
                                    ✓ Préstamo Liquidado
                                </span>
                            </div>
                        )}

                        {/* 4. Header cronograma */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase tracking-widest px-1">
                                <CalendarIcon className="w-4 h-4 text-brand-red" />
                                {esVistaIntegrante ? `Cronograma — ${integranteNombre}` : 'Cronograma de Pagos y Saldos'}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">

                                {canRefinanciar && data.estado === 1 && !prestamoCancelado && (!data.es_grupal || esVistaIntegrante) && !integranteYaRefinanciado && (!esVistaIntegrante || integranteTienePendientes) && data.datos_economicos?.desembolsado && (
                                    <button
                                        onClick={() => handleAbrirRefinanciamiento(cronogramaActivo, esVistaIntegrante, integranteNombre)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold hover:bg-brand-gold-dark text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-brand-gold/20"
                                    >
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5" />
                                        {esVistaIntegrante ? 'Refinanciar Integrante' : 'Refinanciar'}
                                    </button>
                                )}

                                {canCambiarPresidente && data.es_grupal && !esVistaIntegrante && data.estado === 1 && !prestamoCancelado && data.integrantes?.length > 1 && (
                                    <button
                                        onClick={() => setCambiarPresidenteOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md"
                                    >
                                        <StarIcon className="w-3.5 h-3.5" />
                                        Cambiar Presidente
                                    </button>
                                )}

                                {integranteYaRefinanciado && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-black uppercase rounded-lg border border-blue-200">
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5" />
                                        Préstamo #{integranteRefinanciado.refinanciado_prestamo_id?.toString().padStart(5, '0')}
                                    </span>
                                )}

                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing || loadingPdf || loadingIntegrante}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg transition-all border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                                </button>

                                {!prestamoCancelado && canGeneratePdf && (
                                    <button onClick={handleDescargarCronograma} disabled={loadingPdf || refreshing}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-brand-red-dark text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-brand-red/20 disabled:opacity-40 disabled:cursor-not-allowed">
                                        {loadingPdf
                                            ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                            : <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                        }
                                        {esVistaIntegrante ? 'PDF Individual' : (data.es_grupal ? 'PDF Grupal' : 'Descargar PDF')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 5. Cronograma + Cards económicas integradas */}
                        {loadingIntegrante ? (
                            <div className="flex items-center justify-center py-12">
                                <ArrowPathIcon className="w-6 h-6 animate-spin text-brand-red" />
                                <span className="ml-2 text-xs text-slate-400 font-bold uppercase">Cargando cronograma...</span>
                            </div>
                        ) : (
                            <CronogramaTable
                                cronograma={cronogramaActivo}
                                esVistaIntegrante={esVistaIntegrante}
                                onHistorialModal={setHistorialModal}
                                onReducirMora={canReducirMora && !prestamoCancelado && data.estado === 1 ? handleAbrirReducirMora : undefined}
                                eco={eco}
                                estadoPrestamo={data.estado}
                                loadingEco={loadingIntegrante}
                            />
                        )}

                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase pt-4 border-t border-slate-100">
                            <p>F. Registro: {data.fechas?.generacion}</p>
                            <p>F. Inicio: {data.fechas?.inicio}</p>
                        </div>
                    </div>
                )}
            </ViewModal>

            <HistorialMoraModal isOpen={!!historialModal} onClose={() => setHistorialModal(null)} data={historialModal} />
            <PdfModal isOpen={pdfOpen} onClose={handleCerrarPdf} title={pdfTitle} base64={pdfBase64} />
            <RefinanciamientoModal
                isOpen={refModalOpen}
                onClose={() => setRefModalOpen(false)}
                data={refData}
                integrantesGrupo={data?.integrantes}
                onSuccess={handleSuccessRefinanciamiento}
            />
            <ReducirMoraModal
                isOpen={reducirMoraOpen}
                onClose={() => { setReducirMoraOpen(false); setCuotaParaReducir(null); }}
                cuota={cuotaParaReducir}
                onSuccess={handleSuccessReducirMora}
            />
            <CambiarPresidenteModal
                isOpen={cambiarPresidenteOpen}
                onClose={() => setCambiarPresidenteOpen(false)}
                prestamo={data}
                onSuccess={() => { setCambiarPresidenteOpen(false); if (onRefresh) onRefresh(); }}
            />
        </>
    );
};

export default ViewPrestamoModal;