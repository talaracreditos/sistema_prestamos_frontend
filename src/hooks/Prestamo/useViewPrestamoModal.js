import { useState } from 'react';
import { descargarCronograma, showIntegrante , castigarDetalle } from 'services/prestamoService';
import { useAuth } from 'context/AuthContext';

export function useViewPrestamoModal({ data, onClose, onRefresh }) {

    const { can } = useAuth();

    // ── Permisos ──────────────────────────────────────────────────────────────
    const canRefinanciar       = can('prestamo.refinanciar');
    const canGeneratePdf       = can('prestamo.generatePDF');
    const canReducirMora       = can('prestamo.reducirMora');
    const canCambiarPresidente = can('prestamo.cambiarPresidente');
    const canCastigar          = can('prestamoDetalle.status');
    const canReprogramar       = can('prestamo.reprogramar');

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
    const [loadingCastigo, setLoadingCastigo] = useState(false);

    // ── Selección de integrante ───────────────────────────────────────────────
    const handleSelectIntegrante = async (clienteId) => {
        if (integranteSeleccionado === clienteId) {
            setIntegranteSeleccionado(null);
            setIntegranteData(null);
            return;
        }
        setIntegranteSeleccionado(clienteId);
        setLoadingIntegrante(true);
        setIntegranteData(null);
        try {
            const res = await showIntegrante(data.id, clienteId);
            setIntegranteData(res.data || res);
        } finally {
            setLoadingIntegrante(false);
        }
    };

    // ── PDF ───────────────────────────────────────────────────────────────────
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

    const handleCerrarPdf = () => {
        setPdfOpen(false);
        setPdfBase64(null);
    };

    // ── Cierre del modal principal ────────────────────────────────────────────
    const handleClose = () => {
        setIntegranteSeleccionado(null);
        setIntegranteData(null);
        onClose();
    };

    // ── Refinanciamiento ──────────────────────────────────────────────────────
    const handleAbrirRefinanciamiento = (cronogramaActivo, esVistaIntegrante, integranteNombre) => {
        let deudaPendiente     = 0;
        let moraPendiente      = 0;
        let excedentePendiente = 0;
        let excDeducido        = false;

        if (cronogramaActivo) {
            cronogramaActivo.forEach(cuota => {
                if ([0, 2, 6].includes(cuota.estado)) return;

                const deudaBase  = parseFloat(cuota.total_cuota ?? cuota.monto ?? 0);
                const abonado    = parseFloat(cuota.pago_acumulado ?? 0);
                const moraTotal  = parseFloat(cuota.mora_total ?? cuota.mora ?? 0);
                const moraPagada = parseFloat(cuota.mora_pagada ?? 0);

                const excedente = !excDeducido
                    ? parseFloat(cuota.excedente_anterior ?? 0)
                    : 0;

                if (!excDeducido) {
                    excedentePendiente = excedente;
                    excDeducido        = true;
                }

                deudaPendiente += Math.max(0, deudaBase - abonado);
                moraPendiente  += Math.max(0, moraTotal - moraPagada);
            });
        }

        if (deudaPendiente <= 0) {
            alert('No hay saldo pendiente para refinanciar.');
            return;
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

    const handleCastigar = async (detalleId, activar) => {
        setLoadingCastigo(true);
        try {
            await castigarDetalle(detalleId, activar);
            if (onRefresh) await onRefresh();
        } finally {
            setLoadingCastigo(false);
        }
    };

    const handleSuccessRefinanciamiento = () => {
        setRefModalOpen(false);
        handleClose();
        if (onRefresh) onRefresh();
    };

    // ── Derivados ─────────────────────────────────────────────────────────────
    const esVistaIntegrante        = !!integranteSeleccionado && !loadingIntegrante && !!integranteData;
    const cronogramaActivo         = integranteData?.cronograma ?? data?.cronograma;
    const integranteActivo         = data?.integrantes?.find(i => i.id === integranteSeleccionado) ?? null;
    const integranteRefinanciado   = data?.integrantes_refinanciados?.find(i => i.id === integranteSeleccionado) ?? null;
    const integranteYaRefinanciado = !!integranteRefinanciado;
    const integranteNombre         = integranteActivo?.nombre ?? integranteRefinanciado?.nombre;
    const prestamoCancelado        = data?.estado === 2;
    const tieneIntegrantes         = data?.integrantes?.length > 0 || data?.integrantes_refinanciados?.length > 0;

    const eco = loadingIntegrante
        ? null
        : (esVistaIntegrante && integranteData?.datos_economicos)
            ? integranteData.datos_economicos
            : data?.datos_economicos;

    return {
        // permisos
        canRefinanciar, canGeneratePdf, canReducirMora, canCambiarPresidente, canCastigar, canReprogramar,
        // estado
        integranteSeleccionado, integranteData, loadingIntegrante, loadingCastigo,
        pdfOpen, pdfBase64, pdfTitle, loadingPdf,
        historialModal, refModalOpen, refData,
        // derivados
        esVistaIntegrante, cronogramaActivo,
        integranteActivo, integranteRefinanciado, integranteYaRefinanciado,
        integranteNombre, prestamoCancelado, tieneIntegrantes, eco,
        // handlers
        handleSelectIntegrante, handleDescargarCronograma,
        handleCerrarPdf, handleClose,
        handleAbrirRefinanciamiento, handleSuccessRefinanciamiento,
        setHistorialModal, setRefModalOpen, handleCastigar,
    };
}