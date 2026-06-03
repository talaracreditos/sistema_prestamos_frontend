import { useState, useEffect, useCallback } from 'react';
import { getSaldoCapitalDashboard } from 'services/dashboardService';

const hoy = new Date();
const MES_DEFAULT  = hoy.getMonth() + 1;
const ANIO_DEFAULT = hoy.getFullYear();

export const useDashboardSaldoCapital = () => {
    const [loading, setLoading] = useState(true);
    const [data,    setData]    = useState(null);
    const [mes,     setMes]     = useState(MES_DEFAULT);
    const [anio,    setAnio]    = useState(ANIO_DEFAULT);
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);

    const fetchData = useCallback(async (m = MES_DEFAULT, a = ANIO_DEFAULT, asesorIds = []) => {
        setLoading(true);
        try {
            const filters = { mes: m, anio: a };
            if (asesorIds.length > 0) filters.asesor_ids = asesorIds.join(',');
            const json = await getSaldoCapitalDashboard(filters);
            setData(json.data || json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(MES_DEFAULT, ANIO_DEFAULT); }, [fetchData]);

    const handleFiltrar = () =>
        fetchData(mes, anio, asesoresSeleccionados.map(a => a.id));

    const handleLimpiar = () => {
        setMes(MES_DEFAULT);
        setAnio(ANIO_DEFAULT);
        setAsesoresSeleccionados([]);
        fetchData(MES_DEFAULT, ANIO_DEFAULT, []);
    };

    const handleAgregarAsesor = (asesor) => {
        if (!asesor) return;
        setAsesoresSeleccionados(prev =>
            prev.find(a => a.id === asesor.id) ? prev : [
                ...prev,
                { id: asesor.id, nombre: asesor.nombre_completo ?? asesor.nombre ?? `Asesor #${asesor.id}` },
            ]
        );
    };

    const handleQuitarAsesor = (id) =>
        setAsesoresSeleccionados(prev => prev.filter(a => a.id !== id));

    return {
        loading, data,
        mes, setMes,
        anio, setAnio,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar,
    };
};