// ── useIndex.js ──────────────────────────────────────────────────────────────
import { useState, useCallback, useRef, useEffect } from 'react';
import { index, destroy } from 'services/horarioSistemaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
 
export const useIndex = () => {
    const [loading,        setLoading]        = useState(true);
    const [horarios,       setHorarios]       = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters,        setFilters]        = useState({ search: '', activo: '' });
    const filtersRef                          = useRef({ search: '', activo: '' });
    const [alert,          setAlert]          = useState(null);
    const [showDelete,     setShowDelete]     = useState(false);
    const [selectedId,     setSelectedId]     = useState(null);
 
    const fetchHorarios = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setHorarios(res.data || []);
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
 
    useEffect(() => { fetchHorarios(1); }, [fetchHorarios]);
 
    const handleAskDelete    = (id) => { setSelectedId(id); setShowDelete(true); };
    const handleConfirmDelete = async () => {
        setShowDelete(false);
        setLoading(true);
        try {
            await destroy(selectedId);
            setAlert({ type: 'success', message: 'Horario eliminado.' });
            fetchHorarios(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };
 
    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchHorarios(1); };
    const handleFilterClear  = () => {
        const reset = { search: '', activo: '' };
        setFilters(reset); filtersRef.current = reset; fetchHorarios(1);
    };
 
    return {
        loading, horarios, paginationInfo, filters,
        alert, setAlert,
        showDelete, setShowDelete,
        handleAskDelete, handleConfirmDelete, fetchHorarios,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    };
};