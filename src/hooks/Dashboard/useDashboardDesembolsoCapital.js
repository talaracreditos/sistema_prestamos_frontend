import { useState, useEffect, useCallback, useRef } from 'react';
import { getDesembolsoCapitalDashboard } from 'services/dashboardService';

const keyDe = (mes, anio) => `${anio}-${mes}`;

export const useDashboardDesembolsoCapital = () => {
    const hoy = new Date();

    const [loading, setLoading] = useState(true);
    const [data,    setData]    = useState(null);
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);
    const [mesVisible, setMesVisible] = useState({
        mes:  hoy.getMonth() + 1,
        anio: hoy.getFullYear(),
    });

    // Cache en memoria por mes ya cargado (se invalida al cambiar el filtro de asesor)
    const cacheRef = useRef({});

    const fetchMes = useCallback(async (mes, anio, asesorIds = [], { forzar = false } = {}) => {
        const cacheKey = keyDe(mes, anio);

        if (!forzar && cacheRef.current[cacheKey]) {
            setData(cacheRef.current[cacheKey]);
            return;
        }

        setLoading(true);
        try {
            const filters = { mes, anio };
            if (asesorIds.length > 0) filters.asesor_ids = asesorIds.join(',');
            const json = await getDesembolsoCapitalDashboard(filters);
            const payload = json.data || json;
            cacheRef.current[cacheKey] = payload;
            setData(payload);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    // Carga inicial
    useEffect(() => {
        fetchMes(mesVisible.mes, mesVisible.anio, []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCambiarMes = useCallback((nuevoMes) => {
        setMesVisible(nuevoMes);
        fetchMes(nuevoMes.mes, nuevoMes.anio, asesoresSeleccionados.map(a => a.id));
    }, [asesoresSeleccionados, fetchMes]);

    const handleFiltrarAsesor = useCallback(() => {
        // Cambia el filtro de asesor: la cache queda obsoleta, se limpia y se fuerza refetch del mes visible
        cacheRef.current = {};
        fetchMes(mesVisible.mes, mesVisible.anio, asesoresSeleccionados.map(a => a.id), { forzar: true });
    }, [asesoresSeleccionados, mesVisible, fetchMes]);

    const handleLimpiar = useCallback(() => {
        cacheRef.current = {};
        setAsesoresSeleccionados([]);
        const mesActual = { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
        setMesVisible(mesActual);
        fetchMes(mesActual.mes, mesActual.anio, [], { forzar: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchMes]);

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
        mesVisible,
        asesoresSeleccionados,
        handleCambiarMes,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrarAsesor, handleLimpiar,
    };
};