import { useState, useEffect, useCallback, useMemo } from 'react';
import peruData from 'utilities/data/peruData';
import { onlyLetters, onlyNumbers } from 'utilities/Validations/validations';

export const useSolicitudForm = (data, handleChange, opciones = {}) => {
    const {
        esRenovacion       = false,
        prestamoOrigen     = null,
        comboKey           = null,
        onToggleRenovacion = null,
        onSelectPrestamo   = null,
        onLimpiarOrigen    = null,
    } = opciones;

    const esRenovacionActiva         = esRenovacion && !!prestamoOrigen;
    const formBloqueadoPorRenovacion = esRenovacion && !prestamoOrigen;

    // ── IDs del préstamo origen (para excluirlos del bloqueo de riesgo) ───────
    const idsOrigenSet = useMemo(() => {
        if (!prestamoOrigen?.integrantes) return new Set();
        return new Set(prestamoOrigen.integrantes.map(i => i.id));
    }, [prestamoOrigen]);

    // ── Bloqueos riesgo/DNI ───────────────────────────────────────────────────
    const dniPrincipalVencido  = data.dni_status?.estado === 'VENCIDO';
    const dniIntegranteVencido = data.es_grupal && data.integrantes?.some(i => i.dni_status?.estado === 'VENCIDO');

    const principalBloqueadoPorRiesgo = !esRenovacionActiva && data.es_grupal &&
        data.modalidad?.includes('GRUPAL') &&
        (data.modalidad?.includes('VIGENTE') || data.modalidad?.includes('RCS'));

    // Solo bloquea integrantes NUEVOS (no pertenecen al préstamo origen)
    const integranteBloqueadoPorRiesgo = data.es_grupal &&
        data.integrantes?.some(i =>
            i.modalidad?.includes('GRUPAL') &&
            (i.modalidad?.includes('VIGENTE') || i.modalidad?.includes('RCS')) &&
            !idsOrigenSet.has(i.id)
        );

    const isMainBlocked        = dniPrincipalVencido || principalBloqueadoPorRiesgo;
    const hasBlockedIntegrante = dniIntegranteVencido || integranteBloqueadoPorRiesgo;
    const isBlocked            = isMainBlocked || hasBlockedIntegrante;

    const bloqueado = isBlocked || formBloqueadoPorRenovacion;

    // ── Descuento informativo ─────────────────────────────────────────────────
    const calcularDescuento = useCallback(() => {
        if (!prestamoOrigen) return 0;
        if (!prestamoOrigen.es_grupal) return prestamoOrigen.saldo_pendiente ?? 0;
        return (prestamoOrigen.integrantes ?? [])
            .filter(i => data.integrantes?.find(fi => fi.id === i.id))
            .reduce((acc, i) => acc + (i.saldo_pendiente ?? 0), 0);
    }, [prestamoOrigen, data.integrantes]);

    // ── Aval ──────────────────────────────────────────────────────────────────
    const [tieneAval,  setTieneAval]  = useState(!!data.aval);
    const [provincias, setProvincias] = useState([]);
    const [distritos,  setDistritos]  = useState([]);

    const handleAvalInputChange = (field, value, type, limit) => {
        if (bloqueado) return;
        const validated = type === 'numeric'
            ? onlyNumbers(value, limit)
            : type === 'letters' ? onlyLetters(value) : value;
        handleChange(`aval.${field}`, validated);
    };

    const handleToggleAval = (e) => {
        if (bloqueado) return;
        const checked = e.target.checked;
        setTieneAval(checked);
        handleChange('aval', checked ? {
            dni_aval: '', nombres_aval: '', apellido_paterno_aval: '',
            apellido_materno_aval: '', telefono_movil_aval: '', direccion_aval: '',
            relacion_cliente_aval: '', departamento_aval: '', provincia_aval: '', distrito_aval: ''
        } : null);
    };

    useEffect(() => {
        const dep = data.aval?.departamento_aval;
        setProvincias(dep && peruData[dep] ? Object.keys(peruData[dep]) : []);
    }, [data.aval?.departamento_aval]);

    useEffect(() => {
        const dep  = data.aval?.departamento_aval;
        const prov = data.aval?.provincia_aval;
        setDistritos(dep && prov && peruData[dep]?.[prov] ? peruData[dep][prov] : []);
    }, [data.aval?.provincia_aval, data.aval?.departamento_aval]);

    return {
        // renovación
        esRenovacion,
        esRenovacionActiva,
        formBloqueadoPorRenovacion,
        prestamoOrigen,
        comboKey,
        descuento: calcularDescuento(),
        onToggleRenovacion,
        onSelectPrestamo,
        onLimpiarOrigen,
        // bloqueos
        bloqueado,
        isBlocked,
        isMainBlocked,
        hasBlockedIntegrante,
        // aval
        avalConfig: { tieneAval, handleToggleAval, handleAvalInputChange, provincias, distritos },
    };
};