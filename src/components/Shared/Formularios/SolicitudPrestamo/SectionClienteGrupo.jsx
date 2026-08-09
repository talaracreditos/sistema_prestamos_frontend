import React from 'react';
import ClienteSearchSelect from 'components/Shared/Comboboxes/ClienteSearchSelect';
import ProductoSearchSelect from 'components/Shared/Comboboxes/ProductoSearchSelect';
import GrupoSearchSelect from 'components/Shared/Comboboxes/GrupoSearchSelect';
import { UserIcon, UserGroupIcon, ShieldCheckIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SectionClienteGrupo = ({ 
    data, handleChange, isBlocked, isMainBlocked, isUpdate, 
    addIntegrante, removeIntegrante, updateMontoIntegrante, updateCargoIntegrante,
    toggleTasaIndividual, updateTasaIntegrante,
    tasaGlobal = '',
    idsOrigenRenovacion = [],
}) => {

    const isPresidenteTaken = (currentId) => data.integrantes.some(i => i.cargo === 'PRESIDENTE' && i.id !== currentId);
    const isSecretarioTaken = (currentId) => data.integrantes.some(i => i.cargo === 'SECRETARIO' && i.id !== currentId);
    
    let alertClass = 'bg-slate-50 dark:bg-dark-surface-alt border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted';
    let alertMessage = 'ESPERANDO SELECCIÓN...';
    let AlertIcon = ShieldCheckIcon;

    if (data.dni_status?.estado === 'VENCIDO') {
        alertClass = 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400';
        alertMessage = `BLOQUEADO: DNI VENCIDO (${data.dni_status.fecha_texto})`;
        AlertIcon = ExclamationTriangleIcon;
    } else if (isMainBlocked) {
        alertClass = 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400';
        alertMessage = data.modalidad; 
    } else if (data.modalidad) {
        alertClass = 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400';
        alertMessage = data.modalidad;
        if (data.dni_status?.estado === 'POR_VENCER') {
            alertClass = 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400';
            alertMessage = `${data.modalidad}`;
            AlertIcon = ExclamationTriangleIcon;
        }
    }

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
            <h3 className="text-sm font-black text-slate-700 dark:text-dark-text uppercase mb-4 flex items-center gap-2 transition-colors">
                {data.es_grupal ? <UserGroupIcon className="w-5 h-5 text-brand-gold-dark dark:text-brand-gold" /> : <UserIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />} 
                {data.es_grupal ? 'Configuración de Grupo' : 'Información del Cliente'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">{data.es_grupal ? 'Grupo *' : 'Cliente *'}</label>
                    {!data.es_grupal ? (
                        <ClienteSearchSelect 
                            onSelect={(c) => { 
                                handleChange('cliente_id', c?.usuario_id); 
                                handleChange('modalidad', c ? c.modalidad_cliente : ''); 
                                handleChange('fechaVencimientoDni', c ? c.fechaVencimientoDni : null); 
                                handleChange('dni_status', c ? c.dni_status : null);
                            }} 
                            initialName={data.cliente_nombre || data.cliente?.nombre_completo}
                            disabled={isUpdate} 
                        />
                    ) : (
                        <GrupoSearchSelect 
                            onSelect={(g) => handleChange('grupo_id', g?.id)} 
                            initialName={data.grupo_nombre} 
                            disabled={isUpdate || isBlocked}
                        />
                    )}
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Estado de Riesgo</label>
                    <div className={`p-2.5 rounded-lg border text-xs font-black flex items-center gap-2 h-[42px] transition-colors ${alertClass}`}>
                        <AlertIcon className="w-4 h-4" /> {alertMessage}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Producto Financiero *</label>
                    <ProductoSearchSelect onSelect={(p) => handleChange('producto_id', p?.id)} initialName={data.producto_nombre || data.producto?.nombre} disabled={isBlocked} />
                </div>
            </div>

            {/* TABLA DE INTEGRANTES */}
            {data.es_grupal && (
                <div className="mt-8 border-t border-slate-100 dark:border-dark-border pt-6 transition-colors">
                    <div className="flex justify-between items-end mb-4">
                        <div className="w-72">
                            <label className="block text-[10px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase mb-1 italic transition-colors">Añadir Socio al Grupo:</label>
                            <ClienteSearchSelect onSelect={addIntegrante} disabled={isBlocked} clearOnSelect={true} />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase transition-colors">Suma Total Grupo</p>
                            <p className="text-lg font-black text-brand-red dark:text-brand-gold transition-colors">S/ {data.integrantes.reduce((acc, i) => acc + parseFloat(i.monto || 0), 0).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="overflow-hidden border border-slate-100 dark:border-dark-border rounded-xl transition-colors">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-dark-surface-alt text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase transition-colors">
                                <tr>
                                    <th className="px-4 py-3">Socio / Modalidad</th>
                                    <th className="px-4 py-3 w-36">Cargo</th>
                                    <th className="px-4 py-3 w-36">Aporte (S/)</th>
                                    {/* Columna tasa individual */}
                                    <th className="px-4 py-3 w-48">
                                        <span className="flex items-center gap-1">
                                            Tasa %
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-dark-text-muted/60 normal-case">(vacío = global)</span>
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-dark-border transition-colors">
                                {data.integrantes.map((int) => {
                                    const esDeOrigen = idsOrigenRenovacion.includes(int.id);

                                    const tieneRiesgoGrupal = int.modalidad === 'RCS' ||
                                        int.modalidad === 'VIGENTE GRUPAL' ||
                                        (int.modalidad?.includes('VIGENTE') && int.modalidad?.includes('GRUPAL'));

                                    const tieneRiesgoIndividual = int.modalidad === 'VIGENTE INDIVIDUAL' ||
                                        (int.modalidad?.includes('VIGENTE') && !int.modalidad?.includes('GRUPAL'));

                                    const dniVencido    = int.dni_status?.estado === 'VENCIDO';
                                    const dniPorVencer  = int.dni_status?.estado === 'POR_VENCER';

                                    const isRed    = (tieneRiesgoGrupal && !esDeOrigen) || dniVencido;
                                    const isYellow = !isRed && (dniPorVencer || tieneRiesgoIndividual || (tieneRiesgoGrupal && esDeOrigen));
                                    
                                    return (
                                        <tr key={int.id} className={isRed ? 'bg-red-50/50 dark:bg-red-500/10' : (isYellow ? 'bg-yellow-50/50 dark:bg-yellow-500/10' : 'hover:bg-slate-50 dark:hover:bg-dark-surface-alt')}>
                                            {/* Socio */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold uppercase text-[11px] ${isRed ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-dark-text'}`}>{int.nombre}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-black border transition-colors ${
                                                        isRed    ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' : 
                                                        isYellow ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30' : 
                                                                   'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20'
                                                    }`}>
                                                        {dniVencido
                                                            ? `DNI VENCIDO (${int.dni_status.fecha_texto})` 
                                                            : int.modalidad}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Cargo */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={int.cargo || 'INTEGRANTE'}
                                                    onChange={(e) => updateCargoIntegrante(int.id, e.target.value)}
                                                    disabled={isBlocked && !isRed}
                                                    className="w-full p-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-xs font-bold text-slate-700 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none disabled:cursor-not-allowed uppercase transition-colors"
                                                >
                                                    <option value="PRESIDENTE" disabled={isPresidenteTaken(int.id)}>Presidente</option>
                                                    <option value="SECRETARIO" disabled={isSecretarioTaken(int.id)}>Secretario</option>
                                                    <option value="INTEGRANTE">Integrante</option>
                                                </select>
                                            </td>

                                            {/* Aporte */}
                                            <td className="px-4 py-3">
                                                <input 
                                                    disabled={isBlocked && !isRed} 
                                                    type="text" 
                                                    value={int.monto === 0 ? '' : int.monto} 
                                                    onChange={(e) => {
                                                        let val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                                        updateMontoIntegrante(int.id, val === '' ? 0 : val);
                                                    }} 
                                                    placeholder="0.00"
                                                    className="w-full p-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg text-xs font-black text-brand-red dark:text-brand-gold focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none disabled:cursor-not-allowed transition-colors" 
                                                />
                                            </td>

                                            {/* Tasa individual */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Checkbox para activar tasa propia */}
                                                    <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0" title="Activar tasa individual">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!int.usa_tasa_individual}
                                                            disabled={isBlocked && !isRed}
                                                            onChange={(e) => toggleTasaIndividual?.(int.id, e.target.checked)}
                                                            className="w-3.5 h-3.5 accent-brand-red dark:accent-brand-gold disabled:cursor-not-allowed"
                                                        />
                                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">
                                                            Propia
                                                        </span>
                                                    </label>

                                                    {/* Input tasa — habilitado solo si checkbox activo */}
                                                    <div className="relative flex-1">
                                                        <input
                                                            type="text"
                                                            disabled={(isBlocked && !isRed) || !int.usa_tasa_individual}
                                                            value={int.usa_tasa_individual ? (int.tasa_interes ?? '') : (tasaGlobal ?? '')}
                                                            onChange={(e) => {
                                                                let val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                                                updateTasaIntegrante?.(int.id, val);
                                                            }}
                                                            placeholder={tasaGlobal ? String(tasaGlobal) : '0.00'}
                                                            className={`w-full p-2 pr-6 border rounded-lg text-xs font-black outline-none transition-colors
                                                                ${int.usa_tasa_individual
                                                                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400'
                                                                    : 'bg-slate-50 dark:bg-dark-surface-alt border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted cursor-not-allowed'
                                                                }
                                                                disabled:cursor-not-allowed
                                                            `}
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 dark:text-dark-text-muted">%</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Eliminar */}
                                            <td className="px-4 py-3">
                                                <button type="button" onClick={() => removeIntegrante(int.id)} className="text-slate-400 dark:text-dark-text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.integrantes.length === 0 && (
                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400 dark:text-dark-text-muted/60 text-xs italic transition-colors">Busca y selecciona clientes para armar el grupo.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionClienteGrupo;