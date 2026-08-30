import { useState, useEffect, useCallback } from 'react';
import { getMiSesion, abrirCaja, cerrarCaja } from 'services/cajaChicaSesionService';
import { store as storeMovimiento } from 'services/cajaChicaMovimientoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const [loading, setLoading] = useState(true);
    const [sesionActiva, setSesionActiva] = useState(undefined);
    const [alert, setAlert] = useState(null);

    const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
    const [isCerrarModalOpen, setIsCerrarModalOpen] = useState(false);

    const initialForm = {
        fecha: new Date().toISOString().slice(0, 10),
        tipo: 'egreso',
        caja_chica_gasto_id: '',
        concepto: '',
        medio_pago: 'efectivo',
        monto: '',
        numero_operacion: '',
    };
    const [formData, setFormData] = useState(initialForm);

    const verifySesion = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMiSesion();
            setSesionActiva(res?.data?.id ? res.data : null);
        } catch (err) {
            setSesionActiva(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { verifySesion(); }, [verifySesion]);

    const handleAbrirSesion = async (data) => {
        setLoading(true);
        try {
            await abrirCaja(data);
            setAlert({ type: 'success', message: '¡Caja chica aperturada exitosamente!' });
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
            setAlert({ type: 'success', message: 'Caja chica cerrada correctamente.' });
            setIsCerrarModalOpen(false);
            verifySesion();
        } catch (err) {
            setAlert(handleApiError(err));
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await storeMovimiento(formData);
            setAlert({ type: 'success', message: 'Movimiento registrado correctamente.' });
            setFormData(initialForm);
            verifySesion();
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return {
        loading, sesionActiva, alert, setAlert,
        isAbrirModalOpen, setIsAbrirModalOpen,
        isCerrarModalOpen, setIsCerrarModalOpen,
        handleAbrirSesion, handleCerrarSesion,
        formData, handleChange, handleSubmit,
        verifySesion,
    };
};