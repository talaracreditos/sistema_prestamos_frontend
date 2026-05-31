import { useState, useCallback, useEffect, useRef } from 'react';
import { index, pdf, destroy } from 'services/pagoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const FILTERS_INITIAL = { search: '', prestamo_id: '', cliente: '', estado: '', fecha_inicio: '', fecha_fin: '' };

export const useIndex = () => {
    const [loading,        setLoading]        = useState(true);
    const [pagos,          setPagos]          = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters,        setFilters]        = useState(FILTERS_INITIAL);
    const filtersRef = useRef(FILTERS_INITIAL);

    const [alert,          setAlert]          = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfBase64,      setPdfBase64]      = useState(null);
    const [pdfTitle,       setPdfTitle]       = useState('');
    const [pdfLoading,     setPdfLoading]     = useState(false);

    const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
    const [pagoToAnular,      setPagoToAnular]      = useState(null);
    const [anularLoading,     setAnularLoading]     = useState(false);

    const fetchPagos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            if (res?.data) {
                setPagos([...res.data]);
                setPaginationInfo({
                    currentPage: res.current_page,
                    totalPages:  res.last_page,
                    total:       res.total,
                });
            }
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPagos(1); }, [fetchPagos]);

    const handleViewPdf = async (id) => {
        setPdfLoading(true);
        try {
            const res = await pdf(id);
            setPdfBase64(res.data.pdf);
            setPdfTitle(res.data.title);
            setIsPdfModalOpen(true);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setPdfLoading(false);
        }
    };

    const handleFilterSubmit = () => { filtersRef.current = filters; fetchPagos(1); };
    const handleFilterClear  = () => {
        setFilters(FILTERS_INITIAL);
        filtersRef.current = FILTERS_INITIAL;
        fetchPagos(1);
    };

    const openAnularModal = (pago) => { setPagoToAnular(pago); setIsAnularModalOpen(true); };

    const handleConfirmAnular = async (pin) => {
        if (!pagoToAnular) return;
        setAnularLoading(true);
        try {
            await destroy(pagoToAnular.id, pin);
            setAlert({ type: 'success', message: 'Pago anulado y revertido correctamente.' });
            fetchPagos(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setAnularLoading(false);
            setIsAnularModalOpen(false);
            setPagoToAnular(null);
        }
    };

    return {
        loading, pagos, paginationInfo, filters, setFilters, alert, setAlert,
        fetchPagos, handleFilterSubmit, handleFilterClear,
        handleViewPdf, isPdfModalOpen, setIsPdfModalOpen, pdfBase64, pdfTitle, pdfLoading,
        isAnularModalOpen, setIsAnularModalOpen, openAnularModal, handleConfirmAnular, anularLoading,
        pagoToAnular,
    };
};