import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/kilatajeService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        precio_gramo: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.precio_gramo) {
            return setAlert({ type: 'error', message: 'Ingresa el kilataje y su precio por gramo.' });
        }

        setAlert(null);
        setLoading(true);

        try {
            await store(formData);
            setAlert({
                type: 'success',
                message: 'El kilataje ha sido registrado exitosamente. Redirigiendo...'
            });

            setTimeout(() => {
                navigate('/kilataje/listar');
            }, 1500);

        } catch (err) {
            setAlert(handleApiError(err, 'Error al intentar registrar el kilataje.'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, alert, setAlert, handleChange, handleSubmit };
};