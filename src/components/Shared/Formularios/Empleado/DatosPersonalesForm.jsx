import React from 'react';
import { IdentificationIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { onlyLetters, onlyNumbers } from 'utilities/Validations/validations';

const DatosPersonalesForm = ({ data, handleNestedChange }) => {
    const valores = data.datos_empleado;

    const onChange = (field, value) => handleNestedChange('datos_empleado', field, value);

    const inputClass = "w-full p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none placeholder-slate-400 dark:placeholder-dark-text-muted/60 transition-all";

    return (
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 dark:border-dark-border pb-3 transition-colors">
                <IdentificationIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" /> Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* DNI: Solo 8 números */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        DNI <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.dni || ''}
                        onChange={(e) => onChange('dni', onlyNumbers(e.target.value, 8))}
                        className={inputClass}
                        placeholder="8 dígitos"
                    />
                </div>

                {/* Fecha Nacimiento */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Fecha Nacimiento <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <input
                        type="date"
                        value={valores.fechaNacimiento || ''}
                        onChange={(e) => onChange('fechaNacimiento', e.target.value)}
                        className={`${inputClass} uppercase`}
                    />
                </div>

                {/* Sexo */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Sexo <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <select
                        value={valores.sexo || ''}
                        onChange={(e) => onChange('sexo', e.target.value)}
                        className={`${inputClass} cursor-pointer uppercase`}
                    >
                        <option value="">-- Seleccionar --</option>
                        <option value="MASCULINO">MASCULINO</option>
                        <option value="FEMENINO">FEMENINO</option>
                    </select>
                </div>

                {/* Nombres: Solo letras */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Nombres <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.nombre || ''}
                        onChange={(e) => onChange('nombre', onlyLetters(e.target.value))}
                        className={`${inputClass} uppercase`}
                        placeholder="Nombres completos"
                    />
                </div>

                {/* Apellido Paterno: Solo letras */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Apellido Paterno <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.apellidoPaterno || ''}
                        onChange={(e) => onChange('apellidoPaterno', onlyLetters(e.target.value))}
                        className={`${inputClass} uppercase`}
                        placeholder="Paterno"
                    />
                </div>

                {/* Apellido Materno: Solo letras */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Apellido Materno <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.apellidoMaterno || ''}
                        onChange={(e) => onChange('apellidoMaterno', onlyLetters(e.target.value))}
                        className={`${inputClass} uppercase`}
                        placeholder="Materno"
                    />
                </div>

                {/* Teléfono: Solo 9 números */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Teléfono <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <div className="relative">
                        <PhoneIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors"/>
                        <input
                            type="text"
                            value={valores.telefono || ''}
                            onChange={(e) => onChange('telefono', onlyNumbers(e.target.value, 9))}
                            className={`${inputClass} pl-10`}
                            placeholder="999888777"
                        />
                    </div>
                </div>

                {/* Estado Civil */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Estado Civil <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <select
                        value={valores.estadoCivil || ''}
                        onChange={(e) => onChange('estadoCivil', e.target.value)}
                        className={`${inputClass} cursor-pointer uppercase`}
                    >
                        <option value="">-- Seleccionar --</option>
                        <option value="Soltero">Soltero(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viudo">Viudo(a)</option>
                        <option value="Conviviente">Conviviente</option>
                    </select>
                </div>

                {/* Dirección */}
                <div className="md:col-span-12">
                    <label className="block text-xs font-bold text-slate-500 dark:text-dark-text-muted uppercase mb-2 transition-colors">
                        Dirección <span className="text-brand-red dark:text-brand-gold">*</span>
                    </label>
                    <div className="relative">
                        <MapPinIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 dark:text-dark-text-muted transition-colors"/>
                        <input
                            type="text"
                            value={valores.direccion || ''}
                            onChange={(e) => onChange('direccion', e.target.value)}
                            className={`${inputClass} pl-10 uppercase`}
                            placeholder="Calle, Número, Distrito..."
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DatosPersonalesForm;