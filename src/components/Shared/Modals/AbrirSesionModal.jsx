import React, { useState, useEffect } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { BanknotesIcon, ChatBubbleLeftEllipsisIcon, KeyIcon } from '@heroicons/react/24/outline';
import CajaSearchSelect from 'components/Shared/Comboboxes/CajaSearchSelect';

const AbrirSesionModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [cajaId, setCajaId]             = useState('');
    const [montoApertura, setMontoApertura] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [pin, setPin]                   = useState('');
    const [cajaKey, setCajaKey]           = useState(Date.now());

    useEffect(() => {
        if (isOpen) {
            setCajaId('');
            setMontoApertura('');
            setObservaciones('');
            setPin('');
            setCajaKey(Date.now());
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            caja_id:        cajaId,
            monto_apertura: montoApertura || 0,
            observaciones:  observaciones,
            pin:            pin,
        });
    };

    const canSubmit = cajaId && montoApertura !== '' && pin.length === 6;

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={true} title="Aperturar Turno de Caja">
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Caja */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Seleccionar Caja Física *</label>
                    <CajaSearchSelect
                        key={cajaKey}
                        onSelect={(caja) => setCajaId(caja ? caja.id : '')}
                        disabled={loading}
                    />
                </div>

                {/* Monto apertura */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Monto de Apertura (Sencillo) *</label>
                    <div className="relative">
                        <BanknotesIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="number" step="0.01" min="0" required
                            value={montoApertura}
                            onChange={(e) => setMontoApertura(e.target.value)}
                            placeholder="Ej: 50.00"
                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-brand-red outline-none transition-all"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Observaciones */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Notas de Apertura</label>
                    <div className="relative">
                        <ChatBubbleLeftEllipsisIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Ej: Se recibe con monedas de 1 y 5 soles..."
                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:ring-2 focus:ring-brand-red outline-none transition-all min-h-[80px]"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* PIN de autorización */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <KeyIcon className="w-3.5 h-3.5" />
                        PIN de Autorización *
                    </label>
                    <div className="flex gap-2 justify-center">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <input
                                key={i}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={pin[i] || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/, '').slice(-1);
                                    const arr = pin.split('');
                                    arr[i] = val;
                                    // rellenar huecos con ''
                                    const next = Array.from({ length: 6 }, (_, j) => arr[j] ?? '');
                                    setPin(next.join(''));
                                    // focus siguiente
                                    if (val) {
                                        const nextInput = e.target.parentElement.children[i + 1];
                                        nextInput?.focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !pin[i] && i > 0) {
                                        e.target.parentElement.children[i - 1]?.focus();
                                    }
                                }}
                                onPaste={(e) => {
                                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                    if (pasted.length === 6) setPin(pasted);
                                    e.preventDefault();
                                }}
                                disabled={loading}
                                className={`w-10 h-11 text-center text-base font-black rounded-xl border-2 outline-none transition-all
                                    ${pin[i] ? 'border-brand-red bg-brand-red-light text-brand-red' : 'border-slate-200 bg-slate-50 text-slate-700'}
                                    focus:border-brand-red focus:ring-2 focus:ring-brand-red/20`}
                            />
                        ))}
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium text-center mt-2">
                        Solicita el PIN a un administrador para aperturar el turno.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="w-full bg-brand-red text-white py-4 rounded-xl font-black uppercase text-sm shadow-lg shadow-brand-red/30 hover:bg-brand-red-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                    {loading ? 'Procesando...' : 'Abrir Turno Ahora'}
                </button>
            </form>
        </ViewModal>
    );
};

export default AbrirSesionModal;