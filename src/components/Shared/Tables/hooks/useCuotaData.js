import { useMemo } from 'react';

export const useCuotaData = (cuota, i, esVistaIntegrante) =>
    useMemo(() => {
        /* ── Identidad ── */
        const nro  = cuota.nro ?? i + 1;
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

        /* ── Mora (Usamos directamente cuota.mora que mapea al saldo_mora real del backend) ── */
        const moraTotal  = parseFloat(cuota.mora_total ?? 0);
        const moraPagada = parseFloat(cuota.mora_pagada ?? 0);
        const moraPend   = parseFloat(cuota.mora ?? 0);

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
        const excAnterior  = parseFloat(cuota.excedente_anterior  ?? 0);
        const excAplicado  = parseFloat(cuota.excedente_aplicado  ?? 0);
        const excConsumido = parseFloat(cuota.excedente_consumido ?? 0);
        const excGenerado  = parseFloat(cuota.excedente_generado  ?? 0);

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

        const tieneAbonos =
            mostrarRecibido          ||
            acumInd > 0              ||
            pagoAcumGrupo > 0        ||
            moraPagada > 0           ||
            excAnterior > 0          ||
            excConsumido > 0         ||
            excGenerado > 0          ||
            excAplicado > 0;

        const tieneExcedente = excAnterior > 0 || excConsumido > 0 || excGenerado > 0 || excAplicado > 0;

        return {
            nro, monto,
            capital, interes,
            seguro, segPagado, segPend,
            capPagado, intPagado, capPend, intPend,
            moraTotal, moraPagada, moraPend,
            abonado, acumInd, pagoAcumGrupo,
            saldo, diasAtraso,
            excAnterior, excAplicado, excConsumido, excGenerado,
            esCancelada, esRefinanciada, esInactiva,
            mostrarRecibido, estadoGlobal,
            tieneAbonos, tieneExcedente,
        };
    }, [cuota, i, esVistaIntegrante]);