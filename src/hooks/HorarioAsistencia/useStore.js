import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/horarioAsistenciaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert,   setAlert]   = useState(null);
    const [formData, setFormData] = useState({
        nombre:      '',
        hora_inicio: '',
        hora_fin:    '',
        turno:       'unico',
        dias:        [],
        activo:      true,
        roles:       [],
    });

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Horario de asistencia registrado correctamente.' });
            setTimeout(() => navigate('/horario-asistencia/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, alert, setAlert, handleChange, handleSubmit };
};