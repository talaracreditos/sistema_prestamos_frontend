import { useState, useEffect, useCallback } from 'react';
import { getMasterDashboard } from 'services/dashboardService';

export const useDashboardMaster = () => {
    const [loading,     setLoading]     = useState(true);
    const [data,        setData]        = useState(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin,    setFechaFin]    = useState('');
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);

    // Nuevos filtros
    const [documento,       setDocumento]       = useState('');
    const [codRecaudo,      setCodRecaudo]      = useState('');
    const [estadoCredito,   setEstadoCredito]   = useState('');
    const [situacion,       setSituacion]       = useState('');
    const [tipoDesembolso,  setTipoDesembolso]  = useState(''); // 🔥 nuevo
    const [calificacionSbs, setCalificacionSbs] = useState('');

    const buildFilters = useCallback((fi, ff, asesorIds, page, extra = {}) => {
        const filters = { page };
        if (fi)                  filters.fecha_inicio      = fi;
        if (ff)                  filters.fecha_fin         = ff;
        if (asesorIds.length > 0) filters.asesor_ids       = asesorIds.join(',');
        if (extra.documento)     filters.documento         = extra.documento;
        if (extra.codRecaudo)    filters.cod_recaudo       = extra.codRecaudo;
        if (extra.estadoCredito) filters.estado_credito    = extra.estadoCredito;
        if (extra.situacion)     filters.situacion         = extra.situacion;
        if (extra.tipoDesembolso) filters.tipo_desembolso  = extra.tipoDesembolso; // 🔥 nuevo
        if (extra.calificacionSbs) filters.calificacion_sbs = extra.calificacionSbs;
        return filters;
    }, []);

    const fetchData = useCallback(async (fi = '', ff = '', asesorIds = [], page = 1, extra = {}) => {
        setLoading(true);
        try {
            const filters = buildFilters(fi, ff, asesorIds, page, extra);
            const json    = await getMasterDashboard(filters);
            setData(json.data || json);
        } catch (e) {
            console.error('Error dashboard master:', e);
        } finally {
            setLoading(false);
        }
    }, [buildFilters]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getExtra = () => ({ documento, codRecaudo, estadoCredito, situacion, tipoDesembolso, calificacionSbs });

    const handleFiltrar = () =>
        fetchData(fechaInicio, fechaFin, asesoresSeleccionados.map(a => a.id), 1, getExtra());

    const handlePageChange = (page) =>
        fetchData(fechaInicio, fechaFin, asesoresSeleccionados.map(a => a.id), page, getExtra());

    const handleLimpiar = () => {
        setFechaInicio(''); setFechaFin('');
        setAsesoresSeleccionados([]);
        setDocumento(''); setCodRecaudo('');
        setEstadoCredito(''); setSituacion(''); setTipoDesembolso(''); setCalificacionSbs('');
        fetchData('', '', [], 1, {});
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
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar, handlePageChange,
        // nuevos
        documento,       setDocumento,
        codRecaudo,      setCodRecaudo,
        estadoCredito,   setEstadoCredito,
        situacion,       setSituacion,
        tipoDesembolso,  setTipoDesembolso, // 🔥 nuevo
        calificacionSbs, setCalificacionSbs,
    };
};