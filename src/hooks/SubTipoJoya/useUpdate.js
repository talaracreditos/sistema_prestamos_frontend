import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/subtipoJoyaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({ descripcion: '' });

    useEffect(() => {
        const loadSubtipoJoya = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
                setFormData({ descripcion: data.descripcion || '' });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la información del subtipo de joya.'));
            } finally {
                setLoading(false);
            }
        };
        if (id) loadSubtipoJoya();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.descripcion.trim()) {
            return setAlert({ type: 'error', message: 'La descripción es obligatoria.' });
        }

        setSaving(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Subtipo de joya actualizado correctamente.' });
            setTimeout(() => navigate('/subtipo-joya/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setSaving(false);
        }
    };

    return { formData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate };
};