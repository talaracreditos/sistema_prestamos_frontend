import { useState, useEffect, useCallback } from 'react';
import { getClientesDniDashboard } from 'services/dashboardService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const DIAS_DEFECTO = '30';

export const OPCIONES_DIAS = [
    { value: '15', label: '15 días' },
    { value: '30', label: '30 días' },
    { value: '60', label: '60 días' },
    { value: '90', label: '90 días' },
];

export const useDashboardClientesDni = () => {
    const [loading,  setLoading]  = useState(true);
    const [data,     setData]     = useState(null);
    const [alert,    setAlert]    = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [dias,     setDias]     = useState(DIAS_DEFECTO);
    const [tab,      setTab]      = useState('vencidos');

    const fetch = useCallback(async (filters = {}) => {
        setLoading(true);
        setAlert(null);
        try {
            const res = await getClientesDniDashboard(filters);
            setData(res?.data ?? res);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch({ dias: DIAS_DEFECTO }); }, [fetch]);

    const handleFiltrar = () => fetch({ busqueda: busqueda.trim(), dias });

    const handleCambiarDias = (valor) => {
        setDias(valor);
        fetch({ busqueda: busqueda.trim(), dias: valor });
    };

    const handleLimpiar = () => {
        setBusqueda('');
        setDias(DIAS_DEFECTO);
        fetch({ dias: DIAS_DEFECTO });
    };

    const vencidos  = data?.vencidos   ?? [];
    const porVencer = data?.por_vencer ?? [];
    const filas     = tab === 'vencidos' ? vencidos : porVencer;

    return {
        loading, alert, setAlert,
        busqueda, setBusqueda,
        dias, handleCambiarDias,
        tab, setTab,
        filas,
        totalVencidos:  data?.resumen?.vencidos   ?? 0,
        totalPorVencer: data?.resumen?.por_vencer ?? 0,
        diasAlerta:     data?.dias_alerta ?? Number(dias),
        tieneFiltro:    !!busqueda || dias !== DIAS_DEFECTO,
        handleFiltrar, handleLimpiar,
    };
};