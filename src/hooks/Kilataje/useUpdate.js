import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/kilatajeService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        precio_gramo: ''
    });

    useEffect(() => {
        const loadKilataje = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
                setFormData({
                    nombre: data.nombre || '',
                    precio_gramo: data.precio_gramo || ''
                });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la información del kilataje.'));
            } finally {
                setLoading(false);
            }
        };
        if (id) loadKilataje();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.precio_gramo) {
            return setAlert({ type: 'error', message: 'El kilataje y el precio por gramo son obligatorios.' });
        }

        setSaving(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Kilataje actualizado correctamente.' });
            setTimeout(() => navigate('/kilataje/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setSaving(false);
        }
    };

    return { formData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate };
};