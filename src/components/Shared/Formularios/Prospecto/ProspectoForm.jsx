import React from 'react';
import { UserIcon, BuildingOfficeIcon, PhoneIcon, CurrencyDollarIcon, DocumentTextIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { onlyNumbers, onlyLetters, toUpper } from 'utilities/Validations/validations';
import ZonaSearchSelect from 'components/Shared/Comboboxes/ZonaSearchSelect';
import CiiuSelect from 'components/Shared/Comboboxes/CiiuSearchSelect';
import peruData from 'utilities/data/peruData';

const ESTADOS_LABEL = {
    1: { label: 'Nuevo',         color: 'bg-slate-100 text-slate-700 border-slate-200' },
    2: { label: 'Contactado',    color: 'bg-brand-red-light text-brand-red border-brand-red/20' },
    3: { label: 'En Evaluación', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    4: { label: 'Aprobado',      color: 'bg-green-50 text-green-700 border-green-200' },
    5: { label: 'Rechazado',     color: 'bg-red-100 text-brand-red border-brand-red/30' },
    6: { label: 'Convertido',    color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const EstadoBadge = ({ estado }) => {
    const e = ESTADOS_LABEL[estado] || ESTADOS_LABEL[1];
    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${e.color}`}>
            {e.label}
        </span>
    );
};

const inputClass = "w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none";
const selectClass = "w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none";

const ProspectoForm = ({ data, onChange, isEditing = false }) => {
    const esEmpresa = Number(data.tipo) === 2;

    const provincias = data.departamento && peruData[data.departamento]
        ? Object.keys(peruData[data.departamento])
        : [];

    const distritos = data.departamento && data.provincia && peruData[data.departamento]?.[data.provincia]
        ? peruData[data.departamento][data.provincia]
        : [];

    return (
        <div className="space-y-8">

            {/* SECCIÓN 1: TIPO Y DATOS PERSONALES */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-700 uppercase mb-4 border-b pb-2 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-brand-red" /> Datos de Identificación
                </h4>

                {!isEditing && (
                    <div className="mb-6">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Tipo de Prospecto</label>
                        <div className="flex gap-3">
                            <button type="button"
                                onClick={() => onChange('tipo', 1)}
                                disabled={!!data.ruc}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all
                                    ${!esEmpresa ? 'bg-brand-red-light text-brand-red border-brand-red' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                                    ${!!data.ruc ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                <UserIcon className="w-4 h-4" /> Persona
                            </button>
                            <button type="button"
                                onClick={() => onChange('tipo', 2)}
                                disabled={!!data.dni}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all
                                    ${esEmpresa ? 'bg-yellow-50 text-yellow-700 border-yellow-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                                    ${!!data.dni ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                <BuildingOfficeIcon className="w-4 h-4" /> Empresa
                            </button>
                        </div>
                        {(data.dni || data.ruc) && (
                            <p className="text-[9px] text-slate-400 mt-1.5 italic">
                                * Tipo bloqueado según el documento ingresado ({data.dni ? 'DNI → Persona' : 'RUC → Empresa'})
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {!esEmpresa ? (
                        <>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">DNI *</label>
                                <input type="text" value={data.dni || ''} onChange={(e) => onChange('dni', onlyNumbers(e.target.value, 8))}
                                    className={inputClass} required readOnly={!isEditing && !!data.dni} />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                                    Vencimiento DNI {!data.no_caduca && '*'}
                                </label>
                                <input type="date" value={data.fechaVencimientoDni || ''}
                                    onChange={(e) => onChange('fechaVencimientoDni', e.target.value)}
                                    className={`${inputClass} ${data.no_caduca ? 'opacity-40 cursor-not-allowed bg-slate-100' : ''}`}
                                    required={!data.no_caduca}
                                    disabled={!!data.no_caduca} />
                                <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer select-none">
                                    <input type="checkbox" checked={!!data.no_caduca}
                                        onChange={(e) => {
                                            onChange('no_caduca', e.target.checked);
                                            if (e.target.checked) onChange('fechaVencimientoDni', '');
                                        }}
                                        className="w-3.5 h-3.5 accent-brand-red" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase">DNI no caduca (mayor de 60 años)</span>
                                </label>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nombres *</label>
                                <input type="text" value={data.nombre || ''} onChange={(e) => onChange('nombre', onlyLetters(e.target.value))}
                                    className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ap. Paterno *</label>
                                <input type="text" value={data.apellidoPaterno || ''} onChange={(e) => onChange('apellidoPaterno', onlyLetters(e.target.value))}
                                    className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ap. Materno *</label>
                                <input type="text" value={data.apellidoMaterno || ''} onChange={(e) => onChange('apellidoMaterno', onlyLetters(e.target.value))}
                                    className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">F. Nacimiento *</label>
                                <input type="date" value={data.fechaNacimiento || ''} onChange={(e) => onChange('fechaNacimiento', e.target.value)}
                                    className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sexo *</label>
                                <select value={data.sexo || ''} onChange={(e) => onChange('sexo', e.target.value)}
                                    className={selectClass} required>
                                    <option value="">-- Seleccionar --</option>
                                    <option value="MASCULINO">MASCULINO</option>
                                    <option value="FEMENINO">FEMENINO</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">RUC *</label>
                                <input type="text" value={data.ruc || ''} onChange={(e) => onChange('ruc', onlyNumbers(e.target.value, 11))}
                                    className={inputClass} required readOnly={!isEditing && !!data.ruc} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Razón Social *</label>
                                <input type="text" value={data.razon_social || ''} onChange={(e) => onChange('razon_social', toUpper(e.target.value))}
                                    className={inputClass} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nombre Comercial</label>
                                <input type="text" value={data.nombre_comercial || ''} onChange={(e) => onChange('nombre_comercial', toUpper(e.target.value))}
                                    className={inputClass} />
                            </div>
                        </>
                    )}
                    <div className="sm:col-span-2">
                        <CiiuSelect onSelect={(ciiu) => onChange('ciiu_id', ciiu ? ciiu.id : null)} initialCiiu={data.ciiu || null} />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: CONTACTO Y DIRECCIÓN */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-700 uppercase mb-4 border-b pb-2 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-brand-red" /> Contacto y Residencia
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                            <PhoneIcon className="w-3 h-3 inline mr-1" /> Celular *
                        </label>
                        <input type="text" value={data.telefono || ''} onChange={(e) => onChange('telefono', onlyNumbers(e.target.value, 9))}
                            className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Teléfono Fijo (Opcional)</label>
                        <input type="text" value={data.telefonoFijo || ''} onChange={(e) => onChange('telefonoFijo', onlyNumbers(e.target.value, 15))}
                            className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Correo Electrónico (Opcional)</label>
                        <input type="email" value={data.correo || ''} onChange={(e) => onChange('correo', toUpper(e.target.value))}
                            className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Dirección Fiscal *</label>
                        <input type="text" value={data.direccionFiscal || ''} onChange={(e) => onChange('direccionFiscal', toUpper(e.target.value))}
                            className={inputClass} required />
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Departamento *</label>
                            <select value={data.departamento || ''} onChange={(e) => onChange('departamento', e.target.value)}
                                className={selectClass} required>
                                <option value="">-- Seleccionar --</option>
                                {Object.keys(peruData).map((dep) => (
                                    <option key={dep} value={dep}>{dep}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Provincia *</label>
                            <select value={data.provincia || ''} onChange={(e) => onChange('provincia', e.target.value)}
                                disabled={!data.departamento}
                                className={`${selectClass} disabled:bg-slate-100 disabled:text-slate-400`} required>
                                <option value="">-- Seleccionar --</option>
                                {provincias.map((prov) => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Distrito *</label>
                            <select value={data.distrito || ''} onChange={(e) => onChange('distrito', e.target.value)}
                                disabled={!data.provincia}
                                className={`${selectClass} disabled:bg-slate-100 disabled:text-slate-400`} required>
                                <option value="">-- Seleccionar --</option>
                                {distritos.map((dist) => (
                                    <option key={dist} value={dist}>{dist}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:col-span-2">
                        <div className="flex-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tipo de Vivienda *</label>
                            <select value={data.tipoVivienda || ''} onChange={(e) => onChange('tipoVivienda', e.target.value)}
                                className={selectClass} required>
                                <option value="">-- Seleccionar --</option>
                                <option value="PROPIA">PROPIA</option>
                                <option value="ALQUILADA">ALQUILADA</option>
                                <option value="FAMILIAR">FAMILIAR</option>
                                <option value="HIPOTECADA">HIPOTECADA</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">T. Residencia *</label>
                            <input type="text" value={data.tiempoResidencia || ''} onChange={(e) => onChange('tiempoResidencia', toUpper(e.target.value))}
                                placeholder="EJ: 2 AÑOS" className={inputClass} required />
                        </div>
                    </div>
                    <div className="sm:col-span-2 mt-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Zona Operativa *</label>
                        <ZonaSearchSelect
                            initialName={data.zona_nombre || ''}
                            onSelect={(zona) => {
                                onChange('zona_id', zona ? zona.id : null);
                                onChange('zona_nombre', zona ? zona.nombre : '');
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: FINANCIERO */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-700 uppercase mb-4 border-b pb-2 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-green-600" /> Evaluación Financiera
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ingreso Estimado (S/) *</label>
                        <input type="text" value={data.ingreso_estimado || ''} onChange={(e) => onChange('ingreso_estimado', onlyNumbers(e.target.value))}
                            className="w-full p-3 text-sm text-green-700 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none"
                            placeholder="1500" required />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Monto Solicitado (S/) *</label>
                        <input type="text" value={data.monto_solicitado || ''} onChange={(e) => onChange('monto_solicitado', onlyNumbers(e.target.value))}
                            className="w-full p-3 text-sm text-green-700 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none"
                            placeholder="5000" required />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Propósito del Préstamo *</label>
                        <input type="text" value={data.proposito || ''} onChange={(e) => onChange('proposito', toUpper(e.target.value))}
                            className={inputClass} placeholder="EJ: CAPITAL DE TRABAJO..." required />
                    </div>
                    <div className="sm:col-span-2 mt-2">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                            <DocumentTextIcon className="w-3 h-3 inline mr-1" /> Observaciones del Asesor
                        </label>
                        <textarea value={data.observaciones || ''} onChange={(e) => onChange('observaciones', toUpper(e.target.value))}
                            className="w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none min-h-[80px]"
                            placeholder="ANOTE AQUÍ REFERENCIAS DE LA VISITA O DETALLES EXTRA..." />
                    </div>
                </div>
            </div>
        </div>
    );
};

export { ESTADOS_LABEL };
export default ProspectoForm;