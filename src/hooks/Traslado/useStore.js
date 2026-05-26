import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { prestamosPorAsesor, store } from 'services/trasladoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const filtrosVacios = {
    search: '', monto_min: '', monto_max: '',
    frecuencia: '', tipo: '',
    cuotas_pagadas_min: '', cuotas_pagadas_max: '',
};

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading]                   = useState(false);
    const [loadingPrestamos, setLoadingPrestamos] = useState(false);
    const [alert, setAlert]                       = useState(null);
    const [prestamos, setPrestamos]               = useState([]);
    const [selectedIds, setSelectedIds]           = useState([]);
    const [filtrosPrestamos, setFiltrosPrestamos] = useState(filtrosVacios);
    const [showPinModal, setShowPinModal]         = useState(false);

    const [formData, setFormData] = useState({
        asesor_origen_id:  null,
        asesor_destino_id: null,
        motivo:            '',
    });

    const cargarPrestamos = async (asesorId, filtros = filtrosVacios) => {
        setLoadingPrestamos(true);
        try {
            const data  = await prestamosPorAsesor(asesorId, filtros);
            const lista = Array.isArray(data) ? data : (data?.data ?? []);
            setPrestamos(lista);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoadingPrestamos(false);
        }
    };

    const handleSelectAsesorOrigen = async (asesor) => {
        setFormData(prev => ({ ...prev, asesor_origen_id: asesor?.id ?? null }));
        setSelectedIds([]);
        setPrestamos([]);
        setFiltrosPrestamos(filtrosVacios);
        if (!asesor) return;
        await cargarPrestamos(asesor.id);
    };

    const handleSelectAsesorDestino = (asesor) => {
        if (asesor && asesor.id === formData.asesor_origen_id) {
            setAlert({ type: 'error', message: 'El asesor de destino debe ser diferente al asesor origen.' });
            return;
        }
        setAlert(null);
        setFormData(prev => ({ ...prev, asesor_destino_id: asesor?.id ?? null }));
    };

    const handleFiltroChange = (name, val) =>
        setFiltrosPrestamos(prev => ({ ...prev, [name]: val }));

    const handleFiltroSubmit = () => {
        if (!formData.asesor_origen_id) return;
        setSelectedIds([]);
        cargarPrestamos(formData.asesor_origen_id, filtrosPrestamos);
    };

    const handleFiltroClear = () => {
        setFiltrosPrestamos(filtrosVacios);
        setSelectedIds([]);
        if (formData.asesor_origen_id) cargarPrestamos(formData.asesor_origen_id);
    };

    const handleTogglePrestamo = (id) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleToggleTodos = () =>
        setSelectedIds(selectedIds.length === prestamos.length ? [] : prestamos.map(p => p.id));

    const handleChange = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    // Validaciones previas — abre el modal PIN si todo ok
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedIds.length === 0)    return setAlert({ type: 'error', message: 'Selecciona al menos un préstamo.' });
        if (!formData.asesor_destino_id) return setAlert({ type: 'error', message: 'Selecciona un asesor de destino.' });
        if (formData.asesor_origen_id === formData.asesor_destino_id)
            return setAlert({ type: 'error', message: 'El asesor de destino debe ser diferente al origen.' });

        setAlert(null);
        setShowPinModal(true);
    };

    // Llamado desde el ConfirmModal con el PIN
    const handleConfirmConPin = async (pin) => {
        setShowPinModal(false);
        setLoading(true);
        try {
            await store({
                prestamo_ids:      selectedIds,
                asesor_destino_id: formData.asesor_destino_id,
                motivo:            formData.motivo,
                pin,
            });
            const n = selectedIds.length;
            setAlert({ type: 'success', message: `${n} préstamo${n > 1 ? 's' : ''} trasladado${n > 1 ? 's' : ''} correctamente.` });
            setTimeout(() => navigate('/traslado/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return {
        loading, loadingPrestamos, alert, setAlert,
        formData, prestamos, selectedIds,
        filtrosPrestamos, showPinModal, setShowPinModal,
        handleSelectAsesorOrigen, handleSelectAsesorDestino,
        handleTogglePrestamo, handleToggleTodos,
        handleFiltroChange, handleFiltroSubmit, handleFiltroClear,
        handleChange, handleSubmit, handleConfirmConPin,
    };
};