import React from 'react';
import CronogramaTable from 'components/Shared/Tables/CronogramaTable';
import DatosEconomicosCards from 'components/Shared/Tables/components/CronogramaTable/DatosEconomicosCards';
import {
    BanknotesIcon,
    UserGroupIcon,
    ChartPieIcon,
    LockClosedIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

// ── Fila de integrante ────────────────────────────────────────────────────────
const IntegranteRow = ({ integrante }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-border last:border-0 transition-colors">
        <span className="text-sm text-slate-800 dark:text-dark-text font-semibold transition-colors">
            {integrante.nombre}
            <span className="ml-2 text-[10px] font-bold text-brand-gold-dark dark:text-brand-gold uppercase transition-colors">
                ({integrante.cargo})
            </span>
        </span>
        <span className="text-sm font-black text-brand-red dark:text-brand-gold shrink-0 transition-colors">
            S/ {parseFloat(integrante.monto).toFixed(2)}
        </span>
    </div>
);

// ── Helper: integrante pagó su parte en una cuota ────────────────────────────
const integrantePagoSuParte = (intDet) => {
    if (!intDet) return false;
    if (intDet.pagado === true) return true;
    const saldo = parseFloat(intDet.saldo ?? intDet.saldo_real ?? 1);
    return saldo <= 0;
};

// ── Componente principal ──────────────────────────────────────────────────────
const OperacionForm = ({ prestamoDetalle, openPagoModal, onHistorialModal }) => {
    if (!prestamoDetalle) return null;

    const { datos_economicos, integrantes, cronograma } = prestamoDetalle;
    const esGrupal   = prestamoDetalle.es_grupal;
    const tieneInteg = esGrupal && integrantes?.length > 0;

    // ── Columna Cobrar ────────────────────────────────────────────────────────
    const accionColumn = [{
        header: 'Acción',
        render: (row, i, allRows) => {
            const esPagable   = [1, 3, 4, 5].includes(row.estado);
            const saldoGlobal = parseFloat(row.saldo_pendiente ?? row.saldo_real ?? 0);

            if (row.estado === 2 || saldoGlobal <= 0)
                return <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase italic">✓ Cobrado</span>;

            if (!esPagable) return null;

            // Cuota "futura": todavía no le corresponde (estado 1 = PENDIENTE,
            // no vencida). Cobrarla de todas formas es un adelanto y requiere
            // PIN de autorización — esto es independiente del bloqueo por
            // integrante de abajo.
            const esCuotaFutura = row.estado === 1;

            // ── Individual ────────────────────────────────────────────────────
            if (!esGrupal) {
                const hayAnteriorPendiente = allRows
                    .filter(r => r.nro < row.nro)
                    .some(r => r.estado !== 2);

                // Para individual, "cuota anterior pendiente" y "cuota futura" son
                // la misma señal: adelantar el cobro requiere PIN. No se bloquea
                // duro — se autoriza con PIN, igual que siempre funcionó esto.
                const requierePinAnticipado = hayAnteriorPendiente || esCuotaFutura;
                const rowIndividual = { ...row, es_grupal: false, requierePinAnticipado };

                return (
                    <div className="flex flex-col gap-1 items-end">
                        <button
                            onClick={() => openPagoModal(rowIndividual)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 ${
                                requierePinAnticipado
                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30'
                                    : 'bg-brand-red dark:bg-brand-red-glow text-white dark:text-black hover:bg-brand-red-dark dark:hover:brightness-110 shadow-lg shadow-brand-red/30 dark:shadow-black/30'
                            }`}
                        >
                            {requierePinAnticipado
                                ? <><ShieldExclamationIcon className="w-3.5 h-3.5" /> Requiere PIN</>
                                : <><BanknotesIcon className="w-3.5 h-3.5" /> Cobrar</>}
                        </button>
                        {requierePinAnticipado && (
                            <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                                {hayAnteriorPendiente ? 'Cuota anterior pendiente' : 'Pago adelantado'}
                            </span>
                        )}
                    </div>
                );
            }

            // ── Grupal ────────────────────────────────────────────────────────
            // Bloqueo DURO por integrante: si no pagó su parte de la cuota
            // inmediatamente anterior, queda excluido de esta cuota. Sin PIN,
            // sin excepción — el PIN nunca reactiva a un bloqueado.
            const cuotaAnterior = allRows.find(r => r.nro === row.nro - 1);

            const integrantesPueden = (row.integrantes ?? []).filter(int => {
                if (integrantePagoSuParte(int)) return false;
                if (!cuotaAnterior) return true;
                const detAnt = (cuotaAnterior.integrantes ?? []).find(d => d.id === int.id);
                if (!detAnt) return true;
                return integrantePagoSuParte(detAnt);
            });

            const integrantesBloqueados = (row.integrantes ?? []).filter(int => {
                if (integrantePagoSuParte(int)) return false;
                if (!cuotaAnterior) return false;
                const detAnt = (cuotaAnterior.integrantes ?? []).find(d => d.id === int.id);
                if (!detAnt) return false;
                return !integrantePagoSuParte(detAnt);
            });

            if (integrantesPueden.length === 0) {
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-300 dark:text-dark-text-muted/50 uppercase">
                            <LockClosedIcon className="w-3 h-3" /> Todos bloqueados
                        </span>
                        <span className="text-[8px] text-slate-400 dark:text-dark-text-muted font-bold">
                            Deben pagar cuota anterior
                        </span>
                    </div>
                );
            }

            // El modal SOLO recibe a los habilitados. Los bloqueados nunca
            // llegan al formulario, ni siquiera con PIN.
            const rowFiltrado = {
                ...row,
                integrantes: integrantesPueden,
                es_grupal: true,
                // PIN a nivel de cuota, solo si se está adelantando el cobro de
                // una cuota que todavía no le corresponde al grupo (PENDIENTE).
                // Sigue aplicando únicamente a los habilitados.
                requierePinAnticipado: esCuotaFutura,
            };

            return (
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => openPagoModal(rowFiltrado)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 ${
                            esCuotaFutura
                                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/30'
                                : 'bg-brand-red dark:bg-brand-red-glow text-white dark:text-black hover:bg-brand-red-dark dark:hover:brightness-110 shadow-lg shadow-brand-red/30 dark:shadow-black/30'
                        }`}
                    >
                        {esCuotaFutura
                            ? <><ShieldExclamationIcon className="w-3.5 h-3.5" /> Cobrar ({integrantesPueden.length})</>
                            : <><BanknotesIcon className="w-3.5 h-3.5" /> Cobrar ({integrantesPueden.length})</>}
                    </button>
                    <div className="flex flex-col gap-0.5">
                        {esCuotaFutura && (
                            <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                                Pago adelantado — requiere PIN
                            </span>
                        )}
                        {integrantesBloqueados.length > 0 && (
                            <span className="text-[8px] font-bold text-slate-400 dark:text-dark-text-muted flex items-center gap-0.5">
                                <LockClosedIcon className="w-2.5 h-2.5" />
                                {integrantesBloqueados.length} bloqueado{integrantesBloqueados.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            );
        },
    }];

    return (
        <div className="mt-10 animate-in slide-in-from-bottom-6 duration-500 space-y-6 transition-colors">

            {/* Desglose integrantes */}
            {tieneInteg && (
                <div className="bg-white dark:bg-dark-surface rounded-[28px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 overflow-hidden transition-colors">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex items-center gap-3 transition-colors">
                        <div className="p-2 bg-slate-900 dark:bg-black rounded-xl transition-colors"><UserGroupIcon className="w-4 h-4 text-white dark:text-dark-text" /></div>
                        <h4 className="font-black text-slate-800 dark:text-dark-text uppercase text-xs tracking-[0.15em] transition-colors">Desglose de Integrantes</h4>
                    </div>
                    <div className="p-5 divide-y divide-slate-100 dark:divide-dark-border transition-colors">
                        {integrantes.map(int => <IntegranteRow key={int.id} integrante={int} />)}
                    </div>
                </div>
            )}

            {/* Resumen Económico — DatosEconomicosCards */}
            <div className="bg-white dark:bg-dark-surface rounded-[28px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex items-center gap-3 transition-colors">
                    <div className="p-2 bg-slate-900 dark:bg-black rounded-xl transition-colors"><ChartPieIcon className="w-4 h-4 text-white dark:text-dark-text" /></div>
                    <h4 className="font-black text-slate-800 dark:text-dark-text uppercase text-xs tracking-[0.15em] transition-colors">Resumen Económico</h4>
                </div>
                <div className="p-5">
                    <DatosEconomicosCards
                        eco={datos_economicos}
                        estadoPrestamo={prestamoDetalle.estado}
                        esVistaIntegrante={false}
                    />
                </div>
            </div>

            {/* Cronograma */}
            <div className="bg-white dark:bg-dark-surface rounded-[28px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border flex items-center gap-3 transition-colors">
                    <div className="p-2 bg-slate-900 dark:bg-black rounded-xl transition-colors"><BanknotesIcon className="w-4 h-4 text-white dark:text-dark-text" /></div>
                    <h4 className="font-black text-slate-800 dark:text-dark-text uppercase text-xs tracking-[0.15em] transition-colors">Cronograma de Pagos y Saldos</h4>
                </div>
                <div className="p-2">
                    <CronogramaTable
                        cronograma={cronograma}
                        esVistaIntegrante={false}
                        onHistorialModal={onHistorialModal}
                        extraColumns={accionColumn}
                    />
                </div>
            </div>
        </div>
    );
};

export default OperacionForm;