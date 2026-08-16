import React from 'react';
import { CuotaCard } from './components/CronogramaTable/CuotaCard';
import DatosEconomicosCards, { DatosEconomicosCardsSkeleton } from './components/CronogramaTable/DatosEconomicosCards';

const CronogramaTable = ({
    cronograma = [],
    esVistaIntegrante = false,
    onHistorialModal,
    onReducirMora,
    extraColumns = [],
    eco = null,
    estadoPrestamo = 1,
    loadingEco = false,
}) => {
    const sharedProps = {
        cronograma,
        esVistaIntegrante,
        onHistorialModal,
        onReducirMora: esVistaIntegrante ? undefined : onReducirMora,
        extraColumns,
    };

    return (
        <div className="flex flex-col gap-4 transition-colors">
            {/* Cards económicas — solo si se pasan */}
            {eco !== null && (
                loadingEco
                    ? <DatosEconomicosCardsSkeleton />
                    : <DatosEconomicosCards
                        eco={eco}
                        estadoPrestamo={estadoPrestamo}
                        esVistaIntegrante={esVistaIntegrante}
                      />
            )}

            {/* Cronograma */}
            <div className="flex flex-col gap-3">
                {cronograma.map((cuota, i) => (
                    <CuotaCard key={cuota.nro ?? i} cuota={cuota} i={i} {...sharedProps} />
                ))}
            </div>
        </div>
    );
};

export default CronogramaTable;