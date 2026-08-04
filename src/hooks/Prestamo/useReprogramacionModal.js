import { useState, useEffect, useMemo } from 'react';
import { reprogramar } from 'services/prestamoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

/**
 * data esperado (lo arma ViewPrestamoModal al abrir):
 *   {
 *     prestamoId,
 *     frecuenciaActual,      // frecuencia actual del préstamo, precarga el select
 *     cuotasPendientes,      // cantidad de cuotas pendientes — cuántas fechas previsualizar
 *     totalReprogramaciones, // veces que ya fue reprogramado (informativo)
 *   }
 */

const DIAS_POR_FRECUENCIA = { SEMANAL: 7, CATORCENAL: 14 };

// Suma meses sin desbordar (31 ene + 1 mes = 28/29 feb, no 3 marzo) —
// espeja exactamente addMonthNoOverflow() de Carbon en el backend.
const addMonthsNoOverflow = (date, months) => {
    const targetMonthIndex = date.getMonth() + months;
    const firstOfTarget    = new Date(date.getFullYear(), targetMonthIndex, 1);
    const diasEnTarget     = new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth() + 1, 0).getDate();
    const dia              = Math.min(date.getDate(), diasEnTarget);
    return new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), dia);
};

const addDias = (date, dias) => {
    const d = new Date(date);
    d.setDate(d.getDate() + dias);
    return d;
};

const fmtFecha = (date) => date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Genera la secuencia de fechas — misma lógica que CalculoFechasService::generarFechas
 * (SEMANAL +7d, CATORCENAL +14d, MENSUAL addMonthNoOverflow), solo para previsualizar
 * en el front; el cálculo real y autoritativo lo hace el backend al confirmar.
 */
const generarPreviewFechas = (fechaPrimeraStr, frecuencia, cantidad) => {
    if (!fechaPrimeraStr || !cantidad) return [];

    const [y, m, d] = fechaPrimeraStr.split('-').map(Number);
    let actual = new Date(y, m - 1, d);

    const fechas = [actual];
    for (let i = 1; i < cantidad; i++) {
        actual = frecuencia === 'MENSUAL'
            ? addMonthsNoOverflow(actual, 1)
            : addDias(actual, DIAS_POR_FRECUENCIA[frecuencia] ?? 7);
        fechas.push(actual);
    }
    return fechas;
};

export const useReprogramacionModal = ({ isOpen, data, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert]     = useState(null);

    const [formData, setFormData] = useState({
        frecuencia:           'SEMANAL',
        fecha_primera_cuota:  '',
        motivo:               '',
    });

    useEffect(() => {
        if (isOpen && data) {
            setFormData({
                frecuencia:          data.frecuenciaActual || 'SEMANAL',
                fecha_primera_cuota: '',
                motivo:              '',
            });
            setAlert(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, data?.prestamoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Recalcula en vivo cada vez que cambia frecuencia o fecha.
    const previewFechas = useMemo(() => {
        const fechas = generarPreviewFechas(
            formData.fecha_primera_cuota,
            formData.frecuencia,
            data?.cuotasPendientes ?? 0,
        );
        return fechas.map(fmtFecha);
    }, [formData.fecha_primera_cuota, formData.frecuencia, data?.cuotasPendientes]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        setLoading(true);
        try {
            await reprogramar(data.prestamoId, {
                frecuencia:          formData.frecuencia,
                fecha_primera_cuota: formData.fecha_primera_cuota,
                motivo:              formData.motivo?.trim() || null,
            });
            onSuccess();
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const submitDisabled = loading
        || !formData.frecuencia
        || !formData.fecha_primera_cuota;

    return {
        formData,
        loading, alert, setAlert,
        handleChange, handleSubmit,
        submitDisabled,
        previewFechas,
    };
};