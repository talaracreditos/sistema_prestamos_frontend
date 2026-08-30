import { useState, useCallback, useRef, useEffect } from 'react';
import { index, show } from 'services/cajaChicaSesionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [sesiones, setSesiones] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ estado: '', fecha: '' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detalleSesion, setDetalleSesion] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    const fetchSesiones = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setSesiones(response.data?.data || []);
            setPaginationInfo({
                currentPage: response.data?.current_page,
                totalPages: response.data?.last_page,
                total: response.data?.total
            });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSesiones(1); }, [fetchSesiones]);

    const handleVerDetalle = async (id) => {
        setIsModalOpen(true);
        setLoadingDetalle(true);
        try {
            const res = await show(id);
            setDetalleSesion(res.data || res);
        } catch (err) {
            setAlert(handleApiError(err));
            setIsModalOpen(false);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchSesiones(1); };
    const handleFilterClear = () => {
        const reset = { estado: '', fecha: '' };
        setFilters(reset);
        filtersRef.current = reset;
        fetchSesiones(1);
    };

    return {
        loading, sesiones, paginationInfo, filters, alert, setAlert,
        fetchSesiones, handleFilterChange, handleFilterSubmit, handleFilterClear,
        isModalOpen, setIsModalOpen, detalleSesion, loadingDetalle, handleVerDetalle
    };
};