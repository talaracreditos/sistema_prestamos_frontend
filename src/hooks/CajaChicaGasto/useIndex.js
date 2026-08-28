// hooks/CajaChicaGasto/useIndex.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { index, destroy } from 'services/cajaChicaGastoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [gastos, setGastos] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    
    const [filters, setFilters] = useState({ search: '' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [gastoToDelete, setGastoToDelete] = useState(null);

    const fetchGastos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setGastos(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                total: response.total
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar gastos'));
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchGastos(1); }, [fetchGastos]);

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchGastos(1); };
    const handleFilterClear = () => {
        const res = { search: '' };
        setFilters(res); 
        filtersRef.current = res; 
        fetchGastos(1); 
    };

    const openDeleteModal = (id) => {
        setGastoToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setGastoToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!gastoToDelete) return;
        try {
            await destroy(gastoToDelete);
            setAlert({ type: 'success', message: 'Gasto eliminado con éxito.' });
            fetchGastos(paginationInfo.currentPage);
        } catch (err) { 
            setAlert(handleApiError(err)); 
        } finally {
            closeDeleteModal();
        }
    };

    return { 
        loading, gastos, paginationInfo, filters, alert, setAlert, 
        fetchGastos, 
        handleFilterChange, handleFilterSubmit, handleFilterClear,
        isDeleteModalOpen, openDeleteModal, closeDeleteModal, handleConfirmDelete
    };
};