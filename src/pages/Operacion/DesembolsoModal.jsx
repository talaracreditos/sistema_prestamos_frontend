import React, { useState, useEffect } from 'react';
import { PhotoIcon, DocumentCheckIcon, ArrowsRightLeftIcon, XMarkIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const DesembolsoModal = ({ isOpen, onClose, prestamo, onConfirm, loading }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [nroOperacion, setNroOperacion] = useState('');

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); }
    };

    const reset = () => { setFile(null); setPreview(null); setNroOperacion(''); onClose(); };

    const handleSubmit = () => {
        if (!file) return;
        const prestamoId = prestamo?.id ?? prestamo?.value ?? prestamo?.prestamo_id;
        if (!prestamoId) return;
        const fd = new FormData();
        fd.append('prestamo_id', prestamoId);
        fd.append('comprobante', file);
        fd.append('metodo_pago', 'TRANSFERENCIA');
        fd.append('numero_operacion', nroOperacion);
        onConfirm(fd);
    };

    if (!isOpen || !prestamo) return null;

    const presidente = prestamo?.presidente ?? null;
    const cuentas    = presidente?.cuentas_bancarias ?? [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                onClick={reset}
            />

            {/* Modal */}
            <div
                className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden w-full"
                style={{ maxWidth: 1080, height: 680 }}
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-7 py-4 bg-white border-b border-slate-100">
                    <span className="text-[11px] font-black uppercase tracking-[.18em] text-slate-800">
                        Autorizar Salida de Dinero
                    </span>
                    <button
                        onClick={reset}
                        className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body — dos columnas */}
                <div className="flex h-full pt-[57px]">

                    {/* ── IZQUIERDA ── */}
                    <div className="flex flex-col border-r border-slate-100" style={{ width: 500 }}>

                        {/* Scroll area */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                            {/* Card oscura */}
                            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowsRightLeftIcon className="w-3.5 h-3.5 text-yellow-400" />
                                        <span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500">
                                            Importe Desembolso
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 bg-slate-800 px-2.5 py-1 rounded-full">
                                        #{prestamo.id}
                                    </span>
                                </div>

                                <p className="text-[30px] font-black italic tracking-tighter text-yellow-400 leading-none">
                                    S/ {Number(prestamo.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                </p>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-[.15em] text-slate-500 mb-0.5">
                                        Beneficiario
                                    </p>
                                    <p className="text-sm font-black uppercase text-white leading-snug break-words">
                                        {prestamo.cliente}
                                    </p>
                                </div>

                                {prestamo.es_grupal && presidente && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <BuildingLibraryIcon className="w-3 h-3 text-yellow-400" />
                                            <p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-400">
                                                Cuentas · {presidente.nombre}
                                                <span className="text-slate-600 ml-1">· {presidente.dni}</span>
                                            </p>
                                        </div>
                                        {cuentas.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {cuentas.map((c, i) => (
                                                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                                        <p className="text-[9px] font-black uppercase tracking-wider text-yellow-500/80">{c.banco}</p>
                                                        <p className="text-xs font-black tracking-widest text-white mt-0.5">{c.numero_cuenta}</p>
                                                        {c.cci && <p className="text-[9px] font-bold text-slate-500 mt-0.5">CCI: {c.cci}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[9px] italic text-slate-600 font-bold uppercase">Sin cuentas registradas</p>
                                        )}
                                    </div>
                                )}

                                {!prestamo.es_grupal && prestamo.cuentas_bancarias?.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <BuildingLibraryIcon className="w-3 h-3 text-yellow-400" />
                                            <p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-400">
                                                Cuentas Bancarias
                                            </p>
                                        </div>
                                        <div className="space-y-1.5">
                                            {prestamo.cuentas_bancarias.map((c, i) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                                    <p className="text-[9px] font-black uppercase tracking-wider text-yellow-500/80">{c.banco}</p>
                                                    <p className="text-xs font-black tracking-widest text-white mt-0.5">{c.numero_cuenta}</p>
                                                    {c.cci && <p className="text-[9px] font-bold text-slate-500 mt-0.5">CCI: {c.cci}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Nro operación */}
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-[.12em] text-slate-400 mb-1.5 ml-0.5">
                                    Nro de Operación Bancaria
                                </label>
                                <input
                                    type="text"
                                    value={nroOperacion}
                                    onChange={(e) => setNroOperacion(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none transition-all focus:border-red-500 focus:bg-white"
                                    placeholder="Ej: BCP-009283"
                                />
                            </div>
                        </div>

                        {/* Botón confirmar fijo abajo */}
                        <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !file}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-100 transition-all active:scale-[.98]"
                            >
                                {loading
                                    ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    : <DocumentCheckIcon className="w-4 h-4" />
                                }
                                Confirmar y Desembolsar
                            </button>
                        </div>
                    </div>

                    {/* ── DERECHA: preview + upload ── */}
                    <div className="flex flex-col flex-1 bg-slate-50 p-4 gap-3">

                        {/* Preview */}
                        <div className="relative flex-1 flex items-center justify-center rounded-2xl border border-slate-200 bg-white overflow-hidden group">
                            {preview ? (
                                <>
                                    <img
                                        src={preview}
                                        alt="Voucher"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <button
                                        onClick={() => { setFile(null); setPreview(null); }}
                                        className="absolute top-3 right-3 p-1.5 bg-white border border-slate-100 rounded-full text-red-400 shadow hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <XMarkIcon className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center select-none">
                                    <PhotoIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Sin Vista Previa</p>
                                </div>
                            )}
                        </div>

                        {/* Upload */}
                        <div className="shrink-0">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="modal-desembolso-upload" />
                            <label
                                htmlFor="modal-desembolso-upload"
                                className={`flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                    file
                                        ? 'border-red-400 bg-red-50 text-red-500'
                                        : 'border-slate-200 bg-white text-slate-400 hover:border-red-300 hover:bg-slate-50'
                                }`}
                            >
                                <PhotoIcon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                    {file ? `✓ ${file.name.slice(0, 28)}` : 'Subir Captura / Voucher'}
                                </span>
                            </label>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DesembolsoModal;