import React from 'react';
import {
    UserIcon, SparklesIcon, AdjustmentsHorizontalIcon, CurrencyDollarIcon,
    PlusIcon, TrashIcon, CheckCircleIcon, PencilSquareIcon, XMarkIcon, LockClosedIcon
} from '@heroicons/react/24/outline';
import TipoJoyaSearchSelect from 'components/Shared/Comboboxes/TipoJoyaSearchSelect';
import SubtipoJoyaSearchSelect from 'components/Shared/Comboboxes/SubtipoJoyaSearchSelect';
import ClienteSearchSelect from 'components/Shared/Comboboxes/ClienteSearchSelect';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const CampoNumero = ({ label, value, onChange, highlight, disabled }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5">{label}</label>
        <input
            type="number"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
            className={`w-full p-3.5 text-sm font-bold border rounded-xl outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-dark-surface-alt/50 ${
                highlight
                    ? 'bg-slate-50 dark:bg-dark-surface-alt border-brand-red/30 dark:border-brand-gold/30 focus:ring-brand-red dark:focus:ring-brand-gold text-slate-800 dark:text-dark-text'
                    : 'bg-slate-50 dark:bg-dark-surface-alt border-slate-200 dark:border-dark-border focus:ring-brand-red dark:focus:ring-brand-gold text-slate-800 dark:text-dark-text'
            }`}
        />
    </div>
);

// Display de valor calculado — NUNCA editable, siempre viene del cálculo automático
const CampoCalculado = ({ label, value, prefix = '', destacado = false }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5">{label}</label>
        <div className={`p-3.5 text-sm font-black border rounded-xl ${
            destacado
                ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold'
                : 'bg-slate-100 dark:bg-dark-surface-alt/50 border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-muted'
        }`}>
            {prefix}{fmt(value)}
        </div>
    </div>
);

