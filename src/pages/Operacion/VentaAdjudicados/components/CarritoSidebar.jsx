import React from 'react';
import { ShoppingCartIcon, TrashIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import ClienteSearchSelect from 'components/Shared/Comboboxes/ClienteSearchSelect';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const inputCls = 'w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-xs font-bold text-slate-700 dark:text-dark-text outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold';

const CarritoSidebar = ({
    carrito, quitarDelCarrito, totalCarrito,
    clienteGenerico, cambiarTipoCliente,
    comprador, setComprador,
    clienteRegistrado, setClienteRegistrado, clienteKey,
    metodoPago, setMetodoPago, numeroOperacion, setNumeroOperacion,
    onProcesar, procesando = false,
}) => (
    <div className="bg-white dark:bg-dark-surface rounded-[28px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 sticky top-4 transition-colors">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border flex items-center gap-2">
            <ShoppingCartIcon className="w-4 h-4 text-slate-700 dark:text-dark-text" />
            <h4 className="font-black text-slate-800 dark:text-dark-text uppercase text-xs tracking-[0.15em]">
                Carrito ({carrito.length})
            </h4>
        </div>

        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
            {carrito.length === 0 && (
                <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted text-center py-6">
                    Agrega lotes desde la lista para venderlos.
                </p>
            )}
            {carrito.map(item => (
                <div key={item.lote} className="flex items-center justify-between bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border p-3">
                    <div>
                        <p className="text-xs font-black text-slate-800 dark:text-dark-text">Lote #{item.lote}</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted">{item.cantidad_piezas} pieza(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <span className="block text-xs font-black text-slate-700 dark:text-dark-text">S/ {fmt(item.precio_venta)}</span>
                            {parseFloat(item.precio_venta) !== parseFloat(item.valor_tasado) && (
                                <span className="block text-[8px] font-bold text-slate-400 dark:text-dark-text-muted line-through">S/ {fmt(item.valor_tasado)}</span>
                            )}
                        </div>
                        <button onClick={() => quitarDelCarrito(item.lote)} disabled={procesando}
                            className="text-slate-300 dark:text-dark-text-muted/60 hover:text-brand-red transition-colors disabled:opacity-40">
                            <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-dark-border space-y-3">
            {/* ── Comprador ── */}
            <div>
                <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5">Comprador</label>
                <div className="flex bg-slate-100 dark:bg-dark-surface-alt p-0.5 rounded-lg border border-slate-200 dark:border-dark-border mb-2">
                    <button type="button" onClick={() => cambiarTipoCliente(true)} disabled={procesando}
                        className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${clienteGenerico ? 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold shadow-sm' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                        Genérico
                    </button>
                    <button type="button" onClick={() => cambiarTipoCliente(false)} disabled={procesando}
                        className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${!clienteGenerico ? 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold shadow-sm' : 'text-slate-400 dark:text-dark-text-muted'}`}>
                        Cliente registrado
                    </button>
                </div>

                {clienteGenerico ? (
                    // Comprador que no es cliente: se registran sus datos en la venta
                    <div className="space-y-2">
                        <input type="text" inputMode="numeric" maxLength={11}
                            value={comprador.documento} disabled={procesando}
                            onChange={e => setComprador(p => ({ ...p, documento: e.target.value.replace(/\D/g, '') }))}
                            placeholder="DNI (8) o RUC (11)"
                            className={inputCls}
                        />
                        <input type="text" maxLength={120}
                            value={comprador.nombres} disabled={procesando}
                            onChange={e => setComprador(p => ({ ...p, nombres: e.target.value }))}
                            placeholder="Nombres"
                            className={`${inputCls} uppercase`}
                        />
                        <input type="text" maxLength={120}
                            value={comprador.apellidos} disabled={procesando}
                            onChange={e => setComprador(p => ({ ...p, apellidos: e.target.value }))}
                            placeholder="Apellidos (paterno y materno)"
                            className={`${inputCls} uppercase`}
                        />
                    </div>
                ) : (
                    // Cliente que ya existe en el sistema
                    <div>
                        <ClienteSearchSelect
                            key={clienteKey}
                            onSelect={setClienteRegistrado}
                            disabled={procesando}
                        />
                        {clienteRegistrado && (
                            <p className="text-[9px] font-bold text-green-600 dark:text-green-400 mt-1.5 uppercase">
                                {clienteRegistrado.nombre_completo}
                                {clienteRegistrado.documento && ` · ${clienteRegistrado.documento}`}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Método de pago ── */}
            <div>
                <label className="block text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5">Método de pago</label>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setMetodoPago('EFECTIVO')} disabled={procesando}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
                            metodoPago === 'EFECTIVO' ? 'bg-brand-red text-white border-brand-red' : 'bg-white dark:bg-dark-surface text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'
                        }`}>
                        <BanknotesIcon className="w-3.5 h-3.5" /> Efectivo
                    </button>
                    <button type="button" onClick={() => setMetodoPago('TRANSFERENCIA')} disabled={procesando}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${
                            metodoPago === 'TRANSFERENCIA' ? 'bg-brand-red text-white border-brand-red' : 'bg-white dark:bg-dark-surface text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border'
                        }`}>
                        <CreditCardIcon className="w-3.5 h-3.5" /> Transferencia
                    </button>
                </div>
                {metodoPago === 'TRANSFERENCIA' && (
                    <input type="text" maxLength={50}
                        value={numeroOperacion} disabled={procesando}
                        onChange={e => setNumeroOperacion(e.target.value)}
                        placeholder="N° de operación (opcional)"
                        className={`${inputCls} mt-2`}
                    />
                )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-dark-border">
                <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase">Total</span>
                <span className="text-xl font-black text-brand-red dark:text-brand-gold">S/ {fmt(totalCarrito)}</span>
            </div>

            <button
                onClick={onProcesar}
                disabled={carrito.length === 0 || procesando}
                className="w-full py-3.5 rounded-2xl font-black uppercase text-xs bg-slate-900 dark:bg-black text-white dark:text-dark-text hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
                {procesando ? 'Procesando...' : 'Procesar Venta'}
            </button>
        </div>
    </div>
);

export default CarritoSidebar;