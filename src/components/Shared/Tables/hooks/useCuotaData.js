import { useMemo } from 'react';

export const useCuotaData = (cuota, i, esVistaIntegrante) =>
    useMemo(() => {
        const nro  = cuota.nro ?? i + 1;
        const esPrendario = !!cuota.es_prendario;
        let estadoGlobal = cuota.estado;
        
        const esCancelada    = estadoGlobal === 0;
        const esPagada       = estadoGlobal === 2;
        const esRefinanciada = estadoGlobal === 6;
        const esInactiva     = esCancelada || esRefinanciada;

        const capital   = parseFloat(cuota.capital ?? 0);
        const interes   = parseFloat(cuota.interes ?? 0);
        const seguro    = parseFloat(cuota.seguro ?? 0);
        const custodia  = parseFloat(cuota.custodia ?? 0);
        const monto     = parseFloat(cuota.total_cuota ?? cuota.monto ?? 0);

        const capPagado = parseFloat(cuota.capital_pagado ?? 0);
        const intPagado = parseFloat(cuota.interes_pagado ?? 0);
        const segPagado = parseFloat(cuota.seguro_pagado ?? 0);
        const custodiaPagada = parseFloat(cuota.custodia_pagada ?? 0);

        const capPend   = parseFloat(cuota.capital_pendiente ?? 0);
        const intPendMes = parseFloat(cuota.interes_pendiente ?? 0);
        const segPendMes   = parseFloat(cuota.seguro_pendiente ?? 0);
        const custodiaPendMes = parseFloat(cuota.custodia_pendiente ?? 0);

        const moraTotal  = parseFloat(cuota.mora_total ?? 0);
        const moraPagada = parseFloat(cuota.mora_pagada ?? 0);
        const moraPend   = parseFloat(cuota.mora ?? 0);
        const diasAtraso = parseInt(cuota.dias_atraso ?? 0);

        const abonado = esVistaIntegrante 
            ? parseFloat(cuota.pago_total_real ?? cuota.pago_acumulado ?? 0) 
            : parseFloat(cuota.pago_realizado  ?? cuota.pago_acumulado ?? 0);
        const acumInd       = esVistaIntegrante ? parseFloat(cuota.pago_acumulado ?? 0) : 0;
        const pagoAcumGrupo = !esVistaIntegrante ? parseFloat(cuota.pago_acumulado ?? 0) : 0;

        const excAnterior  = parseFloat(cuota.excedente_anterior  ?? 0);
        const excAplicado  = parseFloat(cuota.excedente_aplicado  ?? 0);
        const excConsumido = parseFloat(cuota.excedente_consumido ?? 0);
        const excGenerado  = parseFloat(cuota.excedente_generado  ?? 0);

        const mostrarRecibido = abonado > 0;
        const tieneAbonos = mostrarRecibido || acumInd > 0 || pagoAcumGrupo > 0 || moraPagada > 0 || excAnterior > 0 || excConsumido > 0 || excGenerado > 0 || excAplicado > 0;
        const tieneExcedente = excAnterior > 0 || excConsumido > 0 || excGenerado > 0 || excAplicado > 0;

        const aplicaLiquidacion = esPrendario && !esPagada && !esInactiva;
        const liqPatear = cuota.liquidacion_hoy?.modos?.patear;
        const diasLiquidacion = cuota.liquidacion_hoy?.dias ?? null;

        const intDevengadoHoy = liqPatear ? parseFloat(liqPatear.interes ?? 0) : null;
        const custodiaDevengadaHoy = liqPatear ? parseFloat(liqPatear.custodia ?? 0) : null;
        const seguroDevengadoHoy = liqPatear ? parseFloat(liqPatear.seguro ?? 0) : null; // 🔥 AHORA SÍ SACAMOS EL SEGURO
        const cancelacionTotalHoy = liqPatear ? parseFloat(liqPatear.cancelacion_total ?? 0) : null;

        const intPend = aplicaLiquidacion && intDevengadoHoy != null ? intDevengadoHoy : intPendMes;
        const custodiaPend = aplicaLiquidacion && custodiaDevengadaHoy != null ? custodiaDevengadaHoy : custodiaPendMes;
        const segPend = aplicaLiquidacion && seguroDevengadoHoy != null ? seguroDevengadoHoy : segPendMes; // 🔥 PENDIENTE REAL
        const saldo = aplicaLiquidacion && cancelacionTotalHoy != null ? cancelacionTotalHoy : parseFloat(cuota.saldo_pendiente ?? cuota.saldo_real ?? 0);

        const interesTotalUi = aplicaLiquidacion && intDevengadoHoy != null ? (intPagado + intDevengadoHoy) : interes;
        const custodiaTotalUi = aplicaLiquidacion && custodiaDevengadaHoy != null ? (custodiaPagada + custodiaDevengadaHoy) : custodia;
        const seguroTotalUi = aplicaLiquidacion && seguroDevengadoHoy != null ? (segPagado + seguroDevengadoHoy) : seguro; // 🔥 TOTAL UI
        
        const montoTotalUi = aplicaLiquidacion ? (capital + interesTotalUi + seguroTotalUi + custodiaTotalUi + moraPend) : monto; // 🔥 SUMA PERFECTA

        if (!esVistaIntegrante && cuota.integrantes?.length > 0 && !esInactiva) {
            if (saldo <= 0)      estadoGlobal = 2;
            else if (abonado > 0) estadoGlobal = 5;
        }

        return {
            nro, monto: montoTotalUi, capital, interes: interesTotalUi, seguro: seguroTotalUi, segPagado, segPend, 
            capPagado, intPagado, capPend, intPend, intPendMes,
            moraTotal, moraPagada, moraPend, abonado, acumInd, pagoAcumGrupo, saldo, diasAtraso,
            excAnterior, excAplicado, excConsumido, excGenerado, esCancelada, esRefinanciada, esInactiva, mostrarRecibido, estadoGlobal, tieneAbonos, tieneExcedente,
            esPrendario, custodia: custodiaTotalUi, custodiaPagada, custodiaPend, custodiaPendMes, diasLiquidacion, intDevengadoHoy, custodiaDevengadaHoy, seguroDevengadoHoy
        };
    }, [cuota, i, esVistaIntegrante]);