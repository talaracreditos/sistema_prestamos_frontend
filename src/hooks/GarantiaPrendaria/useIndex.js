import { useState, useCallback, useEffect, useRef } from 'react';
import { index, show } from 'services/garantiaPrendariaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';

const FILTERS_INITIAL = {
    search:      '',
    prestamo_id: '',
    cliente:     '',
    estado:      '',
};

export const useIndex = () => {
    const { can } = useAuth();

    const [loading,        setLoading]        = useState(true);
    const [garantias,      setGarantias]      = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters,        setFilters]        = useState(FILTERS_INITIAL);
    const filtersRef = useRef(FILTERS_INITIAL);

    const [alert, setAlert] = useState(null);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData,        setViewData]        = useState(null);
    const [viewLoading,     setViewLoading]     = useState(false);

    const fetchGarantias = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            // El backend puede devolver el paginador directo o envuelto en
            // { type, message, data }: se toma el objeto que trae la lista.
            const pag = Array.isArray(res?.data) ? res : res?.data;

            if (pag?.data) {
                setGarantias([...pag.data]);
                setPaginationInfo({
                    currentPage: pag.current_page,
                    totalPages:  pag.last_page,
                    total:       pag.total,
                });
            }
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchGarantias(1); }, [fetchGarantias]);

    const handleFilterSubmit = () => {
        filtersRef.current = filters;
        fetchGarantias(1);
    };

    const handleFilterClear = () => {
        setFilters(FILTERS_INITIAL);
        filtersRef.current = FILTERS_INITIAL;
        fetchGarantias(1);
    };

    const handleView = async (id) => {
        setViewData(null);
        setIsViewModalOpen(true);
        setViewLoading(true);
        try {
            const res = await show(id);
            setViewData(res.data || res);
        } catch (err) {
            setIsViewModalOpen(false);
            setAlert(handleApiError(err, 'No se pudo cargar el detalle de la garantía.'));
        } finally {
            setViewLoading(false);
        }
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewData(null);
    };

    return {
        loading, garantias, paginationInfo, filters, setFilters, alert, setAlert,
        fetchGarantias, handleFilterSubmit, handleFilterClear,
        handleView, isViewModalOpen, closeViewModal, viewData, viewLoading,
        canShow: can('garantiaPrendaria.show'),
    };
};