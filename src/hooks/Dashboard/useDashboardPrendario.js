import { useCallback, useEffect, useState } from 'react';
import { getPrendarioDashboard } from 'services/dashboardService';

const PER_PAGE = 10;

const FILTROS_VACIOS = {
    documento:   '',
    fechaInicio: '',
    fechaFin:    '',
    kilatajeId:  '',
    estado:      '',
};

// Convierte el estado del form a los params que espera el backend
const toParams = (f) => ({
    ...(f.documento   ? { documento:    f.documento.trim() } : {}),
    ...(f.fechaInicio ? { fecha_inicio: f.fechaInicio }      : {}),
    ...(f.fechaFin    ? { fecha_fin:    f.fechaFin }         : {}),
    ...(f.kilatajeId  ? { kilataje_id:  f.kilatajeId }       : {}),
    ...(f.estado      ? { estado:       f.estado }           : {}),
});

export const useDashboardPrendario = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData]       = useState(null);
    const [page, setPage]       = useState(1);

    // Lo que el usuario está escribiendo vs. lo que ya se aplicó con "Filtrar"
    const [form, setForm]         = useState(FILTROS_VACIOS);
    const [aplicados, setAplicados] = useState(FILTROS_VACIOS);

    const setCampo = (campo) => (valor) => setForm(prev => ({ ...prev, [campo]: valor }));

    const cargar = useCallback(async (pagina, filtros) => {
        setLoading(true);
        try {
            const res = await getPrendarioDashboard({
                ...toParams(filtros),
                page:     pagina,
                per_page: PER_PAGE,
            });
            setData(res?.data ?? null);
        } catch (error) {
            console.error('Error al cargar reporte prendario:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar(page, aplicados);
    }, [cargar, page, aplicados]);

    const handleFiltrar = () => {
        setPage(1);
        setAplicados({ ...form });
    };

    const handleLimpiar = () => {
        setForm(FILTROS_VACIOS);
        setPage(1);
        setAplicados(FILTROS_VACIOS);
    };

    const handlePageChange = (nueva) => setPage(nueva);

    return {
        loading,
        data,
        // filtros (form)
        documento:   form.documento,   setDocumento:   setCampo('documento'),
        fechaInicio: form.fechaInicio, setFechaInicio: setCampo('fechaInicio'),
        fechaFin:    form.fechaFin,    setFechaFin:    setCampo('fechaFin'),
        kilatajeId:  form.kilatajeId,  setKilatajeId:  setCampo('kilatajeId'),
        estado:      form.estado,      setEstado:      setCampo('estado'),
        // filtros ya aplicados (para el Excel)
        exportFilters: toParams(aplicados),
        tieneFiltro:   Object.values(aplicados).some(Boolean) || Object.values(form).some(Boolean),
        handleFiltrar,
        handleLimpiar,
        handlePageChange,
    };
};