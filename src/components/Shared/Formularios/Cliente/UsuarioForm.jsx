import React, { useState } from 'react';
import { UserIcon, KeyIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const UsuarioForm = ({ form, handleNestedChange, isEditing = false }) => {
    const [showPass,    setShowPass]    = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const esEmpresa = Number(form.datos_cliente?.tipo) === 2;
    const editable  = isEditing || esEmpresa;   // empresa siempre lo escribe a mano

    const username = form.usuario.username || '';
    const usernameCorto = esEmpresa && username.length > 0 && username.length < 3;

    const pass    = form.usuario.password || '';
    const confirm = form.usuario.password_confirmation || '';
    const noCoinciden = pass && confirm && pass !== confirm;

    return (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm dark:shadow-black/25 border border-slate-200 dark:border-dark-border mt-6 transition-colors">
            <h3 className="text-lg font-black text-slate-800 dark:text-dark-text flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-dark-border pb-2 uppercase transition-colors">
                <UserIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" /> Credenciales y Acceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase mb-1 transition-colors">
                        Nombre de Usuario *
                        {!isEditing && !esEmpresa && (
                            <span className="ml-2 text-[10px] font-normal text-slate-400 dark:text-dark-text-muted normal-case">
                                (generado automáticamente)
                            </span>
                        )}
                        {esEmpresa && (
                            <span className="ml-2 text-[10px] font-normal text-brand-gold-dark dark:text-brand-gold normal-case">
                                (ingreso manual obligatorio)
                            </span>
                        )}
                    </label>
                    <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-dark-text-muted"/>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => editable && handleNestedChange(
                                'usuario',
                                'username',
                                e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                            )}
                            readOnly={!editable}
                            maxLength={20}
                            className={`w-full pl-9 p-2.5 text-sm border rounded-xl outline-none transition-all ${
                                editable
                                    ? usernameCorto
                                        ? 'text-slate-800 dark:text-dark-text border-brand-red focus:ring-2 focus:ring-brand-red bg-brand-red-light dark:bg-red-500/20'
                                        : 'text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface border-slate-300 dark:border-dark-border focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold'
                                    : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted cursor-not-allowed'
                            }`}
                            placeholder={esEmpresa ? 'Ej: TALARACRED' : 'Se genera con nombre y apellidos'}
                            required
                        />
                    </div>

                    {/* Mensaje / validación para empresa */}
                    {esEmpresa && (
                        usernameCorto ? (
                            <p className="text-[10px] text-brand-red dark:text-red-400 mt-1 font-bold animate-pulse">
                                ⚠ El nombre de usuario debe tener al menos 3 caracteres.
                            </p>
                        ) : (
                            <div className="mt-2 p-2.5 bg-brand-gold-light dark:bg-brand-gold/10 border border-brand-gold/30 dark:border-brand-gold/20 rounded-xl flex items-start gap-2 transition-colors">
                                <BuildingOfficeIcon className="w-4 h-4 text-brand-gold-dark dark:text-brand-gold flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] font-bold text-brand-gold-dark dark:text-brand-gold">
                                    Al ser una <span className="font-black">empresa</span>, el nombre de usuario no se genera
                                    automáticamente. Ingréselo manualmente (es obligatorio).
                                </p>
                            </div>
                        )
                    )}
                </div>

                {/* Password — solo en update */}
                {isEditing && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase mb-1 transition-colors">
                                Nueva Contraseña
                                <span className="text-xs text-slate-400 dark:text-dark-text-muted font-normal normal-case ml-1">(Opcional)</span>
                            </label>
                            <div className="relative">
                                <KeyIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-dark-text-muted"/>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={pass}
                                    onChange={(e) => handleNestedChange('usuario', 'password', e.target.value)}
                                    className="w-full pl-9 pr-10 p-2.5 text-sm text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-colors"
                                    placeholder="Dejar vacío para mantener"
                                    minLength={8}
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-2.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold transition-colors">
                                    {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-dark-text uppercase mb-1 transition-colors">
                                Confirmar Contraseña
                                <span className="text-xs text-slate-400 dark:text-dark-text-muted font-normal normal-case ml-1">(Opcional)</span>
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-dark-text-muted"/>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={(e) => handleNestedChange('usuario', 'password_confirmation', e.target.value)}
                                    className={`w-full pl-9 pr-10 p-2.5 text-sm text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface border rounded-xl outline-none focus:ring-2 transition-colors ${
                                        noCoinciden
                                            ? 'border-brand-red focus:ring-brand-red bg-brand-red-light dark:bg-red-500/20'
                                            : confirm && !noCoinciden
                                                ? 'border-green-400 focus:ring-green-400 bg-green-50 dark:bg-green-500/20'
                                                : 'border-slate-300 dark:border-dark-border focus:ring-brand-red dark:focus:ring-brand-gold'
                                    }`}
                                    placeholder="Repita la contraseña"
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3 top-2.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold transition-colors">
                                    {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            {noCoinciden && (
                                <p className="text-[10px] text-brand-red dark:text-red-400 mt-1 font-bold animate-pulse">⚠ Las contraseñas no coinciden.</p>
                            )}
                            {confirm && !noCoinciden && pass && (
                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 font-bold">✓ Las contraseñas coinciden.</p>
                            )}
                        </div>
                    </>
                )}

                {/* Info en store */}
                {!isEditing && (
                    <div className="md:col-span-2 p-3 bg-brand-gold-light dark:bg-brand-gold/10 border border-brand-gold/30 dark:border-brand-gold/20 rounded-xl transition-colors">
                        <p className="text-[11px] font-bold text-brand-gold-dark dark:text-brand-gold">
                            La contraseña inicial será el <span className="font-black">DNI</span> del cliente (o RUC si es empresa).
                            Se le enviará un correo de bienvenida con sus datos de acceso para que pueda cambiar la contraseña.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};
 
export default UsuarioForm;