import { useState, useCallback, useRef, useEffect } from 'react';
import { index, show, destroy, descargarTasacion } from 'services/tasacionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';

export const useIndex = () => {
    const { can } = useAuth();

    // ── Permisos ──────────────────────────────────────────────────────────────
    const canShow = can('tasacion.show');
    const canUpdate = can('tasacion.update');
    const canDelete = can('tasacion.delete');
    const canStore = can('tasacion.store');
    const canPdf = can('tasacion.generatePDF');
    const canDoAnyAction = canShow || canUpdate || canDelete || canPdf;

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

    // ── PDF de tasación ──────────────────────────────────────────────────────
    const [pdfLoading, setPdfLoading] = useState(null);
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [pdfBase64, setPdfBase64] = useState(null);
    const [pdfTitle, setPdfTitle] = useState('');

    const handleVerPdf = async (id) => {
        if (!canPdf) return;
        setPdfLoading(id);
        try {
            const response = await descargarTasacion(id);
            setPdfBase64(response.data?.pdf || null);
            setPdfTitle(response.data?.title || 'Tasación');
            setIsPdfOpen(true);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally { setPdfLoading(null); }
    };

    const handleClosePdf = () => {
        setIsPdfOpen(false);
        setPdfBase64(null);
    };

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


    const handleView = async (id) => {
        if (!canShow) return;
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

    const handleAskDelete = (id) => {
        if (!canDelete) return;
        setSelectedId(id); setShowDelete(true);
    };
    const handleConfirmDelete = async () => {
        if (!canDelete) return;
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
        pdfLoading, isPdfOpen, pdfBase64, pdfTitle, handleVerPdf, handleClosePdf,
        fetchTasaciones, handleAskDelete, handleConfirmDelete,
        handleFilterChange, handleFilterSubmit, handleFilterClear,

        // permisos
        canShow, canUpdate, canDelete, canStore, canPdf, canDoAnyAction,
    };
};