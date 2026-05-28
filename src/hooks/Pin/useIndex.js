import { useState, useCallback, useRef, useEffect } from 'react';
import { index, destroy } from 'services/pinService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [pins, setPins]                     = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ usuario_id: '', generado_por_id: '', activo: '' });
    const [alert, setAlert]                   = useState(null);
    const filtersRef                          = useRef(filters);

    const [comboKey, setComboKey] = useState(Date.now());

    // ── Confirm modal ─────────────────────────────────────────────────────────
    const [isConfirmOpen,  setIsConfirmOpen]  = useState(false);
    const [pinToInhabilitar, setPinToInhabilitar] = useState(null);

    const fetchPins = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setPins(res.data || []);
            setPaginationInfo({ currentPage: res.current_page, totalPages: res.last_page, total: res.total });
        } catch (err) {
            setAlert(handleApiError(err));
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPins(1); }, [fetchPins]);

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchPins(1); };
    const handleFilterClear  = () => {
        const reset = { usuario_id: '', generado_por_id: '', activo: '' };
        setFilters(reset);
        filtersRef.current = reset;
        setComboKey(Date.now());
        fetchPins(1);
    };

    // Abre el modal de confirmación
    const openInhabilitarModal = (id) => {
        setPinToInhabilitar(id);
        setIsConfirmOpen(true);
    };

    // Ejecuta tras confirmar
    const handleConfirmInhabilitar = async () => {
        if (!pinToInhabilitar) return;
        setIsConfirmOpen(false);
        setLoading(true);
        try {
            await destroy(pinToInhabilitar);
            setAlert({ type: 'success', message: 'PIN inhabilitado correctamente.' });
            fetchPins(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setPinToInhabilitar(null);
            setLoading(false);
        }
    };

    return {
        loading, pins, paginationInfo, filters, alert, setAlert, comboKey,
        fetchPins, handleFilterChange, handleFilterSubmit, handleFilterClear,
        isConfirmOpen, setIsConfirmOpen,
        openInhabilitarModal, handleConfirmInhabilitar,
    };
};