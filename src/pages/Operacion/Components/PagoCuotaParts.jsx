import React from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';

// ── Badge Excedente ──
export const ExcedenteBadge = ({ monto, label = 'Exc. propio disponible' }) => {
    if (!monto || monto <= 0) return null;
    return (
        <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl px-3 py-1.5 transition-colors">
            <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase">{label}</span>
            <span className="text-[10px] font-black text-purple-800 dark:text-purple-300 ml-auto">S/ {parseFloat(monto).toFixed(2)}</span>
        </div>
    );
};

// ── Tarjeta Resumen Negra ──
export const ResumenPago = ({ cuota, totalAPagar, mora, excedenteIndividual, esGrupal, integrantesPendientes }) => (
    <div className="bg-slate-900 dark:bg-black p-6 rounded-[28px] text-white dark:text-dark-text shadow-xl dark:shadow-black/50 border border-slate-800 dark:border-dark-border transition-colors">
        <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="w-4 h-4 text-brand-gold" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-dark-text-muted">
                {parseFloat(cuota?.pago_acumulado) > 0 ? 'Saldo Pendiente' : 'Total a Cobrar'}
            </span>
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter text-brand-gold">S/ {totalAPagar}</h2>
        {mora > 0 && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted mt-1 transition-colors">
                Cuota: S/ {(parseFloat(totalAPagar) - mora).toFixed(2)}
                <span className="text-red-400 dark:text-red-400 ml-1">+ Mora: S/ {mora.toFixed(2)}</span>
            </p>
        )}
        {parseFloat(cuota?.mora_pagada || 0) > 0 && <p className="text-[10px] font-bold text-orange-400 dark:text-orange-300 mt-1">Mora ya cubierta: S/ {parseFloat(cuota.mora_pagada).toFixed(2)}</p>}
        {excedenteIndividual > 0 && (
            <p className="text-[10px] font-bold text-purple-400 dark:text-purple-300 mt-1 flex items-center gap-1">
                Excedente aplicado: -S/ {excedenteIndividual.toFixed(2)}
            </p>
        )}
        {parseFloat(cuota?.pago_acumulado) > 0 && <p className="text-[10px] font-bold text-blue-400 dark:text-blue-300 mt-1">Ya abonado: S/ {parseFloat(cuota.pago_acumulado).toFixed(2)}</p>}
        <div className="mt-5 pt-5 border-t border-white/10 dark:border-dark-border transition-colors">
            <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-dark-text-muted mb-1.5 transition-colors">Cuota N° {cuota?.nro} — {cuota?.vencimiento}</p>
            <p className="text-sm font-black uppercase leading-snug text-white dark:text-dark-text break-words transition-colors">{cuota?.cliente ?? (esGrupal ? 'Préstamo Grupal' : 'Cliente')}</p>
            {esGrupal && integrantesPendientes.length > 0 && (
                <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted mt-2 transition-colors">{integrantesPendientes.length} socio{integrantesPendientes.length > 1 ? 's' : ''} habilitado{integrantesPendientes.length > 1 ? 's' : ''} para pagar</p>
            )}
        </div>
    </div>
);

