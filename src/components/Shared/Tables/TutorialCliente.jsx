import React, { useState, useEffect, useCallback } from 'react';
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';


const STORAGE_KEY = 'tutorial_cliente';

const TODOS_LOS_PASOS = [
    {
        id:       'intro',
        selector: null,
        titulo:   '¡Bienvenido! 👋',
        texto:    'Esta es la vista de tu préstamo. Te mostramos parte por parte cómo leerla para que siempre sepas cuánto y cuándo pagar. Toca "Siguiente" para empezar.',
    },
    {
        id:       'resumen',
        selector: '[data-tutorial="resumen"]',
        titulo:   'Tu resumen',
        texto:    'La tarjeta roja muestra el saldo total que falta pagar, y la blanca el valor de cada cuota y con qué frecuencia se paga.',
    },
    {
        id:         'integrantes',
        selector:   '[data-tutorial="integrantes"]',
        soloGrupal: true,
        titulo:     'Tu grupo',
        texto:      'Aquí están todos los integrantes del grupo con su cargo. Tú apareces resaltado en rojo con "(Tú)".',
    },
    {
        id:         'toggle',
        selector:   '[data-tutorial="toggle-vista"]',
        soloGrupal: true,
        titulo:     'Grupo vs Mi Saldo',
        texto:      'Con estos botones cambias de vista: "Grupo" muestra las cuotas y el saldo de todo el grupo, y "Mi Saldo" muestra solo lo que te corresponde pagar a ti.',
    },
    {
        id:       'progreso',
        selector: '[data-tutorial="progreso"]',
        titulo:   'Tu avance',
        texto:    'Esta barra te dice cuántas cuotas ya se pagaron del total. ¡Cuando llegue al 100% el préstamo estará completo!',
    },
    {
        id:       'proxima',
        selector: '[data-tutorial="proxima"]',
        titulo:   'Tu próximo pago',
        texto:    'Esta tarjeta grande es la cuota que toca pagar ahora. Si está en rojo es porque está atrasada — el monto que ves ya incluye la mora, no tienes que sumarla tú.',
    },
    {
        id:       'pendientes',
        selector: '[data-tutorial="pendientes"]',
        titulo:   'Cuotas siguientes',
        texto:    'Estas son las cuotas que vienen después, con su fecha de vencimiento y monto, para que planifiques tus pagos con anticipación.',
    },
    {
        id:       'pagadas',
        selector: '[data-tutorial="pagadas"]',
        titulo:   'Cuotas pagadas',
        texto:    'Toca aquí para desplegar tu historial. Si alguna cuota tuvo mora, verás cuánto pagaste de cuota y cuánto de mora.',
    },
    {
        id:       'ayuda',
        selector: '[data-tutorial="ayuda"]',
        titulo:   '¡Listo! 🎉',
        texto:    'Eso es todo. Si quieres volver a ver esta guía, toca este enlace cuando gustes. Ante cualquier duda, comunícate con tu asesor.',
    },
];

