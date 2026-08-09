import React, { useMemo } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';
import peruData from 'utilities/data/peruData';
import ZonaSearchSelect from 'components/Shared/Comboboxes/ZonaSearchSelect';

const DireccionForm = ({ data, handleNestedChange }) => {
    const d  = data.direccion;
    const dc = data.datos_cliente;

    const onD = (field, value) => handleNestedChange('direccion', field, value);

    const handleDepartamentoChange = (e) => {
        onD('departamento', e.target.value);
        onD('provincia', '');
        onD('distrito', '');
    };

    const handleProvinciaChange = (e) => {
        onD('provincia', e.target.value);
        onD('distrito', '');
    };

    const departamentos = useMemo(() => Object.keys(peruData).sort(), []);

    const provincias = useMemo(() => {
        if (!d.departamento || !peruData[d.departamento]) return [];
        return Object.keys(peruData[d.departamento]).sort();
    }, [d.departamento]);

    const distritos = useMemo(() => {
        if (!d.departamento || !d.provincia || !peruData[d.departamento][d.provincia]) return [];
        return [...peruData[d.departamento][d.provincia]].sort();
    }, [d.departamento, d.provincia]);

    const inputClass = "w-full p-3 text-sm text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-colors";

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border flex flex-col h-full transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-5 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <MapPinIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Dirección y Zona
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Dirección Fiscal / Domicilio *</label>
                    <input
                        type="text"
                        value={d.direccionFiscal || ''}
                        onChange={(e) => onD('direccionFiscal', toUpper(e.target.value))}
                        className={inputClass}
                        placeholder="EJ: AV. LOS INCAS 123"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Departamento *</label>
                    <select
                        value={d.departamento || ''}
                        onChange={handleDepartamentoChange}
                        className={`${inputClass} cursor-pointer`}
                        required
                    >
                        <option value="">-- Seleccione --</option>
                        {departamentos.map(depto => (
                            <option key={depto} value={depto}>{depto.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Provincia *</label>
                    <select
                        value={d.provincia || ''}
                        onChange={handleProvinciaChange}
                        disabled={!d.departamento}
                        className={`${inputClass} disabled:bg-slate-100 dark:disabled:bg-dark-surface-alt disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 disabled:cursor-not-allowed cursor-pointer`}
                        required
                    >
                        <option value="">-- Seleccione --</option>
                        {provincias.map(prov => (
                            <option key={prov} value={prov}>{prov.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Distrito *</label>
                    <select
                        value={d.distrito || ''}
                        onChange={(e) => onD('distrito', e.target.value)}
                        disabled={!d.provincia}
                        className={`${inputClass} disabled:bg-slate-100 dark:disabled:bg-dark-surface-alt disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 disabled:cursor-not-allowed cursor-pointer`}
                        required
                    >
                        <option value="">-- Seleccione --</option>
                        {distritos.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">T. Residencia *</label>
                    <input
                        type="text"
                        value={d.tiempoResidencia || ''}
                        onChange={(e) => onD('tiempoResidencia', toUpper(e.target.value))}
                        className={inputClass}
                        placeholder="EJ: 2 AÑOS"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Tipo de Vivienda *</label>
                    <select
                        value={d.tipoVivienda || ''}
                        onChange={(e) => onD('tipoVivienda', e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                        required
                    >
                        <option value="">-- Seleccione --</option>
                        <option value="PROPIA">PROPIA</option>
                        <option value="ALQUILADA">ALQUILADA</option>
                        <option value="FAMILIAR">FAMILIAR</option>
                        <option value="HIPOTECADA">HIPOTECADA</option>
                    </select>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-dark-border mt-2 transition-colors">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-1 transition-colors">Zona Operativa Comercial *</label>
                    <ZonaSearchSelect
                        initialName={dc.zona_nombre || ''}
                        onSelect={(zona) => handleNestedChange('datos_cliente', 'zona_id', zona ? zona.id : null)}
                    />
                </div>
            </div>
        </div>
    );
};

export default DireccionForm;