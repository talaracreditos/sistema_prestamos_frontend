// hooks/CajaChicaGasto/useUpdate.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/cajaChicaGastoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

    useEffect(() => {
        const loadGasto = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
                setFormData({
                    nombre: data.nombre || '',
                    descripcion: data.descripcion || ''
                });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar el gasto.'));
            } finally {
                setLoading(false);
            }
        };
        if (id) loadGasto();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Gasto actualizado con éxito.' });
            setTimeout(() => navigate('/caja-chica-gasto/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar el gasto'));
        } finally {
            setSaving(false);
        }
    };

    return { formData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate };
};