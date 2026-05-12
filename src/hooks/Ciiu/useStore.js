import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/ciiuService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const navigate  = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert,   setAlert]   = useState(null);
    const [formData, setFormData] = useState({
        codigo: '', descripcion: '', seccion: '', division: '', grupo: '',
    });

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        setLoading(true);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'CIIU registrado exitosamente. Redirigiendo...' });
            setTimeout(() => navigate('/ciiu/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally { setLoading(false); }
    };

    return { formData, loading, alert, setAlert, handleChange, handleSubmit };
};