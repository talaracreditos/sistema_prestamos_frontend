import React from 'react';

const ParametroForm = ({ formData, clave, handleChange, handleSubmit, saving }) => {

    const handleValor = (e) => {
        // Solo números y punto decimal — máx 2 decimales
        const raw = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        handleChange('valor', raw);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 bg-white dark:bg-dark-surface p-10 rounded-[40px] border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 space-y-6 transition-colors">

            {/* Clave — solo lectura */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1 tracking-widest transition-colors">
                    Clave del Parámetro
                </label>
                <input
                    type="text"
                    readOnly
                    value={clave}
                    className="w-full p-4 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-2xl font-black text-slate-400 dark:text-dark-text-muted outline-none cursor-not-allowed transition-colors"
                />
            </div>

            {/* Valor — solo números */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1 tracking-widest transition-colors">
                    Valor *
                </label>
                <input
                    type="text"
                    inputMode="decimal"
                    value={formData.valor}
                    onChange={handleValor}
                    placeholder="Ej: 3.00"
                    className="w-full p-4 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-2xl font-black text-brand-red dark:text-brand-gold text-center outline-none focus:ring-2 focus:border-brand-red dark:focus:border-brand-gold focus:ring-brand-red dark:focus:ring-brand-gold transition-all text-lg placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                    required
                />
                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-1 ml-1 uppercase tracking-wide transition-colors">
                    Solo se permiten números y punto decimal.
                </p>
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2 ml-1 tracking-widest transition-colors">
                    Descripción
                </label>
                <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Descripción del parámetro"
                    className="w-full p-4 bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-2xl font-bold text-slate-800 dark:text-dark-text outline-none focus:ring-2 focus:border-brand-red dark:focus:border-brand-gold focus:ring-brand-red dark:focus:ring-brand-gold transition-all placeholder-slate-400 dark:placeholder-dark-text-muted/60"
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={saving || !formData.valor}
                    className="w-full py-4 bg-brand-red dark:bg-brand-red-glow text-white dark:text-black font-black uppercase rounded-2xl hover:bg-brand-red-dark dark:hover:brightness-110 transition-all shadow-lg shadow-brand-red/30 dark:shadow-black/30 disabled:opacity-50 tracking-widest"
                >
                    {saving ? 'Guardando...' : 'Actualizar Parámetro'}
                </button>
            </div>
        </form>
    );
};

export default ParametroForm;