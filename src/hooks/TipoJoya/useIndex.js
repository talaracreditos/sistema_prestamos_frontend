import { useState, useCallback, useRef, useEffect } from 'react';
import { index, destroy } from 'services/tipoJoyaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [tiposJoyas, setTiposJoyas] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });

    const [filters, setFilters] = useState({ search: '' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const fetchTiposJoyas = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setTiposJoyas(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                total: response.total
            });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTiposJoyas(1);
    }, [fetchTiposJoyas]);

    const handleAskDelete = (id) => {
        setSelectedId(id);
        setShowDelete(true);
    };

    const handleConfirmDelete = async () => {
        setShowDelete(false);
        setLoading(true);
        try {
            await destroy(selectedId);
            setAlert({ type: 'success', message: 'Tipo de joya eliminado correctamente.' });
            fetchTiposJoyas(1);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchTiposJoyas(1); };
    const handleFilterClear = () => {
        const reset = { search: '' };
        setFilters(reset);
        filtersRef.current = reset;
        fetchTiposJoyas(1);
    };

    return {
        loading, tiposJoyas, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete, fetchTiposJoyas, handleAskDelete,
        handleConfirmDelete, handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};