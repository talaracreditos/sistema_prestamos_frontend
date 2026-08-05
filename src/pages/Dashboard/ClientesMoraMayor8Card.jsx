import React from 'react';
import ClientesMoraCard from './ClientesMoracard';
import { useDashboardClientesMoraMayor8 } from 'hooks/Dashboard/useDashboardClientesMora';
import { exportClientesMoraMayor8Dashboard } from 'services/dashboardService';
import { FireIcon } from '@heroicons/react/24/outline';

const ClientesMoraMayor8Card = () => (
    <ClientesMoraCard
        useDashboardHook={useDashboardClientesMoraMayor8}
        exportService={exportClientesMoraMayor8Dashboard}
        filename="reporte_clientes_mora_mayor_8"
        titulo="Clientes en Mora Mayor a 8 Días"
        subtitulo="Capital adeudado · mora > 8 días · ordenado por deuda"
        icon={FireIcon}
    />
);

export default ClientesMoraMayor8Card;