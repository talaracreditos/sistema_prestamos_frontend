import { useCallback, useEffect, useState } from 'react';
import { getMoraEvolucionDashboard } from 'services/dashboardService';

const iso = d => {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
};

/** Rangos rápidos del modal (fin siempre = hoy). */
export const RANGOS_RAPIDOS = [
    { key: 'filtro', label: 'Rango del filtro' },
    { key: '30d',    label: 'Últimos 30 días' },
    { key: '6m',     label: 'Últimos 6 meses' },
    { key: '12m',    label: 'Últimos 12 meses' },
];

const calcularRango = (key, filtroInicio, filtroFin) => {
    const hoy = new Date();
    const desde = new Date(hoy);
    switch (key) {
        case '30d': desde.setDate(hoy.getDate() - 29);   return [iso(desde), iso(hoy)];
        case '6m':  desde.setMonth(hoy.getMonth() - 6);  return [iso(desde), iso(hoy)];
        case '12m': desde.setMonth(hoy.getMonth() - 12); return [iso(desde), iso(hoy)];
        default:    return [filtroInicio, filtroFin];
    }
};

/**
 * Evolución de la mora > 8 días de un asesor (asesorIds = [id]),
 * de varios (suma) o de todos (asesorIds = []).
 * Solo consulta mientras el modal está abierto.
 */
export const useMoraEvolucion = ({ isOpen, asesorIds = [], filtroInicio, filtroFin }) => {
    const [rangoKey, setRangoKey] = useState('filtro');
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);
    const [data,     setData]     = useState(null);

    const idsKey = asesorIds.join(',');

    // Cada vez que se abre para otro asesor, vuelve al rango del filtro
    useEffect(() => {
        if (isOpen) setRangoKey('filtro');
    }, [isOpen, idsKey]);

    const cargar = useCallback(async () => {
        const [inicio, fin] = calcularRango(rangoKey, filtroInicio, filtroFin);
        if (!inicio || !fin) return;

        setLoading(true);
        setError(null);
        try {
            const res = await getMoraEvolucionDashboard({
                fecha_inicio: inicio,
                fecha_fin:    fin,
                ...(idsKey ? { asesor_ids: idsKey } : {}),
            });
            setData(res?.data ?? null);
        } catch (e) {
            setError(e?.message || 'No se pudo cargar la evolución.');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [rangoKey, filtroInicio, filtroFin, idsKey]);

    useEffect(() => {
        if (isOpen) cargar();
    }, [isOpen, cargar]);

    useEffect(() => {
        if (!isOpen) setData(null);
    }, [isOpen]);

    return { loading, error, data, rangoKey, setRangoKey, recargar: cargar };
};