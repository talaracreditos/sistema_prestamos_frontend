import { useState, useEffect, useCallback } from 'react';
import { getCuotaDiaDashboard } from 'services/dashboardService';

export const useDashboardCuotaDia = () => {

    const hoy = new Date().toLocaleDateString('en-CA');

    const [loading,   setLoading]   = useState(true);
    const [data,      setData]      = useState(null);
    const [fecha,     setFecha]     = useState(hoy);
    const [asesorId,  setAsesorId]  = useState('');

    const fetchData = useCallback(async (f = hoy, aid = '') => {
        setLoading(true);

        try {
            const json = await getCuotaDiaDashboard({
                fecha: f,
                asesor_id: aid || undefined,
            });

            setData(json.data || json);

        } catch (e) {
            console.error(e);

        } finally {
            setLoading(false);
        }

    }, [hoy]);

    useEffect(() => {
        fetchData(fecha, asesorId);
    }, [fetchData]);

    const handleFiltrar = () => fetchData(fecha, asesorId);

    const handleLimpiar = () => {
        setFecha(hoy);
        setAsesorId('');
        fetchData(hoy, '');
    };

    return {
        loading,
        data,

        fecha,
        setFecha,

        asesorId,
        setAsesorId,

        handleFiltrar,
        handleLimpiar,
    };
};