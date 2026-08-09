import React from 'react';
import { useDashboardPrestamos } from 'hooks/Dashboard/useDashboardPrestamos';
import DashboardCard from 'components/Shared/Cards/DashboardCard';
import { exportPrestamosDashboard } from 'services/dashboardService';
import { UserGroupIcon, UserIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TABS = [
    { id: 'cards',      label: 'Resumen'    },
    { id: 'activos',    label: 'Vigentes'   },
    { id: 'anteriores', label: 'Anteriores' },
    { id: 'proximas',   label: 'Por vencer' },
    { id: 'vencidas',   label: 'Vencidas'   },
    { id: 'mensual',    label: '12 meses'   },
];

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const filaActivo = p => (
    <div className="bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border border-slate-100 dark:border-dark-border p-4 transition-colors">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 bg-brand-red-light dark:bg-dark-surface rounded-lg flex-shrink-0 transition-colors">
                    {p.es_grupal 
                        ? <UserGroupIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> 
                        : <UserIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" />
                    }
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-dark-text uppercase truncate">
                        <span className="text-slate-400 dark:text-dark-text-muted/60 mr-1.5">{p.numero_prestamo}</span>
                        {p.nombre}
                    </p>
                    {p.es_grupal && p.grupo && <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-0.5">GRUPO: {p.grupo}</p>}
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-slate-900 dark:text-dark-text">S/ {fmt(p.monto)}</p>
                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase mt-0.5">{p.frecuencia}</p>
            </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">
            <span>{p.pagadas}/{p.cuotas} cuotas pagadas</span>
            <span className="text-brand-red dark:text-brand-gold">{p.progreso}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-dark-border rounded-full h-1.5 mt-2 transition-colors">
            <div className="bg-brand-red dark:bg-brand-gold h-1.5 rounded-full transition-all" style={{ width: `${p.progreso}%` }} />
        </div>
        <div className="mt-2 flex gap-3 text-[9px] text-slate-400 dark:text-dark-text-muted font-bold">
            <span>Inicio: {p.fecha_inicio}</span><span>·</span>
            <span>{p.pendientes} pendientes</span><span>·</span>
            <span className="uppercase">{p.modalidad}</span>
        </div>
    </div>
);

const filaAnterior = p => (
    <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-dark-surface-alt rounded-xl border border-slate-100 dark:border-dark-border px-4 py-3 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-slate-100 dark:bg-dark-surface rounded-lg flex-shrink-0 transition-colors">
                {p.es_grupal 
                    ? <UserGroupIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" /> 
                    : <UserIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted" />
                }
            </div>
            <div className="min-w-0">
                <p className="text-xs font-black text-slate-700 dark:text-dark-text uppercase truncate">
                    <span className="text-slate-400 dark:text-dark-text-muted/60 mr-1.5">{p.numero_prestamo}</span>
                    {p.nombre}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-0.5">{p.fecha_inicio} · {p.cuotas} cuotas</p>
            </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-black text-slate-600 dark:text-dark-text">S/ {fmt(p.monto)}</span>
            {p.estado === 3 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 uppercase shadow-sm">Liquidado</span>}
            {p.estado === 2 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-red-light dark:bg-red-500/20 text-brand-red dark:text-red-400 border border-brand-red/20 dark:border-red-500/30 uppercase shadow-sm">Cancelado</span>}
            {p.estado === 4 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 uppercase shadow-sm">Refinanciado</span>}
        </div>
    </div>
);

const filaProxima = c => (
    <div className="flex items-center justify-between gap-3 bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl px-4 py-3 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-amber-100/50 dark:bg-amber-500/20 rounded-lg flex-shrink-0 transition-colors">
                <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-dark-text uppercase truncate">
                    <span className="text-slate-400 dark:text-dark-text-muted/60 mr-1.5">{c.numero_prestamo}</span>
                    {c.nombre}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-dark-text-muted font-bold mt-0.5">Cuota #{c.numero_cuota} · Vence: {c.fecha_vencimiento}</p>
            </div>
        </div>
        <div className="text-right flex-shrink-0">
            <p className="text-sm font-black text-slate-900 dark:text-dark-text">S/ {fmt(c.monto)}</p>
            <p className={`text-[9px] font-black uppercase mt-0.5 ${c.dias_restantes === 0 ? 'text-brand-red dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {c.dias_restantes === 0 ? 'Vence hoy' : `En ${c.dias_restantes} día(s)`}
            </p>
        </div>
    </div>
);

const filaVencida = c => (
    <div className="flex items-center justify-between gap-3 bg-brand-red-light/20 dark:bg-red-500/10 border border-brand-red/20 dark:border-red-500/20 rounded-xl px-4 py-3 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-brand-red-light/50 dark:bg-red-500/20 rounded-lg flex-shrink-0 transition-colors">
                <ExclamationTriangleIcon className="w-4 h-4 text-brand-red dark:text-red-400" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-dark-text uppercase truncate">
                    <span className="text-slate-400 dark:text-dark-text-muted/60 mr-1.5">{c.numero_prestamo}</span>
                    {c.nombre}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-dark-text-muted font-bold mt-0.5">
                    Cuota #{c.numero_cuota} · Venció: {c.fecha_vencimiento} · <span className="text-brand-red dark:text-red-400">{c.dias_mora} día(s) mora</span>
                </p>
            </div>
        </div>
        <div className="text-right flex-shrink-0">
            <p className="text-sm font-black text-brand-red dark:text-red-400">S/ {fmt(c.monto)}</p>
            {c.cargo_mora > 0 && <p className="text-[9px] font-bold text-brand-red/70 dark:text-red-400/70 mt-0.5">+S/ {fmt(c.cargo_mora)} mora</p>}
        </div>
    </div>
);

const PrestamoCard = () => {
    const {
        loading, data,
        fechaInicio, setFechaInicio,
        fechaFin,    setFechaFin,
        handleFiltrar, handleLimpiar,
        setActivosPage, setAnterioresPage,
        setProximasPage, setVencidasPage,
    } = useDashboardPrestamos();

    const mensual = data?.graficas?.mensual ?? [];

    return (
        <DashboardCard
            title="Préstamos y Cuotas"
            subtitle="Módulo de cartera"
            icon="briefcase"
            loading={loading}
            cards={data?.cards ?? []}
            tabs={TABS}
            conFiltros={true}
            fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
            fechaFin={fechaFin}       setFechaFin={setFechaFin}
            onFiltrar={handleFiltrar}
            onLimpiar={handleLimpiar}
            tablas={{
                activos:    { data: data?.activos,    renderFila: filaActivo,   onPageChange: setActivosPage,    emptyText: 'Sin préstamos vigentes'        },
                anteriores: { data: data?.anteriores, renderFila: filaAnterior, onPageChange: setAnterioresPage, emptyText: 'Sin préstamos anteriores'      },
                proximas:   { data: data?.proximas,   renderFila: filaProxima,  onPageChange: setProximasPage,   emptyText: 'Sin cuotas próximas a vencer' },
                vencidas:   { data: data?.vencidas,   renderFila: filaVencida,  onPageChange: setVencidasPage,   emptyText: 'Sin cuotas vencidas'          },
            }}
            graficas={[
                { tab: 'mensual', tipo: 'barra', data: mensual, xKey: 'mes', dataKey: 'cantidad', label: 'Préstamos por mes',        color: '#8B1A1A', isMoney: false, height: 200 },
                { tab: 'mensual', tipo: 'barra', data: mensual, xKey: 'mes', dataKey: 'total',    label: 'Monto desembolsado (S/)', color: '#F5A623', isMoney: true,  height: 180 },
            ]}
            exportService={exportPrestamosDashboard}
            exportFilename="reporte_prestamos"
            exportLabel="Excel"
        />
    );
};

export default PrestamoCard;