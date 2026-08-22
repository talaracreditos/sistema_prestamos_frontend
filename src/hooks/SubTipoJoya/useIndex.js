import { useState, useCallback, useRef, useEffect } from 'react';
import { index, destroy } from 'services/subtipoJoyaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [subtiposJoyas, setSubtiposJoyas] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });

    const [filters, setFilters] = useState({ search: '' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const fetchSubtiposJoyas = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setSubtiposJoyas(response.data || []);
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
        fetchSubtiposJoyas(1);
    }, [fetchSubtiposJoyas]);

    const handleAskDelete = (id) => {
        setSelectedId(id);
        setShowDelete(true);
    };

    const handleConfirmDelete = async () => {
        setShowDelete(false);
        setLoading(true);
        try {
            await destroy(selectedId);
            setAlert({ type: 'success', message: 'Subtipo de joya eliminado correctamente.' });
            fetchSubtiposJoyas(1);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchSubtiposJoyas(1); };
    const handleFilterClear = () => {
        const reset = { search: '' };
        setFilters(reset);
        filtersRef.current = reset;
        fetchSubtiposJoyas(1);
    };

    return {
        loading, subtiposJoyas, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete, fetchSubtiposJoyas, handleAskDelete,
        handleConfirmDelete, handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};