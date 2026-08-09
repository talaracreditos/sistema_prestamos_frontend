import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import HistorialMoraModal from './HistorialMoraModal';
import HistorialReprogramacionesModal from './HistorialReprogramacionesModal';
import RefinanciamientoModal from './RefinanciamientoModal';
import ReducirMoraModal from './ReducirMoraModal';
import CambiarPresidenteModal from './CambiarPresidenteModal';
import ReprogramacionModal from './ReprogramacionModal';
import CronogramaTable from 'components/Shared/Tables/CronogramaTable';
import CronogramaCliente from 'components/Shared/Tables/CronogramaCliente';
import { 
    CalendarIcon, UserIcon, UserGroupIcon, 
    InformationCircleIcon, UsersIcon, 
    ArrowPathIcon, ArrowDownTrayIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathRoundedSquareIcon, StarIcon } from '@heroicons/react/24/outline';
import { useViewPrestamoModal } from 'hooks/Prestamo/useViewPrestamoModal';
import { useAuth } from 'context/AuthContext';

const ViewPrestamoModal = ({ isOpen, onClose, data, isLoading, onRefresh }) => {

    const [reducirMoraOpen, setReducirMoraOpen]                         = useState(false);
    const [cuotaParaReducir, setCuotaParaReducir]                       = useState(null);
    const [cambiarPresidenteOpen, setCambiarPresidenteOpen]     = useState(false);
    const [reprogramarOpen, setReprogramarOpen]                         = useState(false);
    const [historialReprogOpen, setHistorialReprogOpen]         = useState(false);
    const [refreshing, setRefreshing]                                   = useState(false);

    const { user, role } = useAuth();
    const esCliente = role === 'cliente';

    const userId = user?.id ?? null;

    const {
        canRefinanciar, canGeneratePdf, canReducirMora, canCambiarPresidente, canReprogramar,
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

    const miIntegrante = esCliente && data?.es_grupal
        ? data?.integrantes?.find(int => int.id === userId)
            ?? data?.integrantes_refinanciados?.find(int => int.id === userId)
        : null;

    const handleVerMiSaldo = () => {
        if (!miIntegrante || esVistaIntegrante) return;
        handleSelectIntegrante(miIntegrante.id);
    };

    const handleVerGrupo = () => {
        if (!esVistaIntegrante || !integranteSeleccionado) return;
        handleSelectIntegrante(integranteSeleccionado);
    };

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

    const handleSuccessReprogramacion = () => {
        setReprogramarOpen(false);
        if (onRefresh) onRefresh();
    };

    const puedeVerReprogramar = !esCliente && canReprogramar && !data?.es_grupal
        && data?.estado === 1 && !prestamoCancelado && data?.datos_economicos?.desembolsado;

    const cuotasPendientesCount = (cronogramaActivo ?? [])
        .filter(c => ![0, 2, 6].includes(c.estado)).length;

    const handleAbrirReprogramar = () => setReprogramarOpen(true);

    return (
        <>
            <ViewModal
                isOpen={isOpen}
                onClose={handleClose}
                title={esCliente
                    ? `Mi Préstamo #${data?.id?.toString().padStart(5, '0')}`
                    : `Detalle de Préstamo #${data?.id?.toString().padStart(5, '0')}`}
                isLoading={isLoading}
                size="xl"
                hideFooter = {true}
            >
                {data && (
                    <div className="space-y-6 transition-colors">

                        {/* 1. Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-dark-surface-alt p-4 rounded-2xl border border-slate-100 dark:border-dark-border transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl shadow-sm ${data.es_grupal ? 'bg-brand-red dark:bg-brand-red-glow text-white' : 'bg-white dark:bg-dark-surface text-slate-500 dark:text-dark-text'}`}>
                                    {data.es_grupal ? <UserGroupIcon className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                                        {data.es_grupal ? 'Grupo Solidario' : 'Cliente Titular'}
                                    </p>
                                    <p className="text-sm font-black uppercase text-slate-800 dark:text-dark-text">{data.cliente?.nombre}</p>
                                    {!esCliente && (
                                        <p className="text-[10px] font-bold text-brand-red dark:text-brand-gold">Documento: {data.cliente?.documento}</p>
                                    )}
                                    {!data.es_grupal && !esCliente && (
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className={`text-[9px] font-black uppercase ${
                                                data.integrantes?.[0]?.situacion === 'CASTIGADO' ? 'text-red-600 dark:text-red-400' :
                                                data.integrantes?.[0]?.situacion === 'VENCIDO'   ? 'text-amber-600 dark:text-amber-400' :
                                                'text-green-600 dark:text-green-400'
                                            }`}>
                                                ● {data.integrantes?.[0]?.situacion ?? 'VIGENTE'}
                                            </span>
                                            {canCastigar && data.estado === 1 && !prestamoCancelado && (
                                                <button
                                                    onClick={() => handleCastigar(data.detalle_id, !data.castigado)}
                                                    disabled={loadingCastigo}
                                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg transition-all border disabled:opacity-40 ${
                                                        data.castigado
                                                            ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30 hover:bg-green-100'
                                                            : 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {loadingCastigo ? '...' : data.castigado ? '✓ Quitar Castigo' : '✕ Marcar Castigado'}
                                                </button>
                                            )}
                                            {data.total_reprogramaciones > 0 && (
                                                <button
                                                    onClick={() => setHistorialReprogOpen(true)}
                                                    title="Ver historial de reprogramaciones"
                                                    className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 hover:bg-teal-100 transition-colors"
                                                >
                                                    <ClockIcon className="w-3 h-3" />
                                                    Reprogramado {data.total_reprogramaciones}x
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white dark:bg-dark-surface rounded-xl shadow-sm text-slate-500 dark:text-dark-text transition-colors">
                                    <InformationCircleIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Desembolso</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-dark-text uppercase">{data.datos_economicos?.modalidad_label ?? data.datos_economicos?.modalidad}</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Vía: {data.datos_economicos?.abonado_por}</p>
                                </div>
                            </div>
                        </div>

                        {/* Banner cancelado */}
                        {prestamoCancelado && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-dark-surface-alt border border-slate-300 dark:border-dark-border rounded-xl transition-colors">
                                <span className="text-[9px] font-black text-slate-500 dark:text-dark-text-muted uppercase">
                                    {esCliente
                                        ? '🚫 Este préstamo fue cancelado — Ya no hay cuotas por pagar'
                                        : '🚫 Préstamo Cancelado — Las cuotas ya no son exigibles'}
                                </span>
                            </div>
                        )}

                        {/* 2. Integrantes */}
                        {!esCliente && data.es_grupal && tieneIntegrantes && (
                            <div className="bg-brand-red-light/40 dark:bg-brand-gold/10 p-4 rounded-xl border border-brand-red/10 dark:border-brand-gold/20 transition-colors">
                                <h4 className="flex items-center gap-2 text-xs font-black text-brand-red-dark dark:text-brand-gold uppercase mb-1">
                                    <UsersIcon className="w-4 h-4" /> Desglose de Integrantes
                                </h4>
                                <p className="text-[9px] text-brand-red/70 dark:text-brand-gold/80 font-bold mb-3 italic">
                                    Haz click en un socio para ver su cronograma individual
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {data.integrantes.map((int) => (
                                        <div key={int.id} className="flex flex-col gap-1">
                                            <div onClick={() => handleSelectIntegrante(int.id)}
                                                className={`flex justify-between items-center bg-white dark:bg-dark-surface p-2 rounded border shadow-sm cursor-pointer transition-all
                                                    ${integranteSeleccionado === int.id
                                                        ? 'border-brand-red dark:border-brand-gold ring-1 ring-brand-red/50 dark:ring-brand-gold/50 bg-brand-red-light dark:bg-brand-gold/20'
                                                        : 'border-slate-100 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30'}`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-700 dark:text-dark-text uppercase">{int.nombre}</span>
                                                    <span className="text-[10px] text-brand-gold-dark dark:text-brand-gold font-bold">CARGO: {int.cargo}</span>
                                                    <span className={`text-[9px] font-black uppercase mt-0.5 ${
                                                        int.situacion === 'CASTIGADO' ? 'text-red-600 dark:text-red-400' :
                                                        int.situacion === 'VENCIDO'   ? 'text-amber-600 dark:text-amber-400' :
                                                        'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        ● {int.situacion ?? 'VIGENTE'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-black text-brand-red dark:text-brand-gold bg-white dark:bg-dark-surface-alt px-2 py-1 rounded-lg border border-brand-red/20 dark:border-dark-border shadow-sm">
                                                    S/ {int.monto}
                                                </span>
                                            </div>
                                            {canCastigar && integranteSeleccionado === int.id && data.estado === 1 && !prestamoCancelado && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCastigar(int.detalle_id, !int.castigado); }}
                                                    disabled={loadingCastigo}
                                                    className={`w-full text-[9px] font-black uppercase px-2 py-1 rounded-lg transition-all border disabled:opacity-40 ${
                                                        int.castigado
                                                            ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30 hover:bg-green-100'
                                                            : 'bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {loadingCastigo ? '...' : int.castigado ? '✓ Quitar Castigo' : '✕ Marcar Castigado'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {data.integrantes_refinanciados?.map((int) => (
                                        <div key={int.id} onClick={() => handleSelectIntegrante(int.id)}
                                            className={`flex justify-between items-center bg-blue-50 dark:bg-blue-500/10 p-2 rounded border shadow-sm cursor-pointer transition-all opacity-70
                                                ${integranteSeleccionado === int.id
                                                    ? 'border-blue-400 dark:border-blue-400 ring-1 ring-blue-400/50 opacity-100'
                                                    : 'border-blue-100 dark:border-blue-500/20 hover:border-blue-300'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase line-through">{int.nombre}</span>
                                                <span className="text-[10px] text-blue-500 dark:text-blue-400 font-black uppercase">Refinanciado</span>
                                                <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">CARGO: {int.cargo}</span>
                                            </div>
                                            <span className="text-xs font-black text-blue-400 dark:text-blue-400 bg-white dark:bg-dark-surface px-2 py-1 rounded-lg border border-blue-100 dark:border-dark-border shadow-sm line-through">
                                                S/ {int.monto}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Banner liquidado — solo staff */}
                        {!esCliente && data.estado === 3 && !loadingIntegrante && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl transition-colors">
                                <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase">
                                    ✓ Préstamo Liquidado
                                </span>
                            </div>
                        )}

                        {/* Toggle Grupo / Mi saldo  */}
                        {esCliente && data.es_grupal && miIntegrante && (
                            <div data-tutorial="toggle-vista" className="flex items-center gap-1 bg-slate-100 dark:bg-dark-surface-alt p-1 rounded-xl w-fit transition-colors">
                                <button
                                    onClick={handleVerGrupo}
                                    disabled={loadingIntegrante}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50 ${
                                        !esVistaIntegrante
                                            ? 'bg-brand-red dark:bg-brand-red-glow text-white shadow-md shadow-brand-red/20'
                                            : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text'
                                    }`}
                                >
                                    <UsersIcon className="w-3.5 h-3.5" />
                                    Grupo
                                </button>
                                <button
                                    onClick={handleVerMiSaldo}
                                    disabled={loadingIntegrante}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50 ${
                                        esVistaIntegrante
                                            ? 'bg-brand-red dark:bg-brand-red-glow text-white shadow-md shadow-brand-red/20'
                                            : 'text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text'
                                    }`}
                                >
                                    <UserIcon className="w-3.5 h-3.5" />
                                    Mi Saldo
                                </button>
                            </div>
                        )}

                        {/* 4. Header cronograma */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-700 dark:text-dark-text uppercase tracking-widest px-1 transition-colors">
                                <CalendarIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" />
                                {esCliente
                                    ? (esVistaIntegrante ? 'Mis Cuotas' : (data.es_grupal ? 'Cuotas del Grupo' : 'Mis Cuotas'))
                                    : esVistaIntegrante ? `Cronograma — ${integranteNombre}` : 'Cronograma de Pagos y Saldos'}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">

                                {puedeVerReprogramar && (
                                    <button
                                        onClick={handleAbrirReprogramar}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-teal-600/20"
                                    >
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        Reprogramar
                                    </button>
                                )}

                                {!esCliente && canRefinanciar && data.estado === 1 && !prestamoCancelado && (!data.es_grupal || esVistaIntegrante) && !integranteYaRefinanciado && (!esVistaIntegrante || integranteTienePendientes) && data.datos_economicos?.desembolsado && (
                                    <button
                                        onClick={() => handleAbrirRefinanciamiento(cronogramaActivo, esVistaIntegrante, integranteNombre)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold hover:bg-brand-gold-dark text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-brand-gold/20"
                                    >
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5" />
                                        {esVistaIntegrante ? 'Refinanciar Integrante' : 'Refinanciar'}
                                    </button>
                                )}

                                {!esCliente && canCambiarPresidente && data.es_grupal && !esVistaIntegrante && data.estado === 1 && !prestamoCancelado && data.integrantes?.length > 1 && (
                                    <button
                                        onClick={() => setCambiarPresidenteOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md"
                                    >
                                        <StarIcon className="w-3.5 h-3.5" />
                                        Cambiar Presidente
                                    </button>
                                )}

                                {!esCliente && integranteYaRefinanciado && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-200 dark:border-blue-500/20 transition-colors">
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5" />
                                        Préstamo #{integranteRefinanciado.refinanciado_prestamo_id?.toString().padStart(5, '0')}
                                    </span>
                                )}

                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing || loadingPdf || loadingIntegrante}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-dark-surface-alt hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-dark-text text-[10px] font-black uppercase rounded-lg transition-all border border-slate-200 dark:border-dark-border disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ArrowPathIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Actualizando...' : 'Actualizar'}
                                </button>

                                {!prestamoCancelado && canGeneratePdf && (
                                    <button onClick={handleDescargarCronograma} disabled={loadingPdf || refreshing}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red dark:bg-brand-red-glow hover:bg-brand-red-dark dark:hover:brightness-110 text-white dark:text-black text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-brand-red/20 disabled:opacity-40 disabled:cursor-not-allowed">
                                        {loadingPdf
                                            ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                            : <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                        }
                                        {esCliente
                                            ? (esVistaIntegrante ? 'PDF de mis cuotas' : 'Descargar PDF')
                                            : esVistaIntegrante ? 'PDF Individual' : (data.es_grupal ? 'PDF Grupal' : 'Descargar PDF')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 5. Cronograma */}
                        {loadingIntegrante ? (
                            <div className="flex items-center justify-center py-12">
                                <ArrowPathIcon className="w-6 h-6 animate-spin text-brand-red dark:text-brand-gold" />
                                <span className="ml-2 text-xs text-slate-400 dark:text-dark-text-muted font-bold uppercase">Cargando cronograma...</span>
                            </div>
                        ) : esCliente ? (
                            <CronogramaCliente
                                cronograma={cronogramaActivo}
                                eco={eco}
                                estadoPrestamo={data.estado}
                                prestamoCancelado={prestamoCancelado}
                                esGrupal={!!data.es_grupal}
                                esVistaIntegrante={esVistaIntegrante}
                                integrantes={data.es_grupal ? data.integrantes : []}
                                miIntegranteId={miIntegrante?.id ?? null}
                            />
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

                        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-dark-text-muted font-black uppercase pt-4 border-t border-slate-100 dark:border-dark-border transition-colors">
                            <p>F. Registro: {data.fechas?.generacion}</p>
                            <p>F. Inicio: {data.fechas?.inicio}</p>
                        </div>
                    </div>
                )}
            </ViewModal>

            <HistorialMoraModal isOpen={!!historialModal} onClose={() => setHistorialModal(null)} data={historialModal} />
            <PdfModal isOpen={pdfOpen} onClose={handleCerrarPdf} title={pdfTitle} base64={pdfBase64} />
            {!esCliente && (
                <>
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
                    <ReprogramacionModal
                        isOpen={reprogramarOpen}
                        onClose={() => setReprogramarOpen(false)}
                        data={reprogramarOpen ? {
                            prestamoId:            data?.id,
                            frecuenciaActual:        data?.datos_economicos?.frecuencia,
                            cuotasPendientes:        cuotasPendientesCount,
                            totalReprogramaciones:  data?.total_reprogramaciones ?? 0,
                        } : null}
                        onSuccess={handleSuccessReprogramacion}
                    />
                    <HistorialReprogramacionesModal
                        isOpen={historialReprogOpen}
                        onClose={() => setHistorialReprogOpen(false)}
                        prestamoId={data?.id}
                    />
                </>
            )}
        </>
    );
};

export default ViewPrestamoModal;