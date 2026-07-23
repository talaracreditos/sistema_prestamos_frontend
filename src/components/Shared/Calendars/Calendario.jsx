import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Calendario mensual grid clásico.
 *
 * Props:
 *  - mode: 'single' (selección) | 'view' (solo visualización)
 *  - selected: 'YYYY-MM-DD' | null
 *  - onSelect: fn('YYYY-MM-DD')
 *  - feriados: [{fecha:'YYYY-MM-DD', descripcion:'...'}]
 */
const Calendario = ({ mode = 'single', selected, onSelect, feriados = [] }) => {
    const hoy = new Date();
    const [mes, setMes] = useState(() => {
        if (selected && typeof selected === 'string' && selected.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return new Date(selected + 'T12:00:00');
        }
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    });

    const anio     = mes.getFullYear();
    const mesIndex = mes.getMonth();

    // Primer día del mes (0=dom..6=sab), ajustado a lunes=0
    const primerDia = new Date(anio, mesIndex, 1);
    let offsetLunes = primerDia.getDay() - 1; // lunes=0
    if (offsetLunes < 0) offsetLunes = 6;     // domingo=6

    const diasEnMes = new Date(anio, mesIndex + 1, 0).getDate();

    // Construir grid de 6 semanas x 7 días
    const celdas = [];
    for (let i = 0; i < offsetLunes; i++) celdas.push(null);
    for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
    while (celdas.length % 7 !== 0) celdas.push(null);

    const feriadoMap = {};
    feriados.forEach(f => { feriadoMap[f.fecha] = f.descripcion; });

    const toISO = (d) => {
        const mm = String(mesIndex + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${anio}-${mm}-${dd}`;
    };

    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    const prevMes = () => setMes(new Date(anio, mesIndex - 1, 1));
    const nextMes = () => setMes(new Date(anio, mesIndex + 1, 1));

    const semanas = [];
    for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));

    return (
        <div style={styles.container}>
            {/* Cabecera mes + flechas */}
            <div style={styles.header}>
                <button onClick={prevMes} style={styles.navBtn}>
                    <ChevronLeftIcon style={{ width: 16, height: 16 }} type='button' />
                </button>
                <span style={styles.mesLabel}>{MESES[mesIndex]} {anio}</span>
                <button onClick={nextMes} style={styles.navBtn}>
                    <ChevronRightIcon style={{ width: 16, height: 16 }} type='button' />
                </button>
            </div>

            {/* Grid */}
            <div style={styles.grid}>
                {/* Cabecera días */}
                {DIAS_SEMANA.map((d, i) => (
                    <div key={d} style={{
                        ...styles.headerCell,
                        color: i === 6 ? '#ef4444' : '#94a3b8',
                    }}>
                        {d}
                    </div>
                ))}

                {/* Semanas */}
                {semanas.map((semana, si) =>
                    semana.map((dia, di) => {
                        if (!dia) return <div key={`e-${si}-${di}`} style={styles.emptyCell} />;

                        const iso       = toISO(dia);
                        const esFeriado = !!feriadoMap[iso];
                        const esHoy     = iso === `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
                        const esSel     = iso === selected;
                        const esDomingo = di === 6;
                        const esSelec   = mode === 'single' && !esDomingo && !esFeriado;

                        let cellStyle = { ...styles.cell };
                        if (esFeriado)  cellStyle = { ...cellStyle, ...styles.cellFeriado };
                        if (esHoy)      cellStyle = { ...cellStyle, ...styles.cellHoy };
                        if (esSel)      cellStyle = { ...cellStyle, ...styles.cellSelected };
                        if (esDomingo && !esFeriado) cellStyle = { ...cellStyle, ...styles.cellDomingo };

                        return (
                            <div
                                key={iso}
                                style={cellStyle}
                                title={esFeriado ? feriadoMap[iso] : ''}
                                onClick={() => esSelec && onSelect && onSelect(iso)}
                            >
                                <span style={styles.diaNum}>{dia}</span>
                                {esFeriado && (
                                    <span style={styles.feriadoDesc}>
                                        {feriadoMap[iso]}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: '#fff',
        borderRadius: 24,
        border: '1px solid #f1f5f9',
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12)',
        padding: '24px',
        userSelect: 'none',
        width: '100%',
        maxWidth: 720,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    mesLabel: {
        fontSize: 15,
        fontWeight: 900,
        letterSpacing: 2,
        color: '#1e293b',
        textTransform: 'uppercase',
    },
    navBtn: {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '6px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        color: '#64748b',
        transition: 'all 0.15s',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
    },
    headerCell: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 800,
        textTransform: 'uppercase',
        padding: '8px 0',
        letterSpacing: 1,
    },
    emptyCell: {
        minHeight: 64,
        borderRadius: 12,
        background: '#fafafa',
        border: '1px solid #f8fafc',
    },
    cell: {
        minHeight: 64,
        borderRadius: 12,
        border: '1px solid #f1f5f9',
        padding: '8px 6px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'all 0.15s',
        background: '#fff',
    },
    cellFeriado: {
        background: '#fff7ed',
        border: '1.5px solid #fed7aa',
        cursor: 'default',
    },
    cellHoy: {
        border: '2px solid #ef4444',
        background: '#fef2f2',
        boxShadow: '0 0 0 1px #ef4444',
    },
    cellSelected: {
        background: '#ef4444',
        border: '2px solid #dc2626',
        boxShadow: '0 8px 16px -4px rgba(239,68,68,0.4)',
    },
    cellDomingo: {
        opacity: 0.35,
        cursor: 'default',
    },
    diaNum: {
        fontSize: 13,
        fontWeight: 800,
        color: '#374151',
        lineHeight: 1,
    },
    feriadoDesc: {
        fontSize: 8,
        fontWeight: 700,
        color: '#ea580c',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        lineHeight: 1.2,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
};

export default Calendario;