import { useState, useCallback, useRef, useEffect } from 'react';
import {
    index, show, changeStatus, descargarContrato,
    marcarContratoConforme, asignarCodigoRecaudo,
} from 'services/solicitudPrendarioService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const FILTROS_INICIALES = { search: '', estado: '1' };

const base64ABlobUrl = (base64) => {
    const limpio = base64.startsWith('data:') ? base64.split(',')[1] : base64;
    const bytes  = new Uint8Array(Array.from(atob(limpio), c => c.charCodeAt(0)));
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
};

export const useIndex = () => {
    const [loading,         setLoading]         = useState(true);
    const [solicitudes,     setSolicitudes]     = useState([]);
    const [paginationInfo,  setPaginationInfo]  = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters,         setFilters]         = useState(FILTROS_INICIALES);
    const filtersRef = useRef(FILTROS_INICIALES);
    const [alert, setAlert] = useState(null);

    // Ver detalle
    const [isViewOpen,  setIsViewOpen]  = useState(false);
    const [viewData,    setViewData]    = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Aprobar / Rechazar
    const [isApproveOpen,       setIsApproveOpen]       = useState(false);
    const [selectedSolicitud,   setSelectedSolicitud]   = useState(null);
    const [modalAlert,          setModalAlert]          = useState(null);

    // Contrato
    const [contratoLoading,  setContratoLoading]  = useState(null);
    const [conformeLoading,  setConformeLoading]  = useState(null);
    const [isPdfOpen,        setIsPdfOpen]        = useState(false);
    const [contratoPdf,      setContratoPdf]      = useState(null);
    const [contratoPdfTitle, setContratoPdfTitle] = useState('');

    // Código de recaudo
    const [isCodigoRecaudoOpen,     setIsCodigoRecaudoOpen]     = useState(false);
    const [selectedForCodigo,       setSelectedForCodigo]       = useState(null);
    const [codigoRecaudoLoading,    setCodigoRecaudoLoading]    = useState(false);
    const [codigoRecaudoAlert,      setCodigoRecaudoAlert]      = useState(null);

    const fetchSolicitudes = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setSolicitudes(response.data || []);
            setPaginationInfo({ currentPage: response.current_page, totalPages: response.last_page, total: response.total });
        } catch (err) { setAlert(handleApiError(err)); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchSolicitudes(1); }, [fetchSolicitudes]);

    // ── Filtros ───────────────────────────────────────────────────────────────
    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchSolicitudes(1); };
    const handleFilterClear  = () => {
        setFilters(FILTROS_INICIALES);
        filtersRef.current = FILTROS_INICIALES;
        fetchSolicitudes(1);
    };

    // ── Ver ───────────────────────────────────────────────────────────────────
    const handleView = async (id) => {
        setIsViewOpen(true);
        setViewLoading(true);
        try {
            const response = await show(id);
            setViewData(response.data || response);
        } catch (err) { setAlert(handleApiError(err)); setIsViewOpen(false); }
        finally { setViewLoading(false); }
    };

    // ── Aprobar / Rechazar ────────────────────────────────────────────────────
    const openApproveModal = useCallback((solicitud) => {
        setModalAlert(null);
        setSelectedSolicitud(solicitud);
        setIsApproveOpen(true);
    }, []);

    const handleCloseApproveModal = () => {
        setIsApproveOpen(false);
        setSelectedSolicitud(null);
        setModalAlert(null);
    };

    const handleUpdateStatus = useCallback(async (id, nuevoEstado, abonadoPor = 'CUENTA CORRIENTE') => {
        if (nuevoEstado === 3 && !window.confirm(`¿Rechazar la solicitud prendaria #${id}?`)) return;

        setLoading(true);
        try {
            await changeStatus(id, nuevoEstado, nuevoEstado === 2 ? abonadoPor : null);
            handleCloseApproveModal();
            setAlert({
                type: 'success',
                message: nuevoEstado === 2 ? 'Solicitud aprobada. Préstamo generado.' : 'Solicitud rechazada.',
            });
            fetchSolicitudes(paginationInfo.currentPage);
        } catch (err) {
            if (nuevoEstado === 2) setModalAlert(handleApiError(err));
            else setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, [fetchSolicitudes, paginationInfo.currentPage]);

    // ── Contrato ──────────────────────────────────────────────────────────────
    const handleVerContrato = useCallback(async (row) => {
        setContratoLoading(row.id);
        try {
            const response = await descargarContrato(row.id);
            const data = response.data || response;

            if (!data?.pdf) throw new Error('El servidor no devolvió el contrato.');

            setContratoPdf(base64ABlobUrl(data.pdf));
            setContratoPdfTitle(data.title || `Contrato Prendario — Solicitud #${row.id}`);
            setIsPdfOpen(true);
        } catch (err) { 
            setAlert(handleApiError(err)); 
        } finally { 
            setContratoLoading(null); 
        }
    }, []);

    const handleClosePdf = () => {
        setIsPdfOpen(false);
        if (contratoPdf) URL.revokeObjectURL(contratoPdf);
        setContratoPdf(null);
    };

    const handleMarcarConforme = useCallback(async (id) => {
        setConformeLoading(id);
        setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, contrato_conforme: true } : s));
        try {
            await marcarContratoConforme(id);
        } catch (err) {
            setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, contrato_conforme: false } : s));
            setAlert(handleApiError(err));
        } finally {
            setConformeLoading(null);
        }
    }, []);

    // ── Código de recaudo ─────────────────────────────────────────────────────
    const openCodigoRecaudoModal = useCallback((row) => {
        setCodigoRecaudoAlert(null);
        setSelectedForCodigo(row);
        setIsCodigoRecaudoOpen(true);
    }, []);

    const handleCloseCodigoRecaudoModal = () => {
        setIsCodigoRecaudoOpen(false);
        setSelectedForCodigo(null);
        setCodigoRecaudoAlert(null);
    };

    const handleAsignarCodigoRecaudo = async (id, codigo) => {
        setCodigoRecaudoLoading(true);
        setCodigoRecaudoAlert(null);
        try {
            const response = await asignarCodigoRecaudo(id, codigo);
            const actualizado = response.data || response;
            setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, codigo_recaudo: actualizado.codigo_recaudo || codigo.trim() } : s));
            handleCloseCodigoRecaudoModal();
            setAlert({ type: 'success', message: 'Código de recaudo asignado.' });
            fetchSolicitudes(paginationInfo.currentPage);
        } catch (err) {
            setCodigoRecaudoAlert(handleApiError(err));
        } finally {
            setCodigoRecaudoLoading(false);
        }
    };

    return {
        loading, solicitudes, paginationInfo, filters, alert, setAlert, fetchSolicitudes,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
        // Ver
        isViewOpen, setIsViewOpen, viewData, viewLoading, handleView,
        // Aprobar / Rechazar
        isApproveOpen, selectedSolicitud, openApproveModal, handleCloseApproveModal,
        handleUpdateStatus, modalAlert, setModalAlert,
        // Contrato
        handleVerContrato, contratoLoading, isPdfOpen, handleClosePdf, contratoPdf, contratoPdfTitle,
        handleMarcarConforme, conformeLoading,
        // Código de recaudo
        isCodigoRecaudoOpen, selectedForCodigo, codigoRecaudoLoading, codigoRecaudoAlert, setCodigoRecaudoAlert,
        openCodigoRecaudoModal, handleCloseCodigoRecaudoModal, handleAsignarCodigoRecaudo,
    };
};