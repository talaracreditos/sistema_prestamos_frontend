import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPagosDashboard } from 'services/dashboardService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';

const TABS_ADMIN = [
    { id: 'resumen',    label: 'Resumen'    },
    { id: 'recaudado',  label: 'Recaudado'  },
    { id: 'capital',    label: 'Capital'    },
    { id: 'interes',    label: 'Interés'    },
    { id: 'mora',       label: 'Mora'       },
    { id: 'comisiones', label: 'Comisiones' },
    { id: 'seguros',    label: 'Seguros'    },
];

const TABS_CLIENTE = [
    { id: 'resumen',   label: 'Resumen'  },
    { id: 'recaudado', label: '30 días'  },
    { id: 'mensual',   label: '12 meses' },
];

const TABS_ASESOR = [
    { id: 'resumen', label: 'Resumen' },
];

export const useDashboardPagos = () => {
    const { role } = useAuth();
    const esCliente = role === 'cliente';
    const esAsesor  = role === 'asesor';

    const [loading,      setLoading]      = useState(true);
    const [data,         setData]         = useState(null);
    const [alert,        setAlert]        = useState(null);
    const [fechaInicio,  setFechaInicio]  = useState('');
    const [fechaFin,     setFechaFin]     = useState('');

    const fetch = useCallback(async (filters = {}) => {
        setLoading(true);
        setAlert(null);
        try {
            const res = await getPagosDashboard(filters);
            setData(res.data || res);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleFiltrar = () => {
        fetch({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    };

    const handleLimpiar = () => {
        setFechaInicio('');
        setFechaFin('');
        fetch({});
    };

    // ── Lógica de Presentación (Memoizada) ────────────────────────────────────
    const { cards, cardsPorTab, graficas, tabs, cardGroups } = useMemo(() => {
        const g = data?.graficas ?? {};
        const c = data?.cards    ?? [];

        const byLabel = (...kws) => c.filter(item =>
            kws.some(kw => item.label.toLowerCase().includes(kw.toLowerCase()))
        );

        // 1. Determinar Tabs
        const currentTabs = esCliente ? TABS_CLIENTE : esAsesor ? TABS_ASESOR : TABS_ADMIN;

        // 2. Determinar Cards por Tab
        let currentCardsPorTab = {};
        if (esCliente) {
            currentCardsPorTab = { resumen: c, recaudado: c, mensual: c };
        } else if (esAsesor) {
            currentCardsPorTab = { resumen: c };
        } else {
            currentCardsPorTab = {
                resumen:    c,
                recaudado:  byLabel('recaudado', 'pagos'),
                capital:    byLabel('capital'),
                interes:    byLabel('interés', 'interes'),
                mora:       byLabel('mora'),
                comisiones: byLabel('comision'),
                seguros:    byLabel('seguro'),
            };
        }

        // 3. Determinar Gráficas
        const currentGraficas = esCliente ? [
            { tab: 'recaudado', tipo: 'area',  data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'total',    label: 'Monto pagado — últimos 30 días (S/)', color: '#8B1A1A', height: 200 },
            { tab: 'recaudado', tipo: 'barra', data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'cantidad', label: 'Cantidad de pagos — últimos 30 días', color: '#F5A623', isMoney: false, height: 140 },
            { tab: 'mensual',   tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'total',    label: 'Monto pagado — 12 meses (S/)',        color: '#8B1A1A', height: 200 },
            { tab: 'mensual',   tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'cantidad', label: 'Cantidad de pagos — 12 meses',        color: '#F5A623', isMoney: false, height: 140 },
        ] : esAsesor ? [] : [
            { tab: 'recaudado',  tipo: 'area',  data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'total',    label: 'Monto recaudado — últimos 30 días (S/)', color: '#8B1A1A', height: 200 },
            { tab: 'recaudado',  tipo: 'barra', data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'cantidad', label: 'Cantidad de pagos — últimos 30 días',    color: '#F5A623', isMoney: false, height: 140 },
            { tab: 'recaudado',  tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'total',    label: 'Monto recaudado — 12 meses (S/)',        color: '#8B1A1A', height: 200 },
            { tab: 'recaudado',  tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'cantidad', label: 'Cantidad de pagos — 12 meses',           color: '#F5A623', isMoney: false, height: 140 },
            { tab: 'capital',    tipo: 'area',  data: g.capital_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Capital cobrado — últimos 30 días (S/)', color: '#1A8B3A', height: 200 },
            { tab: 'capital',    tipo: 'barra', data: g.capital_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Capital cobrado — 12 meses (S/)',        color: '#1A8B3A', height: 200 },
            { tab: 'interes',    tipo: 'area',  data: g.interes_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Interés cobrado — últimos 30 días (S/)', color: '#1A5C8B', height: 200 },
            { tab: 'interes',    tipo: 'barra', data: g.interes_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Interés cobrado — 12 meses (S/)',        color: '#1A5C8B', height: 200 },
            { tab: 'mora',       tipo: 'area',  data: g.mora_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Mora cobrada — últimos 30 días (S/)', color: '#C05621', height: 200 },
            { tab: 'mora',       tipo: 'barra', data: g.mora_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Mora cobrada — 12 meses (S/)',        color: '#C05621', height: 200 },
            { tab: 'comisiones', tipo: 'area',  data: g.comision_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Comisiones — últimos 30 días (S/)', color: '#F5A623', height: 200 },
            { tab: 'comisiones', tipo: 'barra', data: g.comision_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Comisiones — 12 meses (S/)',        color: '#F5A623', height: 200 },
            { tab: 'seguros',    tipo: 'area',  data: g.seguro_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Ingreso x Seguro — últimos 30 días (S/)', color: '#5B1A8B', height: 200 },
            { tab: 'seguros',    tipo: 'barra', data: g.seguro_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Ingreso x Seguro — 12 meses (S/)',        color: '#5B1A8B', height: 200 },
            { tab: 'seguros',    tipo: 'area',  data: g.seguro_percibido_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Seguro Percibido — últimos 30 días (S/)', color: '#7C3AED', height: 200 },
            { tab: 'seguros',    tipo: 'barra', data: g.seguro_percibido_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Seguro Percibido — 12 meses (S/)',        color: '#7C3AED', height: 200 },
        ];

        // 4. Determinar Grupos de Tarjetas
        const currentCardGroups = (esCliente || esAsesor) ? [] : [
            {
                parent: ['total recaudado'],
                children: [
                    { keywords: ['capital cobrado'],                   signo: '+' },
                    { keywords: ['interés cobrado', 'interes cobrado'], signo: '+' },
                    { keywords: ['ingreso x seguro'],                  signo: '+' },
                    { keywords: ['mora cobrada'],                      signo: '+' },
                    { keywords: ['excedente generado'],                signo: '+' },
                    { keywords: ['excedente usado'],                   signo: '-' },
                ],
            },
            {
                parent: ['recaudado hoy'],
                children: [
                    { keywords: ['capital cobrado hoy'],               signo: '+' },
                    { keywords: ['interés hoy', 'interes hoy'],        signo: '+' },
                    { keywords: ['ingreso x seguro hoy'],              signo: '+' },
                    { keywords: ['mora hoy'],                          signo: '+' },
                    { keywords: ['excedente gen. hoy', 'excedente gen hoy'], signo: '+' },
                    { keywords: ['excedente usado hoy'],               signo: '-' },
                ],
            },
            {
                parent: ['recaudado al mes'],
                children: [
                    { keywords: ['capital cobrado al mes'],            signo: '+' },
                    { keywords: ['interés al mes', 'interes al mes'],  signo: '+' },
                    { keywords: ['ingreso x seguro al mes'],           signo: '+' },
                    { keywords: ['mora al mes'],                       signo: '+' },
                    { keywords: ['excedente gen. mes', 'excedente gen mes'], signo: '+' },
                    { keywords: ['excedente usado mes'],               signo: '-' },
                ],
            },
        ];

        return { cards: c, cardsPorTab: currentCardsPorTab, graficas: currentGraficas, tabs: currentTabs, cardGroups: currentCardGroups };
    }, [data, esCliente, esAsesor]);

    return {
        loading, alert, setAlert,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        handleFiltrar, handleLimpiar,
        cards, cardsPorTab, graficas, tabs, cardGroups // Propiedades de UI inyectadas
    };
};