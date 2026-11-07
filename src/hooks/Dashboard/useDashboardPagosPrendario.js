import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPagosPrendarioDashboard } from 'services/dashboardService';

const TABS = [
    { id: 'cards',     label: 'Resumen'   },
    { id: 'recaudado', label: 'Recaudado' },
    { id: 'capital',   label: 'Capital'   },
    { id: 'cargos',    label: 'Cargos'    },
];

export const useDashboardPagosPrendario = () => {
    const [loading,     setLoading]     = useState(true);
    const [data,        setData]        = useState(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin,    setFechaFin]    = useState('');

    const fetchData = useCallback(async (inicio = '', fin = '') => {
        setLoading(true);
        try {
            const filters = {};
            if (inicio) filters.fecha_inicio = inicio;
            if (fin)    filters.fecha_fin    = fin;
            const json = await getPagosPrendarioDashboard(filters);
            setData(json.data || json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleFiltrar = useCallback(() => fetchData(fechaInicio, fechaFin), [fetchData, fechaInicio, fechaFin]);

    const handleLimpiar = useCallback(() => {
        setFechaInicio('');
        setFechaFin('');
        fetchData();
    }, [fetchData]);

    const cards = data?.cards ?? [];

    const graficas = useMemo(() => {
        const g = data?.graficas ?? {};
        return [
            { tab: 'recaudado', tipo: 'area',  data: g.diaria ?? [],           xKey: 'fecha', dataKey: 'total', label: 'Recaudado prendario — por día (S/)',  color: '#8B1A1A', height: 200 },
            { tab: 'recaudado', tipo: 'barra', data: g.mensual ?? [],          xKey: 'mes',   dataKey: 'total', label: 'Recaudado prendario — por mes (S/)',  color: '#F5A623', isMoney: true, height: 180 },
            { tab: 'capital',   tipo: 'area',  data: g.capital_diaria ?? [],   xKey: 'fecha', dataKey: 'total', label: 'Capital cobrado — por día (S/)',      color: '#8B1A1A', height: 200 },
            { tab: 'capital',   tipo: 'barra', data: g.capital_mensual ?? [],  xKey: 'mes',   dataKey: 'total', label: 'Capital cobrado — por mes (S/)',      color: '#F5A623', isMoney: true, height: 180 },
            { tab: 'cargos',    tipo: 'barra', data: g.interes_mensual ?? [],  xKey: 'mes',   dataKey: 'total', label: 'Interés cobrado — por mes (S/)',      color: '#8B1A1A', isMoney: true, height: 170 },
            { tab: 'cargos',    tipo: 'barra', data: g.custodia_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Custodia cobrada — por mes (S/)',     color: '#F5A623', isMoney: true, height: 170 },
            { tab: 'cargos',    tipo: 'barra', data: g.igv_mensual ?? [],      xKey: 'mes',   dataKey: 'total', label: 'IGV cobrado — por mes (S/)',          color: '#64748b', isMoney: true, height: 170 },
        ];
    }, [data]);

    return {
        loading,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        handleFiltrar, handleLimpiar,
        cards, graficas, tabs: TABS,
    };
};