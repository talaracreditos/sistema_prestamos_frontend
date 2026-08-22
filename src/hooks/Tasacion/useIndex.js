import { useState, useCallback, useRef, useEffect } from 'react';
import { index, show, destroy } from 'services/tasacionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [tasaciones, setTasaciones] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ search: '', estado: '' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);

    const [showDelete, setShowDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // ── Modal de ver detalle (ojito) ─────────────────────────────────────────
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const fetchTasaciones = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setTasaciones(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                total: response.total
            });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTasaciones(1); }, [fetchTasaciones]);

    // El estado (pendiente/abandonado/expirado/convertida) ya NO se cambia
    // manualmente desde acá — se actualiza solo cuando se aprueba o rechaza
    // la solicitud de préstamo asociada. El tasador solo lo visualiza.

    const handleView = async (id) => {
        setIsViewOpen(true);
        setViewLoading(true);
        try {
            const response = await show(id);
            setViewData(response.data || response);
        } catch (err) {
            setAlert(handleApiError(err));
            setIsViewOpen(false);
        } finally {
            setViewLoading(false);
        }
    };

    const handleAskDelete = (id) => { setSelectedId(id); setShowDelete(true); };
    const handleConfirmDelete = async () => {
        setShowDelete(false);
        setLoading(true);
        try {
            await destroy(selectedId);
            setAlert({ type: 'success', message: 'Tasación eliminada correctamente.' });
            fetchTasaciones(1);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally { setLoading(false); }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchTasaciones(1); };
    const handleFilterClear = () => {
        const reset = { search: '', estado: '' };
        setFilters(reset); filtersRef.current = reset; fetchTasaciones(1);
    };

    return {
        loading, tasaciones, paginationInfo, filters, alert, setAlert,
        showDelete, setShowDelete,
        isViewOpen, setIsViewOpen, viewData, viewLoading, handleView,
        fetchTasaciones, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};