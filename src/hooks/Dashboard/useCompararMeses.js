import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCompararMesesPagos } from 'services/dashboardService';

export const MAX_MESES = 6;

/**
 * Un color por mes. Paleta categórica validada (daltonismo y modo oscuro).
 * El color se asigna al AGREGAR el mes y no cambia mientras siga elegido,
 * así quitar un mes no repinta a los demás.
 */
export const PALETA_MESES = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#6250d6'],
    dark:  ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#9085e9'],
};

const NOMBRES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const keyDe = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Últimos 24 meses (más reciente primero) para el selector. */
export const mesesDisponibles = () => {
    const hoy = new Date();
    return Array.from({ length: 24 }, (_, i) => {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        return { key: keyDe(d), label: `${NOMBRES[d.getMonth()]} ${d.getFullYear()}` };
    });
};

const ultimos = n => mesesDisponibles().slice(0, n).map(m => m.key).reverse();

export const PRESETS = [
    { id: 'u3', label: 'Últimos 3 meses', meses: () => ultimos(3) },
    { id: 'u6', label: 'Últimos 6 meses', meses: () => ultimos(6) },
    {
        id: 'anio', label: 'Este mes vs hace 1 año',
        meses: () => {
            const hoy = new Date();
            return [keyDe(new Date(hoy.getFullYear() - 1, hoy.getMonth(), 1)), keyDe(hoy)];
        },
    },
];

export const useCompararMeses = ({ isOpen, concepto = 'interes' }) => {
    // [{ key, slot }] — slot = índice de color fijo
    const [seleccion, setSeleccion] = useState(() => ultimos(3).map((key, slot) => ({ key, slot })));
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [data,    setData]    = useState(null);

    const keys    = useMemo(() => seleccion.map(s => s.key).sort(), [seleccion]);
    const keysStr = keys.join(',');

    const slotDe = useCallback(key => seleccion.find(s => s.key === key)?.slot ?? 0, [seleccion]);

    const agregarMes = key => setSeleccion(prev => {
        if (!key || prev.some(s => s.key === key) || prev.length >= MAX_MESES) return prev;
        const usados = new Set(prev.map(s => s.slot));
        const slot = [0, 1, 2, 3, 4, 5].find(i => !usados.has(i)) ?? 0;
        return [...prev, { key, slot }];
    });

    const quitarMes = key => setSeleccion(prev => prev.length <= 1 ? prev : prev.filter(s => s.key !== key));

    const aplicarPreset = presetId => {
        const p = PRESETS.find(x => x.id === presetId);
        if (p) setSeleccion(p.meses().slice(0, MAX_MESES).map((key, slot) => ({ key, slot })));
    };

    const cargar = useCallback(async () => {
        if (!keysStr) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getCompararMesesPagos({ concepto, meses: keysStr });
            setData(res?.data ?? null);
        } catch (e) {
            setError(e?.message || 'No se pudo cargar el comparativo.');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [concepto, keysStr]);

    useEffect(() => { if (isOpen) cargar(); }, [isOpen, cargar]);

    return {
        loading, error, data,
        seleccion, keys, slotDe,
        agregarMes, quitarMes, aplicarPreset,
    };
};