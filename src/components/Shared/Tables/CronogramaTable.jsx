import React from 'react';
import { ClockIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useCuotaData } from './hooks/useCuotaData';

/* ─── Celda financiera ───────────────────────────────── */
export const CeldaFinanciera = ({ total, pagado, pendiente }) => (
    <div className="flex flex-col min-w-[80px]">
        <span className="text-[11px] font-black text-slate-800 whitespace-nowrap">S/ {parseFloat(total).toFixed(2)}</span>
        {parseFloat(pagado) > 0 && (
            <span className="text-[9px] font-bold text-green-700 whitespace-nowrap">PAGADO: S/ {parseFloat(pagado).toFixed(2)}</span>
        )}
        {parseFloat(pendiente) > 0 && (
            <span className="text-[9px] font-bold text-brand-red whitespace-nowrap">PENDIENTE: S/ {parseFloat(pendiente).toFixed(2)}</span>
        )}
    </div>
);

/* ─── Badge de estado ────────────────────────────────── */
const STATUS_STYLES = {
    0: 'bg-slate-100 text-slate-400 border-slate-200',
    1: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    2: 'bg-green-50 text-green-700 border-green-100',
    3: 'bg-brand-gold-light text-brand-gold-dark border-brand-gold/30',
    4: 'bg-brand-red-light text-brand-red border-brand-red/30',
    5: 'bg-orange-50 text-orange-700 border-orange-100',
    6: 'bg-blue-50 text-blue-700 border-blue-100',
};
const STATUS_LABELS = {
    0: 'CANCELADO', 1: 'PENDIENTE', 2: 'PAGADO',
    3: 'VENCE HOY', 4: 'VENCIDO',  5: 'PARCIAL', 6: 'REFINANCIADO',
};
const getStatusBadge = (estado) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border whitespace-nowrap ${STATUS_STYLES[estado] ?? STATUS_STYLES[1]}`}>
        {STATUS_LABELS[estado] ?? 'PENDIENTE'}
    </span>
);

/* ─── Bloque excedentes (individual de integrante o global) ─── */
/**
 * excAnterior  → lo que venía de la cuota anterior (disponible)
 * excAplicado  → se aplicó a capital (auditoría)
 * excConsumido → se consumió en esta cuota
 * excGenerado  → se generó aquí → pasa a la siguiente cuota
 * label        → "Excedente propio" (integrante) | "Excedente" (global)
 */
const ExcedenteContent = ({ excAnterior, excAplicado, excConsumido, excGenerado, label = 'Excedente' }) => {
    const hayAlgo = excAnterior > 0 || excAplicado > 0 || excConsumido > 0 || excGenerado > 0;
    if (!hayAlgo) return <span className="text-[10px] text-slate-300 font-bold">—</span>;

    return (
        <div className="flex flex-col gap-0.5 items-end">
            {excAnterior > 0 && (
                <span className="text-[9px] font-bold text-purple-600 uppercase whitespace-nowrap">
                    {label} anterior: S/ {excAnterior.toFixed(2)}
                </span>
            )}
            {excAplicado > 0 && (
                <span className="text-[9px] font-bold text-purple-700 uppercase whitespace-nowrap">
                    Aplicado a capital: -S/ {excAplicado.toFixed(2)}
                </span>
            )}
            {excConsumido > 0 && (
                <span className="text-[9px] font-bold text-purple-500 uppercase whitespace-nowrap">
                    Consumido: S/ {excConsumido.toFixed(2)}
                </span>
            )}
            {excGenerado > 0 && (
                <span className="text-[9px] font-bold text-orange-500 uppercase whitespace-nowrap">
                    Generado → siguiente: S/ {excGenerado.toFixed(2)}
                </span>
            )}
        </div>
    );
};

/* ─── Bloque de abonos ───────────────────────────────── */
const AbonosContent = ({ d, esVistaIntegrante }) => (
    <div className="flex flex-col gap-0.5 items-end min-w-[90px]">
        {d.mostrarRecibido && (
            <span className="text-[9px] font-bold text-brand-red uppercase whitespace-nowrap">Recibido: S/ {d.abonado.toFixed(2)}</span>
        )}
        {esVistaIntegrante && d.acumInd > 0 && (
            <span className="text-[9px] font-bold text-green-700 uppercase whitespace-nowrap">Acumulado: S/ {d.acumInd.toFixed(2)}</span>
        )}
        {!esVistaIntegrante && d.pagoAcumGrupo > 0 && (
            <span className="text-[9px] font-bold text-green-700 uppercase whitespace-nowrap">Acumulado: S/ {d.pagoAcumGrupo.toFixed(2)}</span>
        )}
        {d.moraPagada > 0 && (
            <span className="text-[9px] font-bold text-brand-gold-dark uppercase whitespace-nowrap">Mora cubierta: S/ {d.moraPagada.toFixed(2)}</span>
        )}
        {!d.tieneAbonos && (
            <span className="text-[10px] text-slate-300 font-bold">—</span>
        )}
    </div>
);

/* ─── Celda de mora ──────────────────────────────────── */
const MoraContent = ({ d, cuota, nro, onHistorialModal }) => {
    if (d.moraTotal <= 0 || d.esInactiva) return <span className="text-slate-300 font-black text-[11px]">—</span>;
    return (
        <div className="flex flex-col min-w-[70px]">
            <span className={`font-black text-[11px] whitespace-nowrap ${d.moraPend > 0 ? 'text-brand-red' : 'text-brand-red line-through'}`}>
                {d.moraPend > 0 ? `+S/ ${d.moraPend.toFixed(2)}` : `S/ ${d.moraTotal.toFixed(2)}`}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8px] font-bold whitespace-nowrap ${d.moraPend === 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {d.moraPend === 0 ? '✓ Cubierta' : `De S/ ${d.moraTotal.toFixed(2)}`}
                </span>
                {cuota.historial_mora?.length > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onHistorialModal?.({ nro, historial: cuota.historial_mora, total: d.moraTotal }); }}
                        className="text-slate-400 hover:text-brand-red transition-all p-0.5 rounded-full hover:bg-brand-red-light shrink-0"
                    >
                        <ClockIcon className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─── Celda saldo real ───────────────────────────────── */
const SaldoContent = ({ d }) => {
    if (d.esInactiva) return (
        <span className="text-sm font-black italic text-slate-400 line-through whitespace-nowrap">S/ {d.saldo.toFixed(2)}</span>
    );
    return (
        <>
            <span className={`text-sm font-black italic whitespace-nowrap ${d.saldo > 0 ? 'text-brand-red underline' : 'text-green-600'}`}>
                S/ {d.saldo.toFixed(2)}
            </span>
            {d.moraPend > 0 && d.saldo > 0 && (
                <span className="text-[9px] text-slate-400 font-bold block whitespace-nowrap">
                    Cap: {Math.max(0, d.monto - (d.acumInd || d.pagoAcumGrupo)).toFixed(2)} | Mora: {d.moraPend.toFixed(2)}
                </span>
            )}
        </>
    );
};

/* ─── Fila helper para cards ─────────────────────────── */
const CardRow = ({ label, children, hidden, icon }) => {
    if (hidden) return null;
    return (
        <div className="flex items-start justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                {icon && <span className="text-[9px]">{icon}</span>}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-right">{children}</div>
        </div>
    );
};

/* ─── Bloque de excedentes por integrante (vista grupal global) ─── */
/**
 * Se muestra en TODAS las cuotas que tengan al menos un integrante con
 * excedente_generado (cuota pagada) o excedente_anterior/aplicado/consumido
 * (cuota donde se usó). El backend ahora manda integrantes también en pagadas.
 */
const ExcedentesIntegrantes = ({ integrantes }) => {
    const conExcedente = integrantes?.filter(
        int => int.excedente_anterior > 0 || int.excedente_generado > 0 ||
               int.excedente_aplicado > 0 || int.excedente_consumido > 0
    );
    if (!conExcedente?.length) return null;

    return (
        <div className="flex flex-col gap-0.5">
            {conExcedente.map(int => (
                <div key={int.id} className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase">{int.nombre.split(' ')[0]}:</span>
                    {int.excedente_generado > 0 && (
                        <span className="text-[8px] font-bold text-orange-400 whitespace-nowrap">
                            Generado S/ {parseFloat(int.excedente_generado).toFixed(2)}
                        </span>
                    )}
                    {int.excedente_anterior > 0 && (
                        <span className="text-[8px] font-bold text-purple-500 whitespace-nowrap">
                            Anterior S/ {parseFloat(int.excedente_anterior).toFixed(2)}
                        </span>
                    )}
                    {int.excedente_aplicado > 0 && (
                        <span className="text-[8px] font-bold text-purple-700 whitespace-nowrap">
                            Aplicado -S/ {parseFloat(int.excedente_aplicado).toFixed(2)}
                        </span>
                    )}
                    {int.excedente_consumido > 0 && (
                        <span className="text-[8px] font-bold text-purple-400 whitespace-nowrap">
                            Consumido S/ {parseFloat(int.excedente_consumido).toFixed(2)}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

/* Versión card (para móvil) — más verbosa */
const ExcedentesIntegrantesCard = ({ integrantes }) => {
    const conExcedente = integrantes?.filter(
        int => int.excedente_anterior > 0 || int.excedente_generado > 0 ||
               int.excedente_aplicado > 0 || int.excedente_consumido > 0
    );
    if (!conExcedente?.length) return null;

    return (
        <div className="flex flex-col gap-1 items-end">
            {conExcedente.map(int => (
                <div key={int.id} className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase">{int.nombre}</span>
                    {int.excedente_generado > 0 && (
                        <span className="text-[9px] font-bold text-orange-500 whitespace-nowrap">
                            Generado: S/ {parseFloat(int.excedente_generado).toFixed(2)}
                        </span>
                    )}
                    {int.excedente_anterior > 0 && (
                        <span className="text-[9px] font-bold text-purple-600 whitespace-nowrap">
                            Anterior: S/ {parseFloat(int.excedente_anterior).toFixed(2)}
                        </span>
                    )}
                    {int.excedente_aplicado > 0 && (
                        <span className="text-[9px] font-bold text-purple-700 whitespace-nowrap">
                            Aplicado: -S/ {parseFloat(int.excedente_aplicado).toFixed(2)}
                        </span>
                    )}
                    {int.excedente_consumido > 0 && (
                        <span className="text-[9px] font-bold text-purple-400 whitespace-nowrap">
                            Consumido: S/ {parseFloat(int.excedente_consumido).toFixed(2)}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

/* ─── Card móvil ─────────────────────────────────────── */
const CuotaCard = ({ cuota, i, cronograma, esVistaIntegrante, onHistorialModal, extraColumns }) => {
    const [expanded, setExpanded] = React.useState(false);
    const d = useCuotaData(cuota, i, esVistaIntegrante);

    // ¿Hay excedentes de integrantes que mostrar? (incluye cuotas pagadas)
    const hayExcedentesIntegrantes = !esVistaIntegrante &&
        cuota.integrantes?.some(
            int => int.excedente_anterior > 0 || int.excedente_generado > 0 ||
                   int.excedente_aplicado > 0  || int.excedente_consumido > 0
        );

    const borderColor = d.esCancelada
        ? 'border-l-slate-300'
        : d.esRefinanciada
            ? 'border-l-blue-400'
            : d.saldo <= 0
                ? 'border-l-green-400'
                : d.diasAtraso > 0
                    ? 'border-l-brand-red'
                    : 'border-l-slate-200';

    return (
        <div className={`relative bg-white rounded-2xl border border-slate-200 border-l-4 ${borderColor} shadow-sm overflow-hidden transition-all ${d.esInactiva ? 'opacity-55' : ''}`}>

            <button className="w-full text-left px-4 pt-3 pb-3" onClick={() => setExpanded(v => !v)}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 font-mono bg-slate-100 rounded-lg px-2 py-0.5">
                            #{d.nro.toString().padStart(2, '0')}
                        </span>
                        <div>
                            <span className={`text-xs font-bold block ${d.esInactiva ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                {cuota.vencimiento}
                            </span>
                            {d.diasAtraso > 0 && !d.esInactiva && (
                                <span className="text-[9px] font-black text-brand-red uppercase">{d.diasAtraso} días atraso</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-sm font-black ${d.esInactiva ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            S/ {d.monto.toFixed(2)}
                        </span>
                        {getStatusBadge(d.estadoGlobal)}
                        {/* Badge de excedente disponible */}
                        {d.excAnterior > 0 && !d.esInactiva && (
                            <span className="text-[8px] font-black text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                Exc. S/ {d.excAnterior.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Saldo real</span>
                    <SaldoContent d={d} />
                </div>

                {(d.esCancelada || d.esRefinanciada) && (
                    <span className={`mt-1.5 inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${d.esCancelada ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-500'}`}>
                        {d.esCancelada ? 'Cancelado' : 'Refinanciado'}
                    </span>
                )}

                <div className="absolute top-3 right-3 text-slate-300">
                    {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/60 border-t border-slate-100 space-y-0">
                    <CardRow label="Capital">
                        <CeldaFinanciera total={d.capital} pagado={d.capPagado} pendiente={d.esInactiva ? 0 : d.capPend} />
                    </CardRow>
                    <CardRow label="Interés">
                        <CeldaFinanciera total={d.interes} pagado={d.intPagado} pendiente={d.esInactiva ? 0 : d.intPend} />
                    </CardRow>
                    <CardRow label="Seguro" hidden={d.seguro <= 0}>
                        <CeldaFinanciera total={d.seguro} pagado={d.segPagado} pendiente={d.esInactiva ? 0 : d.segPend} />
                    </CardRow>
                    <CardRow label="Mora" hidden={d.moraTotal <= 0 || d.esInactiva}>
                        <MoraContent d={d} cuota={cuota} nro={d.nro} onHistorialModal={onHistorialModal} />
                    </CardRow>
                    {d.tieneAbonos && (
                        <CardRow label="Abonos">
                            <AbonosContent d={d} esVistaIntegrante={esVistaIntegrante} />
                        </CardRow>
                    )}
                    {/* Excedente individual — vista integrante o préstamo individual */}
                    {d.tieneExcedente && !d.esInactiva && (
                        <CardRow label="Excedente" icon="✦">
                            <ExcedenteContent
                                excAnterior={d.excAnterior}
                                excAplicado={d.excAplicado}
                                excConsumido={d.excConsumido}
                                excGenerado={d.excGenerado}
                                label={esVistaIntegrante ? 'Exc. propio' : 'Excedente'}
                            />
                        </CardRow>
                    )}
                    {/* Excedentes de integrantes — vista grupal global.
                        Se muestra en TODAS las cuotas (pagadas y pendientes)
                        donde algún integrante tenga excedentes. */}
                    {hayExcedentesIntegrantes && (
                        <CardRow label="Exc. integrantes" icon="✦">
                            <ExcedentesIntegrantesCard integrantes={cuota.integrantes} />
                        </CardRow>
                    )}
                    {extraColumns.map((col) => (
                        <CardRow key={col.header} label={col.header}>
                            {col.render(cuota, i, cronograma)}
                        </CardRow>
                    ))}
                    {d.moraPend > 0 && d.saldo > 0 && (
                        <p className="text-[9px] text-slate-400 font-bold pt-1">
                            Cap: {Math.max(0, d.monto - (d.acumInd || d.pagoAcumGrupo)).toFixed(2)} | Mora: {d.moraPend.toFixed(2)}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Fila desktop ───────────────────────────────────── */
const CuotaRow = ({ cuota, i, cronograma, esVistaIntegrante, onHistorialModal, extraColumns }) => {
    const d = useCuotaData(cuota, i, esVistaIntegrante);

    return (
        <tr className={`transition-colors ${
            d.esCancelada    ? 'bg-slate-50/80 opacity-50'  :
            d.esRefinanciada ? 'bg-blue-50/60 opacity-60'   :
                               'hover:bg-brand-red-light/30'
        }`}>
            <td className="px-3 py-4 text-xs font-black text-slate-400 text-center font-mono">
                #{d.nro.toString().padStart(2, '0')}
            </td>
            <td className="px-3 py-4 whitespace-nowrap">
                <span className={`text-xs font-bold block ${d.esInactiva ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                    {cuota.vencimiento}
                </span>
                {d.diasAtraso > 0 && !d.esInactiva && (
                    <span className="text-[9px] font-black text-brand-red uppercase">{d.diasAtraso} días atraso</span>
                )}
            </td>
            <td className="px-3 py-4 whitespace-nowrap">
                <span className={`text-sm font-black ${d.esInactiva ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    S/ {d.monto.toFixed(2)}
                </span>
                {d.esCancelada    && <span className="block text-[9px] font-black text-slate-400 uppercase">Cancelado</span>}
                {d.esRefinanciada && <span className="block text-[9px] font-black text-blue-500  uppercase">Refinanciado</span>}
            </td>
            <td className="px-3 py-4">
                <CeldaFinanciera total={d.capital} pagado={d.capPagado} pendiente={d.esInactiva ? 0 : d.capPend} />
            </td>
            <td className="px-3 py-4">
                <CeldaFinanciera total={d.interes} pagado={d.intPagado} pendiente={d.esInactiva ? 0 : d.intPend} />
            </td>
            <td className="px-3 py-4">
                <CeldaFinanciera total={d.seguro} pagado={d.segPagado} pendiente={d.esInactiva ? 0 : d.segPend} />
            </td>
            <td className="px-3 py-4">
                <MoraContent d={d} cuota={cuota} nro={d.nro} onHistorialModal={onHistorialModal} />
            </td>
            <td className="px-3 py-4">
                <AbonosContent d={d} esVistaIntegrante={esVistaIntegrante} />
            </td>
            {/* Columna excedente */}
            <td className="px-3 py-4">
                {d.esInactiva ? (
                    <span className="text-slate-300 font-black text-[11px]">—</span>
                ) : (
                    /* Vista integrante o préstamo individual: excedente propio */
                    <ExcedenteContent
                        excAnterior={d.excAnterior}
                        excAplicado={d.excAplicado}
                        excConsumido={d.excConsumido}
                        excGenerado={d.excGenerado}
                        label={esVistaIntegrante ? 'Exc. propio' : 'Excedente'}
                    />
                )}
                {/* Vista grupal global: excedentes de cada integrante.
                    Se renderiza en TODAS las cuotas (pagadas y pendientes)
                    donde haya excedentes — el backend ahora los manda siempre. */}
                {!esVistaIntegrante && (
                    <ExcedentesIntegrantes integrantes={cuota.integrantes} />
                )}
            </td>
            <td className="px-3 py-4">
                <SaldoContent d={d} />
            </td>
            <td className="px-3 py-4 text-center">{getStatusBadge(d.estadoGlobal)}</td>
            {extraColumns.map((col) => (
                <td key={col.header} className="px-3 py-4 text-center">
                    {col.render(cuota, i, cronograma)}
                </td>
            ))}
        </tr>
    );
};

/* ═══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════ */
const CronogramaTable = ({ cronograma = [], esVistaIntegrante = false, onHistorialModal, extraColumns = [] }) => {
    const sharedProps = { cronograma, esVistaIntegrante, onHistorialModal, extraColumns };

    return (
        <>
            {/* ── Móvil: cards ── */}
            <div className="flex flex-col gap-3 md:hidden">
                {cronograma.map((cuota, i) => (
                    <CuotaCard key={cuota.nro ?? i} cuota={cuota} i={i} {...sharedProps} />
                ))}
            </div>

            {/* ── Desktop: tabla ── */}
            <div className="hidden md:block overflow-hidden border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">
                        <tr>
                            <th className="px-3 py-4 text-center">N°</th>
                            <th className="px-3 py-4">Vencimiento</th>
                            <th className="px-3 py-4">Cuota</th>
                            <th className="px-3 py-4">Capital</th>
                            <th className="px-3 py-4">Interés</th>
                            <th className="px-3 py-4">Seguro</th>
                            <th className="px-3 py-4">Mora</th>
                            <th className="px-3 py-4">Abonos</th>
                            <th className="px-3 py-4">Excedente</th>
                            <th className="px-3 py-4">Saldo Real</th>
                            <th className="px-3 py-4 text-center">Estado</th>
                            {extraColumns.map((col) => (
                                <th key={col.header} className="px-3 py-4 text-center">{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {cronograma.map((cuota, i) => (
                            <CuotaRow key={cuota.nro ?? i} cuota={cuota} i={i} {...sharedProps} />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default CronogramaTable;