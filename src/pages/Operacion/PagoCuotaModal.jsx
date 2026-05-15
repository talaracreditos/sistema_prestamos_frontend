import React, { useState, useEffect } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import {
    BanknotesIcon, DevicePhoneMobileIcon, PhotoIcon,
    UserGroupIcon, DocumentCheckIcon, XMarkIcon
} from '@heroicons/react/24/outline';

const PagoCuotaModal = ({ isOpen, onClose, cuota, onConfirm, loading }) => {
    const [metodo, setMetodo]             = useState('DEPOSITO');
    const [recibido, setRecibido]         = useState('');
    const [referencia, setReferencia]     = useState('');
    const [archivo, setArchivo]           = useState(null);
    const [preview, setPreview]           = useState(null);
    const [esParcial, setEsParcial]       = useState(false);
    const [distribucion, setDistribucion] = useState({});
    const [alertLocal, setAlertLocal]     = useState(null);

    const esGrupal = !!(cuota?.integrantes && cuota.integrantes.length > 0);

    // ── Integrantes pendientes: los que llegan en cuota.integrantes
    const integrantesPendientes = cuota?.integrantes?.filter(i => ![2, 6].includes(i.estado)) ?? [];

    // Si hay exactamente 1 integrante habilitado, mostrar distribución siempre
    const soloUnIntegrante = esGrupal && integrantesPendientes.length === 1;

    const totalAPagar = parseFloat(cuota?.saldo_pendiente ?? cuota?.monto ?? 0).toFixed(2);
    const mora        = parseFloat(cuota?.mora ?? 0);

    // ── Validación mora por integrante (modo parcial grupal) ─────────────────
    const integrantesSinCubrirMora = (esGrupal && esParcial)
        ? integrantesPendientes.filter(int => {
            const moraPend    = parseFloat(int.mora_pendiente ?? 0);
            if (moraPend <= 0) return false;
            const esCompleto  = !distribucion[int.id] || distribucion[int.id] === '';
            if (esCompleto) return false;
            return parseFloat(distribucion[int.id] || 0) < moraPend;
        })
        : [];

    // ── Validación mora individual ────────────────────────────────────────────
    const montoNum    = parseFloat(recibido || 0);
    const noCubreMora = !esGrupal && mora > 0 && montoNum > 0 && montoNum < mora;
    const puedeSubmit = !noCubreMora && integrantesSinCubrirMora.length === 0;

    // ── Reset al abrir ────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setMetodo('DEPOSITO');
            setRecibido(totalAPagar);
            setReferencia('');
            setArchivo(null);
            setPreview(null);
            // Si hay 1 solo integrante habilitado → activar parcial automáticamente
            setEsParcial(soloUnIntegrante);
            setDistribucion({});
            setAlertLocal(null);
        }
    }, [isOpen, totalAPagar, soloUnIntegrante]);

    // ── Sincronizar monto con distribución ────────────────────────────────────
    const calcularTotalDistribuido = () => {
        if (integrantesPendientes.length === 0) return parseFloat(totalAPagar);

        const todosEnFull = integrantesPendientes.every(
            int => !distribucion[int.id] || distribucion[int.id] === ''
        );
        if (todosEnFull) return parseFloat(totalAPagar);

        return integrantesPendientes.reduce((acc, int) => {
            const val         = distribucion[int.id];
            const esCompleto  = !val || val === '';
            const saldoCap    = parseFloat(int.saldo_capital ?? int.saldo ?? 0);
            const moraPend    = parseFloat(int.mora_pendiente ?? 0);
            return acc + (esCompleto
                ? saldoCap + moraPend
                : parseFloat(val || 0));
        }, 0);
    };

    const totalDistribuido = calcularTotalDistribuido();

    useEffect(() => {
        if (esGrupal && esParcial) {
            setRecibido(totalDistribuido.toFixed(2));
        }
    }, [totalDistribuido, esGrupal, esParcial]);

    useEffect(() => {
        if (esGrupal && !esParcial) setRecibido(totalAPagar);
    }, [esParcial, esGrupal, totalAPagar]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) { setArchivo(f); setPreview(URL.createObjectURL(f)); }
    };

    const handleMontoIntegrante = (id, valor) => {
        const sanitized = valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        setDistribucion(prev => ({ ...prev, [id]: sanitized }));
    };

    const reset = () => { setArchivo(null); setPreview(null); onClose(); };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('cuota_id',        cuota.id);
        formData.append('metodo_pago',     metodo);
        formData.append('monto_recibido',  recibido);
        formData.append('numero_operacion', referencia);
        if (archivo) formData.append('comprobante', archivo);

        if (esGrupal && (esParcial || soloUnIntegrante)) {
            formData.append('es_parcial_grupal', '1');
            formData.append('distribucion', JSON.stringify(
                integrantesPendientes.map(int => ({
                    cliente_id:         int.id,
                    total_cuota:        parseFloat(int.saldo ?? int.saldo_capital ?? 0),
                    monto:              parseFloat(distribucion[int.id] || 0),
                    pago_completo:      !distribucion[int.id] || distribucion[int.id] === '',
                    excedente_aplicado: parseFloat(int.excedente_aplicado ?? 0),
                }))
            ));
        }

        setAlertLocal(null);
        onConfirm(formData, setAlertLocal);
    };

    return (
        <ViewModal isOpen={isOpen} hideFooter onClose={reset}
            title={`Cobrar Cuota N° ${cuota?.nro}`} size="2xl">
            <div className="flex flex-col md:flex-row -m-5 h-full min-h-[600px] max-h-[80vh]">

                {/* ── Panel izquierdo ────────────────────────────────────── */}
                <div className="w-full md:w-[55%] p-8 flex flex-col bg-white border-r border-slate-100">
                    <div className="space-y-5 flex-1 overflow-y-auto pr-2">

                        {/* Resumen */}
                        <div className="bg-slate-900 p-6 rounded-[28px] text-white shadow-xl border border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <BanknotesIcon className="w-4 h-4 text-brand-gold" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {parseFloat(cuota?.pago_acumulado) > 0 ? 'Saldo Pendiente' : 'Total a Cobrar'}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-brand-gold">
                                S/ {totalAPagar}
                            </h2>
                            {mora > 0 && (
                                <p className="text-[10px] font-bold text-red-400 mt-1">
                                    Incluye mora: S/ {mora.toFixed(2)}
                                </p>
                            )}
                            {parseFloat(cuota?.mora_pagada || 0) > 0 && (
                                <p className="text-[10px] font-bold text-orange-400 mt-1">
                                    Mora ya cubierta: S/ {parseFloat(cuota.mora_pagada).toFixed(2)}
                                </p>
                            )}
                            {parseFloat(cuota?.excedente_anterior || 0) > 0 && (
                                <p className="text-[10px] font-bold text-purple-400 mt-1">
                                    Excedente aplicado: -S/ {parseFloat(cuota.excedente_anterior).toFixed(2)}
                                </p>
                            )}
                            {parseFloat(cuota?.pago_acumulado) > 0 && (
                                <p className="text-[10px] font-bold text-blue-400 mt-1">
                                    Ya abonado: S/ {parseFloat(cuota.pago_acumulado).toFixed(2)}
                                </p>
                            )}
                            <div className="mt-5 pt-5 border-t border-white/10">
                                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                                    Cuota N° {cuota?.nro} — {cuota?.vencimiento}
                                </p>
                                <p className="text-sm font-black uppercase leading-snug text-white break-words">
                                    {cuota?.cliente ?? (esGrupal ? 'Préstamo Grupal' : 'Cliente')}
                                </p>
                                {/* Integrantes habilitados (nuevo flujo) */}
                                {esGrupal && integrantesPendientes.length > 0 && (
                                    <p className="text-[9px] font-bold text-slate-400 mt-2">
                                        {integrantesPendientes.length} socio{integrantesPendientes.length > 1 ? 's' : ''} habilitado{integrantesPendientes.length > 1 ? 's' : ''} para pagar
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Método */}
                        <div className="grid grid-cols-2 gap-3">
                            {['DEPOSITO', 'EFECTIVO'].map((m) => (
                                <button key={m} type="button" onClick={() => { setMetodo(m); setReferencia(''); }}
                                    className={`p-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border-2 transition-all
                                        ${metodo === m
                                            ? 'border-brand-red bg-brand-red-light/50 text-brand-red shadow-sm'
                                            : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                    {m === 'EFECTIVO'
                                        ? <BanknotesIcon className="w-4 h-4"/>
                                        : <DevicePhoneMobileIcon className="w-4 h-4"/>}
                                    {m}
                                </button>
                            ))}
                        </div>

                       {/* Campos */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                                    Monto a Registrar *
                                </label>
                                <input
                                    type="number" step="0.01" required value={recibido}
                                    readOnly={esGrupal}
                                    onChange={e => !esGrupal && setRecibido(e.target.value)}
                                    className={`w-full p-4 border-2 rounded-2xl text-sm font-bold outline-none transition-all text-slate-800 ${
                                        esGrupal
                                            ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-70'
                                            : 'bg-slate-50 border-slate-100 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:bg-white'
                                    }`}
                                />
                                {!esGrupal && (
                                    <p className="text-[9px] text-slate-400 font-bold mt-1 ml-1">
                                        Puedes ajustar si el cliente paga una cantidad diferente.
                                    </p>
                                )}
                            </div>

                            {/* N° Operación solo para DEPOSITO */}
                            {metodo === 'DEPOSITO' && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                                        N° Operación / Referencia *
                                    </label>
                                    <input type="text" value={referencia} onChange={e => setReferencia(e.target.value)}
                                        placeholder="Ej: 002938"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:bg-white outline-none transition-all" />
                                </div>
                            )}
                        </div>

                        {/* Voucher */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                                {metodo === 'DEPOSITO' ? 'Comprobante *' : 'Foto del Efectivo (Opcional)'}
                            </label>
                            <input type="file" accept="image/*" onChange={handleFileChange}
                                className="hidden" id="pago-cuota-upload" />
                            <label htmlFor="pago-cuota-upload"
                                className={`flex items-center justify-center w-full p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
                                    ${archivo
                                        ? 'border-brand-red bg-brand-red-light/50 text-brand-red'
                                        : 'border-slate-200 hover:border-brand-red/50 hover:bg-slate-50 text-slate-500'}`}>
                                <div className="flex flex-col items-center gap-1 font-black text-[10px] uppercase">
                                    <PhotoIcon className="w-6 h-6 mb-1" />
                                    {archivo
                                        ? 'Comprobante Cargado ✓'
                                        : metodo === 'DEPOSITO'
                                            ? 'Subir Voucher / Captura'
                                            : 'Subir Foto (opcional)'}
                                </div>
                            </label>
                            {metodo === 'EFECTIVO' && (
                                <p className="text-[9px] text-slate-400 font-bold mt-1 ml-1">
                                    Puedes adjuntar una foto del efectivo recibido si lo deseas.
                                </p>
                            )}
                        </div>

                        {/* Toggle pago parcial (solo si hay más de 1 integrante habilitado) */}
                        {esGrupal && integrantesPendientes.length > 1 && (
                            <div onClick={() => setEsParcial(prev => !prev)}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all select-none
                                    ${esParcial
                                        ? 'border-brand-gold bg-brand-gold-light/30'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                                <div className="flex items-center gap-3">
                                    <UserGroupIcon className={`w-5 h-5 ${esParcial ? 'text-brand-gold-dark' : 'text-slate-400'}`} />
                                    <div>
                                        <p className={`text-xs font-black uppercase ${esParcial ? 'text-brand-gold-dark' : 'text-slate-600'}`}>
                                            Pago Parcial del Grupo
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold">
                                            {integrantesPendientes.length} socio{integrantesPendientes.length > 1 ? 's' : ''} habilitado{integrantesPendientes.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${esParcial ? 'bg-brand-gold-dark' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${esParcial ? 'left-5' : 'left-0.5'}`} />
                                </div>
                            </div>
                        )}

                        {/* Distribución por integrante:
                            - Modo toggle: cuando hay >1 integrante y el toggle está activo
                            - Siempre visible: cuando hay exactamente 1 integrante habilitado */}
                        {esGrupal && (esParcial || soloUnIntegrante) && integrantesPendientes.length > 0 && (
                            <div className="border border-brand-gold/30 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-brand-gold-light px-4 py-2.5 border-b border-brand-gold/30">
                                    <p className="text-[10px] font-black text-brand-gold-dark uppercase">
                                        {soloUnIntegrante ? 'Socio Habilitado — Cuota Actual' : 'Socios Habilitados — Cuota Actual'}
                                    </p>
                                    <p className="text-[9px] text-brand-gold-dark/70 font-bold mt-0.5">
                                        Vacío = paga su saldo completo. Ingresa monto si pagó parcialmente.
                                    </p>
                                </div>
                                <div className="divide-y divide-slate-100 bg-white">
                                    {integrantesPendientes.map((int) => {
                                        const val         = distribucion[int.id];
                                        const esCompleto  = !val || val === '';
                                        const saldoCap    = parseFloat(int.saldo_capital ?? int.saldo ?? 0);
                                        const moraPend    = parseFloat(int.mora_pendiente ?? 0);
                                        const saldoTotal  = saldoCap + moraPend;
                                        const montoPuesto = parseFloat(val || 0);
                                        const pagaMas     = !esCompleto && montoPuesto >= saldoTotal;

                                        return (
                                            <div key={int.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-slate-700 uppercase truncate">
                                                        {int.nombre}
                                                    </p>
                                                    <div className="flex flex-col mt-0.5 gap-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[9px] text-slate-400 font-bold">
                                                                Cuota: S/ {parseFloat(int.total_cuota || 0).toFixed(2)}
                                                            </p>
                                                            {parseFloat(int.pago_acumulado || 0) > 0 && (
                                                                <p className="text-[9px] text-green-600 font-bold">
                                                                    Pagó: S/ {parseFloat(int.pago_acumulado).toFixed(2)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {parseFloat(int.excedente_aplicado ?? 0) > 0 && (
                                                            <p className="text-[9px] text-purple-600 font-bold">
                                                                Exc. aplicado: -S/ {parseFloat(int.excedente_aplicado).toFixed(2)}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[9px] font-black text-slate-600">
                                                                Falta: S/ {saldoCap.toFixed(2)}
                                                            </p>
                                                            {moraPend > 0 && (
                                                                <p className="text-[9px] text-red-500 font-bold">
                                                                    + Mora: S/ {moraPend.toFixed(2)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <input type="text" inputMode="decimal"
                                                    value={val ?? ''}
                                                    onChange={e => handleMontoIntegrante(int.id, e.target.value)}
                                                    placeholder="Completo"
                                                    className={`w-28 p-2 border rounded-xl text-xs font-black outline-none focus:ring-1 text-right transition-all
                                                        ${esCompleto || pagaMas
                                                            ? 'border-green-200 bg-green-50 text-green-700 placeholder-green-400 focus:ring-green-400'
                                                            : 'border-brand-gold/50 bg-white text-brand-gold-dark focus:ring-brand-gold focus:border-brand-gold'}`}
                                                />
                                                <div className="w-14 text-right flex-shrink-0">
                                                    {esCompleto || pagaMas
                                                        ? <span className="text-[9px] font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">✓ FULL</span>
                                                        : <span className="text-[9px] font-black text-brand-gold-dark bg-brand-gold-light px-1.5 py-0.5 rounded border border-brand-gold/30">PARCIAL</span>
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Total distribuido:</span>
                                    <span className={`text-sm font-black ${
                                        Math.abs(totalDistribuido - parseFloat(recibido)) < 0.01
                                            ? 'text-green-600' : 'text-brand-gold-dark'}`}>
                                        S/ {totalDistribuido.toFixed(2)}
                                        <span className="text-[9px] text-slate-400 font-bold ml-1">/ S/ {totalAPagar}</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Aviso mora individual */}
                        {noCubreMora && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                <p className="text-xs font-black text-red-700 uppercase">⚠ Debe cubrir la mora primero</p>
                                <p className="text-[11px] text-red-500 mt-1">
                                    El monto mínimo es <span className="font-black">S/ {mora.toFixed(2)}</span>.
                                </p>
                            </div>
                        )}

                        {/* Aviso mora por integrante */}
                        {integrantesSinCubrirMora.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                <p className="text-xs font-black text-red-700 uppercase">⚠ Mora pendiente sin cubrir</p>
                                <div className="mt-1.5 space-y-1">
                                    {integrantesSinCubrirMora.map(int => (
                                        <p key={int.id} className="text-[11px] text-red-500">
                                            <span className="font-black">{int.nombre}</span>
                                            {' '}— mora: <span className="font-black">S/ {parseFloat(int.mora_pendiente).toFixed(2)}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview móvil */}
                        {preview && (
                            <div className="md:hidden">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Vista Previa:</p>
                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 min-h-[180px]">
                                    <img src={preview} alt="Voucher" className="max-h-[260px] rounded-lg shadow-sm" />
                                </div>
                            </div>
                        )}

                        {/* Alert backend */}
                        {alertLocal && (
                            <AlertMessage
                                type={alertLocal.type}
                                message={alertLocal.message}
                                details={alertLocal.details}
                                onClose={() => setAlertLocal(null)}
                            />
                        )}
                    </div>

                    {/* Botón */}
                    <div className="pt-6 mt-auto">
                        <button onClick={handleSubmit} disabled={loading || !puedeSubmit}
                            className="w-full bg-brand-red text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 hover:bg-brand-red-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
                            {loading
                                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                : <DocumentCheckIcon className="w-5 h-5" />
                            }
                            Registrar Pago de Cuota
                        </button>
                    </div>
                </div>

                {/* ── Panel derecho: preview voucher escritorio ──────────── */}
                <div className="hidden md:flex md:w-[45%] bg-slate-50 relative items-center justify-center p-6 rounded-r-[32px]">
                    {preview ? (
                        <div className="relative w-full h-full flex items-center justify-center group">
                            <img src={preview} alt="Voucher Preview"
                                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white border border-slate-200" />
                            <button onClick={() => { setArchivo(null); setPreview(null); }}
                                className="absolute top-4 right-4 bg-white text-brand-red p-2 rounded-full shadow-xl hover:bg-brand-red hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
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