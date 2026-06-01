import { useState, useEffect, useCallback } from 'react';
import { getSaldoCapitalDashboard } from 'services/dashboardService';

/**
 * mesesSeleccionados: [{ mes: number (1-12), anio: number }]
 */
export const useDashboardSaldoCapital = () => {
    const [loading, setLoading] = useState(true);
    const [data,    setData]    = useState(null);
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);
    const [mesesSeleccionados,    setMesesSeleccionados]    = useState([]);   // [{mes,anio}]

    const fetchData = useCallback(async (asesorIds = [], meses = []) => {
        setLoading(true);
        try {
            const filters = {};
            if (asesorIds.length > 0) filters.asesor_ids = asesorIds.join(',');
            if (meses.length > 0)     filters.meses      = JSON.stringify(meses);
            const json = await getSaldoCapitalDashboard(filters);
            setData(json.data || json);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleFiltrar = () =>
        fetchData(asesoresSeleccionados.map(a => a.id), mesesSeleccionados);

    const handleLimpiar = () => {
        setAsesoresSeleccionados([]);
        setMesesSeleccionados([]);
        fetchData([], []);
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

    const handleToggleMes = ({ mes, anio }) => {
        setMesesSeleccionados(prev => {
            const existe = prev.find(m => m.mes === mes && m.anio === anio);
            return existe
                ? prev.filter(m => !(m.mes === mes && m.anio === anio))
                : [...prev, { mes, anio }];
        });
    };

    const handleQuitarMes = ({ mes, anio }) =>
        setMesesSeleccionados(prev => prev.filter(m => !(m.mes === mes && m.anio === anio)));

    return {
        loading, data,
        asesoresSeleccionados,
        mesesSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleToggleMes, handleQuitarMes,
        handleFiltrar, handleLimpiar,
    };
};