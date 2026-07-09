import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/solicitudPrestamoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert,   setAlert]   = useState(null);

    // ── Estado renovación ─────────────────────────────────────────────────────
    const [esRenovacion,   setEsRenovacion]   = useState(false);
    const [prestamoOrigen, setPrestamoOrigen] = useState(null);
    const [comboKey,       setComboKey]       = useState(Date.now());

    const [formData, setFormData] = useState({
        es_grupal:          false,
        cliente_id:         '',
        cliente_nombre:     '',
        fechaVencimientoDni:'',
        dni_status:         null,
        grupo_id:           '',
        integrantes:        [],
        asesor_id:          '',
        asesor_nombre:      '',
        producto_id:        '',
        producto_nombre:    '',
        grupo_nombre:       '',
        monto_solicitado:   0,
        tasa_interes:       '',
        cuotas_solicitadas: '',
        frecuencia:         'SEMANAL',
        seguro:             '',
        seguro_financiado:  false,
        modalidad:          '',
        observaciones:      '',
        aval:               null,
        prestamo_origen_id: '',
        // ── Fecha de inicio personalizada ──
        usar_fecha_personalizada:   false,
        fecha_inicio_personalizada: '',
    });

    const esRenovacionActiva = !!formData.prestamo_origen_id;

    // ── handleChange ─────────────────────────────────────────────────────────
    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [obj, key] = field.split('.');
            setFormData(prev => ({ ...prev, [obj]: { ...prev[obj], [key]: value } }));
        } else {
            setFormData(prev => {
                const newData = { ...prev, [field]: value };
                if (field === 'es_grupal') {
                    if (value === true) {
                        newData.modalidad           = 'GRUPAL';
                        newData.cliente_id          = '';
                        newData.cliente_nombre      = '';
                        newData.fechaVencimientoDni = '';
                        newData.dni_status          = null;
                    } else {
                        newData.modalidad   = '';
                        newData.grupo_id    = '';
                        newData.integrantes = [];
                    }
                }
                return newData;
            });
        }
    };

    // ── Monto grupal = suma integrantes ───────────────────────────────────────
    useEffect(() => {
        if (formData.es_grupal) {
            const total = formData.integrantes.reduce((acc, i) => acc + parseFloat(i.monto || 0), 0);
            setFormData(prev => ({ ...prev, monto_solicitado: total }));
        }
    }, [formData.integrantes, formData.es_grupal]);

    // ── Integrantes ───────────────────────────────────────────────────────────
    const addIntegrante = (cliente) => {
        const id = cliente?.usuario_id ?? cliente?.id;
        if (!id || formData.integrantes.find(i => i.id === id)) return;
        setFormData(prev => {
            const cargo = cliente.cargo ?? (prev.integrantes.length === 0 ? 'PRESIDENTE' : 'INTEGRANTE');
            return {
                ...prev,
                integrantes: [...prev.integrantes, {
                    id,
                    nombre:              cliente.nombre_completo ?? cliente.nombre ?? '',
                    modalidad:           cliente.modalidad_cliente ?? cliente.modalidad ?? '',
                    monto:               parseFloat(cliente.monto || 0),
                    cargo,
                    fechaVencimientoDni: cliente.fechaVencimientoDni ?? null,
                    dni_status:          cliente.dni_status ?? null,
                    puede_excluirse:     cliente.puede_excluirse ?? true,
                    saldo_pendiente:     cliente.saldo_pendiente ?? 0,
                    // tasa individual: null = usa la tasa global
                    tasa_interes:        null,
                    usa_tasa_individual: false,
                }],
            };
        });
    };

    const removeIntegrante      = (id) => setFormData(prev => ({ ...prev, integrantes: prev.integrantes.filter(i => i.id !== id) }));
    const updateMontoIntegrante = (id, monto) => setFormData(prev => ({ ...prev, integrantes: prev.integrantes.map(i => i.id === id ? { ...i, monto } : i) }));
    const updateCargoIntegrante = (id, cargo) => setFormData(prev => ({ ...prev, integrantes: prev.integrantes.map(i => i.id === id ? { ...i, cargo } : i) }));

    /**
     * Activa/desactiva la tasa individual de un integrante.
     * Al desactivar, limpia la tasa para que use la global.
     */
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

    const handleRemoveIntegrante = (id) => {
        if (esRenovacionActiva) {
            const int = formData.integrantes.find(i => i.id === id);
            if (int && !int.puede_excluirse) return;
        }
        removeIntegrante(id);
    };

    // ── Lógica renovación ─────────────────────────────────────────────────────
    const resetRenovacion = () => {
        setPrestamoOrigen(null);
        setComboKey(Date.now());
        setFormData(prev => ({
            ...prev,
            prestamo_origen_id: '',
            modalidad:          '',
            es_grupal:          false,
            grupo_id:           '',
            grupo_nombre:       '',
            cliente_id:         '',
            cliente_nombre:     '',
            integrantes:        [],
            producto_id:        '',
            producto_nombre:    '',
            asesor_id:          '',
            asesor_nombre:      '',
        }));
    };

    const handleToggleRenovacion = (checked) => {
        setEsRenovacion(checked);
        if (!checked) resetRenovacion();
    };

    const handleSelectPrestamoOrigen = (prestamo) => {
        if (!prestamo) { setPrestamoOrigen(null); handleChange('prestamo_origen_id', ''); return; }

        setPrestamoOrigen(prestamo);

        const updates = {
            prestamo_origen_id: prestamo.id,
            modalidad:          'RSS',
            asesor_id:          prestamo.asesor_id       ?? '',
            asesor_nombre:      prestamo.asesor_nombre   ?? '',
            producto_id:        prestamo.producto_id     ?? '',
            producto_nombre:    prestamo.producto_nombre ?? '',
        };

        if (prestamo.es_grupal) {
            updates.es_grupal    = true;
            updates.grupo_id     = prestamo.grupo_id     ?? '';
            updates.grupo_nombre = prestamo.grupo_nombre ?? '';
            updates.cliente_id   = '';
            updates.cliente_nombre = '';
            updates.integrantes  = [];
        } else {
            updates.es_grupal           = false;
            updates.cliente_id          = prestamo.cliente_id ?? '';
            updates.cliente_nombre      = prestamo.cliente    ?? '';
            updates.grupo_id            = '';
            updates.integrantes         = [];
            updates.modalidad           = prestamo.modalidad_cliente ?? 'RSS';
            updates.dni_status          = prestamo.dni_status ?? null;
            updates.fechaVencimientoDni = prestamo.dni_status?.fecha_texto ?? '';
        }

        setFormData(prev => ({ ...prev, ...updates }));

        if (prestamo.es_grupal) {
            prestamo.integrantes?.forEach(int => addIntegrante({
                id:                  int.id,
                nombre:              int.nombre,
                modalidad:           int.modalidad ?? '',
                monto:               0,
                cargo:               int.cargo,
                dni_status:          int.dni_status ?? null,
                fechaVencimientoDni: int.fechaVencimientoDni ?? null,
                puede_excluirse:     int.puede_excluirse ?? false,
                saldo_pendiente:     int.saldo_pendiente ?? 0,
            }));
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e, isBlocked) => {
        e.preventDefault();
        if (isBlocked) {
            setAlert({ type: 'error', message: 'No se puede enviar la solicitud por restricciones de crédito o DNI.' });
            return;
        }
        if (!formData.asesor_id) {
            setAlert({ type: 'error', message: 'Debes seleccionar un asesor.' });
            return;
        }
        if (esRenovacion && !formData.prestamo_origen_id) {
            setAlert({ type: 'error', message: 'Debes seleccionar el préstamo a renovar.' });
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            delete payload.asesor_nombre;
            delete payload.cliente_nombre;
            delete payload.fechaVencimientoDni;
            delete payload.dni_status;
            delete payload.producto_nombre;
            delete payload.grupo_nombre;

            payload.seguro = payload.seguro || 0;
            if (!payload.prestamo_origen_id) delete payload.prestamo_origen_id;

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

            // Limpiar campos UI de integrantes antes de enviar
            if (payload.es_grupal && Array.isArray(payload.integrantes)) {
                payload.integrantes = payload.integrantes.map(i => ({
                    id:              i.id,
                    monto:           i.monto,
                    cargo:           i.cargo,
                    // null si usa tasa global; valor numérico si tiene tasa propia
                    tasa_interes:    i.usa_tasa_individual ? (parseFloat(i.tasa_interes) || null) : null,
                }));
            }

            await store(payload);
            setAlert({ type: 'success', message: 'Solicitud enviada con éxito.' });
            setTimeout(() => navigate('/solicitudPrestamo/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    return {
        formData, loading, alert, setAlert,
        handleChange, handleSubmit,
        addIntegrante, handleRemoveIntegrante,
        updateMontoIntegrante, updateCargoIntegrante,
        toggleTasaIndividual, updateTasaIntegrante,
        esRenovacion, prestamoOrigen, comboKey,
        handleToggleRenovacion,
        handleSelectPrestamoOrigen,
        handleLimpiarOrigen: resetRenovacion,
        esRenovacionActiva
    };
};