import React from 'react';
import Modal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { useReprogramacionModal } from 'hooks/Prestamo/useReprogramacionModal';
import { ClockIcon, ExclamationTriangleIcon, InformationCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const ReprogramacionModal = ({ isOpen, onClose, data, onSuccess }) => {
    const {
        formData, loading, alert, setAlert,
        handleChange, handleSubmit,
        submitDisabled, previewFechas,
    } = useReprogramacionModal({ isOpen, data, onSuccess });

    if (!data) return null;

    const handleClose = () => { if (!loading) onClose(); };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} hideFooter={true} title="Reprogramar Préstamo" size="md">
            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-3 rounded-[inherit]">
                    <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reprogramando cuotas...</p>
                </div>
            )}
            <div className="p-1">

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4 flex gap-3 items-start">
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                        <h4 className="text-[11px] font-black text-amber-800 uppercase">
                            Préstamo #{data.prestamoId?.toString().padStart(5, '0')}
                        </h4>
                        <p className="text-[10px] text-amber-700 font-bold mt-1">
                            Cuotas pendientes que se moverán: {data.cuotasPendientes ?? '—'}
                        </p>
                        <p className="text-[10px] text-amber-700 font-bold">
                            Frecuencia actual: {data.frecuenciaActual ?? '—'}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                    <InformationCircleIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                        Solo se mueven las fechas de las cuotas pendientes. Los montos y la mora ya generada
                        no cambian. Este préstamo ya fue reprogramado{' '}
                        <span className="font-black">{data.totalReprogramaciones ?? 0}</span>{' '}
                        {data.totalReprogramaciones === 1 ? 'vez' : 'veces'} antes.
                    </p>
                </div>

                <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nueva Frecuencia *</label>
                            <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} disabled={loading}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white disabled:opacity-50">
                                <option value="SEMANAL">SEMANAL</option>
                                <option value="CATORCENAL">CATORCENAL</option>
                                <option value="MENSUAL">MENSUAL</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha 1ra Cuota *</label>
                            <input type="date" name="fecha_primera_cuota" required disabled={loading}
                                min={new Date().toISOString().split('T')[0]}
                                value={formData.fecha_primera_cuota} onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50" />
                        </div>
                    </div>

                    {/* ── Preview de fechas resultantes ── */}
                    {previewFechas.length > 0 && (
                        <div className="border border-teal-200 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 border-b border-teal-100">
                                <CalendarDaysIcon className="w-3.5 h-3.5 text-teal-600" />
                                <span className="text-[9px] font-black text-teal-700 uppercase tracking-widest">
                                    Nuevo calendario ({previewFechas.length} {previewFechas.length === 1 ? 'cuota' : 'cuotas'})
                                </span>
                            </div>
                            <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
                                {previewFechas.map((fecha, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-1.5">
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {i === 0 ? 'Próxima cuota' : `Cuota siguiente #${i + 1}`}
                                        </span>
                                        <span className="text-[11px] font-black text-slate-700">{fecha}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Motivo (opcional)</label>
                        <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="2" disabled={loading}
                            placeholder="Ej: Accidente del cliente, imprevisto laboral, etc."
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={handleClose} disabled={loading}
                            className="px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl uppercase disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={submitDisabled}
                            className="flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase rounded-xl transition-all shadow-md disabled:opacity-50">
                            {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Reprogramando...</> : <><ClockIcon className="w-4 h-4" /> Reprogramar</>}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ReprogramacionModal;