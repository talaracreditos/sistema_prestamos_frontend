import React, { useState } from 'react';
import Modal from 'components/Shared/Modals/ViewModal';
import { PhotoIcon, DocumentCheckIcon, ArrowsRightLeftIcon, XMarkIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const DesembolsoModal = ({ isOpen, onClose, prestamo, onConfirm, loading }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [nroOperacion, setNroOperacion] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setNroOperacion('');
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) return;

        const prestamoId = prestamo?.id ?? prestamo?.value ?? prestamo?.prestamo_id;
        if (!prestamoId) {
            console.error('[DesembolsoModal] prestamo sin id:', prestamo);
            return;
        }

        const fd = new FormData();
        fd.append('prestamo_id', prestamoId);
        fd.append('comprobante', file);
        fd.append('metodo_pago', 'TRANSFERENCIA');
        fd.append('numero_operacion', nroOperacion);

        onConfirm(fd);
    };

    if (!prestamo) return null;

    const presidente = prestamo?.presidente ?? null;
    const cuentas = presidente?.cuentas_bancarias ?? [];

    return (
        <Modal isOpen={isOpen} hideFooter={true} onClose={reset} title="Autorizar Salida de Dinero" size="3xl">
            <div className="flex flex-col md:flex-row -m-5 h-full min-h-[600px] max-h-[80vh]">

                {/* Panel izquierdo */}
                <div className="w-full md:w-[45%] flex flex-col bg-white border-r border-slate-100 overflow-y-auto">
                    <div className="p-8 flex-1 space-y-6">

                        {/* Card monto + beneficiario + cuentas del presidente */}
                        <div className="bg-slate-900 p-6 rounded-[28px] text-white shadow-xl border border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowsRightLeftIcon className="w-4 h-4 text-brand-gold" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Importe Desembolso</span>
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-brand-gold">S/ {prestamo.monto}</h2>

                            <div className="mt-5 pt-5 border-t border-white/10">
                                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Beneficiario / Titular:</p>
                                <p className="text-sm font-black uppercase leading-snug text-white break-words">
                                    {prestamo.cliente}
                                </p>
                            </div>

                            {prestamo.es_grupal && presidente && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <BuildingLibraryIcon className="w-3.5 h-3.5 text-brand-gold" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            Cuentas — {presidente.nombre} <span className="text-slate-500">· {presidente.dni}</span>
                                        </p>
                                    </div>
                                    {cuentas.length > 0 ? (
                                        <div className="space-y-2">
                                            {cuentas.map((cuenta, i) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                        {cuenta.banco}
                                                    </p>
                                                    <p className="text-xs font-black text-white tracking-widest">{cuenta.numero_cuenta}</p>
                                                    {cuenta.cci && (
                                                        <p className="text-[10px] text-slate-400 font-bold">CCI: {cuenta.cci}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] italic text-slate-500 font-bold uppercase">Sin cuentas registradas</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nro de Operación Bancaria</label>
                                <input
                                    type="text"
                                    value={nroOperacion}
                                    onChange={(e) => setNroOperacion(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-red focus:ring-brand-red focus:bg-white outline-none transition-all"
                                    placeholder="Ej: BCP-009283"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Evidencia*</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="modal-desembolso-upload" />
                                <label
                                    htmlFor="modal-desembolso-upload"
                                    className={`flex items-center justify-center w-full p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                                        file ? 'border-brand-red bg-brand-red-light/50 text-brand-red' : 'border-slate-200 hover:border-brand-red/50 hover:bg-slate-50 text-slate-500'
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-1 font-black text-[10px] uppercase">
                                        <PhotoIcon className="w-6 h-6 mb-1" />
                                        {file ? 'Voucher Cargado ✓' : 'Subir Captura / Voucher'}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Vista previa en móvil */}
                        <div className="md:hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Vista Previa:</p>
                            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 min-h-[200px]">
                                {preview ? (
                                    <img src={preview} alt="Voucher Preview" className="max-h-[300px] rounded-lg shadow-sm" />
                                ) : (
                                    <p className="text-[10px] font-black text-slate-300 uppercase italic">Sin archivo seleccionado</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botón sticky al fondo */}
                    <div className="sticky bottom-0 bg-white px-8 py-4 border-t border-slate-100">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !file}
                            className="w-full bg-brand-red text-white py-5 rounded-2xl font-black uppercase text-xs shadow-lg shadow-brand-red/30 hover:bg-brand-red-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <DocumentCheckIcon className="w-5 h-5" />
                            )}
                            Confirmar y Desembolsar
                        </button>
                    </div>
                </div>

                {/* Vista previa en escritorio */}
                <div className="hidden md:flex md:w-[55%] bg-slate-50 relative items-center justify-center p-6">
                    {preview ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                            <img
                                src={preview}
                                alt="Voucher Preview"
                                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white border border-slate-200"
                            />
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="absolute top-4 right-4 bg-white text-brand-red p-2 rounded-full shadow-xl hover:bg-brand-red hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <PhotoIcon className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin Vista Previa</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default DesembolsoModal;