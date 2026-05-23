import { useState, useCallback, useRef, useEffect } from 'react';
import { index, changeStatus, show, descargarContrato, marcarContratoConforme } from 'services/solicitudPrestamoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [solicitudes, setSolicitudes] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ search: '', estado: '1' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [modalAlert, setModalAlert] = useState(null); // alert exclusivo del modal

    const [contratoLoading, setContratoLoading] = useState(null);
    const [conformeLoading, setConformeLoading] = useState(null);

    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const [contratoPdf, setContratoPdf] = useState(null);
    const [contratoPdfTitle, setContratoPdfTitle] = useState('');

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

    const handleView = async (id) => {
        setIsViewOpen(true);
        setViewLoading(true);
        try {
            const response = await show(id);
            setViewData(response.data || response);
        } catch (err) { setAlert(handleApiError(err)); setIsViewOpen(false); }
        finally { setViewLoading(false); }
    };

    const openApproveModal = (solicitud) => {
        setModalAlert(null);
        setSelectedSolicitud(solicitud);
        setIsApproveOpen(true);
    };

    const handleCloseApproveModal = () => {
        setIsApproveOpen(false);
        setSelectedSolicitud(null);
        setModalAlert(null);
    };

    const handleUpdateStatus = async (id, nuevoEstado, abonadoPor = 'CUENTA CORRIENTE', codigoRecaudo = null) => {
        setLoading(true);
        try {
            await changeStatus(id, nuevoEstado, abonadoPor, codigoRecaudo);
            setIsApproveOpen(false);
            setSelectedSolicitud(null);
            setModalAlert(null);
            setAlert({ type: 'success', message: 'Solicitud procesada correctamente.' });
            fetchSolicitudes(paginationInfo.currentPage);
        } catch (err) {
            setModalAlert(handleApiError(err)); // error va al modal, no a la página
        } finally {
            setLoading(false);
        }
    };

    const handleVerContrato = async (row) => {
        setContratoLoading(row.id);
        try {
            const response = await descargarContrato(row.id);
            const pdf = response.data.pdf;
            const byteArray = new Uint8Array(Array.from(atob(pdf), c => c.charCodeAt(0)));
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setContratoPdf(url);
            setContratoPdfTitle(`Contrato Grupal — Solicitud #${row.id}`);
            setIsPdfOpen(true);
        } catch (err) { setAlert(handleApiError(err)); }
        finally { setContratoLoading(null); }
    };

    const handleMarcarConforme = async (solicitudId) => {
        setConformeLoading(solicitudId);
        setSolicitudes(prev => prev.map(s => s.id === solicitudId ? { ...s, contrato_conforme: true } : s));
        try {
            await marcarContratoConforme(solicitudId);
        } catch (err) {
            setSolicitudes(prev => prev.map(s => s.id === solicitudId ? { ...s, contrato_conforme: false } : s));
            setAlert(handleApiError(err));
        } finally { setConformeLoading(null); }
    };

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchSolicitudes(1); };
    const handleFilterClear = () => {
        const res = { search: '', estado: '1' };
        setFilters(res); filtersRef.current = res; fetchSolicitudes(1);
    };

    return {
        loading, solicitudes, paginationInfo, filters, alert, setAlert,
        handleUpdateStatus, handleFilterChange, handleFilterSubmit, handleFilterClear,
        fetchSolicitudes, isViewOpen, setIsViewOpen, viewData, viewLoading, handleView,
        isApproveOpen, selectedSolicitud, openApproveModal, handleCloseApproveModal,
        modalAlert, setModalAlert,
        handleVerContrato, contratoLoading,
        isPdfOpen, setIsPdfOpen, contratoPdf, contratoPdfTitle,
        handleMarcarConforme, conformeLoading,
    };
};