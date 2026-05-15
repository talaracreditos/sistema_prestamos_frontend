import { useMemo } from 'react';

/**
 * Hook que lee los datos YA CALCULADOS por el backend.
 * Cero lógica de negocio aquí — el backend manda todo listo.
 *
 * Campos excedente por contexto:
 *  - Vista integrante (esVistaIntegrante=true):
 *      excedente_anterior  → lo que venía de su cuota anterior (individual del integrante)
 *      excedente_aplicado  → cuánto se aplicó a capital
 *      excedente_consumido → cuánto se consumió en esta cuota
 *      excedente_generado  → cuánto generó (pasa a su siguiente cuota)
 *
 *  - Vista global préstamo individual (esVistaIntegrante=false, sin integrantes):
 *      excedente_anterior  → excedente global de la cuota
 *      excedente_consumido → consumido
 *      excedente_generado  → generado
 *
 *  - Vista global préstamo grupal (esVistaIntegrante=false, con integrantes):
 *      Los excedentes se leen de cuota.integrantes[n].excedente_* (por integrante)
 */
export const useCuotaData = (cuota, i, esVistaIntegrante) =>
    useMemo(() => {
        /* ── Identidad ── */
        const nro   = cuota.nro ?? i + 1;
        const monto = parseFloat(cuota.total_cuota ?? cuota.monto ?? 0);

        /* ── Componentes de la cuota ── */
        const capital = parseFloat(cuota.capital ?? 0);
        const interes = parseFloat(cuota.interes ?? 0);

        /* ── Seguro ── */
        const seguro    = parseFloat(cuota.seguro ?? 0);
        const segPagado = parseFloat(cuota.seguro_pagado ?? 0);
        const segPend   = parseFloat(cuota.seguro_pendiente ?? Math.max(0, seguro - segPagado));

        /* ── Capital / Interés pagados y pendientes ── */
        const capPagado = parseFloat(cuota.capital_pagado ?? 0);
        const intPagado = parseFloat(cuota.interes_pagado ?? 0);
        const capPend   = parseFloat(cuota.capital_pendiente ?? Math.max(0, capital - capPagado));
        const intPend   = parseFloat(cuota.interes_pendiente ?? Math.max(0, interes - intPagado));

        /* ── Mora ── */
        const moraTotal  = parseFloat(cuota.mora_total ?? cuota.mora ?? 0);
        const moraPagada = parseFloat(cuota.mora_pagada ?? 0);
        const moraPend   = Math.max(0, moraTotal - moraPagada);

        /* ── Pagos recibidos ── */
        const abonado = esVistaIntegrante
            ? parseFloat(cuota.pago_total_real ?? cuota.pago_acumulado ?? 0)
            : parseFloat(cuota.pago_realizado  ?? cuota.pago_acumulado ?? 0);
        const acumInd       = esVistaIntegrante ? parseFloat(cuota.pago_acumulado ?? 0) : 0;
        const pagoAcumGrupo = !esVistaIntegrante ? parseFloat(cuota.pago_acumulado ?? 0) : 0;

        /* ── Saldo y atraso ── */
        const saldo      = parseFloat(cuota.saldo_pendiente ?? cuota.saldo_real ?? 0);
        const diasAtraso = cuota.dias_atraso || 0;

        /* ── Excedentes — backend los manda calculados ── */
        const excAnterior  = parseFloat(cuota.excedente_anterior  ?? 0); // lo que venía
        const excAplicado  = parseFloat(cuota.excedente_aplicado  ?? 0); // aplicado a capital
        const excConsumido = parseFloat(cuota.excedente_consumido ?? 0); // consumido esta cuota
        const excGenerado  = parseFloat(cuota.excedente_generado  ?? 0); // generó → pasa adelante

        /* ── Flags de estado ── */
        const esCancelada    = cuota.estado === 0;
        const esRefinanciada = cuota.estado === 6;
        const esInactiva     = esCancelada || esRefinanciada;
        const mostrarRecibido = abonado > 0;

        let estadoGlobal = cuota.estado;
        if (!esVistaIntegrante && cuota.integrantes?.length > 0 && !esInactiva) {
            if (saldo <= 0)      estadoGlobal = 2;
            else if (abonado > 0) estadoGlobal = 5;
        }

        /* ── ¿Tiene algo en sección de abonos? ── */
        const tieneAbonos =
            mostrarRecibido          ||
            acumInd > 0              ||
            pagoAcumGrupo > 0        ||
            moraPagada > 0           ||
            excAnterior > 0          ||
            excConsumido > 0         ||
            excGenerado > 0          ||
            excAplicado > 0;

        /* ── ¿Tiene excedente que mostrar? ── */
        const tieneExcedente = excAnterior > 0 || excConsumido > 0 || excGenerado > 0 || excAplicado > 0;

        return {
            /* identidad */
            nro, monto,
            /* componentes */
            capital, interes,
            seguro, segPagado, segPend,
            capPagado, intPagado, capPend, intPend,
            /* mora */
            moraTotal, moraPagada, moraPend,
            /* pagos */
            abonado, acumInd, pagoAcumGrupo,
            /* saldo */
            saldo, diasAtraso,
            /* excedentes (todos del backend) */
            excAnterior, excAplicado, excConsumido, excGenerado,
            /* flags */
            esCancelada, esRefinanciada, esInactiva,
            mostrarRecibido, estadoGlobal,
            tieneAbonos, tieneExcedente,
        };
    }, [cuota, i, esVistaIntegrante]);