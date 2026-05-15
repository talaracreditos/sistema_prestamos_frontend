import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSolicitudForm } from './useSolicitudForm';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';

import SectionClienteGrupo  from './SectionClienteGrupo';
import SectionCondiciones   from './SectionCondiciones';
import SectionAval          from './SectionAval';
import SectionNotas         from './SectionNotas';

const SolicitudForm = ({ 
    data, 
    handleChange, 
    addIntegrante, 
    removeIntegrante, 
    updateMontoIntegrante,
    updateCargoIntegrante,
    isUpdate = false 
}) => {
    const { isBlocked, isMainBlocked, hasBlockedIntegrante, avalConfig } = useSolicitudForm(data, handleChange);

    return (
        <div className={`space-y-6 transition-all duration-300 ${isBlocked ? 'opacity-90' : ''}`}>

            {/* ALERTA DE BLOQUEO GLOBAL */}
            {isBlocked && (
                <div className="bg-brand-red text-white p-5 rounded-2xl flex items-center gap-4 animate-bounce shadow-xl border-2 border-brand-red-dark">
                    <ExclamationTriangleIcon className="w-10 h-10 flex-shrink-0" />
                    <div>
                        <p className="font-black uppercase text-sm">Operación Bloqueada por Riesgo Crediticio</p>
                        <p className="text-[10px] font-bold opacity-90 text-white">
                            {hasBlockedIntegrante 
                                ? 'Uno o más integrantes del grupo tienen una restricción activa o deuda vigente (RCS / VIGENTE).' 
                                : (data.dni_status?.estado === 'VENCIDO' 
                                    ? 'El DNI del cliente principal está VENCIDO.'
                                    : `El cliente principal tiene modalidad: ${data.modalidad}. No puede tener más de un préstamo GRUPAL simultáneo.`)
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* SWITCH INDIVIDUAL / GRUPAL */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200 shadow-inner">
                <button 
                    type="button" 
                    onClick={() => !isUpdate && !isBlocked && handleChange('es_grupal', false)} 
                    disabled={isUpdate || (isBlocked && data.dni_status?.estado === 'VENCIDO')} 
                    className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${!data.es_grupal ? 'bg-white text-brand-red shadow-sm ring-1 ring-brand-red/20' : 'text-slate-400 hover:text-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Individual
                </button>
                <button 
                    type="button" 
                    onClick={() => !isUpdate && !isBlocked && handleChange('es_grupal', true)} 
                    disabled={isUpdate || isBlocked} 
                    className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${data.es_grupal ? 'bg-white text-brand-red shadow-sm ring-1 ring-brand-red/20' : 'text-slate-400 hover:text-slate-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Grupal
                </button>
            </div>

            {/* SELECTOR DE ASESOR */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Asesor Responsable
                </h3>
                <EmpleadoSearchSelect
                    rol="asesor"
                    disabled={isBlocked}
                    initialName={data.asesor_nombre || ''}
                    onSelect={(asesor) => {
                        handleChange('asesor_id',     asesor?.id             ?? '');
                        handleChange('asesor_nombre', asesor?.nombre_completo ?? '');
                    }}
                />
                {!data.asesor_id && (
                    <p className="text-[9px] text-brand-red font-bold uppercase">
                        * Selecciona un asesor para continuar
                    </p>
                )}
            </div>

            {/* SECCIONES MODULARES */}
            <SectionClienteGrupo 
                data={data} 
                handleChange={handleChange} 
                isBlocked={isBlocked} 
                isMainBlocked={isMainBlocked} 
                isUpdate={isUpdate} 
                addIntegrante={addIntegrante} 
                removeIntegrante={removeIntegrante} 
                updateMontoIntegrante={updateMontoIntegrante}
                updateCargoIntegrante={updateCargoIntegrante}
            />

            <SectionCondiciones 
                data={data} 
                handleChange={handleChange} 
                isBlocked={isBlocked} 
            />

            <SectionAval 
                data={data} 
                handleChange={handleChange} 
                isBlocked={isBlocked} 
                config={avalConfig} 
            />

            <SectionNotas 
                data={data} 
                handleChange={handleChange} 
                isBlocked={isBlocked} 
            />

        </div>
    );
};

export default SolicitudForm;