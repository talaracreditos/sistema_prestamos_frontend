import React from 'react';
import { useDashboardPagos } from 'hooks/Dashboard/useDashboardPagos';
import { useAuth } from 'context/AuthContext';
import DashboardCard from 'components/Shared/Cards/DashboardCard';
import { exportPagosDashboard } from 'services/dashboardService';

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

const PagoCard = () => {
    const { role } = useAuth();
    const esCliente = role === 'cliente';

    const {
        loading, data,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        handleFiltrar, handleLimpiar,
    } = useDashboardPagos();

    const g     = data?.graficas ?? {};
    const cards = data?.cards    ?? [];

    const byLabel = (...kws) => cards.filter(c =>
        kws.some(kw => c.label.toLowerCase().includes(kw.toLowerCase()))
    );

    // ── Cards por tab ─────────────────────────────────────────────────────────
    const cardsPorTab = esCliente
        ? {
            // Cliente: solo ve sus pagos en resumen, sin desglose
            resumen:   cards,
            recaudado: cards,
            mensual:   cards,
        }
        : {
            resumen:    cards,
            recaudado:  byLabel('recaudado', 'pagos'),
            capital:    byLabel('capital'),
            interes:    byLabel('interés', 'interes'),
            mora:       byLabel('mora'),
            comisiones: byLabel('comision'),
            seguros:    byLabel('seguro'),
        };

    // ── Gráficas ──────────────────────────────────────────────────────────────
    const graficasCliente = [
        { tab: 'recaudado', tipo: 'area',  data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'total',    label: 'Monto pagado — últimos 30 días (S/)', color: '#8B1A1A', height: 200 },
        { tab: 'recaudado', tipo: 'barra', data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'cantidad', label: 'Cantidad de pagos — últimos 30 días',  color: '#F5A623', isMoney: false, height: 140 },
        { tab: 'mensual',   tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'total',    label: 'Monto pagado — 12 meses (S/)',          color: '#8B1A1A', height: 200 },
        { tab: 'mensual',   tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'cantidad', label: 'Cantidad de pagos — 12 meses',          color: '#F5A623', isMoney: false, height: 140 },
    ];

    const graficasAdmin = [
        // ── Recaudado ──────────────────────────────────────────────────────────
        { tab: 'recaudado',  tipo: 'area',  data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'total',    label: 'Monto recaudado — últimos 30 días (S/)', color: '#8B1A1A', height: 200 },
        { tab: 'recaudado',  tipo: 'barra', data: g.diaria  ?? [], xKey: 'fecha', dataKey: 'cantidad', label: 'Cantidad de pagos — últimos 30 días',    color: '#F5A623', isMoney: false, height: 140 },
        { tab: 'recaudado',  tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'total',    label: 'Monto recaudado — 12 meses (S/)',         color: '#8B1A1A', height: 200 },
        { tab: 'recaudado',  tipo: 'barra', data: g.mensual ?? [], xKey: 'mes',   dataKey: 'cantidad', label: 'Cantidad de pagos — 12 meses',            color: '#F5A623', isMoney: false, height: 140 },
        // ── Capital ────────────────────────────────────────────────────────────
        { tab: 'capital',    tipo: 'area',  data: g.capital_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Capital cobrado — últimos 30 días (S/)', color: '#1A8B3A', height: 200 },
        { tab: 'capital',    tipo: 'barra', data: g.capital_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Capital cobrado — 12 meses (S/)',         color: '#1A8B3A', height: 200 },
        // ── Interés ────────────────────────────────────────────────────────────
        { tab: 'interes',    tipo: 'area',  data: g.interes_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Interés cobrado — últimos 30 días (S/)', color: '#1A5C8B', height: 200 },
        { tab: 'interes',    tipo: 'barra', data: g.interes_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Interés cobrado — 12 meses (S/)',         color: '#1A5C8B', height: 200 },
        // ── Mora ───────────────────────────────────────────────────────────────
        { tab: 'mora',       tipo: 'area',  data: g.mora_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Mora cobrada — últimos 30 días (S/)', color: '#C05621', height: 200 },
        { tab: 'mora',       tipo: 'barra', data: g.mora_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Mora cobrada — 12 meses (S/)',         color: '#C05621', height: 200 },
        // ── Comisiones ─────────────────────────────────────────────────────────
        { tab: 'comisiones', tipo: 'area',  data: g.comision_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Comisiones — últimos 30 días (S/)', color: '#F5A623', height: 200 },
        { tab: 'comisiones', tipo: 'barra', data: g.comision_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Comisiones — 12 meses (S/)',         color: '#F5A623', height: 200 },
        // ── Seguro (Ingreso x Seguro cobrado) ─────────────────────────────────
        { tab: 'seguros',    tipo: 'area',  data: g.seguro_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Ingreso x Seguro — últimos 30 días (S/)', color: '#5B1A8B', height: 200 },
        { tab: 'seguros',    tipo: 'barra', data: g.seguro_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Ingreso x Seguro — 12 meses (S/)',         color: '#5B1A8B', height: 200 },
        // ── Seguro Percibido (préstamos desembolsados) ────────────────────────
        { tab: 'seguros',    tipo: 'area',  data: g.seguro_percibido_diaria  ?? [], xKey: 'fecha', dataKey: 'total', label: 'Seguro Percibido — últimos 30 días (S/)', color: '#7C3AED', height: 200 },
        { tab: 'seguros',    tipo: 'barra', data: g.seguro_percibido_mensual ?? [], xKey: 'mes',   dataKey: 'total', label: 'Seguro Percibido — 12 meses (S/)',         color: '#7C3AED', height: 200 },
    ];

    return (
        <DashboardCard
            title="Pagos"
            subtitle="Módulo de recaudación"
            icon="banknotes"
            loading={loading}
            cards={cards}
            cardsPorTab={cardsPorTab}
            graficas={esCliente ? graficasCliente : graficasAdmin}
            tabs={esCliente ? TABS_CLIENTE : TABS_ADMIN}
            conFiltros={true}
            fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
            fechaFin={fechaFin}       setFechaFin={setFechaFin}
            onFiltrar={handleFiltrar}
            onLimpiar={handleLimpiar}
            exportService={exportPagosDashboard}
            exportFilename="reporte_pagos"
            exportLabel="Excel"
        />
    );
};

export default PagoCard;