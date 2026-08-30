import React from 'react';
import { useStore } from 'hooks/CajaChicaMovimiento/useStore';
import PageHeader from 'components/Shared/Headers/PageHeader';
import CajaChicaMovimientoForm from 'components/Shared/Formularios/CajaChicaMovimiento/CajaChicaMovimientoForm';
import AbrirSesionModal from 'components/Shared/Modals/CajaChicaMovimiento/AbrirSesionModal';
import CerrarSesionModal from 'components/Shared/Modals/CajaChicaMovimiento/CerrarSesionModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { LockClosedIcon, LockOpenIcon, BanknotesIcon, WalletIcon } from '@heroicons/react/24/outline';
import jwtUtils from 'utilities/Token/jwtUtils';

const Store = () => {
    const {
        loading, sesionActiva, alert, setAlert,
        isAbrirModalOpen, setIsAbrirModalOpen,
        isCerrarModalOpen, setIsCerrarModalOpen,
        handleAbrirSesion, handleCerrarSesion,
        formData, handleChange, handleSubmit,
        verifySesion,
    } = useStore();

    if (loading && sesionActiva === undefined) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl transition-colors">
            <PageHeader title="Caja Chica" icon={BanknotesIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {!sesionActiva && !loading ? (
                <div className="mt-10 bg-white dark:bg-dark-surface p-12 rounded-[40px] border border-slate-100 dark:border-dark-border shadow-2xl dark:shadow-black/50 text-center max-w-xl mx-auto transition-colors">
                    <div className="bg-brand-red-light dark:bg-brand-gold/10 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 transform -rotate-6 shadow-inner transition-colors">
                        <LockClosedIcon className="w-12 h-12 text-brand-red dark:text-brand-gold" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-dark-text uppercase tracking-tight mb-3 transition-colors">Caja Chica Cerrada</h2>
                    <p className="text-slate-500 dark:text-dark-text-muted text-sm font-medium mb-10 px-6 leading-relaxed transition-colors">
                        Para registrar ingresos o egresos, primero debes aperturar tu caja chica.
                    </p>
                    <button
                        onClick={() => setIsAbrirModalOpen(true)}
                        className="bg-brand-red dark:bg-brand-red-glow text-white dark:text-black px-12 py-4 rounded-2xl font-black uppercase text-xs shadow-xl dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <LockOpenIcon className="w-4 h-4" /> Aperturar Caja Chica
                    </button>
                </div>
            ) : (
                <div className="mt-6 space-y-6 animate-in fade-in duration-500">

                    {/* ── Barra horizontal tipo mostrador ── */}
                    <div className="flex flex-col md:flex-row items-center justify-between bg-brand-red dark:bg-dark-surface p-6 md:p-8 rounded-[32px] shadow-xl text-white dark:text-dark-text gap-6 border border-brand-red-dark dark:border-dark-border relative overflow-hidden transition-colors">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-red-light opacity-10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center gap-4 z-10">
                            <div className="p-3 bg-brand-red-dark dark:bg-dark-surface-alt rounded-2xl shadow-inner border border-brand-red-dark/50 dark:border-dark-border transition-colors">
                                <WalletIcon className="w-8 h-8 text-brand-gold" />
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-brand-red-light/80 dark:text-dark-text-muted uppercase tracking-[0.2em] block mb-1">Responsable</span>
                                <span className="text-lg font-black block">
                                    {jwtUtils.getName(jwtUtils.getAccessTokenFromCookie()) || 'Usuario del Sistema'}
                                </span>
                                {sesionActiva?.caja?.nombre && (
                                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-full tracking-[0.15em] bg-brand-red-dark/50 dark:bg-dark-surface-alt text-white/70 dark:text-dark-text-muted">
                                        {sesionActiva.caja.nombre}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-brand-red-dark dark:border-dark-border pt-6 md:pt-0 md:pl-8 w-full md:w-auto justify-between md:justify-start z-10 transition-colors">
                            <div className="text-right">
                                <span className="text-[9px] font-black text-brand-red-light/80 dark:text-dark-text-muted uppercase tracking-[0.2em] block mb-1">Apertura</span>
                                <span className="text-lg font-black text-white/80 dark:text-dark-text-muted tracking-tight">
                                    S/ {parseFloat(sesionActiva?.monto_apertura || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-brand-red-light/80 dark:text-dark-text-muted uppercase tracking-[0.2em] block mb-1">Saldo Actual</span>
                                <span className="text-3xl font-black text-brand-gold tracking-tighter drop-shadow-sm">
                                    S/ {parseFloat(sesionActiva?.saldo_actual || 0).toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={() => { verifySesion(); setIsCerrarModalOpen(true); }}
                                className="bg-brand-red-dark dark:bg-dark-surface-alt hover:bg-brand-gold dark:hover:bg-brand-gold hover:text-brand-red-dark dark:hover:text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all border border-brand-red-dark dark:border-dark-border hover:border-brand-gold hover:shadow-lg active:scale-95"
                            >
                                Cerrar Caja
                            </button>
                        </div>
                    </div>

                    {/* ── Panel de registro ── */}
                    <div className="bg-white dark:bg-dark-surface p-4 md:p-8 rounded-[40px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 transition-colors">
                        <form onSubmit={handleSubmit}>
                            <CajaChicaMovimientoForm data={formData} handleChange={handleChange} />
                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow text-white dark:text-black px-10 py-3.5 rounded-xl font-black uppercase shadow-lg shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50 tracking-wide"
                                >
                                    {loading ? 'Registrando...' : 'Registrar Movimiento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AbrirSesionModal isOpen={isAbrirModalOpen} onClose={() => setIsAbrirModalOpen(false)} onConfirm={handleAbrirSesion} loading={loading} />
            <CerrarSesionModal isOpen={isCerrarModalOpen} onClose={() => setIsCerrarModalOpen(false)} onConfirm={handleCerrarSesion} sesionActiva={sesionActiva} loading={loading} />
        </div>
    );
};

export default Store;