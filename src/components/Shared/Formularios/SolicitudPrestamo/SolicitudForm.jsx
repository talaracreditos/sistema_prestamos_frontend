import React, { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSolicitudForm } from './useSolicitudForm';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';

import SectionRenovacion   from './SectionRenovacion';
import SectionClienteGrupo from './SectionClienteGrupo';
import SectionCondiciones  from './SectionCondiciones';
import SectionAval         from './SectionAval';
import SectionNotas        from './SectionNotas';

const SolicitudForm = ({
    data,
    handleChange,
    addIntegrante,
    removeIntegrante,
    updateMontoIntegrante,
    updateCargoIntegrante,
    isUpdate           = false,
    onBlockedChange    = null,   // ← Update lo usa para saber si puede guardar
    // props renovación — solo Store las pasa; Update las omite
    esRenovacion       = false,
    prestamoOrigen     = null,
    comboKey           = null,
    onToggleRenovacion = null,
    onSelectPrestamo   = null,
    onLimpiarOrigen    = null,
}) => {
    const prestamoOrigenEfectivo = prestamoOrigen ?? (
        data.prestamo_origen_id ? {
            id:          data.prestamo_origen_id,
            cliente:     data.cliente_nombre   ?? '',
            monto:       data.monto_solicitado ?? 0,
            es_grupal:   data.es_grupal,
            integrantes: data.integrantes?.map(i => ({
                id:              i.id,
                nombre:          i.nombre,
                puede_excluirse: i.puede_excluirse,
                saldo_pendiente: i.saldo_pendiente,
            })) ?? [],
        } : null
    );

    const esRenovacionEfectiva = esRenovacion || !!data.prestamo_origen_id;

    const {
        esRenovacionActiva,
        formBloqueadoPorRenovacion,
        descuento,
        bloqueado,
        isBlocked,
        isMainBlocked,
        hasBlockedIntegrante,
        avalConfig,
    } = useSolicitudForm(data, handleChange, {
        esRenovacion:       esRenovacionEfectiva,
        prestamoOrigen:     prestamoOrigenEfectivo,
        comboKey,
        onToggleRenovacion,
        onSelectPrestamo,
        onLimpiarOrigen,
    });

    // Notifica al padre (Update) cada vez que cambia isBlocked
    useEffect(() => {
        onBlockedChange?.(isBlocked);
    }, [isBlocked, onBlockedChange]);

    const mostrarSeccionRenovacion = onToggleRenovacion !== null || !!data.prestamo_origen_id;

    return (
        <div className={`space-y-6 transition-all duration-300 ${isBlocked ? 'opacity-90' : ''}`}>

            {/* ── Sección renovación (al tope) ── */}
            {mostrarSeccionRenovacion && (
                <SectionRenovacion
                    esRenovacion={esRenovacionEfectiva}
                    prestamoOrigen={prestamoOrigenEfectivo}
                    comboKey={comboKey}
                    descuento={descuento}
                    onToggleRenovacion={onToggleRenovacion}
                    onSelectPrestamo={onSelectPrestamo}
                    onLimpiarOrigen={onLimpiarOrigen}
                    soloLectura={!onToggleRenovacion}
                />
            )}

            {/* ── Si marcó renovación pero no eligió préstamo: ocultar el resto ── */}
            {formBloqueadoPorRenovacion ? (
                <div className="py-16 text-center border-2 border-dashed border-brand-gold/30 rounded-2xl bg-brand-gold-light/10">
                    <p className="text-[11px] font-black text-brand-gold-dark uppercase tracking-widest">
                        ↑ Selecciona el préstamo a renovar para continuar
                    </p>
                </div>
            ) : (
                <>
                    {/* ── Banner bloqueo riesgo — NO sale en renovación activa ── */}
                    {isBlocked && (
                        <div className="bg-brand-red text-white p-5 rounded-2xl flex items-center gap-4 animate-bounce shadow-xl border-2 border-brand-red-dark">
                            <ExclamationTriangleIcon className="w-10 h-10 flex-shrink-0" />
                            <div>
                                <p className="font-black uppercase text-sm">Operación Bloqueada por Riesgo Crediticio</p>
                                <p className="text-[10px] font-bold opacity-90">
                                    {hasBlockedIntegrante
                                        ? 'Uno o más integrantes del grupo tienen una restricción activa o deuda vigente (RCS / VIGENTE).'
                                        : data.dni_status?.estado === 'VENCIDO'
                                            ? 'El DNI del cliente principal está VENCIDO.'
                                            : `El cliente principal tiene modalidad: ${data.modalidad}. No puede tener más de un préstamo GRUPAL simultáneo.`
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Switch individual/grupal ── */}
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit mx-auto border border-slate-200 shadow-inner">
                        <button
                            type="button"
                            onClick={() => !isUpdate && !bloqueado && handleChange('es_grupal', false)}
                            disabled={isUpdate || esRenovacionActiva || bloqueado}
                            className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                !data.es_grupal ? 'bg-white text-brand-red shadow-sm ring-1 ring-brand-red/20' : 'text-slate-400 hover:text-slate-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Individual
                        </button>
                        <button
                            type="button"
                            onClick={() => !isUpdate && !bloqueado && handleChange('es_grupal', true)}
                            disabled={isUpdate || esRenovacionActiva || bloqueado}
                            className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                data.es_grupal ? 'bg-white text-brand-red shadow-sm ring-1 ring-brand-red/20' : 'text-slate-400 hover:text-slate-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Grupal
                        </button>
                    </div>

                    {/* ── Asesor ── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asesor Responsable</h3>
                        <EmpleadoSearchSelect
                            rol="asesor"
                            disabled={bloqueado}
                            initialName={data.asesor_nombre || ''}
                            onSelect={(asesor) => {
                                handleChange('asesor_id',     asesor?.id              ?? '');
                                handleChange('asesor_nombre', asesor?.nombre_completo ?? '');
                            }}
                        />
                        {!data.asesor_id && (
                            <p className="text-[9px] text-brand-red font-bold uppercase">* Selecciona un asesor para continuar</p>
                        )}
                    </div>

                    {/* ── Secciones ── */}
                    <SectionClienteGrupo
                        data={data}
                        handleChange={handleChange}
                        isBlocked={bloqueado}
                        isMainBlocked={isMainBlocked}
                        isUpdate={isUpdate || esRenovacionActiva}
                        addIntegrante={addIntegrante}
                        removeIntegrante={removeIntegrante}
                        updateMontoIntegrante={updateMontoIntegrante}
                        updateCargoIntegrante={updateCargoIntegrante}
                        idsOrigenRenovacion={prestamoOrigenEfectivo?.integrantes?.map(i => i.id) ?? []}
                    />

                    <SectionCondiciones
                        data={data}
                        handleChange={handleChange}
                        isBlocked={bloqueado}
                    />

                    <SectionAval
                        data={data}
                        handleChange={handleChange}
                        isBlocked={bloqueado}
                        config={avalConfig}
                    />

                    <SectionNotas
                        data={data}
                        handleChange={handleChange}
                        isBlocked={bloqueado}
                    />
                </>
            )}
        </div>
    );
};

export default SolicitudForm;