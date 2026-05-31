import { useState, useEffect, useCallback } from 'react';
import { getSaldoCapitalDashboard } from 'services/dashboardService';

export const useDashboardSaldoCapital = () => {
    const [loading, setLoading] = useState(true);
    const [data,    setData]    = useState(null);
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);

    const fetchData = useCallback(async (asesorIds = []) => {
        setLoading(true);
        try {
            const filters = {};
            if (asesorIds.length > 0) filters.asesor_ids = asesorIds.join(',');
            const json = await getSaldoCapitalDashboard(filters);
            setData(json.data || json);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleFiltrar = () => fetchData(asesoresSeleccionados.map(a => a.id));

    const handleLimpiar = () => {
        setAsesoresSeleccionados([]);
        fetchData([]);
    };

    const handleAgregarAsesor = (asesor) => {
        if (!asesor) return;
        setAsesoresSeleccionados(prev =>
            prev.find(a => a.id === asesor.id) ? prev : [
                ...prev,
                { id: asesor.id, nombre: asesor.nombre_completo ?? asesor.nombre ?? `Asesor #${asesor.id}` }
            ]
        );
    };

    const handleQuitarAsesor = (id) =>
        setAsesoresSeleccionados(prev => prev.filter(a => a.id !== id));

    return {
        loading, data,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar,
    };
};