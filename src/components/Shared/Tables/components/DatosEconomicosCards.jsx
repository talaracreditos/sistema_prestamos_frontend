import React from 'react';

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const CardSkeleton = ({ accent = 'slate' }) => {
    const bg = {
        slate: 'bg-slate-50 dark:bg-dark-surface-alt border border-slate-100 dark:border-dark-border',
        gold:  'bg-brand-gold-light/20 dark:bg-brand-gold/10 border border-brand-gold/10 dark:border-brand-gold/20',
        red:   'bg-brand-red dark:bg-brand-red-glow',
        white: 'bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border',
    }[accent];
    const pulse = accent === 'red' ? 'bg-white/20' : 'bg-slate-200 dark:bg-dark-border';
    return (
        <div className={`p-4 rounded-2xl animate-pulse transition-colors ${bg}`}>
            <div className={`h-2.5 w-24 rounded-full mb-3 ${pulse}`} />
            <div className={`h-7 w-32 rounded-full mb-2 ${pulse}`} />
            <div className={`h-2 w-20 rounded-full mb-4 ${pulse}`} />
            <div className={`h-2 w-full rounded-full ${pulse}`} />
        </div>
    );
};

export const DatosEconomicosCardsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton accent="slate" />
        <CardSkeleton accent="gold"  />
        <CardSkeleton accent="red"   />
        <CardSkeleton accent="white" />
    </div>
);

// ── Cards económicas ──────────────────────────────────────────────────────────
const DatosEconomicosCards = ({ eco, estadoPrestamo, esVistaIntegrante }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-colors">

        {/* Capital */}
        <div className="p-4 bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border transition-colors">
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">
                {estadoPrestamo === 3 ? 'Capital Total' : 'Capital Pendiente'}
            </p>
            <p className="text-xl font-black text-slate-800 dark:text-dark-text">
                S/ {parseFloat(eco?.monto ?? 0).toFixed(2)}
            </p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-dark-text-muted mt-1">
                de S/ {parseFloat(eco?.monto_original ?? 0).toFixed(2)}
            </p>
            <div className="mt-3 w-full bg-slate-200 dark:bg-dark-border rounded-full h-2 overflow-hidden transition-colors">
                <div
                    className="h-full bg-slate-700 dark:bg-dark-text rounded-full transition-all duration-500"
                    style={{ width: `${((eco?.monto ?? 0) * 100) / (eco?.monto_original || 1)}%` }}
                />
            </div>
        </div>

        {/* Interés */}
        <div className="p-4 bg-brand-gold-light/20 dark:bg-brand-gold/10 rounded-2xl border border-brand-gold/10 dark:border-brand-gold/20 transition-colors">
            <p className="text-[10px] font-black uppercase text-brand-gold-dark dark:text-brand-gold mb-1">
                Interés Pendiente
            </p>
            <p className="text-xl font-black text-brand-gold-dark dark:text-brand-gold">
                S/ {parseFloat(eco?.interes_monto ?? 0).toFixed(2)}
            </p>
            <p className="text-[11px] font-bold text-brand-gold-dark/70 dark:text-brand-gold/80 mt-1">
                de S/ {parseFloat(eco?.interes_original ?? 0).toFixed(2)}
            </p>
            <div className="mt-3 w-full bg-brand-gold/20 dark:bg-brand-gold/20 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full bg-brand-gold rounded-full transition-all duration-500"
                    style={{ width: `${((eco?.interes_monto ?? 0) * 100) / (eco?.interes_original || 1)}%` }}
                />
            </div>
        </div>

        {/* Saldo total */}
        <div className="p-4 bg-brand-red dark:bg-brand-red-glow rounded-2xl shadow-xl shadow-brand-red/20 dark:shadow-black/30 transition-colors">
            <p className="text-[10px] font-black uppercase text-white/70 dark:text-dark-text-muted mb-1">
                {estadoPrestamo === 3 ? 'Total Cobrado' : 'Saldo Pendiente'}
            </p>
            <p className="text-xl font-black text-white dark:text-dark-text">
                S/ {parseFloat(eco?.total_prestamo ?? 0).toFixed(2)}
            </p>
            <p className="text-[11px] font-bold text-white/70 dark:text-dark-text-muted mt-1">
                de S/ {parseFloat(eco?.total_original ?? 0).toFixed(2)}
            </p>
            <div className="mt-3 w-full bg-white/20 dark:bg-dark-border rounded-full h-2 overflow-hidden transition-colors">
                <div
                    className="h-full bg-white dark:bg-dark-text rounded-full transition-all duration-500"
                    style={{ width: `${((eco?.total_prestamo ?? 0) * 100) / (eco?.total_original || 1)}%` }}
                />
            </div>
        </div>

        {/* Valor cuota + seguro */}
        <div className="p-4 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border flex flex-col justify-between transition-colors">
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1">
                    {esVistaIntegrante ? 'Cuota Individual' : 'Valor Cuota'}
                </p>
                <p className="text-xl font-black text-slate-800 dark:text-dark-text">
                    S/ {parseFloat(eco?.valor_cuota ?? 0).toFixed(2)}
                </p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-dark-text-muted mt-1 uppercase transition-colors">
                    {eco?.frecuencia}
                </p>
                <p className="text-[10px] font-bold text-brand-gold-dark dark:text-brand-gold mt-0.5 transition-colors">
                    Tasa: {eco?.interes_porc}%
                </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border transition-colors">
                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted">Seguro</p>
                <p className="text-sm font-black text-slate-700 dark:text-dark-text">
                    S/ {parseFloat(eco?.seguro || 0).toFixed(2)}
                </p>
                <p className={`text-[8px] font-black uppercase mt-1 ${eco?.seguro_financiado ? 'text-brand-gold-dark dark:text-brand-gold' : 'text-green-600 dark:text-green-400'}`}>
                    {eco?.seguro_financiado ? 'Financiado' : '✓ Ya Cobrado'}
                </p>
            </div>
        </div>

    </div>
);

export default DatosEconomicosCards;