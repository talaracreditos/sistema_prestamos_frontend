import React, { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSolicitudForm } from './useSolicitudForm';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';

import SectionRenovacion   from './SectionRenovacion';
import SectionClienteGrupo from './SectionClienteGrupo';
import SectionTasacion     from './SectionTasacion';
import SectionCondiciones  from './SectionCondiciones';
import SectionAval         from './SectionAval';
import SectionNotas        from './SectionNotas';

const TIPOS = [
    { key: 'individual', label: 'Individual', es_grupal: false, es_prendario: false },
    { key: 'grupal',     label: 'Grupal',      es_grupal: true,  es_prendario: false },
    { key: 'prendario',  label: 'Prendario',   es_grupal: false, es_prendario: true  },
];

const SolicitudForm = ({
    data,
    handleChange,
    addIntegrante,
    removeIntegrante,
    updateMontoIntegrante,
    updateCargoIntegrante,
    toggleTasaIndividual,
    updateTasaIntegrante,
    isUpdate           = false,
    onBlockedChange    = null,
    esRenovacion       = false,
    prestamoOrigen     = null,
    comboKey           = null,
    onToggleRenovacion = null,
    onSelectPrestamo   = null,
    onLimpiarOrigen    = null,
}) => {
    const prestamoOrigenEfectivo = prestamoOrigen ?? (
        data.prestamo_origen_id ? {
            id:         data.prestamo_origen_id,
            cliente:    data.cliente_nombre    ?? '',
            monto:      data.monto_solicitado ?? 0,
            es_grupal: data.es_grupal,
            integrantes: data.integrantes
                ?.filter(i => i.puede_excluirse === false)
                .map(i => ({
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
        cuotasPrendarioInvalidas,
        tasacionFaltante,
        avalConfig,
    } = useSolicitudForm(data, handleChange, {
        esRenovacion:        esRenovacionEfectiva,
        prestamoOrigen:      prestamoOrigenEfectivo,
        comboKey,
        onToggleRenovacion,
        onSelectPrestamo,
        onLimpiarOrigen,
    });

    // El submit se bloquea por riesgo/DNI (isBlocked) o por datos incompletos de prendario
    const bloqueaEnvio = isBlocked || cuotasPrendarioInvalidas || tasacionFaltante;

    useEffect(() => {
        onBlockedChange?.(bloqueaEnvio);
    }, [bloqueaEnvio, onBlockedChange]);

    const mostrarSeccionRenovacion = onToggleRenovacion !== null || !!data.prestamo_origen_id;

    const tipoActivo = data.es_prendario ? 'prendario' : (data.es_grupal ? 'grupal' : 'individual');

    return (
        <div className={`space-y-6 transition-all duration-300 ${isBlocked ? 'opacity-90' : ''}`}>

            {/* ── Sección renovación ── */}
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

            {formBloqueadoPorRenovacion ? (
                <div className="py-16 text-center border-2 border-dashed border-brand-gold/30 rounded-2xl bg-brand-gold-light/10 dark:bg-brand-gold/5 transition-colors">
                    <p className="text-[11px] font-black text-brand-gold-dark dark:text-brand-gold uppercase tracking-widest">
                        ↑ Selecciona el préstamo a renovar para continuar
                    </p>
                </div>
            ) : (
                <>
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

                    {/* ── Switch Individual / Grupal / Prendario ── */}
                    <div className="flex bg-slate-100 dark:bg-dark-surface-alt p-1 rounded-xl w-fit mx-auto border border-slate-200 dark:border-dark-border shadow-inner transition-colors">
                        {TIPOS.map(opt => {
                            const activo = tipoActivo === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => {
                                        if (isUpdate || esRenovacionActiva || bloqueado) return;
                                        handleChange('es_grupal', opt.es_grupal);
                                        handleChange('es_prendario', opt.es_prendario);
                                    }}
                                    disabled={isUpdate || esRenovacionActiva || bloqueado}
                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                        activo
                                            ? 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold shadow-sm ring-1 ring-brand-red/20 dark:ring-brand-gold/20'
                                            : 'text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Asesor ── */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/25 p-5 space-y-3 transition-colors">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted tracking-widest">Asesor Responsable</h3>
                        <EmpleadoSearchSelect
                            rol="asesor"
                            disabled={bloqueado}
                            initialName={data.asesor_nombre || ''}
                            onSelect={(asesor) => {
                                handleChange('asesor_id',     asesor?.id            ?? '');
                                handleChange('asesor_nombre', asesor?.nombre_completo ?? '');
                            }}
                        />
                        {!data.asesor_id && (
                            <p className="text-[9px] text-brand-red dark:text-brand-gold font-bold uppercase">* Selecciona un asesor para continuar</p>
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
                        toggleTasaIndividual={toggleTasaIndividual}
                        updateTasaIntegrante={updateTasaIntegrante}
                        tasaGlobal={data.tasa_interes}
                        idsOrigenRenovacion={prestamoOrigenEfectivo?.integrantes?.map(i => i.id) ?? []}
                    />

                    {data.es_prendario && (
                        <SectionTasacion
                            data={data}
                            handleChange={handleChange}
                            isBlocked={bloqueado}
                        />
                    )}

                    <SectionCondiciones
                        data={data}
                        handleChange={handleChange}
                        isBlocked={bloqueado}
                        esPrendario={data.es_prendario}
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