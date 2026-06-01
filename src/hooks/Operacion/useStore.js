import { useState, useEffect, useCallback } from 'react';
import { desembolsar, cobrarCuota } from 'services/operacionService';
import { show as getPrestamoDetails } from 'services/prestamoService';
import { getMiSesion, abrirCaja, cerrarCaja } from 'services/cajaSesionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const [loading, setLoading] = useState(true);
    const [sesionActiva, setSesionActiva] = useState(undefined);
    const [alert, setAlert] = useState(null);

    const [tipoOperacion, setTipoOperacion] = useState('cobro');
    const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
    const [prestamoDetalle, setPrestamoDetalle] = useState(null);

    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);

    const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
    const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false);

    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfBase64, setPdfBase64] = useState(null);

    const verifySesion = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMiSesion();
            if (res && res.data && res.data.id) {
                setSesionActiva(res.data);
            } else {
                setSesionActiva(null);
            }
        } catch (err) {
            setSesionActiva(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifySesion();
    }, [verifySesion]);

    const handleAbrirSesion = async (data) => {
        setLoading(true);
        try {
            await abrirCaja(data);
            setAlert({ type: 'success', message: '¡Turno aperturado exitosamente!' });
            setIsAbrirModalOpen(false);
            verifySesion();
        } catch (err) {
            setIsAbrirModalOpen(false);
            setAlert(handleApiError(err));
            setLoading(false);
        }
    };

    const handleCerrarSesion = async (data) => {
        setLoading(true);
        try {
            await cerrarCaja(sesionActiva.id, data);
            setAlert({ type: 'success', message: 'Turno cerrado y arqueo registrado.' });
            setIsCerrarModalOpen(false);
            setPrestamoSeleccionado(null);
            setPrestamoDetalle(null);
            verifySesion();
        } catch (err) {
            setAlert(handleApiError(err));
            setLoading(false);
        }
    };

    const cargarDetallePrestamo = useCallback(async (prestamo) => {
        if (!prestamo) return;
        setLoading(true);
        try {
            const res = await getPrestamoDetails(prestamo.id);
            setPrestamoDetalle(res.data || res);
        } catch (err) {
            setAlert(handleApiError(err, "No se pudo cargar el cronograma."));
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSelectPrestamo = useCallback(async (prestamo) => {
        setPrestamoSeleccionado(prestamo);
        setPrestamoDetalle(null);
        if (prestamo && tipoOperacion === 'cobro') {
            await cargarDetallePrestamo(prestamo);
        }
    }, [tipoOperacion, cargarDetallePrestamo]);

    // Refresca el detalle del préstamo actualmente seleccionado
    const handleRefresh = useCallback(async () => {
        if (!prestamoSeleccionado || tipoOperacion !== 'cobro') return;
        await cargarDetallePrestamo(prestamoSeleccionado);
    }, [prestamoSeleccionado, tipoOperacion, cargarDetallePrestamo]);

    const handleDesembolsar = async (formData) => {
        setLoading(true);
        try {
            await desembolsar(formData);
            setAlert({ type: 'success', message: 'Desembolso procesado correctamente.' });
            setPrestamoSeleccionado(null);
            verifySesion();
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const openPagoModal = (cuota) => {
        setCuotaSeleccionada(cuota);
        setIsPagoModalOpen(true);
    };

    const handleConfirmarPago = async (formData, setAlertLocal) => {
        setLoading(true);
        try {
            const response = await cobrarCuota(formData);
            setAlert({ type: 'success', message: '¡Pago registrado exitosamente!' });
            setIsPagoModalOpen(false);

            if (prestamoSeleccionado) handleSelectPrestamo(prestamoSeleccionado);
            verifySesion();

            if (response.data?.pdf) {
                setPdfBase64(response.data.pdf);
                setPdfTitle('Recibo de Pago de Cuota');
                setIsPdfModalOpen(true);
            }
        } catch (err) {
            const error = handleApiError(err);
            if (setAlertLocal) {
                setAlertLocal(error);
            } else {
                setAlert(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        loading, sesionActiva, alert, setAlert,
        tipoOperacion, setTipoOperacion,
        prestamoSeleccionado, handleSelectPrestamo, prestamoDetalle,
        handleDesembolsar, handleRefresh,
        isPagoModalOpen, setIsPagoModalOpen, cuotaSeleccionada, openPagoModal, handleConfirmarPago,
        isAbrirModalOpen, setIsAbrirModalOpen,
        isCerrarModalOpen, setIsCerrarModalOpen,
        handleAbrirSesion, handleCerrarSesion,
        isPdfModalOpen, setIsPdfModalOpen, pdfTitle, pdfBase64
    };
};