import React from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';

// ── Badge Excedente ──
export const ExcedenteBadge = ({ monto, label = 'Exc. propio disponible' }) => {
    if (!monto || monto <= 0) return null;
    return (
        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-black text-purple-700 uppercase">{label}</span>
            <span className="text-[10px] font-black text-purple-800 ml-auto">S/ {parseFloat(monto).toFixed(2)}</span>
        </div>
    );
};

// ── Tarjeta Resumen Negra ──
export const ResumenPago = ({ cuota, totalAPagar, mora, excedenteIndividual, esGrupal, integrantesPendientes }) => (
    <div className="bg-slate-900 p-6 rounded-[28px] text-white shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="w-4 h-4 text-brand-gold" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                {parseFloat(cuota?.pago_acumulado) > 0 ? 'Saldo Pendiente' : 'Total a Cobrar'}
            </span>
        </div>
        <h2 className="text-4xl font-black italic tracking-tighter text-brand-gold">S/ {totalAPagar}</h2>
        {mora > 0 && (
            <p className="text-[10px] font-bold text-slate-400 mt-1">
                Cuota: S/ {(parseFloat(totalAPagar) - mora).toFixed(2)}
                <span className="text-red-400 ml-1">+ Mora: S/ {mora.toFixed(2)}</span>
            </p>
        )}
        {parseFloat(cuota?.mora_pagada || 0) > 0 && <p className="text-[10px] font-bold text-orange-400 mt-1">Mora ya cubierta: S/ {parseFloat(cuota.mora_pagada).toFixed(2)}</p>}
        {excedenteIndividual > 0 && (
            <p className="text-[10px] font-bold text-purple-400 mt-1 flex items-center gap-1">
                Excedente aplicado: -S/ {excedenteIndividual.toFixed(2)}
            </p>
        )}
        {parseFloat(cuota?.pago_acumulado) > 0 && <p className="text-[10px] font-bold text-blue-400 mt-1">Ya abonado: S/ {parseFloat(cuota.pago_acumulado).toFixed(2)}</p>}
        <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Cuota N° {cuota?.nro} — {cuota?.vencimiento}</p>
            <p className="text-sm font-black uppercase leading-snug text-white break-words">{cuota?.cliente ?? (esGrupal ? 'Préstamo Grupal' : 'Cliente')}</p>
            {esGrupal && integrantesPendientes.length > 0 && (
                <p className="text-[9px] font-bold text-slate-400 mt-2">{integrantesPendientes.length} socio{integrantesPendientes.length > 1 ? 's' : ''} habilitado{integrantesPendientes.length > 1 ? 's' : ''} para pagar</p>
            )}
        </div>
    </div>
);

// ── Lista de Distribución Grupal ──
export const DistribucionGrupal = ({ distribucion, handleMontoIntegrante, integrantesPendientes, soloUnIntegrante, totalDistribuido, totalAPagar, recibido }) => (
    <div className="border border-brand-gold/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-brand-gold-light px-4 py-2.5 border-b border-brand-gold/30">
            <p className="text-[10px] font-black text-brand-gold-dark uppercase">{soloUnIntegrante ? 'Socio Habilitado — Cuota Actual' : 'Socios Habilitados — Cuota Actual'}</p>
            <p className="text-[9px] text-brand-gold-dark/70 font-bold mt-0.5">Vacío = paga su saldo completo. Ingresa monto si pagó parcialmente.</p>
        </div>
        <div className="divide-y divide-slate-100 bg-white">
            {integrantesPendientes.map((int) => {
                const val          = distribucion[int.id];
                const esCompleto   = !val || val === '';
                const saldoCap     = parseFloat(int.saldo_capital ?? int.saldo ?? 0);
                const moraPend     = parseFloat(int.mora_pendiente ?? 0);
                const saldoTotal   = saldoCap + moraPend;
                const montoPuesto  = parseFloat(val || 0);
                const pagaMas      = !esCompleto && montoPuesto >= saldoTotal;
                const excedenteProp= parseFloat(int.excedente_anterior ?? 0);

                return (
                    <div key={int.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-slate-700 uppercase truncate">{int.nombre}</p>
                                <div className="flex flex-col mt-0.5 gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] text-slate-400 font-bold">Cuota: S/ {parseFloat(int.total_cuota || 0).toFixed(2)}</p>
                                        {parseFloat(int.pago_acumulado || 0) > 0 && <p className="text-[9px] text-green-600 font-bold">Pagó: S/ {parseFloat(int.pago_acumulado).toFixed(2)}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] font-black text-slate-600">Falta: S/ {saldoCap.toFixed(2)}</p>
                                        {moraPend > 0 && <p className="text-[9px] text-red-500 font-bold">+ Mora: S/ {moraPend.toFixed(2)}</p>}
                                        {moraPend > 0 && <p className="text-[9px] font-black text-slate-800">= S/ {(saldoCap + moraPend).toFixed(2)}</p>}
                                    </div>
                                </div>
                            </div>
                            <input type="text" inputMode="decimal" value={val ?? ''} onChange={e => handleMontoIntegrante(int.id, e.target.value)} placeholder="Completo"
                                className={`w-28 p-2 border rounded-xl text-xs font-black outline-none focus:ring-1 text-right transition-all
                                    ${esCompleto || pagaMas ? 'border-green-200 bg-green-50 text-green-700 placeholder-green-400 focus:ring-green-400' : 'border-brand-gold/50 bg-white text-brand-gold-dark focus:ring-brand-gold focus:border-brand-gold'}`} />
                            <div className="w-14 text-right flex-shrink-0">
                                {esCompleto || pagaMas ? <span className="text-[9px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">✓ FULL</span> : <span className="text-[9px] font-black text-brand-gold-dark bg-brand-gold-light px-1.5 py-0.5 rounded border border-brand-gold/30">PARCIAL</span>}
                            </div>
                        </div>
                        {excedenteProp > 0 && <div className="mt-1.5 ml-0"><ExcedenteBadge monto={excedenteProp} /></div>}
                    </div>
                );
            })}
        </div>
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase">Total distribuido:</span>
            <span className={`text-sm font-black ${Math.abs(totalDistribuido - parseFloat(recibido)) < 0.01 ? 'text-green-600' : 'text-brand-gold-dark'}`}>
                S/ {totalDistribuido.toFixed(2)} <span className="text-[9px] text-slate-400 font-bold ml-1">/ S/ {totalAPagar}</span>
            </span>
        </div>
    </div>
);

// ── Alertas de Error ──
export const AlertasPago = ({ noCubreMora, mora, integrantesSinCubrirMora }) => (
    <>
        {noCubreMora && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-xs font-black text-red-700 uppercase">⚠ Debe cubrir la mora primero</p>
                <p className="text-[11px] text-red-500 mt-1">El monto mínimo es <span className="font-black">S/ {mora.toFixed(2)}</span>.</p>
            </div>
        )}
        {integrantesSinCubrirMora.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-xs font-black text-red-700 uppercase">⚠ Mora pendiente sin cubrir</p>
                <div className="mt-1.5 space-y-1">
                    {integrantesSinCubrirMora.map(int => (
                        <p key={int.id} className="text-[11px] text-red-500">
                            <span className="font-black">{int.nombre}</span> — mora: <span className="font-black">S/ {parseFloat(int.mora_pendiente).toFixed(2)}</span>
                        </p>
                    ))}
                </div>
            </div>
        )}
    </>
);