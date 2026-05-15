import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/solicitudPrestamoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [alert, setAlert]       = useState(null);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res  = await show(id);
                const data = res.data || res;
                setFormData({
                    ...data,
                    seguro:           data.seguro || '',
                    seguro_financiado: !!data.seguro_financiado,
                    asesor_id:        data.asesor_id || '',
                    asesor_nombre:    data.asesor_nombre || '',
                    integrantes:      data.integrantes.map(i => ({ 
                        id:       i.id, 
                        nombre:   i.nombre_completo, 
                        monto:    i.monto,
                        modalidad: i.modalidad,
                        cargo:    i.cargo || 'INTEGRANTE'
                    }))
                });
            } catch (err) { setAlert(handleApiError(err)); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const isMainBlocked = formData?.dni_status?.estado === 'VENCIDO' || 
        (formData?.es_grupal && (formData?.modalidad?.includes('GRUPAL') && (formData?.modalidad?.includes('VIGENTE') || formData?.modalidad?.includes('RCS'))));

    const hasBlockedIntegrante = formData?.es_grupal && (formData?.integrantes || []).some(i => 
        i.dni_status?.estado === 'VENCIDO' || 
        (i.modalidad?.includes('GRUPAL') && (i.modalidad?.includes('VIGENTE') || i.modalidad?.includes('RCS')))
    );

    const isBlocked = isMainBlocked || hasBlockedIntegrante;

    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [obj, key] = field.split('.');
            setFormData(prev => ({ ...prev, [obj]: { ...prev[obj], [key]: value } }));
        } else { 
            setFormData(prev => ({ ...prev, [field]: value })); 
        }
    };

    useEffect(() => {
        if (formData?.es_grupal) {
            const total = formData.integrantes.reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
            if (total !== formData.monto_solicitado)
                setFormData(prev => ({ ...prev, monto_solicitado: total }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.integrantes, formData?.es_grupal]);

    const addIntegrante = (cliente) => {
        if (!cliente || formData.integrantes.find(i => i.id === cliente.usuario_id)) return;
        setFormData(prev => {
            const hasPresidente = prev.integrantes.some(i => i.cargo === 'PRESIDENTE');
            const cargo = !hasPresidente ? 'PRESIDENTE' : 'INTEGRANTE';
            return {
                ...prev,
                integrantes: [...prev.integrantes, { 
                    id:       cliente.usuario_id, 
                    nombre:   cliente.nombre_completo, 
                    modalidad: cliente.modalidad_cliente,
                    monto:    '',
                    cargo
                }]
            };
        });
    };

    const removeIntegrante      = (id) => setFormData(prev => ({ ...prev, integrantes: prev.integrantes.filter(i => i.id !== id) }));
    const updateMontoIntegrante = (id, monto) => setFormData(prev => ({ ...prev, integrantes: prev.integrantes.map(i => i.id === id ? { ...i, monto } : i) }));
    const updateCargoIntegrante = (id, cargo) => setFormData(prev => ({ ...prev, integrantes: prev.integrantes.map(i => i.id === id ? { ...i, cargo } : i) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBlocked) return;
        if (!formData.asesor_id) {
            setAlert({ type: 'error', message: 'Debes seleccionar un asesor.' });
            return;
        }
        setSaving(true);
        try {
            const payload = { ...formData };
            // Campos solo UI
            delete payload.asesor_nombre;
            delete payload.fechaVencimientoDni;
            delete payload.dni_status;

            payload.seguro = payload.seguro || 0;

            if (payload.es_grupal) {
                payload.modalidad = 'GRUPAL';
            } else {
                if (payload.modalidad?.includes('VIGENTE') || payload.modalidad?.includes('RCS')) {
                    payload.modalidad = 'RCS'; 
                } else if (payload.modalidad?.includes('RSS')) {
                    payload.modalidad = 'RSS';
                } else {
                    payload.modalidad = 'NUEVO';
                }
            }

            await update(id, payload);
            setAlert({ type: 'success', message: 'Solicitud actualizada.' });
            setTimeout(() => navigate('/solicitudPrestamo/listar'), 1500);
        } catch (err) { setAlert(handleApiError(err)); }
        finally { setSaving(false); }
    };

    return { 
        formData, loading, saving, alert, setAlert, handleChange, handleSubmit, 
        navigate, addIntegrante, removeIntegrante, updateMontoIntegrante, 
        updateCargoIntegrante, isBlocked 
    };
};