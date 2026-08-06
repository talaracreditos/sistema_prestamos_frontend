import { useState, useEffect, useCallback } from 'react';
import { getSBSDashboard } from 'services/dashboardService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useDashboardSBS = () => {
    const [loading,       setLoading]      = useState(true);
    const [data,          setData]         = useState(null);
    const [alert,         setAlert]        = useState(null);
    const [busqueda,      setBusqueda]     = useState('');
    const [calificacion,  setCalificacion] = useState('');
    const [nroCredito,    setNroCredito]   = useState('');
    const [mes,           setMes]          = useState(''); // NUEVO ESTADO

    const fetchData = useCallback(async (filters = {}, pg = 1) => {
        setLoading(true);
        setAlert(null);
        try {
            const res = await getSBSDashboard({ ...filters, page: pg });
            setData(res.data || res);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const currentFilters = () => ({
        ...(busqueda          ? { busqueda }                : {}),
        ...(calificacion !== '' ? { calificacion }          : {}),
        ...(nroCredito        ? { nro_credito: nroCredito } : {}),
        ...(mes               ? { mes }                     : {}), // NUEVO FILTRO
    });

    const handleFiltrar    = ()  => fetchData(currentFilters(), 1);
    const handleLimpiar    = ()  => { setBusqueda(''); setCalificacion(''); setNroCredito(''); setMes(''); fetchData({}, 1); };
    const handlePageChange = (p) => fetchData(currentFilters(), p);

    return {
        loading, data, alert,
        busqueda,     setBusqueda,
        calificacion, setCalificacion,
        nroCredito,   setNroCredito,
        mes,          setMes, // EXPORTAMOS
        handleFiltrar, handleLimpiar, handlePageChange,
    };
};