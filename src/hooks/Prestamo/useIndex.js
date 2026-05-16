import { useState, useCallback, useRef, useEffect } from 'react';
import { index, show, deletePrestamo } from 'services/prestamoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [prestamos, setPrestamos] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });

    const [filters, setFilters] = useState({ search: '', estado: '1' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const viewIdRef = useRef(null); // ← guardar el id del préstamo abierto

    const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
    const [selectedAbonoUrl, setSelectedAbonoUrl] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchPrestamos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setPrestamos(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                total: response.total,
            });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPrestamos(1); }, [fetchPrestamos]);

    const handleView = async (id) => {
        setIsViewOpen(true);
        setViewLoading(true);
        viewIdRef.current = id;
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

    // ── Recargar solo el préstamo abierto (sin cerrar el modal) ──────────────
    const handleRefreshView = useCallback(async () => {
        if (!viewIdRef.current) return;
        setViewLoading(true);
        try {
            const response = await show(viewIdRef.current);
            setViewData(response.data || response);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setViewLoading(false);
        }
        // También refresca la lista en segundo plano
        fetchPrestamos(paginationInfo.currentPage);
    }, [fetchPrestamos, paginationInfo.currentPage]);

    const handleOpenAbono = (url) => {
        setSelectedAbonoUrl(url);
        setIsAbonoModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setSelectedDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await deletePrestamo(selectedDeleteId);
            setAlert({ type: 'success', message: 'Préstamo cancelado correctamente.' });
            setIsDeleteModalOpen(false);
            fetchPrestamos(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchPrestamos(1); };
    const handleFilterClear = () => {
        const res = { search: '', estado: '1' };
        setFilters(res);
        filtersRef.current = res;
        fetchPrestamos(1);
    };

    return {
        loading, prestamos, paginationInfo, filters, alert, setAlert,
        handleFilterChange, handleFilterSubmit, handleFilterClear, fetchPrestamos,
        handleView, isViewOpen, setIsViewOpen, viewData, viewLoading,
        handleRefreshView, // ← nuevo
        handleOpenAbono, isAbonoModalOpen, setIsAbonoModalOpen, selectedAbonoUrl,
        isDeleteModalOpen, setIsDeleteModalOpen, openDeleteModal, handleConfirmDelete, deleteLoading,
    };
};