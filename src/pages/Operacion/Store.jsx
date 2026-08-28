import React, { useState } from 'react';
import { useStore } from 'hooks/Operacion/useStore';
import PageHeader from 'components/Shared/Headers/PageHeader';
import PrestamoSearchSelect from 'components/Shared/Comboboxes/PrestamoSearchSelect';
import OperacionForm from 'components/Shared/Formularios/Operacion/OperacionForm';
import PagoCuotaModal from './PagoCuotaModal';
import DesembolsoModal from './DesembolsoModal';
import AbrirSesionModal from 'components/Shared/Modals/Operacion/AbrirSesionModal';
import CerrarSesionModal from 'components/Shared/Modals/Operacion/CerrarSesionModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import HistorialMoraModal from 'pages/Prestamo/HistorialMoraModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import {
    CurrencyDollarIcon,
    LockClosedIcon,
    LockOpenIcon,
    BanknotesIcon,
    ArrowUpCircleIcon,
    ArrowDownCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import jwtUtils from 'utilities/Token/jwtUtils';

const Store = () => {
    const {
        loading, sesionActiva, alert, setAlert, tipoOperacion, setTipoOperacion,
        prestamoSeleccionado, handleSelectPrestamo, prestamoDetalle, handleDesembolsar,
        isPagoModalOpen, setIsPagoModalOpen, cuotaSeleccionada, openPagoModal, handleConfirmarPago,
        isAbrirModalOpen, setIsAbrirModalOpen, isCerrarModalOpen, setIsCerrarModalOpen,
        handleAbrirSesion, handleCerrarSesion, isPdfModalOpen, setIsPdfModalOpen, pdfTitle, pdfBase64, handleRefresh, verifySesion
    } = useStore();

    const [isDesembolsoModalOpen, setIsDesembolsoModalOpen] = useState(false);
    const [historialModal, setHistorialModal]               = useState(null);
    const [comboResetKey, setComboResetKey]                 = useState(0);  // ← reset combobox

    if (loading && sesionActiva === undefined) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl transition-colors">
            <PageHeader title="Caja Operativa" icon={CurrencyDollarIcon} />
            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                details={alert?.details}
                onClose={() => setAlert(null)}
            />

            {/* ── Sesión cerrada ── */}
            {!sesionActiva && !loading ? (
                <div className="mt-10 bg-white dark:bg-dark-surface p-12 rounded-[40px] border border-slate-100 dark:border-dark-border shadow-2xl dark:shadow-black/50 text-center max-w-xl mx-auto transition-colors">
                    <div className="bg-brand-red-light dark:bg-brand-gold/10 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 transform -rotate-6 shadow-inner transition-colors">
                        <LockClosedIcon className="w-12 h-12 text-brand-red dark:text-brand-gold" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-dark-text uppercase tracking-tight mb-3 transition-colors">Turno Cerrado</h2>
                    <p className="text-slate-500 dark:text-dark-text-muted text-sm font-medium mb-10 px-6 leading-relaxed transition-colors">
                        Para registrar cobros de cuotas o autorizar desembolsos, es necesario que realices la apertura de tu turno físico.
                    </p>
                    <button
                        onClick={() => setIsAbrirModalOpen(true)}
                        className="bg-brand-red dark:bg-brand-red-glow text-white dark:text-black px-12 py-4 rounded-2xl font-black uppercase text-xs shadow-xl dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <LockOpenIcon className="w-4 h-4" /> Aperturar Turno de Caja
                    </button>
                </div>
            ) : (
                <div className="mt-6 space-y-6 animate-in fade-in duration-500">

                    {/* ── Header cajero ── */}
                    <div className="flex flex-col md:flex-row items-center justify-between bg-brand-red dark:bg-dark-surface p-6 md:p-8 rounded-[32px] shadow-xl text-white dark:text-dark-text gap-6 border border-brand-red-dark dark:border-dark-border relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-red-light opacity-10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex items-center gap-4 z-10">
                            <div className="flex items-center gap-4 z-10">
                                <div className="p-3 bg-brand-red-dark dark:bg-dark-surface-alt rounded-2xl shadow-inner border border-brand-red-dark/50 dark:border-dark-border transition-colors">
                                    <BanknotesIcon className="w-8 h-8 text-brand-gold" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-brand-red-light/80 dark:text-dark-text-muted uppercase tracking-[0.2em] block mb-1">Cajero de Turno</span>
                                    <span className="text-lg font-black block">
                                        {jwtUtils.getName(jwtUtils.getAccessTokenFromCookie()) || 'Usuario del Sistema'}
                                    </span>
                                    {sesionActiva?.dia_operativo && (
                                        <span className={`mt-1 inline-flex items-center gap-1 text-[12px] font-black uppercase px-2.5 py-1 rounded-full tracking-[0.15em] ${
                                            sesionActiva.dia_operativo.pendiente_de_cierre
                                                ? 'bg-brand-gold text-brand-red-dark'
                                                : 'bg-brand-red-dark/50 dark:bg-dark-surface-alt text-white/70 dark:text-dark-text-muted'
                                        }`}>
                                            Día Operativo: {sesionActiva.dia_operativo.fecha}
                                            {sesionActiva.dia_operativo.pendiente_de_cierre ? ' · Pendiente de Cierre' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-brand-red-dark dark:border-dark-border pt-6 md:pt-0 md:pl-8 w-full md:w-auto justify-between md:justify-start z-10 transition-colors">
                            <div className="text-right">
                                <span className="text-[9px] font-black text-brand-red-light/80 dark:text-dark-text-muted uppercase tracking-[0.2em] block mb-1">Saldo en Efectivo</span>
                                <span className="text-3xl font-black text-brand-gold tracking-tighter drop-shadow-sm">
                                    S/ {parseFloat(sesionActiva?.saldo_esperado || 0).toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={() => { verifySesion(); setIsCerrarModalOpen(true); }}
                                className="bg-brand-red-dark dark:bg-dark-surface-alt hover:bg-brand-gold dark:hover:bg-brand-gold hover:text-brand-red-dark dark:hover:text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all border border-brand-red-dark dark:border-dark-border hover:border-brand-gold hover:shadow-lg active:scale-95"
                            >
                                Cerrar Turno
                            </button>
                        </div>
                    </div>

                    {/* ── Panel operación ── */}
                    <div className="bg-white dark:bg-dark-surface p-4 md:p-8 rounded-[40px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">

                        {/* Toggle cobro / desembolso */}
                        <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-dark-surface-alt p-1.5 rounded-2xl w-full sm:w-fit mx-auto border border-slate-200 dark:border-dark-border transition-colors">
                            <button
                                onClick={() => { setTipoOperacion('cobro'); handleSelectPrestamo(null); }}
                                className={`flex-1 sm:px-10 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                                    tipoOperacion === 'cobro'
                                        ? 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold shadow-md ring-1 ring-brand-red/20 dark:ring-brand-gold/20'
                                        : 'text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold'
                                }`}
                            >
                                <ArrowUpCircleIcon className="w-4 h-4" /> Cobrar Cuota
                            </button>
                            <button
                                onClick={() => { setTipoOperacion('desembolso'); handleSelectPrestamo(null); }}
                                className={`flex-1 sm:px-10 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                                    tipoOperacion === 'desembolso'
                                        ? 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold shadow-md ring-1 ring-brand-red/20 dark:ring-brand-gold/20'
                                        : 'text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold'
                                }`}
                            >
                                <ArrowDownCircleIcon className="w-4 h-4" /> Desembolsar
                            </button>
                        </div>

                        {/* Buscador */}
                        <PrestamoSearchSelect
                            tipoOperacion={tipoOperacion}
                            onSelect={handleSelectPrestamo}
                            disabled={loading}
                            resetKey={comboResetKey}
                        />

                        {/* Desembolso */}
                        {prestamoSeleccionado && tipoOperacion === 'desembolso' && (
                            <div className="mt-8 p-6 md:p-10 bg-brand-gold-light/30 dark:bg-brand-gold/10 rounded-[32px] border-2 border-dashed border-brand-gold/50 dark:border-brand-gold/30 animate-in zoom-in-95 duration-300 transition-colors">
                                {/* Encabezado */}
                                <div className="text-center mb-8">
                                    <h4 className="font-black text-brand-gold-dark dark:text-brand-gold uppercase text-lg mb-1 tracking-tight">Autorizar Desembolso</h4>
                                    <p className="text-xs font-bold text-brand-red dark:text-red-400 uppercase tracking-widest">{prestamoSeleccionado.cliente}</p>
                                </div>

                                {/* Datos del préstamo */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                    <div className="bg-white/70 dark:bg-dark-surface-alt rounded-2xl p-4 border border-brand-gold/20 dark:border-dark-border transition-colors">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-1">Préstamo</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-dark-text">#{prestamoSeleccionado.id}</span>
                                    </div>
                                    <div className="bg-white/70 dark:bg-dark-surface-alt rounded-2xl p-4 border border-brand-gold/20 dark:border-dark-border transition-colors">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-1">Documento</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-dark-text">{prestamoSeleccionado.documento}</span>
                                    </div>
                                    <div className="bg-white/70 dark:bg-dark-surface-alt rounded-2xl p-4 border border-brand-gold/20 dark:border-dark-border transition-colors">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-1">Producto</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-dark-text leading-tight">{prestamoSeleccionado.producto_nombre}</span>
                                    </div>
                                    <div className="bg-white/70 dark:bg-dark-surface-alt rounded-2xl p-4 border border-brand-gold/20 dark:border-dark-border transition-colors">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-1">Cuotas Pend.</span>
                                        <span className="text-sm font-black text-slate-800 dark:text-dark-text">{prestamoSeleccionado.cuotas_pendientes}</span>
                                    </div>
                                    <div className="bg-white/70 dark:bg-dark-surface-alt rounded-2xl p-4 border border-brand-gold/20 dark:border-dark-border col-span-2 transition-colors">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-1">Asesor Asignado</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-dark-text leading-tight">{prestamoSeleccionado.asesor_nombre}</span>
                                    </div>
                                    <div className="bg-white/70 dark:bg-dark-surface-alt rounded-2xl p-4 border border-brand-gold/20 dark:border-dark-border col-span-2 transition-colors">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-1">Tipo de Crédito</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-dark-text leading-tight">
                                            {prestamoSeleccionado.es_grupal
                                                ? `GRUPAL${prestamoSeleccionado.grupo_nombre ? ` · ${prestamoSeleccionado.grupo_nombre}` : ''}`
                                                : 'INDIVIDUAL'}
                                        </span>
                                    </div>
                                </div>

                                {/* Presidente del grupo (solo grupal) */}
                                {prestamoSeleccionado.es_grupal && prestamoSeleccionado.presidente && (
                                    <div className="bg-brand-red/5 dark:bg-brand-gold/10 rounded-2xl p-4 border border-brand-red/20 dark:border-brand-gold/20 mb-6 transition-colors">
                                        <span className="text-[9px] font-black text-brand-red/70 dark:text-brand-gold/80 uppercase tracking-[0.15em] block mb-1">Presidente del Grupo</span>
                                        <span className="text-sm font-black text-brand-red dark:text-brand-gold">{prestamoSeleccionado.presidente.nombre}</span>
                                        {prestamoSeleccionado.presidente.dni && (
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-widest block mt-0.5">
                                                DNI: {prestamoSeleccionado.presidente.dni}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Integrantes del grupo + sus cuentas (solo grupal) */}
                                {prestamoSeleccionado.es_grupal && prestamoSeleccionado.integrantes?.length > 0 && (
                                    <div className="mb-8">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase block mb-3 tracking-[0.2em] text-center">
                                            Integrantes del Grupo ({prestamoSeleccionado.integrantes.length})
                                        </span>
                                        <div className="space-y-3">
                                            {prestamoSeleccionado.integrantes.map((int, idx) => (
                                                <div key={int.cliente_id ?? idx} className="bg-white dark:bg-dark-surface rounded-2xl p-4 border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 transition-colors">
                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                        <div>
                                                            <span className="text-sm font-black text-slate-800 dark:text-dark-text leading-tight block">{int.nombre}</span>
                                                            {int.dni && (
                                                                <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">DNI: {int.dni}</span>
                                                            )}
                                                        </div>
                                                        {int.cargo && (
                                                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-[0.1em] ${
                                                                int.cargo === 'PRESIDENTE'
                                                                    ? 'bg-brand-red/10 text-brand-red dark:text-brand-gold'
                                                                    : 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted'
                                                            }`}>
                                                                {int.cargo}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Cuentas del integrante */}
                                                    {int.cuentas_bancarias?.length > 0 ? (
                                                        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-dark-border transition-colors">
                                                            {int.cuentas_bancarias.map((cta, i) => (
                                                                <div key={i} className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                                                                    <div>
                                                                        <span className="text-[8px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block">{cta.banco}</span>
                                                                        <span className="text-xs font-black text-slate-700 dark:text-dark-text tracking-tight">N° {cta.numero_cuenta}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted tracking-tight md:text-right">CCI: {cta.cci}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 dark:text-dark-text-muted/60 uppercase tracking-widest block mt-2 pt-2 border-t border-slate-100 dark:border-dark-border transition-colors">Sin cuentas registradas</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cuentas bancarias (solo individual) */}
                                {!prestamoSeleccionado.es_grupal && prestamoSeleccionado.cuentas_bancarias?.length > 0 && (
                                    <div className="mb-8">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase block mb-3 tracking-[0.2em] text-center">Cuentas Bancarias del Cliente</span>
                                        <div className="space-y-2">
                                            {prestamoSeleccionado.cuentas_bancarias.map((cta, idx) => (
                                                <div key={idx} className="bg-white dark:bg-dark-surface rounded-2xl p-4 border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/20 flex flex-col md:flex-row md:items-center md:justify-between gap-2 transition-colors">
                                                    <div>
                                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-0.5">{cta.banco}</span>
                                                        <span className="text-sm font-black text-slate-800 dark:text-dark-text tracking-tight">{cta.numero_cuenta}</span>
                                                    </div>
                                                    <div className="md:text-right">
                                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-[0.15em] block mb-0.5">CCI</span>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-dark-text-muted tracking-tight">{cta.cci}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Importe a entregar */}
                                <div className="text-center my-10">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase block mb-2 tracking-[0.3em]">Importe Neto a Entregar</span>
                                    <h2 className="text-6xl md:text-7xl font-black text-brand-red dark:text-brand-gold italic tracking-tighter">S/ {prestamoSeleccionado.monto}</h2>
                                    {prestamoSeleccionado.monto_original &&
                                        parseFloat(prestamoSeleccionado.monto_original) !== parseFloat(prestamoSeleccionado.monto) && (
                                        <span className="text-[14px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-widest block mt-2">
                                            Monto original: S/ {parseFloat(prestamoSeleccionado.monto_original).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {/* Botón */}
                                <div className="text-center">
                                    <button
                                        onClick={() => setIsDesembolsoModalOpen(true)}
                                        disabled={loading}
                                        className="px-16 py-5 bg-brand-red dark:bg-brand-red-glow text-white dark:text-black rounded-2xl font-black uppercase text-sm shadow-xl shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                                    >
                                        {loading ? 'Procesando...' : 'Siguiente: Adjuntar Voucher'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Cobro — OperacionForm */}
                        {prestamoSeleccionado && tipoOperacion === 'cobro' && prestamoDetalle && (
                            <>
                                <div className="flex justify-end mt-6 mb-2">
                                    <button
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-dark-surface-alt hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-dark-text text-[10px] font-black uppercase rounded-xl transition-all disabled:opacity-50"
                                    >
                                        <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                                        Actualizar
                                    </button>
                                </div>
                                <OperacionForm
                                    prestamoDetalle={prestamoDetalle}
                                    loading={loading}
                                    openPagoModal={openPagoModal}
                                    onHistorialModal={setHistorialModal}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modales ── */}
            <PagoCuotaModal
                isOpen={isPagoModalOpen}
                onClose={() => setIsPagoModalOpen(false)}
                cuota={cuotaSeleccionada}
                onConfirm={handleConfirmarPago}
                loading={loading}
            />
            <DesembolsoModal
                isOpen={isDesembolsoModalOpen}
                onClose={() => setIsDesembolsoModalOpen(false)}
                prestamo={prestamoSeleccionado}
                onConfirm={async (fd) => {
                    await handleDesembolsar(fd);
                    setIsDesembolsoModalOpen(false);
                    setComboResetKey(k => k + 1);  // ← fuerza limpieza del combobox
                }}
                loading={loading}
            />
            <AbrirSesionModal
                isOpen={isAbrirModalOpen}
                onClose={() => setIsAbrirModalOpen(false)}
                onConfirm={handleAbrirSesion}
                loading={loading}
            />
            <CerrarSesionModal
                isOpen={isCerrarModalOpen}
                onClose={() => setIsCerrarModalOpen(false)}
                onConfirm={handleCerrarSesion}
                sesionActiva={sesionActiva}
                loading={loading}
            />
            <PdfModal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                title={pdfTitle}
                base64={pdfBase64}
            />
            <HistorialMoraModal
                isOpen={!!historialModal}
                onClose={() => setHistorialModal(null)}
                data={historialModal}
            />
        </div>
    );
};

export default Store;