import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { usePagoCuota } from 'hooks/Operacion/usePagoCuota';
import { ResumenPago, DistribucionGrupal, AlertasPago } from './Components/PagoCuotaParts';
import { BanknotesIcon, DevicePhoneMobileIcon, PhotoIcon, UserGroupIcon, DocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PagoCuotaModal = ({ isOpen, onClose, cuota, onConfirm, loading }) => {
    const { state, setters, computed, handlers } = usePagoCuota({ isOpen, cuota, onClose, onConfirm });
    const { metodo, referencia, archivo } = state;

    // Bloquear cierre mientras se procesa el pago
    const handleClose = () => { if (!loading) handlers.reset(); };

    return (
        <ViewModal isOpen={isOpen} hideFooter={true} onClose={handleClose} title={`Cobrar Cuota N° ${cuota?.nro}`} size="2xl">
            {/* Overlay bloqueante mientras carga */}
            {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[inherit] gap-3">
                    <div className="w-10 h-10 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registrando pago...</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row -m-5 h-full min-h-[600px] max-h-[80vh]">

                {/* ── Panel Izquierdo ── */}
                <div className="w-full md:w-[55%] p-8 flex flex-col bg-white border-r border-slate-100">
                    <div className="space-y-5 flex-1 overflow-y-auto pr-2">

                        {/* 1. Resumen */}
                        <ResumenPago
                            cuota={cuota} totalAPagar={computed.totalAPagar} mora={computed.mora}
                            excedenteIndividual={computed.excedenteIndividual} esGrupal={computed.esGrupal}
                            integrantesPendientes={computed.integrantesPendientes}
                        />

                        {/* 2. Selector de Método */}
                        <div className="grid grid-cols-2 gap-3">
                            {['DEPOSITO', 'EFECTIVO'].map((m) => (
                                <button key={m} type="button" onClick={() => { setters.setMetodo(m); setters.setReferencia(''); }}
                                    disabled={loading}
                                    className={`p-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${state.metodo === m ? 'border-brand-red bg-brand-red-light/50 text-brand-red shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                    {m === 'EFECTIVO' ? <BanknotesIcon className="w-4 h-4"/> : <DevicePhoneMobileIcon className="w-4 h-4"/>}
                                    {m}
                                </button>
                            ))}
                        </div>

                        {/* 3. Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Monto a Registrar *</label>
                                <input type="number" step="0.01" required value={state.recibido}
                                    readOnly={computed.esGrupal || loading}
                                    onChange={e => !computed.esGrupal && !loading && setters.setRecibido(e.target.value)}
                                    className={`w-full p-4 border-2 rounded-2xl text-sm font-bold outline-none transition-all text-slate-800 ${computed.esGrupal || loading ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 border-slate-100 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:bg-white'}`} />
                                {!computed.esGrupal && <p className="text-[9px] text-slate-400 font-bold mt-1 ml-1">Puedes ajustar si el cliente paga una cantidad diferente.</p>}
                            </div>
                            {state.metodo === 'DEPOSITO' && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">N° Operación / Referencia *</label>
                                    <input type="text" value={state.referencia} disabled={loading}
                                        onChange={e => setters.setReferencia(e.target.value)} placeholder="Ej: 002938"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:bg-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                                </div>
                            )}
                        </div>

                        {/* 4. Voucher Upload */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">{state.metodo === 'DEPOSITO' ? 'Comprobante *' : 'Foto del Efectivo (Opcional)'}</label>
                            <input type="file" accept="image/*" onChange={handlers.handleFileChange} className="hidden" id="pago-cuota-upload" disabled={loading} />
                            <label htmlFor="pago-cuota-upload" className={`flex items-center justify-center w-full p-5 border-2 border-dashed rounded-2xl transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${state.archivo ? 'border-brand-red bg-brand-red-light/50 text-brand-red' : 'border-slate-200 hover:border-brand-red/50 hover:bg-slate-50 text-slate-500'}`}>
                                <div className="flex flex-col items-center gap-1 font-black text-[10px] uppercase">
                                    <PhotoIcon className="w-6 h-6 mb-1" />
                                    {state.archivo ? 'Comprobante Cargado ✓' : state.metodo === 'DEPOSITO' ? 'Subir Voucher / Captura' : 'Subir Foto (opcional)'}
                                </div>
                            </label>
                            {state.metodo === 'EFECTIVO' && <p className="text-[9px] text-slate-400 font-bold mt-1 ml-1">Puedes adjuntar una foto del efectivo recibido si lo deseas.</p>}
                        </div>

                        {/* 5. Toggle Parcial Grupal */}
                        {computed.esGrupal && computed.integrantesPendientes.length > 1 && (
                            <div onClick={() => !loading && setters.setEsParcial(!state.esParcial)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all select-none ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${state.esParcial ? 'border-brand-gold bg-brand-gold-light/30' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                                <div className="flex items-center gap-3">
                                    <UserGroupIcon className={`w-5 h-5 ${state.esParcial ? 'text-brand-gold-dark' : 'text-slate-400'}`} />
                                    <div>
                                        <p className={`text-xs font-black uppercase ${state.esParcial ? 'text-brand-gold-dark' : 'text-slate-600'}`}>Pago Parcial del Grupo</p>
                                        <p className="text-[9px] text-slate-400 font-bold">{computed.integrantesPendientes.length} socio{computed.integrantesPendientes.length > 1 ? 's' : ''} habilitado{computed.integrantesPendientes.length > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${state.esParcial ? 'bg-brand-gold-dark' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${state.esParcial ? 'left-5' : 'left-0.5'}`} />
                                </div>
                            </div>
                        )}

                        {/* 6. Distribución Grupal */}
                        {computed.esGrupal && (state.esParcial || computed.soloUnIntegrante) && computed.integrantesPendientes.length > 0 && (
                            <DistribucionGrupal
                                distribucion={state.distribucion} handleMontoIntegrante={handlers.handleMontoIntegrante}
                                integrantesPendientes={computed.integrantesPendientes} soloUnIntegrante={computed.soloUnIntegrante}
                                totalDistribuido={computed.totalDistribuido} totalAPagar={computed.totalAPagar} recibido={state.recibido}
                                disabled={loading}
                            />
                        )}

                        {/* 7. Alertas de mora */}
                        <AlertasPago noCubreMora={computed.noCubreMora} mora={computed.mora} integrantesSinCubrirMora={computed.integrantesSinCubrirMora} />

                        {/* 8. Preview móvil */}
                        {state.preview && (
                            <div className="md:hidden">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Vista Previa:</p>
                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 min-h-[180px]">
                                    <img src={state.preview} alt="Voucher" className="max-h-[260px] rounded-lg shadow-sm" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Alert encima del botón */}
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

                    {/* Botón Guardar */}
                    <div className="pt-4 mt-auto">
                        <button onClick={handlers.handleSubmit} disabled={loading || !computed.puedeSubmit}
                            className="w-full bg-brand-red text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 hover:bg-brand-red-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
                            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <DocumentCheckIcon className="w-5 h-5" />}
                            {loading ? 'Procesando...' : 'Registrar Pago de Cuota'}
                        </button>
                        {metodo === 'DEPOSITO' && (!referencia?.trim() || !archivo) && (
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase mt-2">
                            {!referencia?.trim() && !archivo
                                ? 'Ingresa el N° de operación y sube el voucher'
                                : !referencia?.trim()
                                    ? 'Ingresa el N° de operación'
                                    : 'Sube el comprobante / voucher'}
                        </p>
                    )}
                    </div>
                </div>

                {/* ── Panel Derecho (Preview Desktop) ── */}
                <div className="hidden md:flex md:w-[45%] bg-slate-50 relative items-center justify-center p-6 rounded-r-[32px]">
                    {state.preview ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                            <img src={state.preview} alt="Voucher Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white border border-slate-200" />
                            {!loading && (
                                <button onClick={() => { setters.setArchivo(null); setters.setPreview(null); }}
                                    className="absolute top-4 right-4 bg-white text-brand-red p-2 rounded-full shadow-xl hover:bg-brand-red hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <PhotoIcon className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin Vista Previa</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-bold">Sube el voucher para visualizarlo aquí</p>
                        </div>
                    )}
                </div>
            </div>
        </ViewModal>
    );
};

export default PagoCuotaModal;