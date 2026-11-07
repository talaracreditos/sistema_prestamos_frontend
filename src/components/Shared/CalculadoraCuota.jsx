import React, { useState, useEffect } from 'react';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { fetchIgv } from 'services/parametroService';

// ── IGV referencial (prendario) ───────────────────────────────────────────────
// Se pide una sola vez por carga de página y se comparte entre todas las
// calculadoras (formulario, detalle, etc.). Si falla, se reintenta la próxima vez.
let igvCache = null;
const obtenerIgv = () => {
    if (!igvCache) {
        igvCache = fetchIgv().catch(() => {
            igvCache = null;
            return 0;
        });
    }
    return igvCache;
};

/**
 * CalculadoraCuota
 *
 * Props nuevas para modo grupal con tasas individuales:
 *   integrantes  — array de integrantes con { id, nombre, monto, tasa_interes, usa_tasa_individual }
 *                  Si se pasa, se calcula por integrante y se ignoran monto/tasa del nivel superior.
 *
 * Props legacy (modo simple):
 *   monto, tasa, cuotas, frecuencia, seguro, seguro_financiado, cantidadIntegrantes, custodia, esPrendario
 *
 * Regla del interés (modo simple): se calcula SIEMPRE sobre capital + seguro
 * financiado. La custodia va aparte: se suma a la cuota pero NO genera interés.
 *
 * IGV (solo si esPrendario): REFERENCIAL — la calculadora lo consulta sola.
 * Base: interés + seguro (si tiene) + custodia. Nunca sobre el capital, sin mora.
 * La cuota se muestra SIN IGV; el IGV se suma solo al Total a Cobrar.
 * No se envía ni se guarda en BD.
 */
