import { useState, useCallback, useRef, useEffect } from 'react';
import { index, show } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [prospectos, setProspectos]         = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ search: '', estado: '', tipo: '', zona_id: '', asesor_id: '' });
    const filtersRef                          = useRef(filters);
    const [alert, setAlert]                   = useState(null);

    const [isViewOpen, setIsViewOpen]   = useState(false);
    const [viewData, setViewData]       = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const fetchProspectos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setProspectos(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages:  response.last_page,
                total:       response.total,
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar los prospectos'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProspectos(1); }, [fetchProspectos]);

    const handleView = async (id) => {
        setIsViewOpen(true);
        setViewLoading(true);
        setViewData(null);
        try {
            const response = await show(id);
            setViewData(response.data || response);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar el prospecto'));
            setIsViewOpen(false);
        } finally {
            setViewLoading(false);
        }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchProspectos(1); };
    const handleFilterClear  = () => {
        const reset = { search: '', estado: '', tipo: '', zona_id: '', asesor_id: '' };
        setFilters(reset); filtersRef.current = reset; fetchProspectos(1);
    };

    return {
        loading, prospectos, paginationInfo, filters, alert, setAlert,
        isViewOpen, setIsViewOpen, viewData, setViewData, viewLoading,
        fetchProspectos, handleView,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    };
};