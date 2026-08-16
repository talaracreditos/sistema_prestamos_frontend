import React from 'react';

/* ─────────────────────────────────────────────────────────────
 * BARRA DE PROGRESO
 * ───────────────────────────────────────────────────────────── */
const ProgresoPago = ({ pagadas, total, esVistaPersonal }) => {
    const pct = total > 0 ? Math.round((pagadas / total) * 100) : 0;
    return (
        <div data-tutorial="progreso" className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest transition-colors">
                    {esVistaPersonal ? 'Tu avance de pago' : 'Avance del grupo'}
                </p>
                <p className="text-[11px] font-black text-brand-red dark:text-brand-gold transition-colors">
                    {pagadas} de {total} cuotas pagadas
                </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-dark-surface-alt rounded-full h-3 overflow-hidden transition-colors">
                <div
                    className="h-full bg-gradient-to-r from-brand-red to-brand-gold rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted mt-1.5 text-right transition-colors">{pct}% completado</p>
        </div>
    );
};

export default ProgresoPago;