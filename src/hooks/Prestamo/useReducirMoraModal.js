import { useEffect, useState } from 'react';
import { reducirMora } from 'services/prestamoService';

const PORCENTAJES_RAPIDOS = [10, 25, 50, 75, 100];

export function useReducirMoraModal({ onSuccess, isOpen }) {
    const [loading, setLoading]   = useState(false);
    const [alert, setAlert]       = useState(null);
    const [monto, setMonto]       = useState('');
    const [motivo, setMotivo]     = useState('');
    const [preview, setPreview]   = useState(null);

    useEffect(() => {
        if (isOpen) {
            setMonto('');
            setMotivo('');
            setPreview(null);
            setAlert(null);
        }
    }, [isOpen]);

    const calcularPreview = (saldoPendiente, montoStr) => {
        const m = parseFloat(montoStr);
        if (!saldoPendiente || isNaN(m) || m <= 0) {
            setPreview(null);
            return;
        }
        const reduccion = Math.min(Math.round(m * 100) / 100, saldoPendiente);
        const restante   = Math.round((saldoPendiente - reduccion) * 100) / 100;
        setPreview({ saldoPendiente, reduccion, restante });
    };

    // Permite números con hasta 2 decimales (S/ 17.10, etc.)
    const handleMontoChange = (val, saldoPendiente) => {
        const sanitized = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        const parts = sanitized.split('.');
        const limitado = parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : sanitized;

        setMonto(limitado);
        calcularPreview(saldoPendiente, limitado);
    };

    // Botones rápidos: % sobre el SALDO PENDIENTE REAL, no sobre el bruto
    const handlePorcentajeRapido = (pct, saldoPendiente) => {
        const m = Math.min(Math.round(saldoPendiente * (pct / 100) * 100) / 100, saldoPendiente);
        const montoStr = m.toFixed(2);
        setMonto(montoStr);
        calcularPreview(saldoPendiente, montoStr);
    };

    // cuotaDetalleId: opcional — si viene, el backend reduce SOLO la mora
    // de ese integrante (dentro de un préstamo grupal). Si es null/undefined,
    // mantiene el comportamiento original (cuota completa).
    const handleSubmit = async (cuotaId, saldoPendiente, cuotaDetalleId = null) => {
        const m = parseFloat(monto);
        if (!monto || isNaN(m) || m <= 0) {
            setAlert({ type: 'error', message: 'Ingresa un monto válido mayor a 0.' });
            return;
        }
        if (m > saldoPendiente) {
            setAlert({ type: 'error', message: `El monto no puede ser mayor al saldo pendiente (S/ ${saldoPendiente.toFixed(2)}).` });
            return;
        }

        setLoading(true);
        setAlert(null);
        try {
            const payload = { cuota_id: cuotaId, monto: m, motivo };
            if (cuotaDetalleId) payload.cuota_detalle_id = cuotaDetalleId;

            const res = await reducirMora(payload);
            const result = res.data ?? res;
            setAlert({
                type: 'success',
                message: `Mora reducida en S/ ${m.toFixed(2)}. Antes: S/ ${result.saldo_anterior?.toFixed(2)} → Ahora: S/ ${result.saldo_nuevo?.toFixed(2)}`,
            });
            setMonto('');
            setMotivo('');
            setPreview(null);
            if (onSuccess) onSuccess(result);
        } catch (e) {
            setAlert({ type: 'error', message: e.message ?? 'Error al reducir mora.' });
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