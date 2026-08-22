import React, { useMemo } from 'react';
import { BanknotesIcon, CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { onlyNumbers } from 'utilities/Validations/validations';
import CalculadoraCuota from 'components/Shared/CalculadoraCuota';

// Suma días según la frecuencia elegida, para calcular la fecha del primer pago
const DIAS_POR_FRECUENCIA = {
    SEMANAL: 7,
    CATORCENAL: 14,
    MENSUAL: 30,
};

const calcularPrimerPago = (fechaInicio, frecuencia) => {
    if (!fechaInicio) return null;

    const [y, m, d] = fechaInicio.split('-').map(Number);
    if (!y || !m || !d) return null;

    const fecha = new Date(y, m - 1, d);

    if (frecuencia === 'MENSUAL') {
        fecha.setMonth(fecha.getMonth() + 1);
    } else {
        fecha.setDate(fecha.getDate() + (DIAS_POR_FRECUENCIA[frecuencia] ?? 30));
    }

    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
};

const SectionCondiciones = ({ data, handleChange, isBlocked, esPrendario = false }) => {

    const numIntegrantes = data.es_grupal ? Math.max(1, data.integrantes?.length || 1) : 1;

    const primerPago = useMemo(() => {
        if (esPrendario) return null; // prendario no usa fecha personalizada
        if (!data.usar_fecha_personalizada || !data.fecha_inicio_personalizada) return null;
        return calcularPrimerPago(data.fecha_inicio_personalizada, data.frecuencia);
    }, [esPrendario, data.usar_fecha_personalizada, data.fecha_inicio_personalizada, data.frecuencia]);

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 relative overflow-hidden transition-colors">
            <h3 className="text-sm font-black text-slate-700 dark:text-dark-text uppercase mb-4 flex items-center gap-2 transition-colors">
                <BanknotesIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Condiciones del Préstamo
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Monto Total (S/)</label>
                    <input
                        disabled={isBlocked} readOnly={data.es_grupal} type="text" value={data.monto_solicitado}
                        onChange={e => handleChange('monto_solicitado', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
                        className={`w-full p-2.5 border rounded-lg text-sm font-black outline-none disabled:cursor-not-allowed transition-colors ${data.es_grupal ? 'bg-brand-red-light/50 dark:bg-brand-gold/10 border-brand-red/20 dark:border-brand-gold/20 text-brand-red dark:text-brand-gold' : 'bg-slate-50 dark:bg-dark-surface-alt border-slate-200 dark:border-dark-border text-slate-900 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold'}`}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">
                        Tasa Interés %
                        {data.es_grupal && (
                            <span className="ml-1 text-slate-300 dark:text-dark-text-muted/60 normal-case font-bold">(global)</span>
                        )}
                    </label>
                    <input
                        disabled={isBlocked} type="text" value={data.tasa_interes}
                        onChange={e => handleChange('tasa_interes', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
                        className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold disabled:cursor-not-allowed transition-colors"
                    />
                </div>

                {/* ── N° Cuotas: combobox 1/2 en prendario, input libre en los demás ── */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">
                        N° Cuotas
                        {esPrendario && (
                            <span className="ml-1 text-amber-500 dark:text-amber-400 normal-case font-bold">(máx. 2)</span>
                        )}
                    </label>
                    {esPrendario ? (
                        <select
                            disabled={isBlocked}
                            value={data.cuotas_solicitadas || '1'}
                            onChange={e => handleChange('cuotas_solicitadas', e.target.value)}
                            className="w-full p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="1">1 cuota</option>
                            <option value="2">2 cuotas</option>
                        </select>
                    ) : (
                        <input
                            disabled={isBlocked} type="text" value={data.cuotas_solicitadas}
                            onChange={e => handleChange('cuotas_solicitadas', onlyNumbers(e.target.value))}
                            className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold disabled:cursor-not-allowed transition-colors"
                        />
                    )}
                </div>

                {/* ── Frecuencia: fija en 30 días para prendario, select normal para el resto ── */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Frecuencia</label>
                    {esPrendario ? (
                        <div className="w-full p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-lg text-sm font-black text-amber-700 dark:text-amber-400 flex items-center justify-between">
                            <span>MENSUAL</span>
                        </div>
                    ) : (
                        <select disabled={isBlocked} value={data.frecuencia} onChange={e => handleChange('frecuencia', e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold disabled:cursor-not-allowed transition-colors">
                            <option value="SEMANAL">SEMANAL</option>
                            <option value="CATORCENAL">CATORCENAL</option>
                            <option value="MENSUAL">MENSUAL</option>
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase mb-1 transition-colors">
                        Seguro x Cliente (S/)
                    </label>
                    <input
                        disabled={isBlocked} type="text" value={data.seguro}
                        onChange={e => handleChange('seguro', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))}
                        placeholder="0.00"
                        className="w-full p-2.5 bg-brand-gold-light/20 dark:bg-brand-gold/10 border border-brand-gold/30 dark:border-brand-gold/20 rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold disabled:cursor-not-allowed transition-colors"
                    />
                </div>

                <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase mb-1 transition-colors">Cobro Seguro</label>
                    <select 
                        disabled={isBlocked} 
                        value={String(data.seguro_financiado) === 'true' || String(data.seguro_financiado) === '1' ? 'true' : 'false'} 
                        onChange={e => handleChange('seguro_financiado', e.target.value === 'true')} 
                        className="w-full p-2.5 bg-brand-gold-light/20 dark:bg-brand-gold/10 border border-brand-gold/30 dark:border-brand-gold/20 rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold disabled:cursor-not-allowed transition-colors"
                    >
                        <option value="true">Financiado (Cuotas)</option>
                        <option value="false">Efectivo (Previo)</option>
                    </select>
                </div>

                {/* ── Fecha de Inicio Personalizada — NO aplica a Prendario (siempre 30 días desde hoy) ── */}
                {!esPrendario && (
                    <div className="col-span-2 md:col-span-3">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 cursor-pointer select-none w-fit transition-colors">
                            <input
                                type="checkbox"
                                disabled={isBlocked}
                                checked={!!data.usar_fecha_personalizada}
                                onChange={e => {
                                    const checked = e.target.checked;
                                    handleChange('usar_fecha_personalizada', checked);
                                    if (!checked) handleChange('fecha_inicio_personalizada', '');
                                }}
                                className="w-3.5 h-3.5 accent-brand-red dark:accent-brand-gold disabled:cursor-not-allowed"
                            />
                            <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400 dark:text-dark-text-muted" />
                            Fecha de Inicio Personalizada
                        </label>
                        <input
                            type="date"
                            disabled={isBlocked || !data.usar_fecha_personalizada}
                            value={data.fecha_inicio_personalizada || ''}
                            onChange={e => handleChange('fecha_inicio_personalizada', e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-dark-surface disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 transition-colors"
                        />

                        {!data.usar_fecha_personalizada && (
                            <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase mt-1 transition-colors">
                                Sin marcar: se calculará automáticamente desde hoy según la frecuencia.
                            </p>
                        )}

                        {data.usar_fecha_personalizada && primerPago && (
                            <div className="mt-2 flex items-center gap-2 bg-brand-red-light/30 dark:bg-brand-gold/10 border border-brand-red/20 dark:border-brand-gold/20 rounded-lg px-3 py-2 transition-colors">
                                <ArrowRightIcon className="w-3.5 h-3.5 text-brand-red dark:text-brand-gold flex-shrink-0" />
                                <p className="text-[10px] font-black text-brand-red dark:text-brand-gold uppercase transition-colors">
                                    1er pago: <span className="normal-case font-bold">{primerPago}</span>
                                    <span className="ml-1 text-slate-400 dark:text-dark-text-muted font-bold normal-case">({data.frecuencia.toLowerCase()})</span>
                                </p>
                            </div>
                        )}

                        {data.usar_fecha_personalizada && !data.fecha_inicio_personalizada && (
                            <p className="text-[9px] text-amber-500 dark:text-amber-400 font-bold uppercase mt-1">
                                Selecciona una fecha para ver cuándo cae el primer pago.
                            </p>
                        )}
                    </div>
                )}

                {/* ── Aviso informativo que reemplaza el bloque de fecha en Prendario ── */}
                {esPrendario && (
                    <div className="col-span-2 md:col-span-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-lg px-3 py-2.5 transition-colors">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                            El préstamo prendario no admite fecha de inicio personalizada: siempre inicia 30 días después de la generación.
                        </p>
                    </div>
                )}
            </div>

            {data.es_grupal && data.integrantes?.length > 0 ? (
                <CalculadoraCuota
                    integrantes={data.integrantes}
                    tasaGlobal={data.tasa_interes}
                    cuotas={data.cuotas_solicitadas}
                    frecuencia={data.frecuencia}
                    seguro={data.seguro}
                    seguro_financiado={data.seguro_financiado}
                    className="mt-6"
                />
            ) : (
                <CalculadoraCuota
                    monto={data.monto_solicitado}
                    tasa={data.tasa_interes}
                    cuotas={data.cuotas_solicitadas}
                    frecuencia={data.frecuencia}
                    seguro={data.seguro}
                    seguro_financiado={data.seguro_financiado}
                    cantidadIntegrantes={numIntegrantes}
                    className="mt-6"
                />
            )}
        </div>
    );
};

export default SectionCondiciones;