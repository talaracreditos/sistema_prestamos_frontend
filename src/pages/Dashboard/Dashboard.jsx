import React, { useMemo, useState } from 'react';
import { useAuth } from 'context/AuthContext';
import PagoCard          from './Pagocard';
import PrestamoCard      from './Prestamocard';
import AsesorCard        from './Asesorcard';
import MoraCard          from './Moracard';
import ClientesMoraCard  from './ClientesMoracard';
import GruposAsesorCard  from './GruposAsesorCard';
import SaldoCapitalCard  from './SaldoCapitalCard';
import CuotaDiaCard from './CuotaDiaCard';
import SBSCard from './SBSCard';
import DesembolsoCapitalCard from './DesembolsoCapitalCard';
import MasterCard from './MastedCard';
import AccesosCard from './Accesoscard';
import ClientesMoraMayor8Card from './ClientesMoraMayor8Card';
import EstructuraCarteraCard from './EstructuraCarteraCard';
import InteresGrupoCard from './InteresGrupoCard';

const STORAGE_KEY = 'dashboard.seccion';

// Cada sección agrupa cards; una card solo se muestra si el usuario tiene el permiso.
const SECCIONES = [
    {
        id: 'general',
        label: 'General',
        cards: [
            { permiso: 'dashboard.accesos', Component: AccesosCard },
            { permiso: 'dashboard.master',  Component: MasterCard },
        ],
    },
    {
        id: 'cobranza',
        label: 'Cobranza',
        cards: [
            { permiso: 'dashboard.pagos',        Component: PagoCard },
            { permiso: 'dashboard.cuotaDia',     Component: CuotaDiaCard },
            { permiso: 'dashboard.interesGrupo', Component: InteresGrupoCard },
        ],
    },
    {
        id: 'cartera',
        label: 'Préstamos y Cartera',
        cards: [
            { permiso: 'dashboard.prestamos',         Component: PrestamoCard },
            { permiso: 'dashboard.saldoCapital',      Component: SaldoCapitalCard },
            { permiso: 'dashboard.desembolsoCapital', Component: DesembolsoCapitalCard },
            { permiso: 'dashboard.estructuraCartera', Component: EstructuraCarteraCard },
        ],
    },
    {
        id: 'mora',
        label: 'Mora',
        cards: [
            { permiso: 'dashboard.mora',               Component: MoraCard },
            { permiso: 'dashboard.clientesMoraMayor8', Component: ClientesMoraMayor8Card },
            { permiso: 'dashboard.clientesMora',       Component: ClientesMoraCard },
        ],
    },
    {
        id: 'asesores',
        label: 'Asesores',
        cards: [
            { permiso: 'dashboard.asesores',     Component: AsesorCard },
            { permiso: 'dashboard.gruposAsesor', Component: GruposAsesorCard },
        ],
    },
    {
        id: 'sbs',
        label: 'SBS',
        cards: [
            { permiso: 'dashboard.sbs', Component: SBSCard },
        ],
    },
];

const leerSeccionGuardada = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};

const guardarSeccion = (id) => {
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* sin storage: no pasa nada */ }
};

const Dashboard = () => {
    const { can } = useAuth();

    // Solo secciones con al menos una card permitida
    const secciones = useMemo(
        () => SECCIONES
            .map(s => ({ ...s, cards: s.cards.filter(c => can(c.permiso)) }))
            .filter(s => s.cards.length > 0),
        [can]
    );

    const [seccionId, setSeccionId] = useState(leerSeccionGuardada);

    // Si la guardada no existe o el usuario ya no tiene permiso, cae a la primera
    const activa = secciones.find(s => s.id === seccionId) ?? secciones[0];

    const cambiarSeccion = (id) => {
        setSeccionId(id);
        guardarSeccion(id);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-dark-text uppercase tracking-tight">Dashboard</h1>
                <p className="text-[11px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest mt-0.5">
                    Metricas — Talara Créditos e Inversiones
                </p>
            </div>

            {secciones.length > 1 && (
                <div
                    role="tablist"
                    aria-label="Secciones del dashboard"
                    className="mb-6 flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700"
                >
                    {secciones.map(s => {
                        const esActiva = s.id === activa.id;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                role="tab"
                                aria-selected={esActiva}
                                onClick={() => cambiarSeccion(s.id)}
                                className={
                                    'shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors ' +
                                    (esActiva
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-dark-text-muted dark:hover:bg-slate-700')
                                }
                            >
                                {s.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {activa ? (
                <div key={activa.id} role="tabpanel" className="grid grid-cols-1 gap-6">
                    {activa.cards.map(({ permiso, Component }) => (
                        <Component key={permiso} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-400 dark:text-dark-text-muted">
                    No tienes métricas disponibles.
                </p>
            )}
        </div>
    );
};

export default Dashboard;