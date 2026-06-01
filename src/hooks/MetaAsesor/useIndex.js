import { useState, useEffect, useCallback, useRef } from 'react';
import { index, destroy } from 'services/metaAsesorService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const MESES = [
    { value: 1,  label: 'Enero'      }, { value: 2,  label: 'Febrero'   },
    { value: 3,  label: 'Marzo'      }, { value: 4,  label: 'Abril'     },
    { value: 5,  label: 'Mayo'       }, { value: 6,  label: 'Junio'     },
    { value: 7,  label: 'Julio'      }, { value: 8,  label: 'Agosto'    },
    { value: 9,  label: 'Setiembre'  }, { value: 10, label: 'Octubre'   },
    { value: 11, label: 'Noviembre'  }, { value: 12, label: 'Diciembre' },
];

const anioActual = new Date().getFullYear();
export const ANIOS = Array.from({ length: 5 }, (_, i) => anioActual - 2 + i);

export const useIndex = () => {
    const [loading, setLoading]       = useState(true);
    const [metas, setMetas]           = useState([]);
    const [alert, setAlert]           = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filters, setFilters]       = useState({ mes: '', anio: anioActual, asesor_id: '' });
    const filtersRef                  = useRef(filters);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages,  setTotalPages]  = useState(1);
    const [total,       setTotal]       = useState(0);

    const fetchMetas = useCallback(async (f = filtersRef.current, page = 1) => {
        setLoading(true);
        try {
            const res  = await index(f, page);
            const body = res.data || res;
            setMetas(body.data         ?? []);
            setTotal(body.total        ?? 0);
            setTotalPages(body.last_page   ?? 1);
            setCurrentPage(body.current_page ?? 1);
        } catch (err) {
            setAlert(handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMetas(); }, [fetchMetas]);

    const handleFilterChange = (name, val) =>
        setFilters(prev => ({ ...prev, [name]: val }));

    const handleFilterSubmit = () => {
        filtersRef.current = filters;
        fetchMetas(filters, 1);   // volver a página 1 al filtrar
    };

    const handleFilterClear = () => {
        const reset = { mes: '', anio: anioActual, asesor_id: '' };
        setFilters(reset);
        filtersRef.current = reset;
        fetchMetas(reset, 1);
    };

    const handlePageChange = (page) => {
        fetchMetas(filtersRef.current, page);
    };

    const handleAskDelete     = (id) => { setSelectedId(id); setShowDelete(true); };
    const handleConfirmDelete = async () => {
        setShowDelete(false);
        try {
            await destroy(selectedId);
            setAlert({ type: 'success', message: 'Meta eliminada correctamente.' });
            fetchMetas(filtersRef.current, currentPage);
        } catch (err) {
            setAlert(handleApiError(err));
        }
    };

    return {
        loading, metas, alert, setAlert,
        filters, showDelete, setShowDelete,
        // paginación
        pagination: {
            currentPage,
            totalPages,
            total,
            onPageChange: handlePageChange,
        },
        handleFilterChange, handleFilterSubmit, handleFilterClear,
        handleAskDelete, handleConfirmDelete,
    };
};