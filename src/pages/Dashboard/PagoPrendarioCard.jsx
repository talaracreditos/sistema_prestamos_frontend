import React from 'react';
import { useDashboardPagosPrendario } from 'hooks/Dashboard/useDashboardPagosPrendario';
import DashboardCard from 'components/Shared/Cards/DashboardCard';

const PagoPrendarioCard = () => {
    const {
        loading,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        handleFiltrar, handleLimpiar,
        cards, graficas, tabs,
    } = useDashboardPagosPrendario();

    return (
        <DashboardCard
            title="Pagos Prendario"
            subtitle="Recaudación exclusiva de préstamos prendarios"
            icon="banknotes"
            loading={loading}
            cards={cards}
            graficas={graficas}
            tabs={tabs}
            conFiltros={true}
            fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
            fechaFin={fechaFin}       setFechaFin={setFechaFin}
            onFiltrar={handleFiltrar}
            onLimpiar={handleLimpiar}
        />
    );
};

export default PagoPrendarioCard;