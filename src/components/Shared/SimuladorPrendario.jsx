import React, { useMemo, useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { CalculatorIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100;

const addDias = (fechaIso, dias) => {
    const d = new Date(`${fechaIso}T00:00:00`);
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
};

const QUICK_DIAS = [30, 60, 90, 120, 150, 180];

/**
 * Simulador de pago prendario — SOLO frontend, sin llamadas al backend.
 * Reconstruye las "bases" (capital de la cuota, tasa mensual, seguro y
 * custodia por período, tasa efectiva de IGV) a partir de lo que YA trae
 * el `show` del préstamo (liquidacion_hoy + datos_economicos + cronograma),
 * y proyecta cuánto sería el interés/seguro/custodia/deuda total N días
 * MÁS ADELANTE de hoy — mismas fórmulas que
 * PrendarioCalculoService::devengado() / liquidarModo() en el backend.
 *
 * IMPORTANTE: los días son SIEMPRE adicionales a partir de hoy (día actual
 * de la liquidación + N), nunca un día absoluto desde el inicio del
 * período. El préstamo puede ya llevar, por ejemplo, 152 días transcurridos
 * — "simular 90 días" significaría viajar al pasado (90 < 152) y la resta
 * contra lo ya pagado daría negativo. Por eso SIEMPRE se parte de "hoy"
 * (liq.dias) y se le suman los días elegidos.
 *
 * La MORA se calcula como tasa diaria × días de atraso en la fecha
 * simulada — NO como un monto fijo que se arrastra igual sin importar
 * cuántos días proyectes.
 *
 * El INTERÉS se calcula sobre capital + seguro financiado (bases.seguroBase),
 * NO sobre el capital puro — mismo criterio que
 * PrendarioCalculoService::devengado() en el backend y que la Calculadora
 * de la solicitud (GenerarPrestamo::calcularFinanciamiento).
 */
const SimuladorPrendario = ({ prestamoDetalle }) => {
    const [open, setOpen] = useState(false);
    const [diasExtra, setDiasExtra] = useState(30);
    const [moraPorDiaManual, setMoraPorDiaManual] = useState('');
    const [penalidadManual, setPenalidadManual] = useState('');

    const liq = prestamoDetalle?.liquidacion_hoy;
    const esPrendario = !!prestamoDetalle?.es_prendario;

    // ── Bases derivadas de la liquidación actual (modo 'cancelar' trae
    // el detalle completo: devengado bruto + neto pendiente + igv real). ──
    const bases = useMemo(() => {
        if (!liq?.modos?.cancelar) return null;

        const diasMes   = liq.dias_mes ?? 30;
        const diasHoy   = liq.dias ?? 0;
        const cancelar  = liq.modos.cancelar;
        const devengado = cancelar.devengado ?? {};

        const factorFijoHoy = Math.max(1, diasHoy / diasMes);

        const capitalCuota = parseFloat(prestamoDetalle?.cronograma?.[0]?.capital ?? 0);
        const tasaMensual  = parseFloat(prestamoDetalle?.datos_economicos?.interes_porc ?? 0);

        const seguroBase   = factorFijoHoy > 0 ? (parseFloat(devengado.seguro   ?? 0) / factorFijoHoy) : 0;
        const custodiaBase = factorFijoHoy > 0 ? (parseFloat(devengado.custodia ?? 0) / factorFijoHoy) : 0;

        const interesPagado   = Math.max(0, parseFloat(devengado.interes   ?? 0) - parseFloat(cancelar.interes   ?? 0));
        const seguroPagado    = Math.max(0, parseFloat(devengado.seguro    ?? 0) - parseFloat(cancelar.seguro    ?? 0));
        const custodiaPagado  = Math.max(0, parseFloat(devengado.custodia  ?? 0) - parseFloat(cancelar.custodia  ?? 0));

        const cargosOrig = parseFloat(cancelar.cargos ?? 0);
        const igvOrig     = parseFloat(cancelar.igv ?? 0);
        const igvRate     = cargosOrig > 0 ? Math.round((igvOrig / cargosOrig) * 100) / 100 : 0.18;

        const diasAtrasoHoy = Math.max(0, diasHoy - diasMes);
        const moraHoy = parseFloat(cancelar.mora ?? 0);
        // Tasa diaria implícita: la mora NO es un monto fijo, crece con los
        // días de atraso. Si ya hay mora acumulada, de ahí se deriva cuánto
        // es por día; si todavía no entra en mora, queda en 0 y el operador
        // la completa a mano (la tasa de mora diaria es un parámetro de BD
        // que no viaja en el payload del préstamo).
        const moraPorDiaDefault = diasAtrasoHoy > 0 ? round2(moraHoy / diasAtrasoHoy) : 0;

        return {
            diasMes,
            diasHoy,
            diasAtrasoHoy,
            fechaCorte: liq.fecha_corte,
            capitalCuota,
            capitalPendiente: parseFloat(cancelar.capital ?? 0),
            tasaMensual,
            seguroBase,
            custodiaBase,
            interesPagado,
            seguroPagado,
            custodiaPagado,
            creditoActual: parseFloat(cancelar.credito ?? 0),
            moraHoy,
            moraPorDiaDefault,
            igvRate,
        };
    }, [liq, prestamoDetalle]);

    const fechaSimulada = bases ? addDias(bases.fechaCorte, diasExtra) : null;

    const resultado = useMemo(() => {
        if (!bases) return null;

        const diasSimTotal     = bases.diasHoy + diasExtra;
        const factorFijoSim    = Math.max(1, diasSimTotal / bases.diasMes);
        const factorInteresSim = diasSimTotal / bases.diasMes;

        const interesDevengado  = round2((bases.capitalCuota + bases.seguroBase) * (bases.tasaMensual / 100) * factorInteresSim);
        const seguroDevengado   = round2(bases.seguroBase   * factorFijoSim);
        const custodiaDevengado = round2(bases.custodiaBase * factorFijoSim);

        const interesPend  = round2(Math.max(0, interesDevengado  - bases.interesPagado));
        const seguroPend   = round2(Math.max(0, seguroDevengado   - bases.seguroPagado));
        const custodiaPend = round2(Math.max(0, custodiaDevengado - bases.custodiaPagado));

        const diasAtraso = Math.max(0, diasSimTotal - bases.diasMes);

        const moraPorDia = parseFloat(moraPorDiaManual || bases.moraPorDiaDefault || 0);
        const mora       = round2(moraPorDia * diasAtraso);

        const penalidad = round2(parseFloat(penalidadManual || 0));

        const cargos = round2(mora + seguroPend + custodiaPend + interesPend);
        const igv    = round2(cargos * bases.igvRate);
        const total  = round2(Math.max(0, cargos + igv + bases.capitalPendiente - bases.creditoActual + penalidad));

        return {
            diasSimTotal, diasAtraso,
            interesPend, seguroPend, custodiaPend, mora, moraPorDia, penalidad,
            cargos, igv, total,
        };
    }, [bases, diasExtra, moraPorDiaManual, penalidadManual]);


    if (!esPrendario || !liq?.modos?.cancelar) return null;

    const handleClose = () => {
        setOpen(false);
        setDiasExtra(30);
        setMoraPorDiaManual('');
        setPenalidadManual('');
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[10px] uppercase bg-slate-900 dark:bg-black text-white dark:text-dark-text hover:bg-slate-800 transition-all active:scale-95"
            >
                <CalculatorIcon className="w-3.5 h-3.5" /> Simular Pago
            </button>

            <ViewModal isOpen={open} onClose={handleClose} title="Simulador de Pago Prendario" size="md" hideFooter>
                <div className="space-y-4 p-1 transition-colors">

                    <p className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-surface-alt border border-slate-100 dark:border-dark-border rounded-xl p-3">
                        Proyección estimada a partir de HOY (día {bases?.diasHoy} del préstamo), asumiendo que no se
                        realiza ningún pago entretanto. Mora y penalidad de pronto pago son referenciales — ajústalas
                        a mano si aplica.
                    </p>

                    {/* ── Selector de días adicionales / fecha ── */}
                    <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_DIAS.map(d => (
                                <button key={d} type="button" onClick={() => setDiasExtra(d)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                        diasExtra === d ? 'bg-brand-red dark:bg-brand-red-glow text-white' : 'bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-500 dark:text-dark-text-muted'
                                    }`}
                                >
                                    +{d} días
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">
                                Días a partir de hoy (día actual: {bases?.diasHoy})
                            </label>
                            <input
                                type="number" min={0} value={diasExtra}
                                onChange={e => setDiasExtra(Math.max(0, parseInt(e.target.value || 0, 10)))}
                                className="w-full p-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">
                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                            Fecha equivalente: <span className="text-slate-800 dark:text-dark-text font-black">{fechaSimulada}</span>
                            {resultado?.diasAtraso > 0 && (
                                <span className="ml-auto text-brand-red dark:text-red-400">{resultado.diasAtraso} días de atraso (día {resultado.diasSimTotal})</span>
                            )}
                        </div>
                    </div>

                    {/* ── Mora / penalidad manuales ── */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">
                                Mora por día (S/) {bases?.moraPorDiaDefault > 0 && `— actual: S/ ${fmt(bases.moraPorDiaDefault)}/día`}
                            </label>
                            <input type="text" inputMode="decimal" value={moraPorDiaManual}
                                onChange={e => setMoraPorDiaManual(e.target.value.replace(/[^0-9.]/g, ''))}
                                placeholder={fmt(bases?.moraPorDiaDefault)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold"
                            />
                            {bases?.diasAtrasoHoy === 0 && (
                                <p className="text-[8px] font-bold text-slate-400 dark:text-dark-text-muted mt-1">
                                    Aún no entra en mora hoy — no hay tasa diaria que derivar, ingrésala a mano si aplica.
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">
                                Penalidad pronto pago (opcional)
                            </label>
                            <input type="text" inputMode="decimal" value={penalidadManual}
                                onChange={e => setPenalidadManual(e.target.value.replace(/[^0-9.]/g, ''))}
                                placeholder="0.00"
                                className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold"
                            />
                        </div>
                    </div>

                    {/* ── Resultado ── */}
                    {resultado && (
                        <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 space-y-1.5">
                            <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">
                                Desglose dentro de {diasExtra} días (día {resultado.diasSimTotal} del préstamo)
                            </p>

                            {resultado.mora > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">
                                        Mora ({resultado.diasAtraso} días × S/ {fmt(resultado.moraPorDia)}/día)
                                    </span>
                                    <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(resultado.mora)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Interés devengado</span>
                                <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(resultado.interesPend)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Seguro</span>
                                <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(resultado.seguroPend)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Custodia</span>
                                <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(resultado.custodiaPend)}</span>
                            </div>
                            {resultado.penalidad > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Penalidad pronto pago</span>
                                    <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(resultado.penalidad)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">IGV</span>
                                <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(resultado.igv)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Capital pendiente</span>
                                <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(bases.capitalPendiente)}</span>
                            </div>
                            {bases.creditoActual > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400">Crédito a favor</span>
                                    <span className="text-xs font-black text-green-600 dark:text-green-400">− S/ {fmt(bases.creditoActual)}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-200 dark:border-dark-border pt-2 mt-2">
                                <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase">Deuda total estimada</span>
                                <span className="text-lg font-black text-brand-red dark:text-brand-gold">S/ {fmt(resultado.total)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </ViewModal>
        </>
    );
};

export default SimuladorPrendario;