// hooks/CajaChicaMovimiento/useIndex.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { index } from 'services/cajaChicaMovimientoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const SALDO_DEFAULT = { saldo_inicial: 0, saldo_actual: 0 };
const FILTERS_DEFAULT = { search: '', tipo: '', medio_pago: '', fecha_inicio: '', fecha_fin: '' };

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [movimientos, setMovimientos] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [saldo, setSaldo] = useState(SALDO_DEFAULT);

    const [filters, setFilters] = useState(FILTERS_DEFAULT);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);

    const fetchMovimientos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const rawResponse = await index(page, filtersRef.current);
            
            const response = rawResponse.data;

            setMovimientos(response?.data || []);
            setPaginationInfo({
                currentPage: response?.current_page ?? 1,
                totalPages: response?.last_page ?? 1,
                total: response?.total ?? 0
            });
            setSaldo({
                saldo_inicial: Number(response?.saldo_inicial ?? 0),
                saldo_actual: Number(response?.saldo_actual ?? 0),
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar movimientos'));
            setSaldo(SALDO_DEFAULT);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchMovimientos(1); }, [fetchMovimientos]);

    const handleFilterChange = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit = () => { filtersRef.current = filters; fetchMovimientos(1); };
    const handleFilterClear = () => {
        setFilters(FILTERS_DEFAULT);
        filtersRef.current = FILTERS_DEFAULT;
        fetchMovimientos(1);
    };

    return {
        loading, movimientos, paginationInfo, filters, alert, setAlert, saldo,
        fetchMovimientos,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    };
};