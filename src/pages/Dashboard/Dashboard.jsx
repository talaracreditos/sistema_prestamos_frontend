import React from 'react';
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

const Dashboard = () => {
    const { can } = useAuth();

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dashboard</h1>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Metricas — Talara Créditos e Inversiones
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {can('dashboard.accesos')        && <AccesosCard />}
                {can('dashboard.master')         && <MasterCard />}
                {can('dashboard.pagos')          && <PagoCard />}
                {can('dashboard.prestamos')      && <PrestamoCard />}
                {can('dashboard.cuotaDia')       && <CuotaDiaCard />}
                {can('dashboard.asesores')       && <AsesorCard />}
                {can('dashboard.mora')           && <MoraCard />}
                {can('dashboard.clientesMora')   && <ClientesMoraCard />}
                {can('dashboard.sbs')            && <SBSCard />}
                {can('dashboard.gruposAsesor')   && <GruposAsesorCard />}
                {can('dashboard.saldoCapital')   && <SaldoCapitalCard />}
                {can('dashboard.desembolsoCapital')   && <DesembolsoCapitalCard />}
            </div>
        </div>
    );
};

export default Dashboard;