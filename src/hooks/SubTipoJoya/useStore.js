import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/subtipoJoyaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({ descripcion: '' });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.descripcion.trim()) {
            return setAlert({ type: 'error', message: 'La descripción del subtipo de joya es obligatoria.' });
        }

        setAlert(null);
        setLoading(true);

        try {
            await store(formData);
            setAlert({ type: 'success', message: 'El subtipo de joya ha sido registrado exitosamente. Redirigiendo...' });
            setTimeout(() => navigate('/subtipo-joya/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al intentar registrar el subtipo de joya.'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, alert, setAlert, handleChange, handleSubmit };
};