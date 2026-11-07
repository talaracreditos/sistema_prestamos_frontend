import React from 'react';
import { useVentaAdjudicados } from 'hooks/Operacion/useVentaAdjudicados';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoteCard from './components/LoteCard';
import LoteDetalleModal from './components/LoteDetalleModal';
import CarritoSidebar from './components/CarritoSidebar';
import {
    ArchiveBoxIcon, MagnifyingGlassIcon, XMarkIcon, UserIcon, BanknotesIcon,
} from '@heroicons/react/24/outline';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const VentaAdjudicados = ({ onVentaRegistrada }) => {
    const {
        documentoBusqueda, setDocumentoBusqueda, documentoBuscado,
        clienteBusqueda, prestamos, loading, handleBuscar, limpiarBusqueda,
        alert, setAlert,
        loteDetalle, loadingDetalle, modalLoteOpen, abrirDetalleLote, cerrarDetalleLote,
        carrito, enCarrito, agregarAlCarrito, quitarDelCarrito, totalCarrito,
        clienteGenerico, cambiarTipoCliente,
        comprador, setComprador,
        clienteRegistrado, setClienteRegistrado, clienteKey,
        metodoPago, setMetodoPago, numeroOperacion, setNumeroOperacion,
        procesarVenta, procesando,
    } = useVentaAdjudicados({ onVentaRegistrada });

    return (
        <div className="mt-6 animate-in fade-in duration-300">
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Búsqueda + préstamos con sus lotes ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Buscador por DNI/RUC */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleBuscar(); }}
                        className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 transition-colors"
                    >
                        <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5 tracking-widest">
                            DNI / RUC del cliente
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <UserIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text" inputMode="numeric" maxLength={11}
                                    value={documentoBusqueda}
                                    onChange={e => setDocumentoBusqueda(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Ej: 42850896"
                                    disabled={loading || procesando}
                                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl text-sm font-black text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || procesando}
                                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl font-black text-[10px] uppercase bg-brand-red text-white hover:bg-brand-red-dark transition-all active:scale-95 disabled:opacity-40"
                            >
                                <MagnifyingGlassIcon className="w-4 h-4" /> Buscar
                            </button>
                            {documentoBuscado && (
                                <button
                                    type="button"
                                    onClick={limpiarBusqueda}
                                    disabled={loading || procesando}
                                    title="Limpiar búsqueda"
                                    className="inline-flex items-center px-3 py-3 rounded-xl text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface transition-all disabled:opacity-40"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>

                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-4 border-brand-red/20 dark:border-brand-gold/20 border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Sin búsqueda todavía */}
                    {!loading && !documentoBuscado && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <MagnifyingGlassIcon className="w-10 h-10 text-slate-300 dark:text-dark-text-muted/50 mb-3" />
                            <p className="text-sm font-black text-slate-400 dark:text-dark-text-muted uppercase">
                                Ingresa el DNI del cliente para ver sus lotes adjudicados
                            </p>
                        </div>
                    )}

                    {/* Búsqueda sin resultados */}
                    {!loading && documentoBuscado && prestamos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ArchiveBoxIcon className="w-10 h-10 text-slate-300 dark:text-dark-text-muted/50 mb-3" />
                            <p className="text-sm font-black text-slate-400 dark:text-dark-text-muted uppercase">
                                Sin lotes adjudicados para {documentoBuscado}
                            </p>
                        </div>
                    )}

                    {/* Cliente + préstamos con sus lotes */}
                    {!loading && prestamos.length > 0 && (
                        <>
                            {clienteBusqueda && (
                                <div className="flex items-center gap-3 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border p-4 transition-colors">
                                    <div className="p-2.5 bg-brand-red-light dark:bg-dark-surface-alt rounded-xl">
                                        <UserIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-800 dark:text-dark-text uppercase truncate">{clienteBusqueda.nombre_completo}</p>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted">
                                            {clienteBusqueda.documento} · {prestamos.length} préstamo{prestamos.length === 1 ? '' : 's'} con adjudicados
                                        </p>
                                    </div>
                                </div>
                            )}

                            {prestamos.map(p => (
                                <section key={p.prestamo_id} className="space-y-3">
                                    {/* Cabecera del préstamo */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 dark:bg-black rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <BanknotesIcon className="w-4 h-4 text-brand-gold shrink-0" />
                                            <span className="text-xs font-black text-white uppercase tracking-widest">
                                                Préstamo {p.numero_prestamo}
                                            </span>
                                            {p.codigo_recaudo && (
                                                <span className="text-[9px] font-bold text-white/50 font-mono">Recaudo: {p.codigo_recaudo}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] font-bold text-white/60 uppercase">
                                            {p.fecha_desembolso && <span>Desemb.: {p.fecha_desembolso}</span>}
                                            <span>Monto: S/ {fmt(p.monto)}</span>
                                            <span className="text-brand-gold">
                                                {p.cantidad_lotes} lote{p.cantidad_lotes === 1 ? '' : 's'} · S/ {fmt(p.valor_total)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Lotes del préstamo */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {p.lotes.map(lote => (
                                            <LoteCard
                                                key={lote.lote}
                                                lote={lote}
                                                enCarrito={enCarrito(lote.lote)}
                                                onVerDetalle={abrirDetalleLote}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </>
                    )}
                </div>

                {/* ── Carrito ── */}
                <div className="lg:col-span-1">
                    <CarritoSidebar
                        carrito={carrito}
                        quitarDelCarrito={quitarDelCarrito}
                        totalCarrito={totalCarrito}
                        clienteGenerico={clienteGenerico}
                        cambiarTipoCliente={cambiarTipoCliente}
                        comprador={comprador}
                        setComprador={setComprador}
                        clienteRegistrado={clienteRegistrado}
                        setClienteRegistrado={setClienteRegistrado}
                        clienteKey={clienteKey}
                        metodoPago={metodoPago}
                        setMetodoPago={setMetodoPago}
                        numeroOperacion={numeroOperacion}
                        setNumeroOperacion={setNumeroOperacion}
                        onProcesar={procesarVenta}
                        procesando={procesando}
                    />
                </div>
            </div>

            <LoteDetalleModal
                isOpen={modalLoteOpen}
                onClose={cerrarDetalleLote}
                loading={loadingDetalle}
                lote={loteDetalle}
                enCarrito={loteDetalle ? enCarrito(loteDetalle.lote) : false}
                onAgregarCarrito={agregarAlCarrito}
            />
        </div>
    );
};

export default VentaAdjudicados;