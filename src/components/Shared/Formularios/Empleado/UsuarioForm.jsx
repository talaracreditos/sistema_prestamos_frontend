import React from 'react';
import { UserIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';
import RolSearchSelect from 'components/Shared/Comboboxes/RolSearchSelect';

const UsuarioForm = ({ form, setForm, handleNestedChange, isEditing = false }) => {
    const pass    = form.usuario.password || '';
    const confirm = form.usuario.password_confirmation || '';
    const noCoinciden = pass && confirm && pass !== confirm;

    const inputClass = "w-full pl-10 p-3.5 text-sm font-bold text-slate-800 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none transition-all";

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 mt-6">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-6 uppercase tracking-wide border-b border-slate-100 pb-3">
                <UserIcon className="w-6 h-6 text-brand-red" /> Credenciales y Acceso
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Nombre de Usuario <span className="text-brand-red">*</span>
                    </label>
                    <div className="relative">
                        <UserIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400"/>
                        <input
                            type="text"
                            value={form.usuario.username || ''}
                            onChange={(e) => handleNestedChange('usuario', 'username', toUpper(e.target.value))}
                            className={inputClass}
                            placeholder="EJ: JPEREZ"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Contraseña {isEditing
                            ? <span className="text-[9px] text-slate-400 font-bold ml-1">(Opcional al editar)</span>
                            : <span className="text-brand-red">*</span>}
                    </label>
                    <div className="relative">
                        <KeyIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400"/>
                        <input
                            type="password"
                            value={form.usuario.password || ''}
                            onChange={(e) => handleNestedChange('usuario', 'password', e.target.value)}
                            className={inputClass}
                            placeholder={isEditing ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
                            required={!isEditing}
                            minLength={6}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Confirmar Contraseña {isEditing
                            ? <span className="text-[9px] text-slate-400 font-bold ml-1">(Opcional)</span>
                            : <span className="text-brand-red">*</span>}
                    </label>
                    <div className="relative">
                        <LockClosedIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400"/>
                        <input
                            type="password"
                            value={form.usuario.password_confirmation || ''}
                            onChange={(e) => handleNestedChange('usuario', 'password_confirmation', e.target.value)}
                            className={`w-full pl-10 p-3.5 text-sm font-bold border rounded-xl outline-none transition-all ${
                                noCoinciden 
                                    ? 'border-brand-red focus:ring-brand-red focus:border-brand-red text-brand-red bg-brand-red-light/50' 
                                    : 'border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-brand-red focus:border-brand-red'
                            }`}
                            placeholder="Repita la contraseña"
                            required={!isEditing}
                        />
                    </div>
                    {noCoinciden && (
                        <p className="text-[10px] text-brand-red mt-2 font-bold animate-pulse">⚠ Las contraseñas no coinciden.</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <RolSearchSelect
                        form={form}
                        setForm={setForm}
                    />
                </div>
            </div>
        </div>
    );
};

export default UsuarioForm;