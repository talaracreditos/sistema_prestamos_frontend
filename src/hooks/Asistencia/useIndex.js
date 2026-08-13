import { useState, useCallback, useRef, useEffect } from 'react';
import { index } from 'services/asistenciaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const initialFilters = { fecha_desde: '', fecha_hasta: '', usuario: '' };

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [asistencias, setAsistencias] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const filtersRef = useRef(initialFilters);
    const [alert, setAlert] = useState(null);

    const fetchAsistencias = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setAsistencias(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                total: response.total
            });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAsistencias(1); }, [fetchAsistencias]);

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));

    const handleFilterSubmit = () => {
        filtersRef.current = filters;
        setAppliedFilters(filters);
        fetchAsistencias(1);
    };

    const handleFilterClear = () => {
        setFilters(initialFilters);
        filtersRef.current = initialFilters;
        setAppliedFilters(initialFilters);
        fetchAsistencias(1);
    };

    // Filtro por empleado — se aplica al toque, sin esperar el botón "Aplicar"
    const handleUsuarioFilter = (empleado) => {
        const usuarioId = empleado?.usuario_id ?? empleado?.id ?? '';
        const nuevosFiltros = { ...filtersRef.current, usuario: usuarioId };
        setFilters(nuevosFiltros);
        filtersRef.current = nuevosFiltros;
        setAppliedFilters(nuevosFiltros);
        fetchAsistencias(1);
    };

    return {
        loading, asistencias, paginationInfo, filters, appliedFilters, alert, setAlert,
        fetchAsistencias, handleFilterChange, handleFilterSubmit, handleFilterClear, handleUsuarioFilter
    };
};