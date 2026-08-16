import { useMemo } from 'react';

const ESTADOS_NO_EXIGIBLES = [0, 2, 6];

/**
 * Centraliza toda la lógica de agrupación/ordenamiento del cronograma
 * para la vista de cliente (individual o grupal).
 *
 * Prioridad de urgencia:
 *   1. atrasadas  -> vencidas (estado 4) o parciales (estado 5) con días de atraso > 0.
 *                    Van SIEMPRE primero, sin importar si son completas o parciales,
 *                    porque son las que requieren acción inmediata.
 *   2. proxima    -> la siguiente cuota exigible que aún no está atrasada
 *                    (destacada, pero nunca una parcial).
 *   3. siguientes -> el resto de cuotas pendientes (incluye parciales sin atraso,
 *                    caso borde de una cuota que vence hoy y ya recibió un abono parcial).
 *   4. pagadas    -> estado 2.
 */
export const useCronogramaCliente = (cronograma = [], estadoPrestamo = 1) => {
    return useMemo(() => {
        const items = (cronograma ?? []).map((cuota, i) => ({ cuota, i }));

        const pagadas = items.filter(({ cuota }) => cuota.estado === 2);

        // Atrasadas: lo más urgente. Completas vencidas o parciales con días de atraso.
        const atrasadas = items
            .filter(({ cuota }) => (cuota.estado === 4 || cuota.estado === 5) && (cuota.dias_atraso ?? 0) > 0)
            .sort((a, b) => (a.cuota.nro ?? a.i) - (b.cuota.nro ?? b.i));

        const idsAtrasadas = new Set(atrasadas.map(({ i }) => i));

        // Todo lo demás exigible (ni pagado, ni ya clasificado como atrasado)
        const exigibles = items.filter(
            ({ cuota, i }) => !ESTADOS_NO_EXIGIBLES.includes(cuota.estado) && !idsAtrasadas.has(i)
        );

        // La destacada nunca puede ser una parcial (aunque no esté atrasada)
        const noParciales = exigibles.filter(({ cuota }) => cuota.estado !== 5);
        const parcialesSinAtraso = exigibles.filter(({ cuota }) => cuota.estado === 5);

        const proxima = noParciales[0] ?? null;
        const restoNoParciales = proxima ? noParciales.slice(1) : noParciales;

        const siguientes = [...restoNoParciales, ...parcialesSinAtraso].sort(
            (a, b) => (a.cuota.nro ?? a.i) - (b.cuota.nro ?? b.i)
        );

        const totalExigibles = atrasadas.length + (proxima ? 1 : 0) + siguientes.length + pagadas.length;
        const prestamoTerminado =
            estadoPrestamo === 3 ||
            (!proxima && atrasadas.length === 0 && siguientes.length === 0 && pagadas.length > 0);

        return { atrasadas, proxima, siguientes, pagadas, totalExigibles, prestamoTerminado };
    }, [cronograma, estadoPrestamo]);
};