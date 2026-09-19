import { useEffect, useState } from 'react';
import { reducirInteres } from 'services/prestamoService';

const PORCENTAJES_RAPIDOS = [10, 25, 50, 75, 100];

export function useReducirInteresModal({ onSuccess, isOpen }) {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert]     = useState(null);
    const [monto, setMonto]     = useState('');
    const [motivo, setMotivo]   = useState('');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setMonto('');
            setMotivo('');
            setPreview(null);
            setAlert(null);
        }
    }, [isOpen]);

    const calcularPreview = (interesPendiente, montoStr) => {
        const m = parseFloat(montoStr);
        if (!interesPendiente || isNaN(m) || m <= 0) {
            setPreview(null);
            return;
        }
        const reduccion = Math.min(Math.round(m * 100) / 100, interesPendiente);
        const restante  = Math.round((interesPendiente - reduccion) * 100) / 100;
        setPreview({ interesPendiente, reduccion, restante });
    };

    const handleMontoChange = (val, interesPendiente) => {
        const sanitized = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        const parts = sanitized.split('.');
        const limitado = parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : sanitized;

        setMonto(limitado);
        calcularPreview(interesPendiente, limitado);
    };

    const handlePorcentajeRapido = (pct, interesPendiente) => {
        const m = Math.min(Math.round(interesPendiente * (pct / 100) * 100) / 100, interesPendiente);
        const montoStr = m.toFixed(2);
        setMonto(montoStr);
        calcularPreview(interesPendiente, montoStr);
    };

    const handleSubmit = async (cuotaId, interesPendiente, cuotaDetalleId = null) => {
        const m = parseFloat(monto);
        if (!monto || isNaN(m) || m <= 0) {
            setAlert({ type: 'error', message: 'Ingresa un monto válido mayor a 0.' });
            return;
        }
        if (m > interesPendiente) {
            setAlert({ type: 'error', message: `El monto no puede ser mayor al interés pendiente (S/ ${interesPendiente.toFixed(2)}).` });
            return;
        }

        setLoading(true);
        setAlert(null);
        try {
            const payload = { cuota_id: cuotaId, monto: m, motivo };
            if (cuotaDetalleId) payload.cuota_detalle_id = cuotaDetalleId;

            const res = await reducirInteres(payload);
            const result = res.data ?? res;
            setAlert({
                type: 'success',
                message: `Interés reducido en S/ ${m.toFixed(2)}. Antes: S/ ${result.interes_anterior?.toFixed(2)} → Ahora: S/ ${result.interes_nuevo?.toFixed(2)}`,
            });
            setMonto('');
            setMotivo('');
            setPreview(null);
            if (onSuccess) onSuccess(result);
        } catch (e) {
            setAlert({ type: 'error', message: e.message ?? 'Error al reducir interés.' });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMonto('');
        setMotivo('');
        setPreview(null);
        setAlert(null);
    };

    return {
        loading, alert, monto, motivo, preview, PORCENTAJES_RAPIDOS,
        setMotivo, handleMontoChange, handlePorcentajeRapido, handleSubmit, reset,
    };
}