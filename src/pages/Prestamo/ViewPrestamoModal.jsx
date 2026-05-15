import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import HistorialMoraModal from 'components/Shared/Modals/HistorialMoraModal';
import RefinanciamientoModal from './RefinanciamientoModal';
import ReducirMoraModal from './ReducirMoraModal';
import CronogramaTable from 'components/Shared/Tables/CronogramaTable';
import {
    CalendarIcon, UserIcon, UserGroupIcon,
    InformationCircleIcon, UsersIcon,
    ArrowPathIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathRoundedSquareIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { useAuth } from 'context/AuthContext';
import { useViewPrestamoModal } from 'hooks/Prestamo/useViewPrestamoModal';

const CardSkeleton = ({ accent = 'slate' }) => {
    const bg = {
        slate: 'bg-slate-50 border border-slate-100',
        gold:  'bg-brand-gold-light/20 border border-brand-gold/10',
        red:   'bg-brand-red/80',
        white: 'bg-white border border-slate-100',
    }[accent];
    const pulse = accent === 'red' ? 'bg-white/20' : 'bg-slate-200';
    return (
        <div className={`p-4 rounded-2xl animate-pulse ${bg}`}>
            <div className={`h-2.5 w-24 rounded-full mb-3 ${pulse}`} />
            <div className={`h-7 w-32 rounded-full mb-2 ${pulse}`} />
            <div className={`h-2 w-20 rounded-full mb-4 ${pulse}`} />
            <div className={`h-2 w-full rounded-full ${pulse}`} />
        </div>
    );
};

const ViewPrestamoModal = ({ isOpen, onClose, data, isLoading, onRefresh }) => {

    const { can } = useAuth();
    const canRefinanciar  = can('prestamo.refinanciar');
    const canGeneratePdf  = can('prestamo.generatePDF');
    const canReducirMora  = can('prestamo.reducirMora');

    // ── Estado local para ReducirMoraModal ───────────────────────────────────
    const [reducirMoraOpen, setReducirMoraOpen]   = useState(false);
    const [cuotaParaReducir, setCuotaParaReducir] = useState(null);

    const {
        integranteSeleccionado,
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

    // ── Cuota con mora pendiente del cronograma activo (la primera) ──────────
    const cuotaConMora = cronogramaActivo?.find(
        c => !([0, 2, 6].includes(c.estado)) && parseFloat(c.mora ?? 0) > 0
    ) ?? null;

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
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-slate-500">
                                    <InformationCircleIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desembolso</p>
                                    <p className="text-sm font-black text-slate-800 uppercase">{data.datos_economicos?.modalidad}</p>
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
                                        <div key={int.id} onClick={() => handleSelectIntegrante(int.id)}
                                            className={`flex justify-between items-center bg-white p-2 rounded border shadow-sm cursor-pointer transition-all
                                                ${integranteSeleccionado === int.id
                                                    ? 'border-brand-red ring-1 ring-brand-red/50 bg-brand-red-light'
                                                    : 'border-slate-100 hover:border-brand-red/30'}`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-700 uppercase">{int.nombre}</span>
                                                <span className="text-[10px] text-brand-gold-dark font-bold">CARGO: {int.cargo}</span>
                                            </div>
                                            <span className="text-xs font-black text-brand-red bg-white px-2 py-1 rounded-lg border border-brand-red/20 shadow-sm">
                                                S/ {int.monto}
                                            </span>
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

                        {/* 3. Banners de contexto */}
                        {data.estado === 3 && !loadingIntegrante && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                                <span className="text-[9px] font-black text-green-700 uppercase">
                                    ✓ Préstamo Liquidado — Totales históricos del préstamo completo
                                </span>
                            </div>
                        )}

                        {/* 4. Cards económicas */}
                        {loadingIntegrante ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <CardSkeleton accent="slate" />
                                <CardSkeleton accent="gold" />
                                <CardSkeleton accent="red" />
                                <CardSkeleton accent="white" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                                        {data.estado === 3 ? 'Capital Total' : 'Capital Pendiente'}
                                    </p>
                                    <p className="text-xl font-black text-slate-800">S/ {parseFloat(eco?.monto ?? 0).toFixed(2)}</p>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">de S/ {parseFloat(eco?.monto_original ?? 0).toFixed(2)}</p>
                                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-slate-700 rounded-full transition-all duration-500"
                                            style={{ width: `${((eco?.monto ?? 0) * 100) / (eco?.monto_original || 1)}%` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-brand-gold-light/20 rounded-2xl border border-brand-gold/10">
                                    <p className="text-[10px] font-black uppercase text-brand-gold-dark mb-1">Interés Pendiente</p>
                                    <p className="text-xl font-black text-brand-gold-dark">S/ {parseFloat(eco?.interes_monto ?? 0).toFixed(2)}</p>
                                    <p className="text-[11px] font-bold text-brand-gold-dark/70 mt-1">de S/ {parseFloat(eco?.interes_original ?? 0).toFixed(2)}</p>
                                    <div className="mt-3 w-full bg-brand-gold/20 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-brand-gold rounded-full transition-all duration-500"
                                            style={{ width: `${((eco?.interes_monto ?? 0) * 100) / (eco?.interes_original || 1)}%` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-brand-red rounded-2xl shadow-xl shadow-brand-red/20">
                                    <p className="text-[10px] font-black uppercase text-white/70 mb-1">
                                        {data.estado === 3 ? 'Total Cobrado' : 'Saldo Pendiente'}
                                    </p>
                                    <p className="text-xl font-black text-white">S/ {parseFloat(eco?.total_prestamo ?? 0).toFixed(2)}</p>
                                    <p className="text-[11px] font-bold text-white/70 mt-1">de S/ {parseFloat(eco?.total_original ?? 0).toFixed(2)}</p>
                                    <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-white rounded-full transition-all duration-500"
                                            style={{ width: `${((eco?.total_prestamo ?? 0) * 100) / (eco?.total_original || 1)}%` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                                            {esVistaIntegrante ? 'Cuota Individual' : 'Valor Cuota'}
                                        </p>
                                        <p className="text-xl font-black text-slate-800">S/ {parseFloat(eco?.valor_cuota ?? 0).toFixed(2)}</p>
                                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase">{eco?.frecuencia}</p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <p className="text-[9px] font-black uppercase text-slate-400">Seguro</p>
                                        <p className="text-sm font-black text-slate-700">S/ {parseFloat(eco?.seguro || 0).toFixed(2)}</p>
                                        <p className={`text-[8px] font-black uppercase mt-1 ${eco?.seguro_financiado ? 'text-brand-gold-dark' : 'text-green-600'}`}>
                                            {eco?.seguro_financiado ? 'Financiado' : '✓ Ya Cobrado'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Header cronograma */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase tracking-widest px-1">
                                <CalendarIcon className="w-4 h-4 text-brand-red" />
                                {esVistaIntegrante ? `Cronograma — ${integranteNombre}` : 'Cronograma de Pagos y Saldos'}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap">

                                {/* ── Botón Reducir Mora ── */}
                                {canReducirMora && !prestamoCancelado && cuotaConMora && (
                                    <button
                                        onClick={() => handleAbrirReducirMora(cuotaConMora)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-orange-500/20"
                                    >
                                        <ScissorsIcon className="w-3.5 h-3.5" />
                                        Reducir Mora
                                    </button>
                                )}

                                {canRefinanciar && data.estado === 1 && !prestamoCancelado && (!data.es_grupal || esVistaIntegrante) && !integranteYaRefinanciado && (
                                    <button
                                        onClick={() => handleAbrirRefinanciamiento(cronogramaActivo, esVistaIntegrante, integranteNombre)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold hover:bg-brand-gold-dark text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-brand-gold/20"
                                    >
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5" />
                                        {esVistaIntegrante ? 'Refinanciar Integrante' : 'Refinanciar'}
                                    </button>
                                )}

                                {integranteYaRefinanciado && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-black uppercase rounded-lg border border-blue-200">
                                        <ArrowPathRoundedSquareIcon className="w-3.5 h-3.5" />
                                        Préstamo #{integranteRefinanciado.refinanciado_prestamo_id?.toString().padStart(5, '0')}
                                    </span>
                                )}

                                {!prestamoCancelado && canGeneratePdf && (
                                    <button onClick={handleDescargarCronograma} disabled={loadingPdf}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-brand-red-dark text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-brand-red/20">
                                        {loadingPdf
                                            ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                            : <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                        }
                                        {esVistaIntegrante ? 'PDF Individual' : (data.es_grupal ? 'PDF Grupal' : 'Descargar PDF')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 6. Tabla cronograma */}
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
        </>
    );
};

export default ViewPrestamoModal;