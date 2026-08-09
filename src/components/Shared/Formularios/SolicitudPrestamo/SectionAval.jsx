import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import peruData from 'utilities/data/peruData';

const SectionAval = ({ data, handleChange, isBlocked, config }) => (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-700 dark:text-dark-text uppercase flex items-center gap-2 transition-colors">
                <ShieldCheckIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Información de Garantía (Aval)
            </h3>
            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border transition-colors ${isBlocked ? 'cursor-not-allowed opacity-50 bg-slate-100 dark:bg-dark-surface-alt' : 'cursor-pointer bg-slate-50 dark:bg-dark-surface-alt'}`}>
                <input disabled={isBlocked} type="checkbox" checked={config.tieneAval} onChange={config.handleToggleAval} className="w-4 h-4 accent-brand-red dark:accent-brand-gold" />
                <span className="text-[10px] font-black text-slate-600 dark:text-dark-text uppercase transition-colors">¿Incluir Aval?</span>
            </label>
        </div>

        {config.tieneAval && data.aval ? (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">DNI *</label>
                        <input disabled={isBlocked} placeholder="Ej: 71228394" value={data.aval.dni_aval} onChange={e => config.handleAvalInputChange('dni_aval', e.target.value, 'numeric', 8)} className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Nombres *</label>
                        <input disabled={isBlocked} placeholder="Ej: Juan Alberto" value={data.aval.nombres_aval} onChange={e => config.handleAvalInputChange('nombres_aval', e.target.value, 'letters')} className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none uppercase disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Apellido Paterno *</label>
                        <input disabled={isBlocked} placeholder="Ej: Perez" value={data.aval.apellido_paterno_aval} onChange={e => config.handleAvalInputChange('apellido_paterno_aval', e.target.value, 'letters')} className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none uppercase disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Apellido Materno *</label>
                        <input disabled={isBlocked} placeholder="Ej: Rodriguez" value={data.aval.apellido_materno_aval} onChange={e => config.handleAvalInputChange('apellido_materno_aval', e.target.value, 'letters')} className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none uppercase disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-dark-border grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors">
                    <select disabled={isBlocked} value={data.aval.departamento_aval} onChange={e => { handleChange('aval.departamento_aval', e.target.value); handleChange('aval.provincia_aval', ''); handleChange('aval.distrito_aval', ''); }} className="p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-xs font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none uppercase disabled:cursor-not-allowed transition-colors">
                        <option value="">DEPARTAMENTO</option>
                        {Object.keys(peruData).map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                    <select disabled={isBlocked || !config.provincias.length} value={data.aval.provincia_aval} onChange={e => { handleChange('aval.provincia_aval', e.target.value); handleChange('aval.distrito_aval', ''); }} className="p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-xs font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none uppercase disabled:cursor-not-allowed transition-colors">
                        <option value="">PROVINCIA</option>
                        {config.provincias.map(prov => <option key={prov} value={prov}>{prov.replace(/_/g, ' ')}</option>)}
                    </select>
                    <select disabled={isBlocked || !config.distritos.length} value={data.aval.distrito_aval} onChange={e => handleChange('aval.distrito_aval', e.target.value)} className="p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-xs font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none uppercase disabled:cursor-not-allowed transition-colors">
                        <option value="">DISTRITO</option>
                        {config.distritos.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                    </select>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Celular *</label>
                        <input disabled={isBlocked} placeholder="Ej: 987654321" value={data.aval.telefono_movil_aval} onChange={e => config.handleAvalInputChange('telefono_movil_aval', e.target.value, 'numeric', 9)} className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Dirección Exacta *</label>
                        <input disabled={isBlocked} placeholder="Ej: Av. Grau 123" value={data.aval.direccion_aval} onChange={e => handleChange('aval.direccion_aval', e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none uppercase disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase mb-1 transition-colors">Vínculo con el cliente *</label>
                        <input disabled={isBlocked} placeholder="Ej: Hermano, Socio, Amigo" value={data.aval.relacion_cliente_aval} onChange={e => config.handleAvalInputChange('relacion_cliente_aval', e.target.value, 'letters')} className="w-full p-2.5 bg-slate-100 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-lg text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none italic disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors" />
                    </div>
                </div>
            </div>
        ) : (
            !isBlocked && (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-dark-border rounded-xl text-slate-300 dark:text-dark-text-muted/60 text-[10px] font-black uppercase italic transition-colors">
                    Sin aval asignado para esta solicitud
                </div>
            )
        )}
    </div>
);
export default SectionAval;