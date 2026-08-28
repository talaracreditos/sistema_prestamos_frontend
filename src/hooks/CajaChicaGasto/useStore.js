// hooks/CajaChicaGasto/useStore.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/cajaChicaGastoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Gasto registrado exitosamente.' });
            setTimeout(() => navigate('/caja-chica-gasto/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al registrar el gasto'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, alert, setAlert, handleChange, handleSubmit };
};