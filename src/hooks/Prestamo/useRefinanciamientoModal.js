import { useState, useEffect, useMemo } from 'react';
import { refinanciar } from 'services/prestamoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useRefinanciamientoModal = ({ isOpen, data, integrantesGrupo, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        producto_id:         '',
        tasa_interes:        '',
        cuotas_solicitadas:  '',
        frecuencia:          'SEMANAL',
        codigo_recaudo:      '',
        incluir_mora:        true,
        mora_incluida:       '',
        observaciones:       '',
        tiene_seguro:        false,
        seguro:              '',
        seguro_financiado:   true,
        nuevo_presidente_id: '',
    });

    const moraDisponible = data?.mora || 0;

    const esPresidenteRefinanciado = useMemo(() => {
        if (!integrantesGrupo || !data?.cliente_id) return false;
        const integranteTarget = integrantesGrupo.find(int => int.id === data.cliente_id);
        return integranteTarget?.cargo === 'PRESIDENTE';
    }, [integrantesGrupo, data?.cliente_id]);

    const integrantesRestantes = useMemo(() => {
        if (!integrantesGrupo || !data?.cliente_id) return [];
        return integrantesGrupo.filter(int => int.id !== data.cliente_id);
    }, [integrantesGrupo, data?.cliente_id]);

    useEffect(() => {
        if (isOpen && data) {
            let presiInicial = '';
            if (esPresidenteRefinanciado && integrantesRestantes.length > 0) {
                presiInicial = integrantesRestantes[0].id;
            }
            setFormData({
                producto_id:         '',
                tasa_interes:        '',
                cuotas_solicitadas:  '',
                frecuencia:          'SEMANAL',
                codigo_recaudo:      '',
                incluir_mora:        true,
                // Por defecto, si hay mora, se precarga completa — el usuario
                // puede reducirla (o subirla, se recorta al real en backend).
                mora_incluida:       (data.mora || 0) > 0 ? data.mora.toFixed(2) : '',
                observaciones:       '',
                tiene_seguro:        false,
                seguro:              '',
                seguro_financiado:   true,
                nuevo_presidente_id: presiInicial,
            });
            setAlert(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, data?.prestamo_id, data?.cliente_id, integrantesRestantes, esPresidenteRefinanciado]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'incluir_mora') {
            setFormData(prev => ({
                ...prev,
                incluir_mora: checked,
                // Al desmarcar, limpiamos el monto; al marcar, precargamos la mora completa.
                mora_incluida: checked ? (moraDisponible > 0 ? moraDisponible.toFixed(2) : '') : '',
            }));
            return;
        }

        if (name === 'mora_incluida') {
            // Sanitiza numérico y limita al tope real de mora disponible.
            let sanitized = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
            const num = parseFloat(sanitized);
            if (!isNaN(num) && num > moraDisponible) {
                sanitized = moraDisponible.toFixed(2);
            }
            setFormData(prev => ({ ...prev, mora_incluida: sanitized }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        setLoading(true);
        try {
            await refinanciar({
                ...formData,
                mora_incluida:             formData.incluir_mora ? parseFloat(formData.mora_incluida || 0) : 0,
                seguro:                    formData.tiene_seguro ? parseFloat(formData.seguro || 0) : 0,
                seguro_financiado:         formData.tiene_seguro ? formData.seguro_financiado : false,
                prestamo_refinanciado_id:  data.prestamo_id,
                cliente_refinanciado_id:   data.cliente_id,
            });
            onSuccess();
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    // ── Cálculos financieros ────────────────────────────────────────────────
    const moraIncluidaNum = formData.incluir_mora ? Math.min(parseFloat(formData.mora_incluida || 0), moraDisponible) : 0;
    const moraCondonada   = Math.max(0, moraDisponible - moraIncluidaNum);

    const montoBase   = (data?.deuda || 0) + moraIncluidaNum;
    const excedente   = data?.excedente || 0;
    const seguroValor = formData.tiene_seguro ? parseFloat(formData.seguro || 0) : 0;
    const montoCalc   = (formData.tiene_seguro && formData.seguro_financiado)
        ? Math.max(0, montoBase - excedente) + seguroValor
        : Math.max(0, montoBase - excedente);

    const submitDisabled = loading
        || !formData.producto_id
        || !formData.cuotas_solicitadas
        || !formData.tasa_interes
        || !formData.codigo_recaudo?.trim()
        || (formData.tiene_seguro && (!formData.seguro || parseFloat(formData.seguro) <= 0))
        || (formData.incluir_mora && (!formData.mora_incluida || parseFloat(formData.mora_incluida) <= 0));

    return {
        formData, setFormData,
        loading, alert, setAlert,
        integrantesRestantes, esPresidenteRefinanciado,
        handleChange, handleSubmit,
        montoBase, montoCalc,
        moraDisponible, moraIncluidaNum, moraCondonada,
        submitDisabled,
    };
};