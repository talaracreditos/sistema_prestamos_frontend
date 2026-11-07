import { useState, useEffect, useCallback, useRef } from 'react';
import { index, destroy, recibo } from 'services/ventaAdjudicadoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';

const FILTERS_INITIAL = {
    search:       '',
    fecha_inicio: '',
    fecha_fin:    '',
    estado:       '',
    metodo_pago:  '',
};

export const useIndex = () => {
    const { can } = useAuth();

    const [loading,        setLoading]        = useState(true);
    const [ventas,         setVentas]         = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters,        setFilters]        = useState(FILTERS_INITIAL);
    const [appliedFilters, setAppliedFilters] = useState(FILTERS_INITIAL);
    const filtersRef = useRef(FILTERS_INITIAL);

    const [alert,             setAlert]             = useState(null);
    const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
    const [ventaToAnular,     setVentaToAnular]     = useState(null);
    const [anularLoading,     setAnularLoading]     = useState(false);

    const [pdfLoading,     setPdfLoading]     = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfBase64,      setPdfBase64]      = useState(null);
    const [pdfTitle,       setPdfTitle]       = useState('');

    // ── Permisos por acción ──────────────────────────────────────────────────
    const canRecibo     = can('ventaAdjudicado.generatePDF');
    const canDelete     = can('ventaAdjudicado.delete');
    const mostrarAcciones = canRecibo || canDelete;

    const fetchVentas = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            if (res?.data) {
                setVentas([...res.data]);
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

    useEffect(() => { fetchVentas(1); }, [fetchVentas]);

    const handleFilterSubmit = () => {
        filtersRef.current = filters;
        setAppliedFilters(filters);
        fetchVentas(1);
    };

    const handleFilterClear = () => {
        setFilters(FILTERS_INITIAL);
        filtersRef.current = FILTERS_INITIAL;
        setAppliedFilters(FILTERS_INITIAL);
        fetchVentas(1);
    };

    const handleViewRecibo = async (id) => {
        setPdfLoading(true);
        try {
            const res = await recibo(id);
            setPdfBase64(res.data.pdf);
            setPdfTitle(res.data.title);
            setIsPdfModalOpen(true);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setPdfLoading(false);
        }
    };

    const openAnularModal = (venta) => {
        setVentaToAnular(venta);
        setIsAnularModalOpen(true);
    };

    const handleConfirmAnular = async (pin) => {
        if (!ventaToAnular) return;
        setAnularLoading(true);
        try {
            await destroy(ventaToAnular.id, {
                pin,
                motivo: 'Anulada desde módulo Ventas Adjudicados',
            });
            setAlert({ type: 'success', message: 'Venta anulada correctamente.' });
            fetchVentas(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setAnularLoading(false);
            setIsAnularModalOpen(false);
            setVentaToAnular(null);
        }
    };

    // Anular: venta activa + permiso de borrado
    const canAnular = (venta) => venta.estado === 1 && canDelete;

    // Recibo: venta activa + permiso de recibo
    const canVerRecibo = (venta) => venta.estado === 1 && canRecibo;

    return {
        loading, ventas, paginationInfo,
        filters, setFilters, appliedFilters,
        alert, setAlert,
        fetchVentas, handleFilterSubmit, handleFilterClear,
        handleViewRecibo, pdfLoading, isPdfModalOpen, setIsPdfModalOpen, pdfBase64, pdfTitle,
        isAnularModalOpen, setIsAnularModalOpen, openAnularModal,
        handleConfirmAnular, anularLoading, ventaToAnular,
        canAnular, canVerRecibo, mostrarAcciones,
    };
};