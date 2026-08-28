// components/Shared/Cards/CajaChicaSaldoCard.jsx
import React from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';

const CajaChicaSaldoCard = ({ saldoActual = 0, saldoInicial = 0 }) => {
    return (
        <div className="bg-slate-900 dark:bg-black rounded-2xl shadow-lg p-6 sm:p-8 mb-4 border border-slate-800 dark:border-dark-border transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-700">
                <div className="flex flex-col items-center sm:items-start pb-4 sm:pb-0">
                    <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <BanknotesIcon className="w-4 h-4 text-brand-gold" /> Efectivo
                    </span>
                    <span className="text-3xl font-black text-white mt-2">
                        S/ {Number(saldoActual).toFixed(2)}
                    </span>
                </div>

                <div className="flex flex-col items-center sm:items-end pt-4 sm:pt-0 sm:pl-6">
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand-gold">
                        Saldo Inicial
                    </span>
                    <span className="text-2xl font-black text-white mt-2">
                        S/ {Number(saldoInicial).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CajaChicaSaldoCard;