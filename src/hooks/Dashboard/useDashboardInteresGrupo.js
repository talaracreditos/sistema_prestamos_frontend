import { useState, useEffect, useCallback } from 'react';
import { getInteresGrupoDashboard } from 'services/dashboardService';

const formatDate = (d) => d.toISOString().split('T')[0];
const hoy          = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const FECHA_INICIO_DEFAULT = formatDate(primerDiaMes);
const FECHA_FIN_DEFAULT    = formatDate(hoy);

export const useDashboardInteresGrupo = () => {
    const [loading,       setLoading]       = useState(true);
    const [data,          setData]          = useState(null);
    const [fechaInicio,   setFechaInicio]   = useState(FECHA_INICIO_DEFAULT);
    const [fechaFin,      setFechaFin]      = useState(FECHA_FIN_DEFAULT);
    const [codigoRecaudo, setCodigoRecaudo] = useState(''); // Nuevo estado

    const fetchData = useCallback(async (fi = FECHA_INICIO_DEFAULT, ff = FECHA_FIN_DEFAULT, recaudo = '', pg = 1) => {
        setLoading(true);
        try {
            const json = await getInteresGrupoDashboard({ 
                fecha_inicio: fi, 
                fecha_fin: ff, 
                codigo_recaudo: recaudo, 
                page: pg 
            });
            setData(json.data || json);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(FECHA_INICIO_DEFAULT, FECHA_FIN_DEFAULT, '', 1); }, [fetchData]);

    const handleFiltrar    = () => fetchData(fechaInicio, fechaFin, codigoRecaudo, 1);
    const handlePageChange = (pg) => fetchData(fechaInicio, fechaFin, codigoRecaudo, pg);

    const handleLimpiar = () => {
        setFechaInicio(FECHA_INICIO_DEFAULT);
        setFechaFin(FECHA_FIN_DEFAULT);
        setCodigoRecaudo('');
        fetchData(FECHA_INICIO_DEFAULT, FECHA_FIN_DEFAULT, '', 1);
    };

    return {
        loading, data,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        codigoRecaudo, setCodigoRecaudo,
        handleFiltrar, handleLimpiar, handlePageChange,
    };
};