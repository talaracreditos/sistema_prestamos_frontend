import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
// Boton de refresco para actualizar la información de la página. Se puede usar en cualquier parte de la aplicación donde se necesite un botón de actualización.

const RefreshButton = ({ onClick, loading = false, title = 'Actualizar' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading}
        title={title}
        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl border border-slate-200 dark:border-dark-border hover:border-brand-red/30 dark:hover:border-brand-gold/30 transition-all disabled:opacity-40"
    >
        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
    </button>
);

export default RefreshButton;