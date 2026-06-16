import React, { useState, useRef, useEffect } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import { ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline';

/**
 * Modal reutilizable para ingresar PIN de autorización.
 *
 * Props:
 *   isOpen      - boolean
 *   onClose     - fn
 *   onConfirm   - fn(pin: string)
 *   title       - string (opcional)
 *   descripcion - string (opcional) — texto descriptivo debajo del título
 *   loading     - boolean
 *   error       - string|null — error externo a mostrar en el modal
 */
const PinModal = ({
    isOpen,
    onClose,
    onConfirm,
    title       = 'PIN de Autorización',
    descripcion = 'Ingresa el PIN generado por un administrador.',
    loading     = false,
    error       = null,
}) => {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const inputsRef = useRef([]);

    useEffect(() => {
        if (isOpen) {
            setDigits(['', '', '', '', '', '']);
            setTimeout(() => inputsRef.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    const handleChange = (index, value) => {
        const val = value.replace(/\D/, '').slice(-1);
        const next = [...digits];
        next[index] = val;
        setDigits(next);
        if (val && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') handleSubmit();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            inputsRef.current[5]?.focus();
        }
        e.preventDefault();
    };

    const handleSubmit = () => {
        const pin = digits.join('');
        if (pin.length < 6) return;
        onConfirm(pin);
    };

    const completo = digits.join('').length === 6;

    return (
        <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={true} title={title} size="sm">
            <div className="flex flex-col items-center gap-5 py-4">
                <div className="p-4 rounded-2xl bg-brand-red-light border border-brand-red/20">
                    <ShieldCheckIcon className="w-8 h-8 text-brand-red" />
                </div>

                <div className="text-center px-2">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{descripcion}</p>
                </div>

                {/* 6 inputs */}
                <div className="flex gap-2" onPaste={handlePaste}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={el => inputsRef.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className={`w-10 h-12 text-center text-lg font-black rounded-xl border-2 outline-none transition-all
                                ${error
                                    ? 'border-red-400 bg-red-50 text-red-600'
                                    : d
                                        ? 'border-brand-red bg-brand-red-light text-brand-red'
                                        : 'border-slate-200 bg-slate-50 text-slate-700'
                                }
                                focus:border-brand-red focus:ring-2 focus:ring-brand-red/20`}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-[10px] text-red-600 font-bold text-center">⚠ {error}</p>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!completo || loading}
                    className="w-full bg-brand-red text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-red/25 hover:bg-brand-red-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading
                        ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Verificando...</>
                        : <><KeyIcon className="w-4 h-4" /> Autorizar</>
                    }
                </button>
            </div>
        </ViewModal>
    );
};

export default PinModal;