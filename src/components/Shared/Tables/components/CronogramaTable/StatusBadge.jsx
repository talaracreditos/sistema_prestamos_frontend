import React from 'react';

const STATUS_STYLES = {
    0: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-400 dark:text-dark-text-muted border-slate-200 dark:border-dark-border',
    1: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20',
    2: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20',
    3: 'bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border-brand-gold/30 dark:border-brand-gold/20',
    4: 'bg-brand-red-light dark:bg-red-500/10 text-brand-red dark:text-red-400 border-brand-red/30 dark:border-red-500/20',
    5: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20',
    6: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
};

const STATUS_LABELS = {
    0: 'CANCELADO', 1: 'PENDIENTE', 2: 'PAGADO',
    3: 'VENCE HOY', 4: 'VENCIDO',  5: 'PARCIAL', 6: 'REFINANCIADO',
};

export const getStatusBadge = (estado) => (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border whitespace-nowrap transition-colors ${STATUS_STYLES[estado] ?? STATUS_STYLES[1]}`}>
        {STATUS_LABELS[estado] ?? 'PENDIENTE'}
    </span>
);