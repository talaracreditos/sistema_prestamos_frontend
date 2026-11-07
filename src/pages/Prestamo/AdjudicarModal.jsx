import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ScaleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAdjudicarModal } from 'hooks/Prestamo/useAdjudicarModal';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const AdjudicarModal = ({ isOpen, onClose, prestamoId, valorTasado = 0, liquidacion = null, diasAtraso = 0, onSuccess }) => {

    const {
        loading, alert, observaciones, setObservaciones,
        cobrarInteres, setCobrarInteres,
        montoInteres, setMontoInteres,
        calculo,
        handleSubmit, reset,
    } = useAdjudicarModal({
        isOpen,
        liquidacion,
        onSuccess: (result) => { if (onSuccess) onSuccess(result); },
    });

    const handleClose = () => { if (!loading) { reset(); onClose(); } };

    const deudaHoy  = liquidacion ? calculo.deudaAjustada : 0;
    const cubreTodo = valorTasado >= deudaHoy;
    const restante  = Math.max(0, deudaHoy - valorTasado);

    return (
        <ViewModal isOpen={isOpen} onClose={handleClose} title="Adjudicar Garantía" size="md" hideFooter>
            <div className="relative space-y-4 p-1 transition-colors">

                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-2xl transition-colors">
                        <div className="w-8 h-8 border-4 border-brand-red/20 dark:border-brand-gold/20 border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">Adjudicando...</p>
                    </div>
                )}

                {/* ── Fila superior: deuda hoy + aviso, lado a lado ── */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2 bg-slate-900 dark:bg-black rounded-2xl p-4 text-white dark:text-dark-text border border-transparent dark:border-dark-border transition-colors flex flex-col justify-center">
                        <p className="text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted tracking-[0.15em] mb-1">
                            {diasAtraso} días de atraso
                        </p>
                        <p className="text-2xl font-black text-brand-red dark:text-brand-gold italic leading-tight">S/ {fmt(deudaHoy)}</p>
                        <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-1">Deuda total exigible a hoy</p>
                    </div>

                    <div className="sm:col-span-3 flex items-start gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase leading-tight">
                                La joya pasará a ser propiedad de la casa
                            </p>
                            <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 mt-1">
                                Esta acción no se puede deshacer. Verifica que la pieza esté físicamente disponible.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Fila media: cobrar interés + resumen económico, lado a lado ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 space-y-2.5 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase">¿Cobrar interés?</span>
                            <div className="flex bg-white dark:bg-dark-surface p-0.5 rounded-lg border border-slate-200 dark:border-dark-border">
                                <button type="button" disabled={loading}
                                    onClick={() => setCobrarInteres(true)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${cobrarInteres ? 'bg-brand-red dark:bg-brand-red-glow text-white' : 'text-slate-400 dark:text-dark-text-muted'}`}
                                >
                                    Sí
                                </button>
                                <button type="button" disabled={loading}
                                    onClick={() => setCobrarInteres(false)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${!cobrarInteres ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'text-slate-400 dark:text-dark-text-muted'}`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        {cobrarInteres ? (
                            <div>
                                <label className="block text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1">
                                    Monto a cobrar (máx. S/ {fmt(calculo.interesPendiente)})
                                </label>
                                <input
                                    type="text" inputMode="decimal" disabled={loading}
                                    value={montoInteres}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                        if (raw === '' || raw === '.') { setMontoInteres(raw); return; }
                                        const max = calculo.interesPendiente;
                                        const num = parseFloat(raw);
                                        setMontoInteres(num > max ? String(max) : raw);
                                    }}
                                    placeholder={fmt(calculo.interesPendiente)}
                                    className="w-full p-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold disabled:cursor-not-allowed transition-colors"
                                />
                                {calculo.interesCondonado > 0 && (
                                    <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                                        Se condonará S/ {fmt(calculo.interesCondonado)}.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted">
                                No se cobrará interés — se condona el total pendiente (S/ {fmt(calculo.interesPendiente)}).
                            </p>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 space-y-1.5 transition-colors">
                        <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1">Desglose de la deuda</p>

                        {calculo.mora > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Mora</span>
                                <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(calculo.mora)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Seguro</span>
                            <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(calculo.seguro)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Custodia</span>
                            <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(calculo.custodia)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">
                                Interés {!cobrarInteres && <span className="text-amber-600 dark:text-amber-400">(condonado)</span>}
                            </span>
                            <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(calculo.interesAplicado)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Capital</span>
                            <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(calculo.capital)}</span>
                        </div>
                        {calculo.credito > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400">Crédito a favor</span>
                                <span className="text-xs font-black text-green-600 dark:text-green-400">− S/ {fmt(calculo.credito)}</span>
                            </div>
                        )}
                        {calculo.penalidad > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Penalidad pronto pago</span>
                                <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(calculo.penalidad)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">IGV</span>
                            <span className="text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(calculo.igv)}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-dark-border pt-1.5 mt-1.5">
                            <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase">Deuda total hoy</span>
                            <span className="text-sm font-black text-slate-800 dark:text-dark-text">S/ {fmt(deudaHoy)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">
                                <ScaleIcon className="w-3.5 h-3.5" /> Valor tasado
                            </span>
                            <span className="text-sm font-black text-slate-700 dark:text-dark-text">S/ {fmt(valorTasado)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200 dark:border-dark-border pt-1.5 mt-1.5">
                            <span className={`text-[10px] font-black uppercase ${cubreTodo ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                {cubreTodo ? 'Cubre todo' : 'Parcial'}
                            </span>
                            <span className={`text-sm font-black ${cubreTodo ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                {cubreTodo ? 'CANCELADO' : `Queda S/ ${fmt(restante)}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5">Observaciones (opcional)</label>
                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} disabled={loading}
                        placeholder="Ej: Cliente fallecido, se condona interés..." rows={2}
                        className="w-full p-3 bg-slate-50 dark:bg-dark-surface-alt border-2 border-slate-100 dark:border-dark-border rounded-2xl text-xs font-bold text-slate-700 dark:text-dark-text focus:border-brand-red dark:focus:border-brand-gold focus:bg-white dark:focus:bg-dark-surface outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60" />
                </div>

                {alert && (
                    <AlertMessage
                        type={alert.type}
                        message={alert.message}
                        details={alert.details}
                        onClose={() => {}}
                    />
                )}

                <button onClick={() => handleSubmit(prestamoId)} disabled={loading}
                    className="w-full bg-brand-red dark:bg-brand-red-glow text-white dark:text-black py-3.5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
                    {loading ? <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" /> : <ScaleIcon className="w-4 h-4" />}
                    {loading ? 'Adjudicando...' : 'Confirmar Adjudicación'}
                </button>
            </div>
        </ViewModal>
    );
};

export default AdjudicarModal;