const TasacionForm = ({
    cliente, handleSeleccionarCliente, handleCambiarCliente,

    detalles, detalleActual, setDetalleActual, editandoId, montoAnteriorEdicion,
    pesoNeto, valorTasadoNum, porcentajeNum, maximoSugerido, formularioTieneDatos,
    handleAgregarDetalle, handleEditarDetalle, handleCancelarEdicion, handleEliminarDetalle,

    porcentajePrestamo, setPorcentajePrestamo,
    precioOroGramo, setPrecioOroGramo,

    kilatesOpciones,

    camposLimitados = false,
}) => {
    const precioOroInvalido = !precioOroGramo || parseFloat(precioOroGramo) <= 0;

    return (
        <>
            {/* ── PASO 1: CLIENTE ─────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors mt-4">
                <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-2 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                    <UserIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> 1. Cliente
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase mb-4 mt-3">
                    Puedes tasar primero y seleccionar al cliente al final, una vez que el interesado califique y quede registrado como cliente.
                </p>

                {!cliente ? (
                    <ClienteSearchSelect onSelect={handleSeleccionarCliente} />
                ) : (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircleIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="font-black text-slate-800 dark:text-dark-text text-sm">{cliente.nombre_completo}</p>
                                <p className="text-xs text-slate-500 dark:text-dark-text-muted">
                                    {cliente.documento && `Doc: ${cliente.documento}`}
                                    {cliente.celular && ` · ${cliente.celular}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleCambiarCliente}
                            className="text-xs font-black text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold uppercase transition-colors"
                        >
                            Cambiar
                        </button>
                    </div>
                )}
            </div>

            {/* ── PASO 2: TASACIÓN DE JOYAS — ya no depende de tener cliente ──── */}
            <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-dark-border pb-3">
                    <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 uppercase tracking-wide transition-colors">
                        <SparklesIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> 2. Tasación de joyas
                        {editandoId && (
                            <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md uppercase tracking-widest normal-case">
                                Editando joya
                            </span>
                        )}
                        {camposLimitados && (
                            <span className="flex items-center gap-1 text-[10px] font-black bg-slate-200 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted px-2 py-0.5 rounded-md uppercase tracking-widest normal-case">
                                <LockClosedIcon className="w-3 h-3" /> Peso bloqueado
                            </span>
                        )}
                    </h3>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Precio del oro — OBLIGATORIO, se ingresa en cada tasación */}
                        <div className={`flex items-center gap-2 border rounded-xl px-4 py-2 transition-colors ${
                            precioOroInvalido
                                ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30'
                                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                        }`}>
                            <CurrencyDollarIcon className={`w-4 h-4 flex-shrink-0 ${precioOroInvalido ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
                            <span className={`text-[10px] font-black uppercase whitespace-nowrap ${precioOroInvalido ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                Precio oro/gr. S/
                            </span>
                            <input
                                type="number"
                                value={precioOroGramo}
                                onChange={(e) => setPrecioOroGramo(e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className={`w-20 bg-transparent text-sm font-black text-right outline-none ${precioOroInvalido ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}
                            />
                            <span className={`text-xs font-black ${precioOroInvalido ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>/g</span>
                        </div>

                        {/* % de préstamo — configurable por el tasador/jefe */}
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl px-4 py-2">
                            <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted flex-shrink-0" />
                            <span className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase whitespace-nowrap">% a prestar</span>
                            <input
                                type="number"
                                value={porcentajePrestamo}
                                onChange={(e) => setPorcentajePrestamo(e.target.value)}
                                min="0"
                                step="1"
                                className="w-16 bg-transparent text-sm font-black text-brand-red dark:text-brand-gold text-right outline-none"
                            />
                            <span className="text-sm font-black text-brand-red dark:text-brand-gold">%</span>
                        </div>
                    </div>
                </div>

                {precioOroInvalido && (
                    <p className="text-[10px] font-black text-brand-red dark:text-red-400 uppercase -mt-3 mb-4">
                        ⚠ Ingresa el precio del oro por gramo antes de agregar joyas — es obligatorio para tasar.
                    </p>
                )}

                {porcentajeNum > 100 && (
                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase -mt-3 mb-4 flex items-center gap-1">
                        ⚠ Prestando por encima del valor tasado ({porcentajeNum}%) — verifica que sea intencional.
                    </p>
                )}

                {/* Formulario joya actual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <TipoJoyaSearchSelect
                        key={editandoId ?? 'nuevo'}
                        onSelect={(t) => setDetalleActual(p => ({ ...p, tipo_joya: t }))}
                        initialName={detalleActual.tipo_joya?.descripcion || ''}
                    />
                    <SubtipoJoyaSearchSelect
                        key={editandoId ?? 'nuevo'}
                        onSelect={(s) => setDetalleActual(p => ({ ...p, subtipo_joya: s }))}
                        initialName={detalleActual.subtipo_joya?.descripcion || ''}
                    />
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-1.5">Kilataje</label>
                        <select
                            value={detalleActual.kilates}
                            onChange={(e) => setDetalleActual(p => ({ ...p, kilates: e.target.value }))}
                            className="w-full p-3.5 text-sm font-bold bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold"
                        >
                            {kilatesOpciones.map(k => (
                                <option key={k} value={k}>{k}K</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Descripción — siempre editable, incluso con peso bloqueado */}
                <div className="mb-4">
                    <textarea
                        value={detalleActual.descripcion_detallada}
                        onChange={(e) => setDetalleActual(p => ({ ...p, descripcion_detallada: e.target.value }))}
                        placeholder="Descripción de la joya (opcional) — marca, estado, señas particulares, etc."
                        rows={3}
                        className="w-full p-3.5 text-sm font-bold bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold resize-y"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <CampoNumero label="Peso bruto (g)" value={detalleActual.peso_bruto}
                        onChange={(v) => setDetalleActual(p => ({ ...p, peso_bruto: v }))}
                        disabled={camposLimitados} />
                    <CampoNumero label="Peso incrustación (g)" value={detalleActual.peso_incrustacion}
                        onChange={(v) => setDetalleActual(p => ({ ...p, peso_incrustacion: v }))}
                        disabled={camposLimitados} />
                    <CampoCalculado label="Peso neto (g)" value={pesoNeto} />
                    <CampoCalculado label="Valor tasado (S/)" value={valorTasadoNum} destacado />
                    <div>
                        <CampoCalculado label="Máx. a prestar (S/)" value={maximoSugerido} destacado />
                        {editandoId && montoAnteriorEdicion > 0 && (
                            <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-1">
                                Anterior: S/ {fmt(montoAnteriorEdicion)}
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted uppercase font-bold -mt-2 mb-4">
                    Valor tasado y máximo a prestar se calculan automáticamente (peso neto × precio del oro según kilataje × % a prestar) — no son editables.
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAgregarDetalle}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase text-xs transition-colors ${
                            editandoId
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-slate-800 dark:bg-dark-surface-alt text-white dark:text-brand-gold hover:bg-slate-900 dark:hover:bg-dark-border'
                        }`}
                    >
                        {editandoId
                            ? <><CheckCircleIcon className="w-4 h-4" /> Guardar cambios de la joya</>
                            : <><PlusIcon className="w-4 h-4" /> Agregar joya a la tasación</>
                        }
                    </button>
                    {editandoId && (
                        <button
                            onClick={handleCancelarEdicion}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-xs text-slate-500 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" /> Cancelar
                        </button>
                    )}
                    {!editandoId && formularioTieneDatos && (
                        <button
                            onClick={handleCancelarEdicion}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl font-black uppercase text-xs text-slate-500 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" /> Limpiar
                        </button>
                    )}
                </div>

                {/* Tabla de joyas agregadas */}
                {detalles.length > 0 && (
                    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-dark-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-dark-surface-alt text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase">
                                    <th className="p-3 text-left">Joya</th>
                                    <th className="p-3 text-right">Kilates</th>
                                    <th className="p-3 text-right">Peso neto</th>
                                    <th className="p-3 text-right">Valor tasado</th>
                                    <th className="p-3 text-right">Máx. prestar</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalles.map(d => (
                                    <tr key={d.id} className={`border-t border-slate-100 dark:border-dark-border transition-colors ${editandoId === d.id ? 'bg-amber-50 dark:bg-amber-500/10' : ''}`}>
                                        <td className="p-3">
                                            <p className="font-bold text-slate-800 dark:text-dark-text">{d.tipo_joya?.descripcion} · {d.subtipo_joya?.descripcion}</p>
                                            <p className="text-xs text-slate-400 dark:text-dark-text-muted">{d.descripcion_detallada}</p>
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-600 dark:text-dark-text-muted">{d.kilates}K</td>
                                        <td className="p-3 text-right font-bold text-slate-600 dark:text-dark-text-muted">{fmt(d.peso_neto)} g</td>
                                        <td className="p-3 text-right font-black text-slate-800 dark:text-dark-text">S/ {fmt(d.valor_tasado)}</td>
                                        <td className="p-3 text-right font-black text-brand-gold">S/ {fmt(d.maximo_prestar)}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEditarDetalle(d)}
                                                    title="Editar joya"
                                                    className="p-1.5 text-slate-300 dark:text-dark-text-muted hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEliminarDetalle(d.id)}
                                                    title="Eliminar joya"
                                                    className="p-1.5 text-slate-300 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default TasacionForm;