import { useState, useEffect, useCallback } from 'react';
import { getCuotaDiaDashboard } from 'services/dashboardService';

export const useDashboardCuotaDia = () => {

    const hoy = new Date().toLocaleDateString('en-CA');

    const [loading,  setLoading]  = useState(true);
    const [data,     setData]     = useState(null);
    const [fecha,    setFecha]    = useState(hoy);

    // Asesores / tasadores elegidos con el combobox: [{ id, nombre }]
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);

    const idsParam = (lista) => lista.length > 0 ? lista.map(a => a.id).join(',') : undefined;

    const fetchData = useCallback(async (f = hoy, lista = []) => {
        setLoading(true);

        try {
            const json = await getCuotaDiaDashboard({
                fecha: f,
                asesor_ids: idsParam(lista),
            });

            setData(json.data || json);

        } catch (e) {
            console.error(e);

        } finally {
            setLoading(false);
        }

    }, [hoy]);

    useEffect(() => {
        fetchData(fecha, asesoresSeleccionados);
        // eslint-disable-next-line
    }, [fetchData]);

    const handleAgregarAsesor = (empleado) => {
        if (!empleado) return;
        setAsesoresSeleccionados(prev =>
            prev.some(a => a.id === empleado.id)
                ? prev
                : [...prev, { id: empleado.id, nombre: empleado.nombre_completo }]
        );
    };

    const handleQuitarAsesor = (id) => {
        setAsesoresSeleccionados(prev => prev.filter(a => a.id !== id));
    };

    const handleFiltrar = () => fetchData(fecha, asesoresSeleccionados);

    const handleLimpiar = () => {
        setFecha(hoy);
        setAsesoresSeleccionados([]);
        fetchData(hoy, []);
    };

    return {
        loading,
        data,

        fecha,
        setFecha,

        asesoresSeleccionados,
        handleAgregarAsesor,
        handleQuitarAsesor,

        // Para el Excel
        exportFilters: {
            fecha,
            ...(asesoresSeleccionados.length > 0 ? { asesor_ids: idsParam(asesoresSeleccionados) } : {}),
        },

        handleFiltrar,
        handleLimpiar,
    };
};