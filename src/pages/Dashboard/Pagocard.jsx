import React from 'react';
import { useDashboardPagos } from 'hooks/Dashboard/useDashboardPagos';
import DashboardCard from 'components/Shared/Cards/DashboardCard';
import { exportPagosDashboard } from 'services/dashboardService';

const PagoCard = () => {
    const {
        loading,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        handleFiltrar, handleLimpiar,
        cards, cardsPorTab, graficas, tabs, cardGroups
    } = useDashboardPagos();

    return (
        <DashboardCard
            title="Pagos"
            subtitle="Módulo de recaudación"
            icon="banknotes"
            loading={loading}
            cards={cards}
            cardsPorTab={cardsPorTab}
            graficas={graficas}
            tabs={tabs}
            conFiltros={true}
            fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
            fechaFin={fechaFin}       setFechaFin={setFechaFin}
            onFiltrar={handleFiltrar}
            onLimpiar={handleLimpiar}
            exportService={exportPagosDashboard}
            exportFilename="reporte_pagos"
            exportLabel="Excel"
            cardGroups={cardGroups}
        />
    );
};

export default PagoCard;