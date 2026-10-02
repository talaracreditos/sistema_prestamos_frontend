import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ScaleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAdjudicarModal } from 'hooks/Prestamo/useAdjudicarModal';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const AdjudicarModal = ({ isOpen, onClose, prestamoId, valorTasado = 0, deudaHoy = 0, diasAtraso = 0, onSuccess }) => {

    const { loading, alert, observaciones, setObservaciones, handleSubmit, reset } = useAdjudicarModal({
        isOpen,
        onSuccess: (result) => { if (onSuccess) onSuccess(result); },
    });

    const handleClose = () => { if (!loading) { reset(); onClose(); } };

    const cubreTodo = valorTasado >= deudaHoy;
    const restante  = Math.max(0, deudaHoy - valorTasado);

    return (
        <ViewModal isOpen={isOpen} onClose={handleClose} title="Adjudicar Garantía" size="sm" hideFooter>
            <div className="relative space-y-5 p-1 transition-colors">

                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-2xl transition-colors">
                        <div className="w-8 h-8 border-4 border-brand-red/20 dark:border-brand-gold/20 border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">Adjudicando...</p>
                    </div>
                )}

                <div className="bg-slate-900 dark:bg-black rounded-[24px] p-5 text-white dark:text-dark-text border border-transparent dark:border-dark-border transition-colors">
                    <p className="text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted tracking-[0.2em] mb-1">
                        {diasAtraso} días de atraso
                    </p>
                    <p className="text-3xl font-black text-brand-red dark:text-brand-gold italic">S/ {fmt(deudaHoy)}</p>
                    <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-1">Deuda total exigible a hoy</p>
                </div>

                <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase">
                            La joya pasará a ser propiedad de la casa
                        </p>
                        <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 mt-1">
                            Esta acción no se puede deshacer. Verifica que la pieza esté físicamente disponible antes de continuar.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 space-y-2 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">
                            <ScaleIcon className="w-3.5 h-3.5" /> Valor tasado
                        </span>
                        <span className="text-sm font-black text-slate-700 dark:text-dark-text">S/ {fmt(valorTasado)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Deuda total hoy</span>
                        <span className="text-sm font-black text-slate-700 dark:text-dark-text">S/ {fmt(deudaHoy)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-dark-border pt-2">
                        <span className={`text-[10px] font-black uppercase ${cubreTodo ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                            {cubreTodo ? 'Cubre toda la deuda' : 'Cobertura parcial'}
                        </span>
                        <span className={`text-lg font-black ${cubreTodo ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                            {cubreTodo ? 'PRÉSTAMO CANCELADO' : `Queda S/ ${fmt(restante)}`}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2">Observaciones (opcional)</label>
                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} disabled={loading}
                        placeholder="Ej: Pieza recibida en tienda, sin daños..." rows={2}
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
                    className="w-full bg-brand-red dark:bg-brand-red-glow text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
                    {loading ? <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" /> : <ScaleIcon className="w-4 h-4" />}
                    {loading ? 'Adjudicando...' : 'Confirmar Adjudicación'}
                </button>
            </div>
        </ViewModal>
    );
};

export default AdjudicarModal;