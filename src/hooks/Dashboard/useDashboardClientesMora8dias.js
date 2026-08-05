import { useState, useEffect, useCallback } from 'react';
import { getClientesMoraDashboard } from 'services/dashboardService';

export const useDashboardClientesMora = () => {
    const [loading,     setLoading]     = useState(true);
    const [data,        setData]        = useState(null);
    const [busqueda,    setBusqueda]    = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin,    setFechaFin]    = useState('');

    const fetchData = useCallback(async (p = 1, b = '', fi = '', ff = '') => {
        setLoading(true);
        try {
            const json = await getClientesMoraDashboard({
                page: p, per_page: 10,
                busqueda: b, fecha_inicio: fi, fecha_fin: ff,
            });
            setData(json.data || json);
        } catch (e) {
            console.error('Error dashboard clientes mora:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(1); }, [fetchData]);

    const handleFiltrar    = () => fetchData(1, busqueda, fechaInicio, fechaFin);
    const handleLimpiar    = () => { setBusqueda(''); setFechaInicio(''); setFechaFin(''); fetchData(1); };
    const handlePageChange = (p) => fetchData(p, busqueda, fechaInicio, fechaFin);

    return {
        loading, data,
        busqueda, setBusqueda,
        fechaInicio, setFechaInicio,
        fechaFin, setFechaFin,
        handleFiltrar, handleLimpiar, handlePageChange,
    };
};