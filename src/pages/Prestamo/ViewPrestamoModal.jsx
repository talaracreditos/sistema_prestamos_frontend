import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import HistorialMoraModal from 'components/Shared/Modals/HistorialMoraModal';
import RefinanciamientoModal from './RefinanciamientoModal';
import CronogramaTable from 'components/Shared/Tables/CronogramaTable';
import {
    CalendarIcon, UserIcon, UserGroupIcon,
    InformationCircleIcon, UsersIcon,
    ArrowPathIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { descargarCronograma, showIntegrante } from 'services/prestamoService';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { useAuth } from 'context/AuthContext';

const ViewPrestamoModal = ({ isOpen, onClose, data, isLoading, onRefresh }) => {

    const { can } = useAuth();
    const canRefinanciar = can('prestamo.refinanciar');

    const [integranteSeleccionado, setIntegranteSeleccionado] = useState(null);
    const [integranteData, setIntegranteData]                 = useState(null);
    const [loadingIntegrante, setLoadingIntegrante]           = useState(false);
    const [pdfOpen, setPdfOpen]                               = useState(false);
    const [pdfBase64, setPdfBase64]                           = useState(null);
    const [pdfTitle, setPdfTitle]                             = useState('');
    const [loadingPdf, setLoadingPdf]                         = useState(false);
    const [historialModal, setHistorialModal]                 = useState(null);
    const [refModalOpen, setRefModalOpen]                     = useState(false);
    const [refData, setRefData]                               = useState(null);

    const handleSelectIntegrante = async (clienteId) => {
        if (integranteSeleccionado === clienteId) {
            setIntegranteSeleccionado(null);
            setIntegranteData(null);
            return;
        }
        setIntegranteSeleccionado(clienteId);
        setLoadingIntegrante(true);
        try {
            const res = await showIntegrante(data.id, clienteId);
            setIntegranteData(res.data || res);
        } finally {
            setLoadingIntegrante(false);
        }
    };

    const handleDescargarCronograma = async () => {
        setLoadingPdf(true);
        try {
            const res = await descargarCronograma(data.id, integranteSeleccionado ?? null);
            const result = res.data || res;
            setPdfBase64(result.pdf);
            setPdfTitle(result.title);
            setPdfOpen(true);
        } finally {
            setLoadingPdf(false);
        }
    };

    const handleClose = () => {
        setIntegranteSeleccionado(null);
        setIntegranteData(null);
        onClose();
    };

    const cronogramaActivo  = integranteData?.cronograma ?? data?.cronograma;
    const esVistaIntegrante = !!integranteData;

    const integranteActivo         = data?.integrantes?.find(i => i.id === integranteSeleccionado) ?? null;
    const integranteRefinanciado   = data?.integrantes_refinanciados?.find(i => i.id === integranteSeleccionado) ?? null;
    const integranteYaRefinanciado = !!integranteRefinanciado;
    const integranteNombre         = integranteActivo?.nombre ?? integranteRefinanciado?.nombre;

    // Préstamo cancelado (estado=2) — no tiene sentido descargar PDF ni refinanciar
    const prestamoCancelado = data?.estado === 2;

    const handleAbrirRefinanciamiento = () => {
        let deudaPendiente     = 0;
        let moraPendiente      = 0;
        let excedentePendiente = 0;
        let excDeducido        = false;

        if (cronogramaActivo) {
            cronogramaActivo.forEach(cuota => {
                // Saltar canceladas (0), pagadas (2) y refinanciadas (6)
                if ([0, 2, 6].includes(cuota.estado)) return;

                const deudaBase  = parseFloat(cuota.total_cuota ?? cuota.monto ?? 0);
                const abonado    = parseFloat(cuota.pago_acumulado ?? 0);
                const moraTotal  = parseFloat(cuota.mora_total ?? cuota.mora ?? 0);
                const moraPagada = parseFloat(cuota.mora_pagada ?? 0);

                const excedente = !excDeducido
                    ? parseFloat(cuota.excedente_aplicado ?? cuota.excedente_anterior ?? 0)
                    : 0;

                if (!excDeducido) {
                    excedentePendiente = excedente;
                    excDeducido        = true;
                }

                deudaPendiente += Math.max(0, deudaBase - abonado - excedente);
                moraPendiente  += Math.max(0, moraTotal - moraPagada);
            });
        }

        setRefData({
            prestamo_id:    data.id,
            cliente_id:     esVistaIntegrante ? integranteSeleccionado : null,
            cliente_nombre: esVistaIntegrante ? integranteNombre : data.cliente?.nombre,
            deuda:          deudaPendiente,
            mora:           moraPendiente,
            excedente:      excedentePendiente,
        });
        setRefModalOpen(true);
    };

    const tieneIntegrantes = data?.integrantes?.length > 0 || data?.integrantes_refinanciados?.length > 0;

    const eco = data?.datos_economicos;
    const interesMonto = eco?.interes_monto != null
        ? parseFloat(eco.interes_monto)
        : (
            parseFloat(eco?.total_prestamo ?? 0)
            - parseFloat(eco?.monto ?? 0)
            - (eco?.seguro_financiado ? parseFloat(eco?.seguro ?? 0) : 0)
          );

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
                                    <p className="text-sm font-black text-slate-800 uppercase">{eco?.modalidad}</p>
                                    <p className="text-[10px] font-bold text-slate-500">Vía: {eco?.abonado_por}</p>
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

                        {/* 3. Resumen Económico */}
                        {data.estado === 3 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                                <span className="text-[9px] font-black text-green-700 uppercase">✓ Préstamo Liquidado — Totales históricos del préstamo completo</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase">
                                    {data.estado === 3 ? 'Capital Total' : 'Capital Pendiente'}
                                </p>
                                <p className="text-md font-black text-slate-800">S/ {parseFloat(eco?.monto ?? 0).toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Interés ({eco?.interes_porc}%)</p>
                                <p className="text-md font-black text-brand-gold-dark">S/ {interesMonto.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center flex flex-col justify-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Seguro</p>
                                <p className="text-md font-black text-slate-800">S/ {parseFloat(eco?.seguro || 0).toFixed(2)}</p>
                                <p className={`text-[8px] font-black uppercase mt-0.5 ${eco?.seguro_financiado ? 'text-brand-gold-dark' : 'text-green-600'}`}>
                                    {eco?.seguro_financiado ? '(En Cuotas)' : '✓ Ya Cobrado'}
                                </p>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-xl text-center shadow-lg">
                                <p className="text-[9px] font-black text-slate-300 uppercase">
                                    {data.estado === 3 ? 'Total Cobrado' : 'Total Cobrar'}
                                </p>
                                <p className="text-md font-black text-brand-gold">S/ {parseFloat(eco?.total_prestamo ?? 0).toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase">Cuota</p>
                                <p className="text-md font-black text-slate-800">S/ {parseFloat(eco?.valor_cuota ?? 0).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* 4. Header cronograma */}
                        <div className="flex items-center justify-between">
                            <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase tracking-widest px-1">
                                <CalendarIcon className="w-4 h-4 text-brand-red" />
                                {esVistaIntegrante ? `Cronograma — ${integranteNombre}` : 'Cronograma de Pagos y Saldos'}
                            </h4>
                            <div className="flex items-center gap-2">

                                {/* Refinanciar — solo si vigente y no cancelado */}
                                {canRefinanciar && data.estado === 1 && !prestamoCancelado && (!data.es_grupal || esVistaIntegrante) && !integranteYaRefinanciado && (
                                    <button onClick={handleAbrirRefinanciamiento}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold hover:bg-brand-gold-dark text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-md shadow-brand-gold/20">
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

                                {/* PDF — oculto si el préstamo está cancelado */}
                                {!prestamoCancelado && (
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

                        {/* 5. Tabla */}
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
            <PdfModal isOpen={pdfOpen} onClose={() => { setPdfOpen(false); setPdfBase64(null); }} title={pdfTitle} base64={pdfBase64} />
            <RefinanciamientoModal
                isOpen={refModalOpen}
                onClose={() => setRefModalOpen(false)}
                data={refData}
                onSuccess={() => {
                    setRefModalOpen(false);
                    handleClose();
                    if (onRefresh) onRefresh();
                }}
            />
        </>
    );
};

export default ViewPrestamoModal;