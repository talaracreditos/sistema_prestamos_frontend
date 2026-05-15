import { useState } from 'react';
import { reducirMora } from 'services/prestamoService';

export function useReducirMoraModal({ onSuccess }) {
    const [loading, setLoading]   = useState(false);
    const [alert, setAlert]       = useState(null);
    const [porcentaje, setPorcentaje] = useState('');
    const [motivo, setMotivo]     = useState('');
    const [preview, setPreview]   = useState(null); // preview del cálculo

    const calcularPreview = (moraCargo, porc) => {
        const p = parseFloat(porc);
        if (!moraCargo || isNaN(p) || p < 1 || p > 100) {
            setPreview(null);
            return;
        }
        const reduccion = Math.round(moraCargo * (p / 100) * 100) / 100;
        const nueva     = Math.round((moraCargo - reduccion) * 100) / 100;
        setPreview({ reduccion, nueva, moraCargo });
    };

    const handlePorcentajeChange = (val, moraCargo) => {
        // solo números 1-100
        const sanitized = val.replace(/[^0-9]/g, '').slice(0, 3);
        const num = parseInt(sanitized, 10);
        if (sanitized === '' || (num >= 1 && num <= 100)) {
            setPorcentaje(sanitized);
            calcularPreview(moraCargo, sanitized);
        }
    };

    const handleSubmit = async (cuotaId, moraCargo) => {
        const porc = parseFloat(porcentaje);
        if (!porcentaje || isNaN(porc) || porc < 1 || porc > 100) {
            setAlert({ type: 'error', message: 'Ingresa un porcentaje válido entre 1 y 100.' });
            return;
        }

        setLoading(true);
        setAlert(null);
        try {
            const res = await reducirMora({ cuota_id: cuotaId, porcentaje: porc, motivo });
            const result = res.data ?? res;
            setAlert({
                type: 'success',
                message: `Mora reducida en ${porc}%. Antes: S/ ${result.mora_anterior?.toFixed(2)} → Ahora: S/ ${result.mora_nueva?.toFixed(2)}`,
            });
            setPorcentaje('');
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
        setPorcentaje('');
        setMotivo('');
        setPreview(null);
        setAlert(null);
    };

    return {
        loading, alert, porcentaje, motivo, preview,
        setMotivo, handlePorcentajeChange, handleSubmit, reset,
    };
}