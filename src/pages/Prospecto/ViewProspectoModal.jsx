import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import SeguimientoModal from './SeguimientoModal';
import StatusModal from './StatusModal';
import { EstadoBadge } from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import {
    UserIcon, ClockIcon,
    ArrowPathIcon, PencilSquareIcon, ArrowRightIcon,
    CheckCircleIcon, IdentificationIcon,
    PhoneIcon, BuildingOfficeIcon,
    ChartBarIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

/* ─── FILA DE DATO ────────────────────────────────────────── */
const DataRow = ({ label, value, highlight = false }) => (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 dark:border-dark-border last:border-0 transition-colors">
        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest pt-0.5 w-2/5 flex-shrink-0">
            {label}
        </span>
        <span className={`text-[11px] font-bold text-right w-3/5 leading-snug ${highlight ? 'text-red-900 dark:text-red-400 font-black' : 'text-slate-700 dark:text-dark-text'}`}>
            {value || <span className="text-slate-300 dark:text-dark-text-muted/60">—</span>}
        </span>
    </div>
);

/* ─── CARD SECCIÓN ────────────────────────────────────────── */
const Card = ({ icon: Icon, title, accentColor = 'text-slate-400', badge, children }) => (
    <div className="bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm dark:shadow-black/25 transition-colors">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-50 dark:border-dark-border transition-colors">
            <div className={`flex items-center gap-2 ${accentColor}`}>
                <div className="p-1.5 bg-slate-50 dark:bg-dark-surface-alt rounded-lg transition-colors">
                    <Icon className="w-3 h-3" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{title}</span>
            </div>
            {badge}
        </div>
        <div className="px-4 pb-3 pt-1">
            {children}
        </div>
    </div>
);

/* ─── MÉTRICA ─────────────────────────────────────────────── */
const Metric = ({ label, value, color = 'text-slate-800 dark:text-dark-text' }) => (
    <div className="flex flex-col gap-0.5 p-3 bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border transition-colors">
        <span className="text-[8px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">{label}</span>
        <span className={`text-base font-black leading-tight ${color}`}>{value || '—'}</span>
    </div>
);

/* ─── TIMELINE ITEM ───────────────────────────────────────── */
const TimelineItem = ({ s, isLast }) => (
    <div className="relative flex gap-3">
        {!isLast && (
            <div className="absolute left-[11px] top-7 bottom-0 w-px bg-slate-100 dark:bg-dark-border transition-colors" />
        )}
        <div className="relative z-10 w-6 h-6 mt-0.5 flex-shrink-0 rounded-full bg-white dark:bg-dark-surface border-2 border-slate-200 dark:border-dark-border flex items-center justify-center transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-red-900 dark:bg-brand-gold" />
        </div>
        <div className="flex-1 bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-xl p-3 mb-3 shadow-sm dark:shadow-black/20 transition-colors">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                <EstadoBadge estado={s.estado_anterior} />
                <ArrowRightIcon className="w-3 h-3 text-slate-300 dark:text-dark-text-muted/60 flex-shrink-0" />
                <EstadoBadge estado={s.estado_nuevo} />
            </div>
            {s.nota && (
                <p className="text-[10px] text-slate-600 dark:text-dark-text leading-relaxed mb-2 italic border-l-2 border-amber-400 dark:border-amber-500 pl-2 transition-colors">
                    {s.nota}
                </p>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-dark-border transition-colors">
                <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase truncate max-w-[55%]">
                    {s.asesor}
                </span>
                <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-surface-alt px-2 py-0.5 rounded-lg border border-slate-100 dark:border-dark-border transition-colors">
                    {s.fecha}
                </span>
            </div>
        </div>
    </div>
);

/* ─── MODAL PRINCIPAL ─────────────────────────────────────── */
const ViewProspectoModal = ({ isOpen, onClose, data, isLoading, onSeguimientoSuccess, onNotify }) => {
    const navigate = useNavigate();
    const { can } = useAuth();

    const [seguimientoOpen, setSeguimientoOpen] = useState(false);
    const [statusOpen,      setStatusOpen]      = useState(false);

    const puedeSeguimiento = can('prospecto.seguimiento') && [1, 2, 5].includes(data?.estado);
    const puedeEditar      = can('prospecto.update')      && [1, 2, 3, 5].includes(data?.estado);
    const puedeStatus      = can('prospecto.status') && data?.estado === 3;

    const handleSuccess = (updatedData) => onSeguimientoSuccess?.(updatedData);

    const fmt = (n) => n
        ? `S/ ${parseFloat(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
        : null;

    return (
        <>
            <ViewModal
                isOpen={isOpen}
                onClose={onClose}
                title={`Expediente #${data?.id?.toString().padStart(6, '0') ?? ''}`}
                isLoading={isLoading}
                size="2xl"
                hideFooter={true}
            >
                {data && (
                    <div className="flex flex-col md:flex-row gap-5 min-h-0 transition-colors">

                        {/* ══ COLUMNA IZQUIERDA ══ */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">

                            {/* Header */}
                            <div className="relative bg-red-900 dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-2xl overflow-hidden transition-colors">
                                <div
                                    className="absolute inset-0 opacity-[0.04]"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
                                        backgroundSize: '12px 12px'
                                    }}
                                />
                                <div className="relative p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-white/10 dark:bg-dark-surface-alt border border-white/20 dark:border-dark-border flex items-center justify-center flex-shrink-0 transition-colors">
                                                {data.tipo === 2
                                                    ? <BuildingOfficeIcon className="w-5 h-5 text-amber-400" />
                                                    : <UserIcon className="w-5 h-5 text-white dark:text-dark-text" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white dark:text-dark-text uppercase leading-tight tracking-tight transition-colors">
                                                    {data.nombre_completo}
                                                </p>
                                                <p className="text-[10px] text-white/50 dark:text-dark-text-muted mt-0.5 font-semibold transition-colors">
                                                    {data.tipo === 1 ? `DNI ${data.dni}` : `RUC ${data.ruc}`}
                                                    <span className="mx-1.5 opacity-40">·</span>
                                                    {data.tipo === 2 ? 'Persona Jurídica' : 'Persona Natural'}
                                                </p>
                                            </div>
                                        </div>
                                        <EstadoBadge estado={data.estado} />
                                    </div>

                                    {(data.monto_solicitado || data.ingreso_estimado) && (
                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            {data.monto_solicitado && (
                                                <div className="bg-white/10 dark:bg-dark-surface-alt rounded-xl p-2.5 border border-white/10 dark:border-dark-border transition-colors">
                                                    <p className="text-[8px] font-black text-white/40 dark:text-dark-text-muted uppercase tracking-widest mb-0.5">Monto Solicitado</p>
                                                    <p className="text-sm font-black text-amber-400">{fmt(data.monto_solicitado)}</p>
                                                </div>
                                            )}
                                            {data.ingreso_estimado && (
                                                <div className="bg-white/10 dark:bg-dark-surface-alt rounded-xl p-2.5 border border-white/10 dark:border-dark-border transition-colors">
                                                    <p className="text-[8px] font-black text-white/40 dark:text-dark-text-muted uppercase tracking-widest mb-0.5">Ingreso Estimado</p>
                                                    <p className="text-sm font-black text-white dark:text-dark-text">{fmt(data.ingreso_estimado)}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Identificación */}
                            <Card icon={IdentificationIcon} title="Identificación" accentColor="text-red-800 dark:text-red-400">
                                {data.tipo === 1 ? (
                                    <>
                                        <DataRow label="DNI"         value={data.dni} />
                                        <DataRow
                                            label="Vencimiento"
                                            value={data.no_caduca ? 'NO CADUCA (Mayor 60 años)' : data.fechaVencimientoDni}
                                            highlight={data.no_caduca}
                                        />
                                        <DataRow label="Nacimiento"    value={data.fechaNacimiento} />
                                        <DataRow label="Sexo"          value={data.sexo} />
                                    </>
                                ) : (
                                    <>
                                        <DataRow label="RUC"         value={data.ruc} />
                                        <DataRow label="Razón Social" value={data.razon_social} />
                                        <DataRow label="N. Comercial" value={data.nombre_comercial} />
                                    </>
                                )}
                                <DataRow label="Actividad (CIIU)" value={data.ciiu ? `${data.ciiu.codigo} — ${data.ciiu.descripcion}` : null} />
                                <DataRow label="Asesor Asignado"   value={data.asesor} />
                                <DataRow label="Fecha Registro"    value={data.created_at?.split(' ')[0]} />
                            </Card>

                            {/* Contacto */}
                            <Card icon={PhoneIcon} title="Contacto y Residencia" accentColor="text-blue-600 dark:text-blue-400">
                                <DataRow label="Celular"    value={data.telefono} />
                                <DataRow label="Teléfono"   value={data.telefonoFijo} />
                                <DataRow label="Correo"     value={data.correo} />
                                <DataRow label="Zona"       value={data.zona} />
                                <DataRow label="Ubicación"  value={data.departamento ? `${data.distrito}, ${data.provincia}` : null} />
                                <DataRow label="Dirección"  value={data.direccionFiscal} />
                                <DataRow label="Vivienda"   value={data.tipoVivienda ? `${data.tipoVivienda} · ${data.tiempoResidencia}` : null} />
                            </Card>

                            {/* Financiero */}
                            <Card
                                icon={ChartBarIcon}
                                title="Evaluación Financiera"
                                accentColor="text-emerald-600 dark:text-emerald-400"
                                badge={
                                    data.proposito && (
                                        <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted bg-slate-50 dark:bg-dark-surface-alt px-2 py-1 rounded-lg border border-slate-100 dark:border-dark-border uppercase tracking-wide transition-colors">
                                            {data.proposito}
                                        </span>
                                    )
                                }
                            >
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <Metric label="Ingreso Estimado" value={fmt(data.ingreso_estimado)} color="text-slate-700 dark:text-dark-text" />
                                    <Metric label="Monto Solicitado" value={fmt(data.monto_solicitado)} color="text-red-900 dark:text-red-400"   />
                                </div>
                                {data.observaciones && (
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl transition-colors">
                                        <p className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">Observaciones</p>
                                        <p className="text-[10px] text-slate-600 dark:text-dark-text leading-relaxed font-medium transition-colors">{data.observaciones}</p>
                                    </div>
                                )}
                            </Card>

                            {/* Convertido */}
                            {data.estado === 6 && data.cliente_id && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl transition-colors">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex-shrink-0 transition-colors">
                                        <ShieldCheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                            Prospecto convertido a cliente
                                        </p>
                                        <p className="text-[9px] text-emerald-500 dark:text-emerald-400/80 mt-0.5">
                                            ID Cliente: #{data.cliente_id.toString().padStart(6, '0')}
                                        </p>
                                    </div>
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 dark:text-emerald-400 ml-auto flex-shrink-0" />
                                </div>
                            )}

                            {/* Acciones */}
                            {(puedeSeguimiento || puedeStatus || puedeEditar) && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {puedeSeguimiento && (
                                        <button
                                            onClick={() => setSeguimientoOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-red-900 dark:bg-brand-red-glow hover:bg-red-950 dark:hover:brightness-110 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm"
                                        >
                                            <ArrowPathIcon className="w-3.5 h-3.5" /> Seguimiento
                                        </button>
                                    )}
                                    {puedeStatus && (
                                        <button
                                            onClick={() => setStatusOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 dark:bg-dark-surface-alt hover:bg-slate-900 dark:hover:bg-slate-700 text-white dark:text-dark-text rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors shadow-sm"
                                        >
                                            <CheckCircleIcon className="w-3.5 h-3.5" /> Aprobar / Rechazar
                                        </button>
                                    )}
                                    {puedeEditar && (
                                        <button
                                            onClick={() => { onClose(); navigate(`/prospecto/editar/${data.id}`); }}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface-alt text-slate-600 dark:text-dark-text rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors"
                                        >
                                            <PencilSquareIcon className="w-3.5 h-3.5" /> Editar
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ══ COLUMNA DERECHA — HISTORIAL ══ */}
                        <div className="w-full md:w-80 flex-shrink-0 flex flex-col">
                            <div className="bg-slate-50 dark:bg-dark-surface-alt border border-slate-100 dark:border-dark-border rounded-2xl overflow-hidden h-full flex flex-col transition-colors">

                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface transition-colors">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-dark-text-muted">
                                        <div className="p-1.5 bg-slate-50 dark:bg-dark-surface-alt rounded-lg transition-colors">
                                            <ClockIcon className="w-3 h-3" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Historial de Gestión</span>
                                    </div>
                                    {data.seguimientos?.length > 0 && (
                                        <span className="text-[9px] font-black bg-red-900 dark:bg-brand-red-glow text-white px-2 py-0.5 rounded-full">
                                            {data.seguimientos.length}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    {data.seguimientos && data.seguimientos.length > 0 ? (
                                        data.seguimientos.map((s, i) => (
                                            <TimelineItem
                                                key={s.id}
                                                s={s}
                                                isLast={i === data.seguimientos.length - 1}
                                            />
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-10">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-dark-surface flex items-center justify-center transition-colors">
                                                <ClockIcon className="w-6 h-6 text-slate-300 dark:text-dark-text-muted/40" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">Sin gestiones</p>
                                                <p className="text-[9px] text-slate-300 dark:text-dark-text-muted/60 mt-0.5">No hay seguimientos registrados</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </ViewModal>

            <SeguimientoModal
                isOpen={seguimientoOpen}
                onClose={() => setSeguimientoOpen(false)}
                prospecto={data}
                onSuccess={handleSuccess}
                onNotify={onNotify}
            />
            <StatusModal
                isOpen={statusOpen}
                onClose={() => setStatusOpen(false)}
                prospecto={data}
                onSuccess={handleSuccess}
                onNotify={onNotify}
            />
        </>
    );
};

export default ViewProspectoModal;