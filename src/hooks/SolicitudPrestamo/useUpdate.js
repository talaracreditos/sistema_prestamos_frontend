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
                    seguro:             data.seguro || '',
                    seguro_financiado:  !!data.seguro_financiado,
                    asesor_id:          data.asesor_id     || '',
                    asesor_nombre:      data.asesor_nombre  || '',
                    prestamo_origen_id: data.prestamo_origen_id || '',
                    // ── Fecha de inicio personalizada ──
                    fecha_inicio_personalizada: data.fecha_inicio_personalizada || '',
                    usar_fecha_personalizada:   !!data.fecha_inicio_personalizada,
                    integrantes: data.integrantes.map(i => ({
                        id:                  i.id,
                        nombre:              i.nombre_completo,
                        monto:               i.monto,
                        modalidad:           i.modalidad,
                        cargo:               i.cargo || 'INTEGRANTE',
                        puede_excluirse:     i.puede_excluirse ?? true,
                        saldo_pendiente:     i.saldo_pendiente ?? 0,
                        // tasa individual guardada en BD (null = usa global)
                        tasa_interes:        i.tasa_interes ?? null,
                        usa_tasa_individual: i.tasa_interes != null,
                    })),
                });
            } catch (err) {
                setAlert(handleApiError(err));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // ── Derivados ─────────────────────────────────────────────────────────────
    const esRenovacionActiva = !!formData?.prestamo_origen_id;

    // ── handleChange ─────────────────────────────────────────────────────────
    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [obj, key] = field.split('.');
            setFormData(prev => ({ ...prev, [obj]: { ...prev[obj], [key]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    // ── Monto grupal = suma integrantes ───────────────────────────────────────
    useEffect(() => {
        if (formData?.es_grupal) {
            const total = formData.integrantes.reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
            if (total !== parseFloat(formData.monto_solicitado))
                setFormData(prev => ({ ...prev, monto_solicitado: total }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.integrantes, formData?.es_grupal]);

    // ── Integrantes ───────────────────────────────────────────────────────────
    const addIntegrante = (cliente) => {
        if (!cliente || formData.integrantes.find(i => i.id === cliente.usuario_id)) return;
        setFormData(prev => {
            const hasPresidente = prev.integrantes.some(i => i.cargo === 'PRESIDENTE');
            return {
                ...prev,
                integrantes: [...prev.integrantes, {
                    id:                  cliente.usuario_id,
                    nombre:              cliente.nombre_completo,
                    modalidad:           cliente.modalidad_cliente,
                    monto:               '',
                    cargo:               hasPresidente ? 'INTEGRANTE' : 'PRESIDENTE',
                    puede_excluirse:     true,
                    saldo_pendiente:     0,
                    tasa_interes:        null,
                    usa_tasa_individual: false,
                }],
            };
        });
    };

    const removeIntegrante = (id) => {
        if (esRenovacionActiva) {
            const int = formData.integrantes.find(i => i.id === id);
            if (int && !int.puede_excluirse) return;
        }
        setFormData(prev => ({ ...prev, integrantes: prev.integrantes.filter(i => i.id !== id) }));
    };

    const updateMontoIntegrante = (id, monto) =>
        setFormData(prev => ({ ...prev, integrantes: prev.integrantes.map(i => i.id === id ? { ...i, monto } : i) }));

    const updateCargoIntegrante = (id, cargo) =>
        setFormData(prev => ({ ...prev, integrantes: prev.integrantes.map(i => i.id === id ? { ...i, cargo } : i) }));

    const toggleTasaIndividual = (id, activo) => {
        setFormData(prev => ({
            ...prev,
            integrantes: prev.integrantes.map(i =>
                i.id === id
                    ? { ...i, usa_tasa_individual: activo, tasa_interes: activo ? (i.tasa_interes ?? '') : null }
                    : i
            ),
        }));
    };

    const updateTasaIntegrante = (id, tasa) => {
        setFormData(prev => ({
            ...prev,
            integrantes: prev.integrantes.map(i =>
                i.id === id ? { ...i, tasa_interes: tasa } : i
            ),
        }));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e, isBlocked) => {
        e.preventDefault();
        if (isBlocked) return;
        if (!formData.asesor_id) {
            setAlert({ type: 'error', message: 'Debes seleccionar un asesor.' });
            return;
        }

        setSaving(true);
        try {
            const payload = { ...formData };
            delete payload.asesor_nombre;
            delete payload.fechaVencimientoDni;
            delete payload.dni_status;

            payload.seguro = payload.seguro || 0;

            // ── Fecha de inicio personalizada ──
            if (!payload.usar_fecha_personalizada) {
                payload.fecha_inicio_personalizada = null;
            }
            delete payload.usar_fecha_personalizada;

            if (payload.prestamo_origen_id) {
                payload.modalidad = 'RSS';
            } else if (payload.es_grupal) {
                payload.modalidad = 'GRUPAL';
            } else if (payload.modalidad?.includes('VIGENTE') || payload.modalidad?.includes('RCS')) {
                payload.modalidad = 'RCS';
            } else if (payload.modalidad?.includes('RSS')) {
                payload.modalidad = 'RSS';
            } else {
                payload.modalidad = 'NUEVO';
            }

            // Limpiar campos UI de integrantes
            if (payload.es_grupal && Array.isArray(payload.integrantes)) {
                payload.integrantes = payload.integrantes.map(i => ({
                    id:           i.id,
                    monto:        i.monto,
                    cargo:        i.cargo,
                    tasa_interes: i.usa_tasa_individual ? (parseFloat(i.tasa_interes) || null) : null,
                }));
            }

            await update(id, payload);
            setAlert({ type: 'success', message: 'Solicitud actualizada.' });
            setTimeout(() => navigate('/solicitudPrestamo/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setSaving(false);
        }
    };

    return {
        formData, loading, saving, alert, setAlert,
        handleChange, handleSubmit,
        navigate,
        esRenovacionActiva,
        addIntegrante, removeIntegrante,
        updateMontoIntegrante, updateCargoIntegrante,
        toggleTasaIndividual, updateTasaIntegrante,
    };
};