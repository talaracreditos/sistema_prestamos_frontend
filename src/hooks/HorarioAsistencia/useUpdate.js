import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/horarioAsistenciaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [alert,    setAlert]    = useState(null);
    const [formData, setFormData] = useState({
        nombre: '', hora_inicio: '', hora_fin: '', turno: 'unico',
        dias: [], activo: true, roles: [],
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res  = await show(id);
                const data = res.data || res;
                setFormData({
                    nombre:      data.nombre,
                    hora_inicio: (data.hora_inicio ?? '').slice(0, 5),
                    hora_fin:    (data.hora_fin ?? '').slice(0, 5),
                    turno:       data.turno ?? 'unico',
                    dias:        data.dias ?? [],
                    activo:      data.activo,
                    roles:       (data.roles ?? []).map(r => r.id),
                    _rolesObj:   data.roles ?? [],
                });
            } catch (err) {
                setAlert(handleApiError(err));
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Horario de asistencia actualizado correctamente.' });
            setTimeout(() => navigate('/horario-asistencia/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setSaving(false);
        }
    };

    return { formData, loading, saving, alert, setAlert, handleChange, handleSubmit };
};