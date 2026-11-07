import { useEffect, useState, useMemo } from 'react';
import { adjudicar } from 'services/prestamoService';

export function useAdjudicarModal({ onSuccess, isOpen, liquidacion }) {
    const [loading, setLoading]             = useState(false);
    const [alert, setAlert]                 = useState(null);
    const [observaciones, setObservaciones] = useState('');
    const [cobrarInteres, setCobrarInteres] = useState(true);
    const [montoInteres, setMontoInteres]   = useState('');

    useEffect(() => {
        if (isOpen) {
            setObservaciones('');
            setCobrarInteres(true);
            // Precarga el input con el interés pendiente completo — el
            // operador lo deja así para cobrar todo, o lo rebaja a mano.
            setMontoInteres(liquidacion?.interes != null ? String(liquidacion.interes) : '');
            setAlert(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // ── Recalculo en vivo: mismo interés pendiente que ya trae la
    // liquidación del backend, ajustado según lo que se decida cobrar.
    // Reusa la misma tasa efectiva de IGV (igv ÷ cargos) que ya viene
    // calculada, para no inventar el % acá — misma fórmula que
    // CalculoAdjudicacionService::ajustarPorInteres en el backend.
    const calculo = useMemo(() => {
        const interesPendiente = parseFloat(liquidacion?.interes ?? 0);
        const mora       = parseFloat(liquidacion?.mora ?? 0);
        const seguro      = parseFloat(liquidacion?.seguro ?? 0);
        const custodia    = parseFloat(liquidacion?.custodia ?? 0);
        const capital     = parseFloat(liquidacion?.capital ?? 0);
        const credito     = parseFloat(liquidacion?.credito ?? 0);
        const penalidad   = parseFloat(liquidacion?.penalidad_pronto_pago ?? 0);
        const cargosOrig  = parseFloat(liquidacion?.cargos ?? 0);
        const igvOrig     = parseFloat(liquidacion?.igv ?? 0);
        const igvRate     = cargosOrig > 0 ? igvOrig / cargosOrig : 0;

        const interesAplicado = !cobrarInteres
            ? 0
            : Math.min(Math.max(0, parseFloat(montoInteres || 0)), interesPendiente);

        const interesCondonado = Math.max(0, interesPendiente - interesAplicado);

        const cargos = mora + seguro + custodia + interesAplicado;
        const igv = cargos * igvRate;
        const deudaAjustada = Math.max(0, cargos + igv + capital - credito + penalidad);

        // Se exponen por separado para el desglose visual del modal —
        // cada campo es exactamente el componente que lo forma, en el
        // mismo orden/fórmula que arma deudaAjustada.
        return {
            interesPendiente, interesAplicado, interesCondonado, deudaAjustada,
            mora, seguro, custodia, capital, credito, penalidad, igv,
        };
    }, [liquidacion, cobrarInteres, montoInteres]);

    const handleSubmit = async (prestamoId) => {
        setLoading(true);
        setAlert(null);
        try {
            const payload = {
                ...(observaciones ? { observaciones } : {}),
                cobrar_interes: cobrarInteres,
                monto_interes: cobrarInteres ? (parseFloat(montoInteres) || 0) : 0,
            };

            const res = await adjudicar(prestamoId, payload);
            const result = res.data ?? res;
            setAlert({
                type: 'success',
                message: result.tipo === 'total'
                    ? 'Garantía adjudicada. El préstamo quedó totalmente cancelado.'
                    : `Garantía adjudicada. Se cubrió S/ ${result.monto_aplicado?.toFixed(2)} de la deuda; queda un saldo pendiente de S/ ${result.saldo_restante?.toFixed(2)}.`,
            });
            if (onSuccess) onSuccess(result);
        } catch (e) {
            const backendData = e.response?.data ?? e.data ?? e;
            const rawDetails  = backendData?.details ?? e.details ?? null;

            setAlert({
                type: 'error',
                message: backendData?.message ?? e.message ?? 'Error al adjudicar la garantía.',
                details: rawDetails
                    ? (Array.isArray(rawDetails) ? rawDetails : [rawDetails])
                    : null,
            });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setObservaciones('');
        setCobrarInteres(true);
        setMontoInteres('');
        setAlert(null);
    };

    return {
        loading, alert, observaciones, setObservaciones,
        cobrarInteres, setCobrarInteres,
        montoInteres, setMontoInteres,
        calculo,
        handleSubmit, reset,
    };
}