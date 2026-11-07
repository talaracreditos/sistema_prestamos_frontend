import React, { useEffect } from 'react';
import { ExclamationTriangleIcon, ScaleIcon, UserIcon } from '@heroicons/react/24/outline';

// Secciones reutilizadas del formulario de Solicitud Préstamo
import { useSolicitudForm } from '../SolicitudPrestamo/useSolicitudForm';
import SectionClienteGrupo  from '../SolicitudPrestamo/SectionClienteGrupo';
import SectionTasacion      from './SectionTasacion';
import SectionCondiciones   from '../SolicitudPrestamo/SectionCondiciones';
import SectionNotas         from '../SolicitudPrestamo/SectionNotas';

const noop = () => {};

const PrendarioForm = ({ data, handleChange, isUpdate = false, onBlockedChange = null }) => {
    const { bloqueado, isMainBlocked } = useSolicitudForm(data, handleChange);

    const tasacionFaltante = !data.tasacion_id;
    const bloqueaEnvio     = bloqueado || tasacionFaltante;

    useEffect(() => {
        onBlockedChange?.(bloqueaEnvio);
    }, [bloqueaEnvio, onBlockedChange]);

    return (
        <div className="space-y-6 transition-all duration-300">

            {/* ── Encabezado ── */}
            <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20 transition-colors">
                    <ScaleIcon className="w-4 h-4" /> Préstamo Prendario
                </span>
            </div>

            {isMainBlocked && (
                <div className="bg-brand-red text-white p-5 rounded-2xl flex items-center gap-4 shadow-xl border-2 border-brand-red-dark">
                    <ExclamationTriangleIcon className="w-10 h-10 flex-shrink-0" />
                    <div>
                        <p className="font-black uppercase text-sm">Operación bloqueada</p>
                        <p className="text-[10px] font-bold opacity-90">El DNI del cliente está VENCIDO.</p>
                    </div>
                </div>
            )}

            {/* ── Tasador responsable (usuario logueado) ── */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/25 p-5 flex items-center gap-3 transition-colors">
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                    <UserIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted tracking-widest">Tasador Responsable</h3>
                    <p className="text-sm font-black text-slate-800 dark:text-dark-text uppercase">
                        {isUpdate ? (data.tasador_nombre || '—') : 'Tú (usuario actual)'}
                    </p>
                </div>
            </div>

            {/* ── Cliente ── */}
            <SectionClienteGrupo
                data={data}
                handleChange={handleChange}
                isBlocked={bloqueado}
                isMainBlocked={isMainBlocked}
                isUpdate={isUpdate}
                esRenovacionActiva={false}
                addIntegrante={noop}
                removeIntegrante={noop}
                updateMontoIntegrante={noop}
                updateCargoIntegrante={noop}
                toggleTasaIndividual={noop}
                updateTasaIntegrante={noop}
                tasaGlobal={data.tasa_interes}
                idsOrigenRenovacion={[]}
            />

            {/* ── Tasación ── */}
            <SectionTasacion data={data} handleChange={handleChange} isBlocked={bloqueado} />
            {tasacionFaltante && (
                <p className="-mt-4 text-[9px] text-brand-red dark:text-brand-gold font-bold uppercase">
                    * Selecciona la tasación del cliente para continuar
                </p>
            )}

            {/* ── Condiciones (1 cuota mensual fija) ── */}
            <SectionCondiciones data={data} handleChange={handleChange} isBlocked={bloqueado} esPrendario={true} />

            <SectionNotas data={data} handleChange={handleChange} isBlocked={bloqueado} />
        </div>
    );
};

export default PrendarioForm;