import { useState, useCallback, useRef, useEffect } from 'react';
import { index, destroy } from 'services/ciiuService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [ciius, setCiius]                   = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ search: '' });
    const filtersRef                          = useRef(filters);
    const [alert, setAlert]                   = useState(null);
    const [showDelete, setShowDelete]         = useState(false);
    const [selectedId, setSelectedId]         = useState(null);

    const fetchCiius = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setCiius(res.data || []);
            setPaginationInfo({ currentPage: res.current_page, totalPages: res.last_page, total: res.total });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCiius(1); }, [fetchCiius]);

    const handleAskDelete    = (id) => { setSelectedId(id); setShowDelete(true); };
    const handleConfirmDelete = async () => {
        setShowDelete(false);
        setLoading(true);
        try {
            await destroy(selectedId);
            setAlert({ type: 'success', message: 'CIIU eliminado correctamente.' });
            fetchCiius(1);
        } catch (err) { setAlert(handleApiError(err)); }
        finally { setLoading(false); }
    };

    const handleFilterChange  = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit  = () => { filtersRef.current = filters; fetchCiius(1); };
    const handleFilterClear   = () => { const r = { search: '' }; setFilters(r); filtersRef.current = r; fetchCiius(1); };

    return {
        loading, ciius, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete,
        fetchCiius, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    };
};