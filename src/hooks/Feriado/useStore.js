import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store, calendario } from 'services/feriadoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const navigate = useNavigate();
    const [loading,  setLoading]  = useState(false);
    const [alert,    setAlert]    = useState(null);
    const [feriados, setFeriados] = useState([]);
    const [formData, setFormData] = useState({ fecha: '', descripcion: '' });

    useEffect(() => {
        const load = async () => {
            try {
                // Antes usaba index() (paginado a 7) y por eso el calendario del
                // formulario solo marcaba los feriados de la primera página.
                // calendario() trae TODOS sin paginar, ya en formato Y-m-d.
                const res = await calendario();
                setFeriados(res.data || []);
            } catch (_) {}
        };
        load();
    }, []);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Feriado registrado correctamente.' });
            setTimeout(() => navigate('/feriados/index'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return { formData, feriados, loading, alert, setAlert, handleChange, handleSubmit };
};