// ── Lista de Distribución Grupal ──
export const DistribucionGrupal = ({ distribucion, handleMontoIntegrante, integrantesPendientes, soloUnIntegrante, totalDistribuido, totalAPagar, recibido }) => (
    <div className="border border-brand-gold/30 dark:border-brand-gold/20 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="bg-brand-gold-light dark:bg-brand-gold/10 px-4 py-2.5 border-b border-brand-gold/30 dark:border-brand-gold/20 transition-colors">
            <p className="text-[10px] font-black text-brand-gold-dark dark:text-brand-gold uppercase">{soloUnIntegrante ? 'Socio Habilitado — Cuota Actual' : 'Socios Habilitados — Cuota Actual'}</p>
            <p className="text-[9px] text-brand-gold-dark/70 dark:text-brand-gold/80 font-bold mt-0.5">Vacío = paga su saldo completo. Ingresa monto si pagó parcialmente.</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-dark-border bg-white dark:bg-dark-surface transition-colors">
            {integrantesPendientes.map((int) => {
                const val         = distribucion[int.id];
                const esCompleto   = !val || val === '';
                const saldoCap     = parseFloat(int.saldo_capital ?? int.saldo ?? 0);
                const moraPend     = parseFloat(int.mora_pendiente ?? 0);
                const saldoTotal   = saldoCap + moraPend;
                const montoPuesto  = parseFloat(val || 0);
                const pagaMas      = !esCompleto && montoPuesto >= saldoTotal;
                const excedenteProp= parseFloat(int.excedente_anterior ?? 0);

                return (
                    <div key={int.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase truncate transition-colors">{int.nombre}</p>
                                <div className="flex flex-col mt-0.5 gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold transition-colors">Cuota: S/ {parseFloat(int.total_cuota || 0).toFixed(2)}</p>
                                        {parseFloat(int.pago_acumulado || 0) > 0 && <p className="text-[9px] text-green-600 dark:text-green-400 font-bold">Pagó: S/ {parseFloat(int.pago_acumulado).toFixed(2)}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] font-black text-slate-600 dark:text-dark-text transition-colors">Falta: S/ {saldoCap.toFixed(2)}</p>
                                        {moraPend > 0 && <p className="text-[9px] text-red-500 dark:text-red-400 font-bold">+ Mora: S/ {moraPend.toFixed(2)}</p>}
                                        {moraPend > 0 && <p className="text-[9px] font-black text-slate-800 dark:text-dark-text transition-colors">= S/ {(saldoCap + moraPend).toFixed(2)}</p>}
                                    </div>
                                </div>
                            </div>
                            <input type="text" inputMode="decimal" value={val ?? ''} onChange={e => handleMontoIntegrante(int.id, e.target.value)} placeholder="Completo"
                                className={`w-28 p-2 border rounded-xl text-xs font-black outline-none focus:ring-1 text-right transition-all
                                    ${esCompleto || pagaMas ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 placeholder-green-400 focus:ring-green-400' : 'border-brand-gold/50 dark:border-brand-gold/30 bg-white dark:bg-dark-surface text-brand-gold-dark dark:text-brand-gold focus:ring-brand-gold focus:border-brand-gold'}`} />
                            <div className="w-14 text-right flex-shrink-0">
                                {esCompleto || pagaMas ? <span className="text-[9px] font-black text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-500/20 transition-colors">✓ FULL</span> : <span className="text-[9px] font-black text-brand-gold-dark dark:text-brand-gold bg-brand-gold-light dark:bg-brand-gold/10 px-1.5 py-0.5 rounded border border-brand-gold/30 dark:border-brand-gold/20 transition-colors">PARCIAL</span>}
                            </div>
                        </div>
                        {excedenteProp > 0 && <div className="mt-1.5 ml-0"><ExcedenteBadge monto={excedenteProp} /></div>}
                    </div>
                );
            })}
        </div>
        <div className="bg-slate-50 dark:bg-dark-surface-alt px-4 py-3 border-t border-slate-200 dark:border-dark-border flex justify-between items-center transition-colors">
            <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase transition-colors">Total distribuido:</span>
            <span className={`text-sm font-black ${Math.abs(totalDistribuido - parseFloat(recibido)) < 0.01 ? 'text-green-600 dark:text-green-400' : 'text-brand-gold-dark dark:text-brand-gold'}`}>
                S/ {totalDistribuido.toFixed(2)} <span className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold ml-1">/ S/ {totalAPagar}</span>
            </span>
        </div>
    </div>
);

// ── Alertas de Error ──
export const AlertasPago = ({ noCubreMora, mora, integrantesSinCubrirMora }) => (
    <>
        {noCubreMora && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 transition-colors">
                <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase">⚠ Debe cubrir la mora primero</p>
                <p className="text-[11px] text-red-500 dark:text-red-300 mt-1">El monto mínimo es <span className="font-black">S/ {mora.toFixed(2)}</span>.</p>
            </div>
        )}
        {integrantesSinCubrirMora.length > 0 && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 transition-colors">
                <p className="text-xs font-black text-red-700 dark:text-red-400 uppercase">⚠ Mora pendiente sin cubrir</p>
                <div className="mt-1.5 space-y-1">
                    {integrantesSinCubrirMora.map(int => (
                        <p key={int.id} className="text-[11px] text-red-500 dark:text-red-300">
                            <span className="font-black">{int.nombre}</span> — mora: <span className="font-black">S/ {parseFloat(int.mora_pendiente).toFixed(2)}</span>
                        </p>
                    ))}
                </div>
            </div>
        )}
    </>
);