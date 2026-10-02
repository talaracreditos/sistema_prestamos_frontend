import { useEffect, useState } from 'react';
import { adjudicar } from 'services/prestamoService';

export function useAdjudicarModal({ onSuccess, isOpen }) {
    const [loading, setLoading]             = useState(false);
    const [alert, setAlert]                 = useState(null);
    const [observaciones, setObservaciones] = useState('');

    useEffect(() => {
        if (isOpen) {
            setObservaciones('');
            setAlert(null);
        }
    }, [isOpen]);

    const handleSubmit = async (prestamoId) => {
        setLoading(true);
        setAlert(null);
        try {
            const res = await adjudicar(prestamoId, observaciones ? { observaciones } : {});
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
        setAlert(null);
    };

    return { loading, alert, observaciones, setObservaciones, handleSubmit, reset };
}