import { useState, useCallback, useRef, useEffect } from 'react';
import { index, justificar as justificarService } from 'services/asistenciaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading,        setLoading]        = useState(true);
    const [asistencias,    setAsistencias]    = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters,        setFilters]        = useState({ usuario: '', fecha_desde: '', fecha_hasta: '' });
    const [appliedFilters, setAppliedFilters]  = useState({ usuario: '', fecha_desde: '', fecha_hasta: '' });
    const filtersRef                          = useRef({ usuario: '', fecha_desde: '', fecha_hasta: '' });
    const [alert,          setAlert]          = useState(null);

    // Justificación de tardanza
    const [asistenciaParaJustificar, setAsistenciaParaJustificar] = useState(null);
    const [justificando, setJustificando] = useState(false);

    const fetchAsistencias = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setAsistencias(res.data || []);
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

    useEffect(() => { fetchAsistencias(1); }, [fetchAsistencias]);

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));

    const handleUsuarioFilter = useCallback((empleado) => {
        setFilters(prev => ({ ...prev, usuario: empleado?.id ?? '' }));
    }, []);

    const handleFilterSubmit = () => {
        filtersRef.current = filters;
        setAppliedFilters(filters);
        fetchAsistencias(1);
    };

    const handleFilterClear = () => {
        const reset = { usuario: '', fecha_desde: '', fecha_hasta: '' };
        setFilters(reset);
        filtersRef.current = reset;
        setAppliedFilters(reset);
        fetchAsistencias(1);
    };

    const handleAbrirJustificar = (asistencia) => setAsistenciaParaJustificar(asistencia);
    const handleCerrarJustificar = () => setAsistenciaParaJustificar(null);

    const handleConfirmarJustificar = async (payload) => {
        if (!asistenciaParaJustificar) return;
        setJustificando(true);
        try {
            await justificarService(asistenciaParaJustificar.id, payload);
            setAlert({ type: 'success', message: 'Asistencia actualizada correctamente.' });
            setAsistenciaParaJustificar(null);
            fetchAsistencias(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setJustificando(false);
        }
    };

    return {
        loading, asistencias, paginationInfo, filters, appliedFilters,
        alert, setAlert,
        fetchAsistencias, handleFilterChange, handleFilterSubmit, handleFilterClear, handleUsuarioFilter,
        asistenciaParaJustificar, justificando,
        handleAbrirJustificar, handleCerrarJustificar, handleConfirmarJustificar,
    };
};