import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/ciiuService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id }   = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [alert,   setAlert]   = useState(null);
    const [formData, setFormData] = useState({
        codigo: '', descripcion: '', seccion: '', division: '', grupo: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res  = await show(id);
                const data = res.data || res;
                setFormData({
                    codigo:      data.codigo      || '',
                    descripcion: data.descripcion || '',
                    seccion:     data.seccion     || '',
                    division:    data.division    || '',
                    grupo:       data.grupo       || '',
                });
            } catch (err) { setAlert(handleApiError(err)); }
            finally { setLoading(false); }
        };
        if (id) load();
    }, [id]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'CIIU actualizado correctamente.' });
            setTimeout(() => navigate('/ciiu/listar'), 1500);
        } catch (err) { setAlert(handleApiError(err)); }
        finally { setSaving(false); }
    };

    return { formData, loading, saving, alert, setAlert, handleChange, handleSubmit };
};