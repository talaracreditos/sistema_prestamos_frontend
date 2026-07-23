import { useState, useCallback, useRef, useEffect } from 'react';
import { index, destroy, calendario } from 'services/feriadoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading,            setLoading]            = useState(true);
    const [feriados,           setFeriados]           = useState([]);
    const [feriadosCalendario, setFeriadosCalendario]  = useState([]);
    const [paginationInfo,     setPaginationInfo]     = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters,            setFilters]            = useState({ search: '', anio: new Date().getFullYear().toString(), dia: '' });
    const filtersRef                                  = useRef(filters);
    const [alert,              setAlert]              = useState(null);
    const [showDelete,         setShowDelete]         = useState(false);
    const [selectedId,         setSelectedId]         = useState(null);

    const fetchFeriados = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setFeriados(res.data || []);
            setPaginationInfo({
                currentPage: res.current_page,
                totalPages:  res.last_page,
                total:       res.total,
            });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    // Independiente de la paginación de la tabla: trae TODOS los feriados
    // para que el modo calendario marque los días de cualquier mes/año,
    // no solo los de la página 1 (los primeros 7).
    const fetchFeriadosCalendario = useCallback(async () => {
        try {
            const res = await calendario();
            setFeriadosCalendario(res.data || []);
        } catch (err) {
            // silencioso: si falla, el calendario simplemente no marca días,
            // no bloqueamos la tabla por esto
        }
    }, []);

    useEffect(() => {
        fetchFeriados(1);
        fetchFeriadosCalendario();
    }, [fetchFeriados, fetchFeriadosCalendario]);

    const handleAskDelete = (id) => { setSelectedId(id); setShowDelete(true); };

    const handleConfirmDelete = async () => {
        setShowDelete(false);
        setLoading(true);
        try {
            await destroy(selectedId);
            setAlert({ type: 'success', message: 'Feriado eliminado.' });
            fetchFeriados(paginationInfo.currentPage);
            fetchFeriadosCalendario(); // refresca marcado del calendario también
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchFeriados(1); };
    const handleFilterClear  = () => {
        const reset = { search: '', anio: new Date().getFullYear().toString(), dia: '' };
        setFilters(reset); filtersRef.current = reset; fetchFeriados(1);
    };

    return {
        loading, feriados, feriadosCalendario, paginationInfo, filters,
        alert, setAlert,
        showDelete, setShowDelete,
        handleAskDelete, handleConfirmDelete, fetchFeriados,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    };
};