import React, { useState, useEffect } from 'react';
import { PhotoIcon, DocumentCheckIcon, ArrowsRightLeftIcon, XMarkIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import ViewModal from 'components/Shared/Modals/ViewModal';

const DesembolsoModal = ({ isOpen, onClose, prestamo, onConfirm, loading }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [nroOperacion, setNroOperacion] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setPreview(null);
            setNroOperacion('');
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); }
    };

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

    if (!prestamo) return null;

    const presidente = prestamo?.presidente ?? null;
    const cuentas    = presidente?.cuentas_bancarias ?? [];

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Autorizar Salida de Dinero"
            size="xl"
            hideFooter={true}
        >
            {/* Desktop: dos columnas | Mobile: una columna scrolleable */}
            <div className="flex flex-col md:flex-row md:overflow-hidden overflow-y-auto transition-colors" style={{ height: 590 }}>

                {/* ── IZQUIERDA ── */}
                <div className="flex flex-col md:border-r border-b md:border-b-0 border-slate-100 dark:border-dark-border shrink-0 md:w-[500px] w-full transition-colors">

                    {/* Scroll area */}
                    <div className="md:flex-1 md:overflow-y-auto px-6 py-5 space-y-4">

                        {/* Card oscura */}
                        <div className="bg-slate-900 dark:bg-black rounded-2xl p-5 border border-slate-800 dark:border-dark-border transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5">
                                    <ArrowsRightLeftIcon className="w-3.5 h-3.5 text-yellow-400" />
                                    <span className="text-[9px] font-black uppercase tracking-[.18em] text-slate-500 dark:text-dark-text-muted">
                                        Importe Desembolso
                                    </span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 bg-slate-800 dark:bg-dark-surface-alt px-2.5 py-1 rounded-full transition-colors">
                                    #{prestamo.id}
                                </span>
                            </div>

                            <p className="text-[30px] font-black italic tracking-tighter text-yellow-400 leading-none">
                                S/ {Number(prestamo.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>

                            <div className="mt-4 pt-4 border-t border-white/10 dark:border-dark-border transition-colors">
                                <p className="text-[9px] font-black uppercase tracking-[.15em] text-slate-500 dark:text-dark-text-muted mb-0.5">
                                    Beneficiario
                                </p>
                                <p className="text-sm font-black uppercase text-white dark:text-dark-text leading-snug break-words transition-colors">
                                    {prestamo.cliente}
                                </p>
                            </div>

                            {prestamo.es_grupal && presidente && (
                                <div className="mt-3 pt-3 border-t border-white/10 dark:border-dark-border transition-colors">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <BuildingLibraryIcon className="w-3 h-3 text-yellow-400" />
                                        <p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-400 dark:text-dark-text-muted">
                                            Cuentas · {presidente.nombre}
                                            <span className="text-slate-600 dark:text-dark-text-muted/60 ml-1">· {presidente.dni}</span>
                                        </p>
                                    </div>
                                    {cuentas.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {cuentas.map((c, i) => (
                                                <div key={i} className="bg-white/5 dark:bg-dark-surface-alt border border-white/10 dark:border-dark-border rounded-xl px-3 py-2 transition-colors">
                                                    <p className="text-[9px] font-black uppercase tracking-wider text-yellow-500/80">{c.banco}</p>
                                                    <p className="text-xs font-black tracking-widest text-white dark:text-dark-text mt-0.5">{c.numero_cuenta}</p>
                                                    {c.cci && <p className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted mt-0.5">CCI: {c.cci}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[9px] italic text-slate-600 dark:text-dark-text-muted font-bold uppercase">Sin cuentas registradas</p>
                                    )}
                                </div>
                            )}

                            {!prestamo.es_grupal && prestamo.cuentas_bancarias?.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/10 dark:border-dark-border transition-colors">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <BuildingLibraryIcon className="w-3 h-3 text-yellow-400" />
                                        <p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-400 dark:text-dark-text-muted">
                                            Cuentas Bancarias
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        {prestamo.cuentas_bancarias.map((c, i) => (
                                            <div key={i} className="bg-white/5 dark:bg-dark-surface-alt border border-white/10 dark:border-dark-border rounded-xl px-3 py-2 transition-colors">
                                                <p className="text-[9px] font-black uppercase tracking-wider text-yellow-500/80">{c.banco}</p>
                                                <p className="text-xs font-black tracking-widest text-white dark:text-dark-text mt-0.5">{c.numero_cuenta}</p>
                                                {c.cci && <p className="text-[9px] font-bold text-slate-500 dark:text-dark-text-muted mt-0.5">CCI: {c.cci}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nro operación */}
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-[.12em] text-slate-400 dark:text-dark-text-muted mb-1.5 ml-0.5">
                                Nro de Operación Bancaria
                            </label>
                            <input
                                type="text"
                                value={nroOperacion}
                                onChange={(e) => setNroOperacion(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-surface-alt border-2 border-slate-100 dark:border-dark-border rounded-xl text-sm font-bold text-slate-900 dark:text-dark-text outline-none transition-all focus:border-red-500 focus:bg-white dark:focus:bg-dark-surface placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                                placeholder="Ej: BCP-009283"
                            />
                        </div>
                    </div>

                    {/* Botón confirmar — solo desktop */}
                    <div className="hidden md:block shrink-0 px-6 py-4 border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !file}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-100 dark:shadow-black/30 transition-all active:scale-[.98]"
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
                <div className="flex flex-col flex-1 bg-slate-50 dark:bg-dark-surface-alt p-4 gap-3 min-h-[320px] transition-colors">

                    {/* Preview */}
                    <div className="relative flex-1 min-h-[220px] flex items-center justify-center rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden group transition-colors">
                        {preview ? (
                            <>
                                <img
                                    src={preview}
                                    alt="Voucher"
                                    className="max-w-full max-h-full object-contain"
                                />
                                <button
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="absolute top-3 right-3 p-1.5 bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-full text-red-400 shadow hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <div className="text-center select-none">
                                <PhotoIcon className="w-10 h-10 text-slate-200 dark:text-dark-border mx-auto mb-2" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-dark-text-muted/60">Sin Vista Previa</p>
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
                                    ? 'border-red-400 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400'
                                    : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface text-slate-400 dark:text-dark-text-muted hover:border-red-300 hover:bg-slate-50 dark:hover:bg-dark-surface-alt'
                            }`}
                        >
                            <PhotoIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                                {file ? `✓ ${file.name.slice(0, 28)}` : 'Subir Captura / Voucher'}
                            </span>
                        </label>
                    </div>

                    {/* Botón confirmar — solo mobile, va al final */}
                    <div className="md:hidden shrink-0 pt-1 pb-2">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !file}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-100 dark:shadow-black/30 transition-all active:scale-[.98]"
                        >
                            {loading
                                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                : <DocumentCheckIcon className="w-4 h-4" />
                            }
                            Confirmar y Desembolsar
                        </button>
                    </div>
                </div>

            </div>
        </ViewModal>
    );
};

export default DesembolsoModal;