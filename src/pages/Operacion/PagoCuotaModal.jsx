import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { usePagoCuota } from 'hooks/Operacion/usePagoCuota';
import { ResumenPago, DistribucionGrupal, AlertasPago } from './Components/PagoCuotaParts';
import {
    BanknotesIcon, DevicePhoneMobileIcon, PhotoIcon,
    UserGroupIcon, DocumentCheckIcon, XMarkIcon,
    ReceiptPercentIcon, ShieldExclamationIcon, KeyIcon,
} from '@heroicons/react/24/outline';

const PagoCuotaModal = ({ isOpen, onClose, cuota, onConfirm, loading }) => {
    const { state, setters, computed, handlers } = usePagoCuota({ isOpen, cuota, onClose, onConfirm });
    const { metodo, referencia, archivo, tieneComision, comision, pinRequerido, pinContexto, pin, pinError } = state;

    const handleClose = () => { if (!loading) handlers.reset(); };

    const descripcionPin = pinContexto?.cuota_anterior
        ? `La cuota #${pinContexto.cuota_anterior} está pendiente. Ingresa el PIN de un administrador para autorizar el cobro de la cuota #${pinContexto.cuota_actual} de todas formas.`
        : 'Esta cuota requiere autorización de un administrador. Ingresa el PIN para continuar.';

    return (
        <ViewModal isOpen={isOpen} hideFooter={true} onClose={handleClose}
            title={`Cobrar Cuota N° ${cuota?.nro}`} size="2xl">

            {/* Overlay carga */}
            {loading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[inherit] gap-3 transition-colors">
                    <div className="w-10 h-10 border-4 border-brand-red/20 dark:border-brand-gold/20 border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">Registrando pago...</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row -m-5 h-full min-h-[600px] max-h-[80vh] transition-colors">

                {/* ── Panel Izquierdo ── */}
                <div className="w-full md:w-[55%] p-8 flex flex-col bg-white dark:bg-dark-surface border-r border-slate-100 dark:border-dark-border transition-colors">
                    <div className="space-y-5 flex-1 overflow-y-auto pr-2">

                        {/* 1. Resumen */}
                        <ResumenPago
                            cuota={cuota} totalAPagar={computed.totalAPagar} mora={computed.mora}
                            excedenteIndividual={computed.excedenteIndividual} esGrupal={computed.esGrupal}
                            integrantesPendientes={computed.integrantesPendientes}
                        />

                        {/* ── PIN de autorización (inline, siempre visible si hace falta) ── */}
                        {pinRequerido && (
                            <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 space-y-3 animate-in fade-in duration-300 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex-shrink-0 transition-colors">
                                        <ShieldExclamationIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase">Autorización Requerida</p>
                                        <p className="text-[10px] text-amber-600/80 dark:text-amber-300/80 font-medium leading-snug">{descripcionPin}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mb-1.5 flex items-center gap-1">
                                        <KeyIcon className="w-3.5 h-3.5" /> PIN de Autorización (6 dígitos) *
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={pin}
                                        disabled={loading}
                                        onChange={e => handlers.handlePinChange(e.target.value)}
                                        placeholder="••••••"
                                        className={`w-full p-3 border-2 rounded-xl text-lg font-black tracking-[0.3em] text-center outline-none transition-all disabled:opacity-50 ${
                                            pinError
                                                ? 'border-red-400 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                                                : 'border-amber-300 dark:border-amber-500/30 bg-white dark:bg-dark-surface text-amber-700 dark:text-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-400'
                                        }`}
                                    />
                                    {pinError && (
                                        <p className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1.5">⚠ {pinError}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. Método */}
                        <div className="grid grid-cols-2 gap-3">
                            {['DEPOSITO', 'EFECTIVO'].map((m) => (
                                <button key={m} type="button"
                                    onClick={() => { setters.setMetodo(m); setters.setReferencia(''); }}
                                    disabled={loading}
                                    className={`p-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all disabled:opacity-50 ${state.metodo === m ? 'border-brand-red dark:border-brand-gold bg-brand-red-light/50 dark:bg-brand-gold/10 text-brand-red dark:text-brand-gold shadow-sm' : 'border-slate-100 dark:border-dark-border text-slate-400 dark:text-dark-text-muted hover:border-slate-200 dark:hover:border-slate-600'}`}>
                                    {m === 'EFECTIVO' ? <BanknotesIcon className="w-4 h-4" /> : <DevicePhoneMobileIcon className="w-4 h-4" />}
                                    {m}
                                </button>
                            ))}
                        </div>

                        {/* 3. Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1">Monto a Registrar *</label>
                                <input type="number" step="0.01" required value={state.recibido}
                                    readOnly={computed.esGrupal || loading}
                                    onChange={e => !computed.esGrupal && !loading && setters.setRecibido(e.target.value)}
                                    className={`w-full p-4 border-2 rounded-2xl text-sm font-bold outline-none transition-all text-slate-800 dark:text-dark-text ${computed.esGrupal || loading ? 'bg-slate-50 dark:bg-dark-surface-alt border-slate-100 dark:border-dark-border cursor-not-allowed opacity-70' : 'bg-slate-50 dark:bg-dark-surface-alt border-slate-100 dark:border-dark-border focus:border-brand-red dark:focus:border-brand-gold focus:ring-1 focus:ring-brand-red dark:focus:ring-brand-gold focus:bg-white dark:focus:bg-dark-surface'}`} />
                                {!computed.esGrupal && <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-1 ml-1">Puedes ajustar si el cliente paga una cantidad diferente.</p>}
                            </div>
                            {state.metodo === 'DEPOSITO' && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1">N° Operación / Referencia *</label>
                                    <input type="text" value={state.referencia} disabled={loading}
                                        onChange={e => setters.setReferencia(e.target.value)} placeholder="Ej: 002938"
                                        className="w-full p-4 bg-slate-50 dark:bg-dark-surface-alt border-2 border-slate-100 dark:border-dark-border rounded-2xl text-sm font-bold text-slate-800 dark:text-dark-text focus:border-brand-red dark:focus:border-brand-gold focus:ring-1 focus:ring-brand-red dark:focus:ring-brand-gold focus:bg-white dark:focus:bg-dark-surface outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60" />
                                </div>
                            )}
                        </div>

                        {/* ── 5. COMISIÓN ── */}
                        <div className={`rounded-2xl border-2 transition-all overflow-hidden ${tieneComision ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt'}`}>
                            {/* Toggle */}
                            <div
                                onClick={() => !loading && setters.setTieneComision(!tieneComision)}
                                className={`flex items-center justify-between p-4 select-none ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <div className="flex items-center gap-3">
                                    <ReceiptPercentIcon className={`w-5 h-5 ${tieneComision ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-dark-text-muted'}`} />
                                    <div>
                                        <p className={`text-xs font-black uppercase ${tieneComision ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-dark-text'}`}>
                                            Cobro con comisión (Yape / BCP)
                                        </p>
                                        <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">La comisión se registra como referencia interna</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${tieneComision ? 'bg-amber-500' : 'bg-slate-300 dark:bg-dark-border'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${tieneComision ? 'left-5' : 'left-0.5'}`} />
                                </div>
                            </div>

                            {/* Input comisión */}
                            {tieneComision && (
                                <div className="px-4 pb-4">
                                    <label className="block text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mb-1.5">Monto de Comisión (S/) *</label>
                                    <input
                                        type="number" step="0.01" min="0.01"
                                        value={comision}
                                        disabled={loading}
                                        onChange={e => setters.setComision(e.target.value)}
                                        placeholder="Ej: 1.50"
                                        className="w-full p-3 bg-white dark:bg-dark-surface border-2 border-amber-200 dark:border-amber-500/30 rounded-xl text-sm font-bold text-slate-800 dark:text-dark-text focus:border-amber-400 focus:ring-1 focus:ring-amber-300 outline-none transition-all disabled:opacity-50"
                                    />
                                    {tieneComision && computed.comisionNum > 0 && (
                                        <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                                            Total cobrado al cliente: S/ {(parseFloat(state.recibido || 0) + computed.comisionNum).toFixed(2)} (cuota + comisión)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 6. Toggle Parcial Grupal */}
                        {computed.esGrupal && computed.integrantesPendientes.length > 1 && (
                            <div onClick={() => !loading && setters.setEsParcial(!state.esParcial)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all select-none ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${state.esParcial ? 'border-brand-gold dark:border-brand-gold bg-brand-gold-light/30 dark:bg-brand-gold/10' : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                <div className="flex items-center gap-3">
                                    <UserGroupIcon className={`w-5 h-5 ${state.esParcial ? 'text-brand-gold-dark dark:text-brand-gold' : 'text-slate-400 dark:text-dark-text-muted'}`} />
                                    <div>
                                        <p className={`text-xs font-black uppercase ${state.esParcial ? 'text-brand-gold-dark dark:text-brand-gold' : 'text-slate-600 dark:text-dark-text'}`}>Pago Parcial del Grupo</p>
                                        <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">{computed.integrantesPendientes.length} socio(s) habilitado(s)</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${state.esParcial ? 'bg-brand-gold-dark dark:bg-brand-gold' : 'bg-slate-300 dark:bg-dark-border'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${state.esParcial ? 'left-5' : 'left-0.5'}`} />
                                </div>
                            </div>
                        )}

                        {/* 7. Distribución Grupal */}
                        {computed.esGrupal && (state.esParcial || computed.soloUnIntegrante) && computed.integrantesPendientes.length > 0 && (
                            <DistribucionGrupal
                                distribucion={state.distribucion} handleMontoIntegrante={handlers.handleMontoIntegrante}
                                integrantesPendientes={computed.integrantesPendientes} soloUnIntegrante={computed.soloUnIntegrante}
                                totalDistribuido={computed.totalDistribuido} totalAPagar={computed.totalAPagar}
                                recibido={state.recibido} disabled={loading}
                            />
                        )}

                        {/* 8. Alertas mora */}
                        <AlertasPago
                            noCubreMora={computed.noCubreMora} mora={computed.mora}
                            integrantesSinCubrirMora={computed.integrantesSinCubrirMora}
                        />

                        {/* 4. Voucher */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1">
                                {state.metodo === 'DEPOSITO' ? 'Comprobante *' : 'Foto del Efectivo (Opcional)'}
                            </label>
                            <input type="file" accept="image/*" onChange={handlers.handleFileChange}
                                className="hidden" id="pago-cuota-upload" disabled={loading} />
                            <label htmlFor="pago-cuota-upload"
                                className={`flex items-center justify-center w-full p-5 border-2 border-dashed rounded-2xl transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${state.archivo ? 'border-brand-red bg-brand-red-light/50 dark:bg-red-500/10 text-brand-red dark:text-red-400' : 'border-slate-200 dark:border-dark-border hover:border-brand-red/50 hover:bg-slate-50 dark:hover:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted'}`}>
                                <div className="flex flex-col items-center gap-1 font-black text-[10px] uppercase">
                                    <PhotoIcon className="w-6 h-6 mb-1" />
                                    {state.archivo ? 'Comprobante Cargado ✓' : state.metodo === 'DEPOSITO' ? 'Subir Voucher / Captura' : 'Subir Foto (opcional)'}
                                </div>
                            </label>
                        </div>

                        {/* 9. Preview móvil */}
                        {state.preview && (
                            <div className="md:hidden">
                                <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1">Vista Previa:</p>
                                <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl p-4 flex items-center justify-center border border-slate-100 dark:border-dark-border min-h-[180px] transition-colors">
                                    <img src={state.preview} alt="Voucher" className="max-h-[260px] rounded-lg shadow-sm" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Alert */}
                    {state.alertLocal && (
                        <div className="pt-4">
                            <AlertMessage
                                type={state.alertLocal.type}
                                message={state.alertLocal.message}
                                details={state.alertLocal.details}
                                onClose={() => setters.setAlertLocal(null)}
                            />
                        </div>
                    )}

                    {/* Botón */}
                    <div className="pt-4 mt-auto">
                        <button onClick={handlers.handleSubmit} disabled={loading || !computed.puedeSubmit}
                            className="w-full bg-brand-red dark:bg-brand-red-glow text-white dark:text-black py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
                            {loading
                                ? <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
                                : <DocumentCheckIcon className="w-5 h-5" />
                            }
                            {loading ? 'Procesando...' : 'Registrar Pago de Cuota'}
                        </button>
                        {metodo === 'DEPOSITO' && (!referencia?.trim() || !archivo) && (
                            <p className="text-[9px] text-center text-slate-400 dark:text-dark-text-muted font-bold uppercase mt-2">
                                {!referencia?.trim() && !archivo
                                    ? 'Ingresa el N° de operación y sube el voucher'
                                    : !referencia?.trim() ? 'Ingresa el N° de operación'
                                    : 'Sube el comprobante / voucher'}
                            </p>
                        )}
                        {tieneComision && !comision && (
                            <p className="text-[9px] text-center text-amber-500 dark:text-amber-400 font-bold uppercase mt-1">
                                Ingresa el monto de la comisión
                            </p>
                        )}
                        {pinRequerido && !state.pinCompleto && (
                            <p className="text-[9px] text-center text-amber-500 dark:text-amber-400 font-bold uppercase mt-1">
                                Ingresa el PIN de autorización (6 dígitos)
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Panel Derecho (Preview Desktop) ── */}
                <div className="hidden md:flex md:w-[45%] bg-slate-50 dark:bg-dark-surface-alt relative items-center justify-center p-6 rounded-r-[32px] transition-colors">
                    {state.preview ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                            <img src={state.preview} alt="Voucher Preview"
                                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border transition-colors" />
                            {!loading && (
                                <button onClick={() => { setters.setArchivo(null); setters.setPreview(null); }}
                                    className="absolute top-4 right-4 bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold p-2 rounded-full shadow-xl hover:bg-brand-red dark:hover:bg-brand-gold hover:text-white dark:hover:text-black transition-all opacity-0 group-hover:opacity-100">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <PhotoIcon className="w-12 h-12 text-slate-200 dark:text-dark-border mx-auto mb-2 transition-colors" />
                            <p className="text-[10px] font-black text-slate-300 dark:text-dark-text-muted/60 uppercase tracking-widest">Sin Vista Previa</p>
                            <p className="text-[9px] text-slate-400 dark:text-dark-text-muted mt-1 font-bold">Sube el voucher para visualizarlo aquí</p>
                        </div>
                    )}
                </div>
            </div>
        </ViewModal>
    );
};

export default PagoCuotaModal;