import { useState, useEffect, useCallback } from 'react';
import { getClientesMoraDashboard, getClientesMoraMayor8Dashboard } from 'services/dashboardService';

const useDashboardClientesMoraBase = (fetchFn) => {
    const [loading,     setLoading]     = useState(true);
    const [data,        setData]        = useState(null);
    const [busqueda,    setBusqueda]    = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin,    setFechaFin]    = useState('');
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);

    const fetchData = useCallback(async (p = 1, b = '', fi = '', ff = '', asesorIds = []) => {
        setLoading(true);
        try {
            const filters = {
                page: p, per_page: 10,
                busqueda: b, fecha_inicio: fi, fecha_fin: ff,
            };
            if (asesorIds.length > 0) filters.asesor_ids = asesorIds.join(',');

            const json = await fetchFn(filters);
            setData(json?.data?.data !== undefined ? json.data : json);
        } catch (e) {
            console.error('Error dashboard clientes mora:', e);
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => { fetchData(1); }, [fetchData]);

    const idsAsesores = () => asesoresSeleccionados.map(a => a.id);

    const handleFiltrar = () =>
        fetchData(1, busqueda, fechaInicio, fechaFin, idsAsesores());

    const handleLimpiar = () => {
        setBusqueda('');
        setFechaInicio('');
        setFechaFin('');
        setAsesoresSeleccionados([]);
        fetchData(1, '', '', '', []);
    };

    const handlePageChange = (p) =>
        fetchData(p, busqueda, fechaInicio, fechaFin, idsAsesores());

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
        busqueda, setBusqueda,
        fechaInicio, setFechaInicio,
        fechaFin, setFechaFin,
        asesoresSeleccionados,
        handleAgregarAsesor, handleQuitarAsesor,
        handleFiltrar, handleLimpiar, handlePageChange,
    };
};

export const useDashboardClientesMora       = () => useDashboardClientesMoraBase(getClientesMoraDashboard);
export const useDashboardClientesMoraMayor8 = () => useDashboardClientesMoraBase(getClientesMoraMayor8Dashboard);