const CalculadoraCuota = ({
    // modo grupal con tasas individuales
    integrantes        = null,   // array | null
    tasaGlobal         = 0,      // tasa global (fallback por integrante)
    // modo simple / legacy
    monto              = 0,
    tasa               = 0,
    cuotas             = 0,
    frecuencia         = 'MENSUAL',
    seguro             = 0,
    seguro_financiado  = false,
    cantidadIntegrantes = 1,
    custodia           = 0,      // monto de custodia (solo modo simple / prendario) — no genera interés
    esPrendario        = false,  // true → consulta y aplica el IGV referencial
    className          = '',
}) => {
    const [showFormulas, setShowFormulas] = useState(false);
    const [igvPorc, setIgvPorc]           = useState(0);

    // IGV: solo prendario. Los hooks van antes de cualquier return.
    useEffect(() => {
        if (!esPrendario) {
            setIgvPorc(0);
            return;
        }
        let activo = true;
        obtenerIgv().then(v => { if (activo) setIgvPorc(v); });
        return () => { activo = false; };
    }, [esPrendario]);

    const cuotasNum        = parseInt(cuotas)   || 0;
    const seguroIndividual = parseFloat(seguro) || 0;
    const isFinanciado     = String(seguro_financiado) === 'true' || String(seguro_financiado) === '1';

    if (cuotasNum <= 0) return null;

    let mesesTotales = cuotasNum;
    if (frecuencia === 'SEMANAL')         mesesTotales = cuotasNum / 4;
    else if (frecuencia === 'CATORCENAL') mesesTotales = cuotasNum / 2;

    // ── Modo grupal con tasas individuales ────────────────────────────────────
    const esGrupalConTasas = Array.isArray(integrantes) && integrantes.length > 0;

    if (esGrupalConTasas) {
        const calcInt = (int) => {
            const montoInt = parseFloat(int.monto || 0);
            if (montoInt <= 0) return null;

            const tasaInt  = int.usa_tasa_individual && int.tasa_interes != null && int.tasa_interes !== ''
                ? parseFloat(int.tasa_interes)
                : (parseFloat(tasaGlobal) || 0);

            if (tasaInt <= 0) return null;

            const seguro_i   = isFinanciado ? seguroIndividual : 0;
            const montoApr   = round(montoInt + seguro_i);
            const amort      = round(montoApr / cuotasNum);
            const intCuota   = round(amort * (tasaInt / 100) * mesesTotales);
            const valCuota   = round(amort + intCuota);
            const totalInd   = round(valCuota * cuotasNum);
            const totalInt   = round(intCuota * cuotasNum);
            const segCuota   = isFinanciado ? round(seguroIndividual / cuotasNum) : 0;

            return {
                nombre:       int.nombre,
                tasaInt,
                montoInt,
                montoApr,
                amort,
                intCuota,
                valCuota,
                totalInd,
                totalInt,
                segCuota,
                usaTasaPropia: !!int.usa_tasa_individual,
            };
        };

        const porInt = integrantes.map(calcInt).filter(Boolean);
        if (porInt.length === 0) return null;

        const totalCuotaGrupal  = round(porInt.reduce((a, i) => a + i.valCuota,  0));
        const totalPagarGrupal  = round(porInt.reduce((a, i) => a + i.totalInd,  0));
        const montoTotalGrupo   = round(porInt.reduce((a, i) => a + i.montoInt,  0));
        const seguroTotalGrupo  = round(seguroIndividual * integrantes.length);

        return (
            <div className={`relative overflow-hidden bg-brand-red rounded-[24px] shadow-xl border border-brand-red-dark text-white flex flex-col ${className}`}>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-brand-red-light opacity-10 rounded-full blur-3xl pointer-events-none" />

                {/* Cabecera grupal */}
                <div className="relative z-10 p-5 flex flex-col xl:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-x-4 gap-y-2 w-full xl:w-auto flex-wrap min-w-0">
                        <div className="p-2.5 bg-brand-red-dark rounded-2xl shadow-inner border border-brand-red-dark/50 flex-shrink-0 hidden sm:flex">
                            <CalculatorIcon className="w-6 h-6 text-brand-gold" />
                        </div>
                        <Item label="Monto Grupo" value={`S/ ${fmt(montoTotalGrupo)}`} />
                        <Sep />
                        <Item label={`${integrantes.length} integrantes`} value={`${cuotasNum} cuotas`} muted />
                        {seguroTotalGrupo > 0 && (
                            <>
                                <Sep />
                                <Item
                                    label={isFinanciado ? 'Seguro/cuota (x int.)' : 'Seguro Total'}
                                    value={isFinanciado ? `S/ ${fmt(seguroIndividual / cuotasNum)}` : `S/ ${fmt(seguroTotalGrupo)}`}
                                    gold
                                />
                            </>
                        )}
                    </div>

                    <div className="flex gap-6 w-full xl:w-auto border-t xl:border-t-0 xl:border-l border-brand-red-dark pt-4 xl:pt-0 xl:pl-6 justify-between xl:justify-end z-10 flex-shrink-0">
                        <div>
                            <p className="text-[9px] font-black text-brand-red-light/80 uppercase tracking-[0.15em] mb-1">
                                Cuota Total ({cuotasNum} {frecuencia.toLowerCase()})
                            </p>
                            <p className="text-xl font-black">S/ {fmt(totalCuotaGrupal)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.15em] mb-1">
                                Total a Cobrar
                            </p>
                            <p className="text-xl font-black text-brand-gold tracking-tighter drop-shadow-sm">
                                S/ {fmt(totalPagarGrupal)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botón desglose */}
                <button
                    type="button"
                    onClick={() => setShowFormulas(v => !v)}
                    className={`relative z-10 w-full py-2.5 text-xs font-black uppercase tracking-widest transition-colors focus:outline-none ${showFormulas ? 'bg-black/30 text-brand-gold' : 'bg-black/20 text-white/70 hover:bg-black/30 hover:text-white'}`}
                >
                    {showFormulas ? '▲ Ocultar desglose por integrante' : '▼ Ver desglose por integrante'}
                </button>

                {/* Panel desglose por integrante */}
                {showFormulas && (
                    <div className="relative z-10 p-5 bg-black/30 flex flex-col gap-4 border-t border-black/20 shadow-inner">
                        {porInt.map((int, idx) => (
                            <div key={idx} className="bg-black/20 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-white uppercase tracking-wide">{int.nombre}</span>
                                    {int.usaTasaPropia && (
                                        <span className="text-[9px] font-black bg-amber-400 text-amber-900 px-2 py-0.5 rounded-md uppercase">
                                            Tasa propia: {int.tasaInt}%
                                        </span>
                                    )}
                                    {!int.usaTasaPropia && (
                                        <span className="text-[9px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded-md uppercase">
                                            Tasa global: {int.tasaInt}%
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <FormulaRow
                                        paso="1"
                                        label="Monto Aprobado"
                                        formula={isFinanciado
                                            ? `S/ ${fmt(int.montoInt)} + S/ ${fmt(seguroIndividual)}`
                                            : `S/ ${fmt(int.montoInt)}`
                                        }
                                        resultado={`S/ ${fmt(int.montoApr)}`}
                                    />
                                    <FormulaRow
                                        paso="2"
                                        label="Amortización"
                                        formula={`S/ ${fmt(int.montoApr)} ÷ ${cuotasNum}`}
                                        resultado={`S/ ${fmt(int.amort)}`}
                                    />
                                    <FormulaRow
                                        paso="3"
                                        label="Interés / cuota"
                                        formula={`S/ ${fmt(int.amort)} × ${int.tasaInt}% × ${mesesTotales} meses`}
                                        resultado={`S/ ${fmt(int.intCuota)}`}
                                    />
                                    {seguroIndividual > 0 && isFinanciado && (
                                        <FormulaRow
                                            paso="4"
                                            label="Seguro / cuota"
                                            formula={`S/ ${fmt(seguroIndividual)} ÷ ${cuotasNum}`}
                                            resultado={`S/ ${fmt(int.segCuota)}`}
                                        />
                                    )}
                                    <div className="h-1" />
                                    <FormulaRow
                                        paso="✓"
                                        label="Cuota Final"
                                        formula={`S/ ${fmt(int.amort)} + S/ ${fmt(int.intCuota)}`}
                                        resultado={`S/ ${fmt(int.valCuota)}`}
                                        isFinal
                                    />
                                    <FormulaRow
                                        paso="✓"
                                        label="Total a Cobrar"
                                        formula={`S/ ${fmt(int.valCuota)} × ${cuotasNum}`}
                                        resultado={`S/ ${fmt(int.totalInd)}`}
                                        isFinal
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Total Grupo</span>
                            <div className="flex gap-6">
                                <div className="text-right">
                                    <p className="text-[9px] text-white/50 uppercase">Cuota</p>
                                    <p className="text-lg font-black">S/ {fmt(totalCuotaGrupal)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-brand-gold uppercase">Total</p>
                                    <p className="text-lg font-black text-brand-gold">S/ {fmt(totalPagarGrupal)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ── Modo simple (individual, prendario o grupal sin tasas distintas) ──────
    const montoBase     = parseFloat(monto)    || 0;
    const tasaNum       = parseFloat(tasa)     || 0;
    const nIntegrantes  = parseInt(cantidadIntegrantes) || 1;
    const seguroTotal   = round(seguroIndividual * nIntegrantes);
    const custodiaNum   = parseFloat(custodia) || 0;
    const igvNum        = esPrendario ? (parseFloat(igvPorc) || 0) : 0;
    const igvRate       = igvNum / 100;

    if (montoBase <= 0 || tasaNum <= 0) return null;

    // Base del interés: capital + seguro financiado. La custodia NO entra acá.
    const montoAprobado    = round(montoBase + (isFinanciado ? seguroTotal : 0));
    const amortizacion     = round(montoAprobado / cuotasNum);
    const interesPorCuota  = round(amortizacion * (tasaNum / 100) * mesesTotales);
    const interesTotal     = round(interesPorCuota * cuotasNum);
    const seguroPorCuota   = seguroTotal > 0 && isFinanciado ? round(seguroTotal / cuotasNum) : 0;
    // Custodia: se cobra aparte, sin interés.
    const custodiaPorCuota = custodiaNum > 0 ? round(custodiaNum / cuotasNum) : 0;

    // IGV REFERENCIAL: interés + seguro (si tiene, financiado o no) + custodia.
    // Nunca sobre capital, sin mora. No se guarda.
    const seguroBaseIgv    = seguroTotal > 0 ? round(seguroTotal / cuotasNum) : 0;
    const baseIgvPorCuota  = round(interesPorCuota + seguroBaseIgv + custodiaPorCuota);
    const igvPorCuota      = igvRate > 0 ? round(baseIgvPorCuota * igvRate) : 0;

    // Cuota SIN IGV. El IGV referencial se suma solo al total a cobrar.
    const valorCuota       = round(amortizacion + interesPorCuota + custodiaPorCuota);
    const igvTotal         = round(igvPorCuota * cuotasNum);
    const totalSinIgv      = round(valorCuota * cuotasNum);
    const totalFinanciado  = round(totalSinIgv + igvTotal);

    const formulaCuota = [
        `S/ ${fmt(amortizacion)}`,
        `S/ ${fmt(interesPorCuota)}`,
        custodiaPorCuota > 0 ? `S/ ${fmt(custodiaPorCuota)}` : null,
    ].filter(Boolean).join(' + ');

    const formulaIgv = [
        `S/ ${fmt(interesPorCuota)}`,
        seguroBaseIgv > 0 ? `S/ ${fmt(seguroBaseIgv)}` : null,
        custodiaPorCuota > 0 ? `S/ ${fmt(custodiaPorCuota)}` : null,
    ].filter(Boolean).join(' + ');

    const formulaTotal = igvTotal > 0
        ? `S/ ${fmt(valorCuota)} × ${cuotasNum} + S/ ${fmt(igvTotal)} IGV`
        : `S/ ${fmt(valorCuota)} × ${cuotasNum}`;

    return (
        <div className={`relative overflow-hidden bg-brand-red rounded-[24px] shadow-xl border border-brand-red-dark text-white flex flex-col ${className}`}>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-brand-red-light opacity-10 rounded-full blur-3xl pointer-events-none" />

             <div className="relative z-10 p-5 flex flex-wrap xl:flex-nowrap justify-between items-center gap-4">

                 <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 bg-brand-red-dark rounded-2xl shadow-inner border border-brand-red-dark/50 flex-shrink-0 hidden sm:flex">
                        <CalculatorIcon className="w-6 h-6 text-brand-gold" />
                    </div>
                    <div className="flex items-center gap-x-4 gap-y-2 flex-wrap min-w-0">
                        <Item label="Monto Aprobado" value={`S/ ${fmt(montoAprobado)}`} />
                        <Sep />
                        <Item label={`Amortización (÷${cuotasNum})`} value={`S/ ${fmt(amortizacion)}`} muted />
                        <Sep />
                        <Item label="Interés/cuota" value={`S/ ${fmt(interesPorCuota)}`} muted />
                        {seguroTotal > 0 && (
                            <>
                                <Sep />
                                <Item
                                    label={isFinanciado ? 'Cobertura/cuota' : 'Seguro Total'}
                                    value={isFinanciado ? `S/ ${fmt(seguroPorCuota)}` : `S/ ${fmt(seguroTotal)}`}
                                    gold
                                />
                            </>
                        )}
                        {custodiaNum > 0 && (
                            <>
                                <Sep />
                                <Item
                                    label="Custodia/cuota"
                                    value={`S/ ${fmt(custodiaPorCuota)}`}
                                    gold
                                />
                            </>
                        )}
                        {igvPorCuota > 0 && (
                            <>
                                <Sep />
                                <Item
                                    label={`IGV ${igvNum}% (ref.)`}
                                    value={`S/ ${fmt(igvPorCuota)}`}
                                    gold
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-6 w-full xl:w-auto border-t xl:border-t-0 xl:border-l border-brand-red-dark pt-4 xl:pt-0 xl:pl-6 justify-between xl:justify-end z-10 flex-shrink-0">
                    <div>
                        <p className="text-[9px] font-black text-brand-red-light/80 uppercase tracking-[0.15em] mb-1">
                            Cuota ({cuotasNum} {frecuencia.toLowerCase()})
                        </p>
                        <p className="text-xl font-black">S/ {fmt(valorCuota)}</p>
                        {igvPorCuota > 0 && (
                            <p className="text-[8px] font-bold text-white/60 uppercase tracking-wider mt-0.5">
                                Sin IGV
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.15em] mb-1">
                            Total a Cobrar
                        </p>
                        <p className="text-xl font-black text-brand-gold tracking-tighter drop-shadow-sm">
                            S/ {fmt(totalFinanciado)}
                        </p>
                        {igvPorCuota > 0 && (
                            <p className="text-[8px] font-bold text-white/60 uppercase tracking-wider mt-0.5">
                                Incluye IGV ref. S/ {fmt(igvTotal)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setShowFormulas(v => !v)}
                className={`relative z-10 w-full py-2.5 text-xs font-black uppercase tracking-widest transition-colors focus:outline-none ${showFormulas ? 'bg-black/30 text-brand-gold' : 'bg-black/20 text-white/70 hover:bg-black/30 hover:text-white'}`}
            >
                {showFormulas ? '▲ Ocultar desglose' : '▼ Ver desglose de cálculo'}
            </button>

            {showFormulas && (
                <div className="relative z-10 p-5 bg-black/30 flex flex-col gap-1.5 border-t border-black/20 shadow-inner">
                    <FormulaRow
                        paso="1"
                        label="Monto Aprobado"
                        formula={
                            isFinanciado
                                ? `S/ ${fmt(montoBase)} + S/ ${fmt(seguroTotal)}`
                                : `S/ ${fmt(montoBase)}`
                        }
                        resultado={`S/ ${fmt(montoAprobado)}`}
                    />
                    <FormulaRow
                        paso="2"
                        label="Amortización"
                        formula={`S/ ${fmt(montoAprobado)} ÷ ${cuotasNum}`}
                        resultado={`S/ ${fmt(amortizacion)}`}
                    />
                    <FormulaRow
                        paso="3"
                        label="Interés total"
                        formula={`S/ ${fmt(montoAprobado)} × ${tasaNum}% × ${mesesTotales} meses`}
                        resultado={`S/ ${fmt(interesTotal)}`}
                    />
                    <FormulaRow
                        paso="3.1"
                        label="Interés / cuota"
                        formula={`S/ ${fmt(interesTotal)} ÷ ${cuotasNum}`}
                        resultado={`S/ ${fmt(interesPorCuota)}`}
                    />
                    {seguroTotal > 0 && (
                        <FormulaRow
                            paso="4"
                            label="Seguro"
                            formula={isFinanciado ? `S/ ${fmt(seguroTotal)} ÷ ${cuotasNum}` : `S/ ${fmt(seguroIndividual)} × ${nIntegrantes}`}
                            resultado={isFinanciado ? `S/ ${fmt(seguroPorCuota)}` : `S/ ${fmt(seguroTotal)}`}
                        />
                    )}
                    {custodiaNum > 0 && (
                        <FormulaRow
                            paso="5"
                            label="Custodia (sin interés)"
                            formula={`S/ ${fmt(custodiaNum)} ÷ ${cuotasNum}`}
                            resultado={`S/ ${fmt(custodiaPorCuota)}`}
                        />
                    )}
                    {igvPorCuota > 0 && (
                        <FormulaRow
                            paso="6"
                            label={`IGV ${igvNum}% (referencial)`}
                            formula={`(${formulaIgv}) × ${igvNum}%`}
                            resultado={`S/ ${fmt(igvPorCuota)}`}
                        />
                    )}
                    <div className="h-2" />
                    <FormulaRow
                        paso="✓"
                        label={igvPorCuota > 0 ? 'Cuota Final (sin IGV)' : 'Cuota Final'}
                        formula={formulaCuota}
                        resultado={`S/ ${fmt(valorCuota)}`}
                        isFinal
                    />
                    <FormulaRow
                        paso="✓"
                        label={igvPorCuota > 0 ? 'Total a Cobrar (con IGV)' : 'Total a Cobrar'}
                        formula={formulaTotal}
                        resultado={`S/ ${fmt(totalFinanciado)}`}
                        isFinal
                    />
                    {igvPorCuota > 0 && (
                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider px-3 pt-1">
                            El IGV es referencial: no se guarda en la solicitud, solo muestra al cliente el monto total real.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Sub-componentes ───────────────────────────────────────────────────────────

const FormulaRow = ({ paso, label, formula, resultado, isFinal = false }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 rounded-xl transition-all ${isFinal ? 'bg-brand-red-dark/60 border border-brand-red-light/20 shadow-md' : 'hover:bg-white/5 border-b border-white/5 last:border-0'}`}>
        <div className="flex items-center gap-3 mb-1 sm:mb-0">
            <span className={`flex items-center justify-center min-w-[22px] h-[22px] rounded-md text-[10px] font-black shadow-sm ${isFinal ? 'bg-brand-gold text-brand-red-dark' : 'bg-black/40 text-brand-red-light border border-white/5'}`}>
                {paso}
            </span>
            <span className={`text-sm ${isFinal ? 'font-black text-white uppercase tracking-wide text-xs' : 'font-bold text-white/90'}`}>
                {label}
            </span>
        </div>
        <div className="flex items-center sm:justify-end gap-3 sm:gap-4 pl-8 sm:pl-0">
            <span className={`font-mono text-[11px] sm:text-xs tracking-tight ${isFinal ? 'text-white/70' : 'text-white/50'}`}>
                {formula}
            </span>
            <span className={`font-black ${isFinal ? 'text-brand-gold text-lg drop-shadow-md' : 'text-white text-sm'}`}>
                {resultado}
            </span>
        </div>
    </div>
);

const Sep = () => <span className="text-brand-red-light/30 font-black text-lg">+</span>;

const Item = ({ label, value, muted, gold }) => (
    <div className="whitespace-nowrap">
        <p className="text-[9px] font-black text-brand-red-light/80 uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={`text-sm font-black ${gold ? 'text-brand-gold' : muted ? 'text-brand-red-light' : 'text-white'}`}>
            {value}
        </p>
    </div>
);

const round = n => Math.round(n * 100) / 100;
const fmt   = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

export default CalculadoraCuota;