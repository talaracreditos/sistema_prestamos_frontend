import { useState, useEffect, useCallback } from 'react';
import { getAccesosDashboard } from 'services/dashboardService';

export const useDashboardAccesos = () => {
    const [loading,        setLoading]        = useState(true);
    const [data,           setData]           = useState(null);
    const [pageRecientes,  setPageRecientes]  = useState(1);
    const [pageNunca,      setPageNunca]      = useState(1);

    const fetchData = useCallback(async (pRec = 1, pNun = 1) => {
        setLoading(true);
        try {
            const json = await getAccesosDashboard({
                page_recientes: pRec,
                page_nunca:     pNun,
                per_page:       10,
            });
            setData(json.data || json);
        } catch (e) {
            console.error('Error accesos:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(1, 1); }, [fetchData]);

    const handlePageRecientes = (page) => {
        setPageRecientes(page);
        fetchData(page, pageNunca);
    };

    const handlePageNunca = (page) => {
        setPageNunca(page);
        fetchData(pageRecientes, page);
    };

    return {
        loading,
        data,
        resumen:   data?.resumen ?? {},
        recientes: data?.recientes ?? { data: [], total: 0, current_page: 1, last_page: 1 },
        nunca:     data?.nunca     ?? { data: [], total: 0, current_page: 1, last_page: 1 },
        refresh:          () => fetchData(pageRecientes, pageNunca),
        handlePageRecientes,
        handlePageNunca,
    };
};