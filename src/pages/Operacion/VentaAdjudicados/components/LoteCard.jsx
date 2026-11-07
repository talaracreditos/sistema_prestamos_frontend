import React from 'react';
import { ScaleIcon, EyeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const LoteCard = ({ lote, enCarrito, onVerDetalle }) => (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="p-4 bg-slate-900 dark:bg-black flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Lote #{lote.lote}</span>
            <ScaleIcon className="w-4 h-4 text-brand-gold" />
        </div>
        <div className="p-4 space-y-2">
            <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted uppercase">
                {lote.cantidad_piezas} pieza{lote.cantidad_piezas === 1 ? '' : 's'}
            </p>
            <p className="text-2xl font-black text-brand-red dark:text-brand-gold italic">S/ {fmt(lote.valor_total)}</p>
            {lote.fecha_adjudicacion && (
                <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted">
                    Adjudicado: {lote.fecha_adjudicacion}
                </p>
            )}

            <button
                onClick={() => onVerDetalle(lote.lote)}
                className={`mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 ${
                    enCarrito
                        ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                        : 'bg-brand-red text-white hover:bg-brand-red-dark'
                }`}
            >
                {enCarrito ? <><CheckCircleIcon className="w-3.5 h-3.5" /> En el carrito</> : <><EyeIcon className="w-3.5 h-3.5" /> Ver detalle</>}
            </button>
        </div>
    </div>
);

export default LoteCard;