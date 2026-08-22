import { useState } from 'react';
import { descargarCronograma, showIntegrante, castigarDetalle } from 'services/prestamoService';
import { useAuth } from 'context/AuthContext';

export function useViewPrestamoModal({ data, onClose, onRefresh }) {

    const { can, role } = useAuth();
    const esCliente = role === 'cliente';

    // ── Permisos base ─────────────────────────────────────────────────────────
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
    const [loadingCastigo, setLoadingCastigo]                 = useState(false);

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
    // Estimado local para mostrar en el modal antes de enviar — el backend
    // (SaldoRefinanciamientoService) recalcula el saldo real y autoritativo
    // al momento de guardar, esto solo es para que el usuario vea cifras
    // aproximadas mientras decide cuánto interés/mora incluir.
    const handleAbrirRefinanciamiento = (cronogramaActivo, esVistaIntegrante, integranteNombre) => {
        let capitalPendiente   = 0;
        let interesPendiente   = 0;
        let seguroPendiente    = 0;
        let moraPendiente      = 0;
        let excedentePendiente = 0;
        let excDeducido        = false;

        if (cronogramaActivo) {
            cronogramaActivo.forEach(cuota => {
                if ([0, 2, 6].includes(cuota.estado)) return;

                const capital       = parseFloat(cuota.capital ?? 0);
                const capitalPagado = parseFloat(cuota.capital_pagado ?? 0);
                const interes       = parseFloat(cuota.interes ?? 0);
                const interesPagado = parseFloat(cuota.interes_pagado ?? 0);
                const seguro        = parseFloat(cuota.seguro ?? 0);
                const seguroPagado  = parseFloat(cuota.seguro_pagado ?? 0);
                const moraTotal     = parseFloat(cuota.mora_total ?? cuota.mora ?? 0);
                const moraPagada    = parseFloat(cuota.mora_pagada ?? 0);

                const excedente = !excDeducido
                    ? parseFloat(cuota.excedente_anterior ?? 0)
                    : 0;

                if (!excDeducido) {
                    excedentePendiente = excedente;
                    excDeducido        = true;
                }

                capitalPendiente += Math.max(0, capital - capitalPagado);
                interesPendiente += Math.max(0, interes - interesPagado);
                seguroPendiente  += Math.max(0, seguro  - seguroPagado);
                moraPendiente    += Math.max(0, moraTotal - moraPagada);
            });
        }

        const deudaPendiente = capitalPendiente + interesPendiente + seguroPendiente;

        if (deudaPendiente <= 0) {
            alert('No hay saldo pendiente para refinanciar.');
            return;
        }

        setRefData({
            prestamo_id:      data.id,
            cliente_id:       esVistaIntegrante ? integranteSeleccionado : null,
            cliente_nombre:   esVistaIntegrante ? integranteNombre : data.cliente?.nombre,
            deuda:            deudaPendiente,
            capital:          capitalPendiente,
            interes:          interesPendiente,
            seguro_pendiente: seguroPendiente,
            mora:             moraPendiente,
            excedente:        excedentePendiente,
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

    // ── Derivados de datos ────────────────────────────────────────────────────
    const esVistaIntegrante        = !!integranteSeleccionado && !loadingIntegrante && !!integranteData;
    const cronogramaActivo         = integranteData?.cronograma ?? data?.cronograma;
    const integranteActivo         = data?.integrantes?.find(i => i.id === integranteSeleccionado) ?? null;
    const integranteRefinanciado   = data?.integrantes_refinanciados?.find(i => i.id === integranteSeleccionado) ?? null;
    const integranteYaRefinanciado = !!integranteRefinanciado;
    const integranteNombre         = integranteActivo?.nombre ?? integranteRefinanciado?.nombre;
    const prestamoCancelado        = data?.estado === 2;
    const tieneIntegrantes         = data?.integrantes?.length > 0 || data?.integrantes_refinanciados?.length > 0;
    const esPrendario              = !!data?.es_prendario;

    const integranteTienePendientes = esVistaIntegrante
        ? (cronogramaActivo ?? []).some(c => ![2, 6, 0].includes(c.estado))
        : false;

    const cuotasPendientesCount = (cronogramaActivo ?? [])
        .filter(c => ![0, 2, 6].includes(c.estado)).length;

    const eco = loadingIntegrante
        ? null
        : (esVistaIntegrante && integranteData?.datos_economicos)
            ? integranteData.datos_economicos
            : data?.datos_economicos;

    // ── Derivados de PERMISO (regla de negocio: quién puede ver qué botón) ────
    // Prendario nunca admite refinanciamiento ni reprogramación — no tiene
    // sentido reprogramar/refinanciar una garantía que se remata en 1-2 cuotas.
    const puedeVerReprogramar =
        !esCliente &&
        canReprogramar &&
        !data?.es_grupal &&
        !esPrendario &&
        data?.estado === 1 &&
        !prestamoCancelado &&
        !!data?.datos_economicos?.desembolsado;

    const puedeVerRefinanciar =
        !esCliente &&
        canRefinanciar &&
        !esPrendario &&
        data?.estado === 1 &&
        !prestamoCancelado &&
        (!data?.es_grupal || esVistaIntegrante) &&
        !integranteYaRefinanciado &&
        (!esVistaIntegrante || integranteTienePendientes) &&
        !!data?.datos_economicos?.desembolsado;

    const puedeVerCambiarPresidente =
        !esCliente &&
        canCambiarPresidente &&
        !!data?.es_grupal &&
        !esVistaIntegrante &&
        data?.estado === 1 &&
        !prestamoCancelado &&
        (data?.integrantes?.length ?? 0) > 1;

    const puedeVerDescargarPdf =
        !prestamoCancelado &&
        canGeneratePdf;

    const puedeVerReducirMora =
        canReducirMora &&
        !prestamoCancelado &&
        data?.estado === 1;

    return {
        // rol / auth
        esCliente,
        // permisos base (por si algún componente hijo los necesita crudos)
        canRefinanciar, canGeneratePdf, canReducirMora, canCambiarPresidente, canCastigar, canReprogramar,
        // estado
        integranteSeleccionado, integranteData, loadingIntegrante, loadingCastigo,
        pdfOpen, pdfBase64, pdfTitle, loadingPdf,
        historialModal, refModalOpen, refData,
        // derivados de datos
        esVistaIntegrante, cronogramaActivo,
        integranteActivo, integranteRefinanciado, integranteYaRefinanciado,
        integranteNombre, prestamoCancelado, tieneIntegrantes, esPrendario, eco,
        integranteTienePendientes, cuotasPendientesCount,
        // derivados de permiso — listos para usar directo en el JSX
        puedeVerReprogramar, puedeVerRefinanciar, puedeVerCambiarPresidente,
        puedeVerDescargarPdf, puedeVerReducirMora,
        // handlers
        handleSelectIntegrante, handleDescargarCronograma,
        handleCerrarPdf, handleClose,
        handleAbrirRefinanciamiento, handleSuccessRefinanciamiento,
        setHistorialModal, setRefModalOpen, handleCastigar,
    };
}