const TutorialCliente = ({ esGrupal = false, reabrir = 0 }) => {

    const [abierto, setAbierto]           = useState(false);
    const [pasosActivos, setPasosActivos] = useState([]);
    const [idx, setIdx]                   = useState(0);
    const [rect, setRect]                 = useState(null);

    const paso      = pasosActivos[idx] ?? null;
    const esUltimo  = idx === pasosActivos.length - 1;
    const esPrimero = idx === 0;

    /* ── Abrir el tour ── */
    const abrirTour = useCallback(() => {
        const activos = TODOS_LOS_PASOS.filter(p => {
            if (p.soloGrupal && !esGrupal) return false;
            if (p.selector === null) return true;
            return !!document.querySelector(p.selector);
        });
        if (activos.length === 0) return;
        setPasosActivos(activos);
        setIdx(0);
        setAbierto(true);
    }, [esGrupal]);

    /* ── Apertura automática la primera vez ──
     * Pequeño delay para que el modal termine de renderizar/animar. */
    useEffect(() => {
        let visto = null;
        try { visto = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage bloqueado */ }
        if (visto === '1') return;
        const t = setTimeout(abrirTour, 600);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Reapertura manual ── */
    useEffect(() => {
        if (reabrir > 0) abrirTour();
    }, [reabrir, abrirTour]);


    useEffect(() => {
        if (!abierto || !paso) return;

        if (!paso.selector) { setRect(null); return; }

        const el = document.querySelector(paso.selector);
        if (!el) { setRect(null); return; }

        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const medir = () => setRect(el.getBoundingClientRect());
        const t = setTimeout(medir, 380);

        window.addEventListener('resize', medir);
        window.addEventListener('scroll', medir, true);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', medir);
            window.removeEventListener('scroll', medir, true);
        };
    }, [abierto, idx, paso]);

    const marcarVisto = () => {
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* storage bloqueado */ }
    };

    const cerrar = () => {
        marcarVisto();
        setAbierto(false);
        setRect(null);
    };

    const siguiente = () => {
        if (esUltimo) { cerrar(); return; }
        setRect(null);
        setIdx(i => i + 1);
    };

    const anterior = () => {
        if (esPrimero) return;
        setRect(null);
        setIdx(i => i - 1);
    };

    if (!abierto || !paso) return null;

    const vw = typeof window !== 'undefined' ? window.innerWidth : 375;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const TOOLTIP_W = Math.min(340, vw - 24);

    let tooltipStyle = {};
    if (rect) {
        const left = Math.min(
            Math.max(rect.left + rect.width / 2 - TOOLTIP_W / 2, 12),
            vw - TOOLTIP_W - 12
        );
        const cabeAbajo = rect.bottom + 240 < vh;
        tooltipStyle = cabeAbajo
            ? { top: rect.bottom + 14, left, width: TOOLTIP_W }
            : { bottom: vh - rect.top + 14, left, width: TOOLTIP_W };
    } else {
        tooltipStyle = {
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: TOOLTIP_W,
        };
    }

    return (
        <>
            {/* ── Bloqueador de clicks sobre todo el modal ── */}
            <div className="fixed inset-0 z-[9997]" onClick={(e) => e.stopPropagation()} />

            {/* ── Spotlight: marco sobre el elemento real + oscurecido alrededor */}
            {rect ? (
                <div
                    className="fixed z-[9998] rounded-2xl border-2 border-brand-gold pointer-events-none transition-all duration-300"
                    style={{
                        top:    rect.top - 6,
                        left:   rect.left - 6,
                        width:  rect.width + 12,
                        height: rect.height + 12,
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.68)',
                    }}
                />
            ) : (
                <div className="fixed inset-0 z-[9998] bg-slate-900/68 dark:bg-black/80 backdrop-blur-[2px] pointer-events-none transition-colors" />
            )}

            {/* ── Tooltip explicativo — flotante pegado al elemento en cualquier pantalla ── */}
            <div
                className="fixed z-[9999] bg-white dark:bg-dark-surface dark:border dark:border-dark-border shadow-2xl dark:shadow-black/50 rounded-2xl overflow-hidden max-h-[70vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 transition-colors"
                style={tooltipStyle}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-1">
                    <span className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                        Guía · Paso {idx + 1} de {pasosActivos.length}
                    </span>
                    <button
                        onClick={cerrar}
                        className="p-1 text-slate-300 dark:text-dark-text-muted/60 hover:text-slate-500 dark:hover:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-surface-alt rounded-lg transition-colors"
                        title="Cerrar guía"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="px-4 pb-3">
                    <h3 className="text-sm font-black text-slate-800 dark:text-dark-text uppercase tracking-tight mb-1">
                        {paso.titulo}
                    </h3>
                    <p className="text-[12px] font-medium text-slate-500 dark:text-dark-text-muted leading-relaxed">
                        {paso.texto}
                    </p>
                </div>

                {/* Footer: dots + navegación */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-dark-border transition-colors">
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                        {pasosActivos.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setRect(null); setIdx(i); }}
                                className={`rounded-full transition-all ${
                                    i === idx
                                        ? 'w-5 h-1.5 bg-brand-red dark:bg-brand-gold'
                                        : 'w-1.5 h-1.5 bg-slate-200 dark:bg-dark-surface-alt hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {!esPrimero ? (
                            <button
                                onClick={anterior}
                                className="flex items-center gap-1 px-3.5 py-2 bg-slate-100 dark:bg-dark-surface-alt hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-dark-text text-[10px] font-black uppercase rounded-xl transition-all"
                            >
                                <ChevronLeftIcon className="w-3.5 h-3.5" />
                                Anterior
                            </button>
                        ) : (
                            <button
                                onClick={cerrar}
                                className="px-3.5 py-2 text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text text-[10px] font-black uppercase rounded-xl transition-all"
                            >
                                Omitir
                            </button>
                        )}

                        <button
                            onClick={siguiente}
                            className="flex-1 flex items-center justify-center gap-1 px-3.5 py-2 bg-brand-red dark:bg-brand-gold hover:bg-brand-red-dark dark:hover:brightness-110 text-white dark:text-black text-[10px] font-black uppercase rounded-xl shadow-md shadow-brand-red/20 dark:shadow-brand-gold/20 transition-all active:scale-95"
                        >
                            {esUltimo ? '¡Entendido!' : 'Siguiente'}
                            {!esUltimo && <ChevronRightIcon className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TutorialCliente;