import { useState, useEffect, useCallback, useRef } from 'react';
import { getClientesDniDashboard } from 'services/dashboardService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const DIAS_DEFECTO = '30';
const PER_PAGE     = 10;

const PAGINA_VACIA = { data: [], total: 0, current_page: 1, last_page: 1 };

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

    // Filtros aplicados y páginas actuales (refs para no perderlos al paginar)
    const filtrosRef = useRef({ busqueda: '', dias: DIAS_DEFECTO });
    const paginasRef = useRef({ vencidos: 1, por_vencer: 1 });

    const cargar = useCallback(async () => {
        setLoading(true);
        setAlert(null);
        try {
            const res = await getClientesDniDashboard({
                busqueda:        filtrosRef.current.busqueda,
                dias:            filtrosRef.current.dias,
                page_vencidos:   paginasRef.current.vencidos,
                page_por_vencer: paginasRef.current.por_vencer,
                per_page:        PER_PAGE,
            });
            setData(res?.data ?? res);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const aplicarFiltros = (nuevos) => {
        filtrosRef.current = nuevos;
        paginasRef.current = { vencidos: 1, por_vencer: 1 };
        cargar();
    };

    const handleFiltrar = () => aplicarFiltros({ busqueda: busqueda.trim(), dias });

    const handleCambiarDias = (valor) => {
        setDias(valor);
        aplicarFiltros({ busqueda: busqueda.trim(), dias: valor });
    };

    const handleLimpiar = () => {
        setBusqueda('');
        setDias(DIAS_DEFECTO);
        aplicarFiltros({ busqueda: '', dias: DIAS_DEFECTO });
    };

    const handlePageVencidos = (page) => {
        paginasRef.current = { ...paginasRef.current, vencidos: page };
        cargar();
    };

    const handlePagePorVencer = (page) => {
        paginasRef.current = { ...paginasRef.current, por_vencer: page };
        cargar();
    };

    const vencidos  = data?.vencidos   ?? PAGINA_VACIA;
    const porVencer = data?.por_vencer ?? PAGINA_VACIA;
    const pagina    = tab === 'vencidos' ? vencidos : porVencer;

    return {
        loading, alert, setAlert,
        busqueda, setBusqueda,
        dias, handleCambiarDias,
        tab, setTab,
        pagina,
        totalVencidos:  data?.resumen?.vencidos   ?? 0,
        totalPorVencer: data?.resumen?.por_vencer ?? 0,
        diasAlerta:     data?.dias_alerta ?? Number(dias),
        tieneFiltro:    !!busqueda || dias !== DIAS_DEFECTO,
        handleFiltrar, handleLimpiar,
        handlePageChange: tab === 'vencidos' ? handlePageVencidos : handlePagePorVencer,
        refresh: cargar,
    };
};