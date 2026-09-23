import { useState, useEffect } from 'react';

const round2 = (n) => Math.round((parseFloat(n) || 0) * 100) / 100;
const money  = (n) => round2(n).toFixed(2);

export const usePagoCuota = ({ isOpen, cuota, onClose, onConfirm }) => {
    const [metodo,       setMetodo]       = useState('DEPOSITO');
    const [recibido,     setRecibido]     = useState('');
    const [referencia,   setReferencia]   = useState('');
    const [archivo,      setArchivo]      = useState(null);
    const [preview,      setPreview]      = useState(null);
    const [esParcial,    setEsParcial]    = useState(false);
    const [distribucion, setDistribucion] = useState({});
    const [alertLocal,   setAlertLocal]   = useState(null);
    const [tieneComision, setTieneComision] = useState(false);
    const [comision,      setComision]      = useState('');

    // Prendario: 'abono' | 'patear' | 'cancelar'
    const [modoPrendario, setModoPrendario] = useState('abono');

    const esPrendario = !!(cuota?.es_prendario);

    // Liquidación a la fecha de corte, resuelta por el backend (show.php →
    // PrendarioCalculoService::liquidacionHoy). El frontend NUNCA calcula
    // intereses: solo muestra y valida rangos con lo que manda el backend.
    const liquidacion = esPrendario ? (cuota?.liquidacion_hoy ?? null) : null;
    const liqModo     = liquidacion?.modos?.[modoPrendario] ?? null;

    const [pinRequerido, setPinRequerido] = useState(false);
    const [pinContexto,  setPinContexto]  = useState(null);
    const [pin,          setPin]          = useState('');
    const [pinError,     setPinError]     = useState(null);

    const esGrupal               = !!(cuota?.es_grupal);
    const integrantesPendientes  = cuota?.integrantes?.filter(i => ![2, 6].includes(i.estado)) ?? [];
    const soloUnIntegrante       = esGrupal && integrantesPendientes.length === 1;
    const pinAnticipado          = !!cuota?.requierePinAnticipado;

    const mora = (esPrendario && liqModo)
        ? parseFloat(liqModo.mora ?? 0)
        : parseFloat(cuota?.mora ?? 0);

    const excedenteIndividual = !esGrupal ? parseFloat(cuota?.excedente_anterior ?? 0) : 0;

    /* Total de la deuda A HOY:
       - Prendario → cancelacion_total del modo elegido (capital + todo lo devengado
         según el modo, menos crédito a favor).
       - Grupal → habilitados_saldo (como antes).
       - Resto → saldo_pendiente / saldo (como antes). */
    const totalAPagar = (esPrendario && liqModo)
        ? money(liqModo.cancelacion_total)
        : parseFloat(cuota?.saldo_pendiente ?? cuota?.saldo ?? 0).toFixed(2);

    // ── Monto sugerido al abrir / cambiar de modo (prendario) ─────────────────
    // abono    → lo devengado a hoy (cargos), editable
    // patear   → el mínimo obligatorio, editable hacia arriba
    // cancelar → el total, bloqueado
    const montoInicial = (() => {
        if (esPrendario && liqModo) {
            if (modoPrendario === 'abono') {
                return liqModo.cargos > 0 ? money(liqModo.cargos) : '';
            }
            return money(liqModo.minimo);
        }
        return totalAPagar;
    })();

    // ── Validaciones ──────────────────────────────────────────────────────────
    const integrantesSinCubrirMora = (esGrupal && esParcial)
        ? integrantesPendientes.filter(int => {
            const moraPend = parseFloat(int.mora_pendiente ?? 0);
            if (moraPend <= 0) return false;
            const val = distribucion[int.id];
            if (!val || val === '' || parseFloat(val) === 0) return false;
            return parseFloat(val) < moraPend;
        }) : [];

    const montoNum    = parseFloat(recibido || 0);
    const noCubreMora = !esGrupal && mora > 0 && montoNum > 0 && montoNum < mora;

    const montoMinimo = (esPrendario && liqModo) ? round2(liqModo.minimo) : null;
    const montoMaximo = (esPrendario && liqModo) ? round2(liqModo.maximo) : null;

    // En 'cancelar' el monto va bloqueado y lo fija el backend.
    const montoBloqueado = esGrupal || (esPrendario && modoPrendario === 'cancelar');

    const errorMontoPrendario = (() => {
        if (!esPrendario || !liqModo || modoPrendario === 'cancelar') return null;
        if (!(montoNum > 0)) return 'Ingresa el monto a pagar.';
        if (montoNum + 0.005 < montoMinimo) {
            return modoPrendario === 'patear'
                ? `Para patear debes cubrir todo lo devengado a hoy: mínimo S/ ${money(montoMinimo)}.`
                : `El monto mínimo es S/ ${money(montoMinimo)}.`;
        }
        if (montoNum - 0.005 > montoMaximo) {
            return `El monto supera la deuda a hoy (S/ ${money(montoMaximo)}).`;
        }
        return null;
    })();

    // Capital que pasaría al período nuevo si patea (solo informativo).
    const capitalRemanentePreview = (esPrendario && liqModo && modoPrendario === 'patear')
        ? Math.max(0, round2(liqModo.capital - Math.max(0, round2(montoNum + liqModo.credito - liqModo.cargos))))
        : null;

    const comisionNum    = tieneComision ? parseFloat(comision || 0) : 0;
    const comisionValida = !tieneComision || (comisionNum > 0);

    const validacionMetodo = metodo === 'DEPOSITO'
        ? !!referencia?.trim() && !!archivo
        : true;

    const pinCompleto = pin.length === 6;
    const pinValido    = !pinRequerido || pinCompleto;

    const puedeSubmit = !noCubreMora
        && integrantesSinCubrirMora.length === 0
        && !errorMontoPrendario
        && validacionMetodo
        && comisionValida
        && pinValido;

    // ── Efectos ───────────────────────────────────────────────────────────────
    // Reset SOLO al abrir. No depende de los totales: en prendario el total cambia
    // al cambiar de modo y no debe borrar método, referencia, archivo ni el modo.
    useEffect(() => {
        if (isOpen) {
            setMetodo('DEPOSITO');
            setReferencia('');
            setArchivo(null);
            setPreview(null);
            setEsParcial(soloUnIntegrante);
            setDistribucion({});
            setAlertLocal(null);
            setTieneComision(false);
            setComision('');
            setPinRequerido(pinAnticipado);
            setPinContexto(null);
            setPin('');
            setPinError(null);
            setModoPrendario('abono');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, soloUnIntegrante, pinAnticipado]);

    // Monto: se precarga al abrir y se vuelve a precargar al cambiar de modo.
    useEffect(() => {
        if (isOpen) setRecibido(montoInicial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, montoInicial]);

    const calcularTotalDistribuido = () => {
        if (integrantesPendientes.length === 0) return parseFloat(totalAPagar);
        const todosEnFull = integrantesPendientes.every(int => !distribucion[int.id] || distribucion[int.id] === '');
        if (todosEnFull) return parseFloat(totalAPagar);
        return integrantesPendientes.reduce((acc, int) => {
            const val        = distribucion[int.id];
            const esCompleto = !val || val === '';
            return acc + (esCompleto ? parseFloat(int.saldo ?? 0) : parseFloat(val || 0));
        }, 0);
    };

    const totalDistribuido = calcularTotalDistribuido();

    useEffect(() => {
        if (esGrupal && esParcial)  setRecibido(totalDistribuido.toFixed(2));
    }, [totalDistribuido, esGrupal, esParcial]);

    useEffect(() => {
        if (esGrupal && !esParcial) setRecibido(totalAPagar);
    }, [esParcial, esGrupal, totalAPagar]);

    // ── Handlers generales ────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) { setArchivo(f); setPreview(URL.createObjectURL(f)); }
    };

    const handleMontoIntegrante = (id, valor) => {
        const sanitized = valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        setDistribucion(prev => ({ ...prev, [id]: sanitized }));
    };

    const reset = () => {
        setArchivo(null);
        setPreview(null);
        setPinRequerido(false);
        setPinContexto(null);
        setPin('');
        setPinError(null);
        onClose();
    };

    const handlePinChange = (valor) => {
        setPin(valor.replace(/\D/g, '').slice(0, 6));
        if (pinError) setPinError(null);
    };

    const handleRequierePin = (contexto, mensaje) => {
        setPinContexto(contexto);
        setPinRequerido(true);
        setPinError(pin ? (mensaje || 'PIN incorrecto o inválido.') : null);
        setAlertLocal(null);
    };

    const buildFormData = () => {
        const formData = new FormData();
        formData.append('cuota_id',        cuota.id);
        formData.append('metodo_pago',     metodo);
        formData.append('monto_recibido',  recibido);
        formData.append('numero_operacion', referencia);
        if (archivo) formData.append('comprobante', archivo);

        if (tieneComision && comisionNum > 0) {
            formData.append('comision', comisionNum.toFixed(2));
        }
        if (pinRequerido && pinCompleto) {
            formData.append('pin', pin);
        }

        // Prendario: el backend decide el monto de 'cancelar' y valida el rango
        // de 'abono' / 'patear' contra su propia liquidación. Aquí solo va el modo.
        if (esPrendario) {
            formData.append('modo_prendario', modoPrendario);
        }

        if (esGrupal && (esParcial || soloUnIntegrante)) {
            formData.append('es_parcial_grupal', '1');
            formData.append('distribucion', JSON.stringify(
                integrantesPendientes.map(int => ({
                    cliente_id:    int.id,
                    cuota_id:      cuota.id,
                    total_cuota:   parseFloat(int.saldo_capital ?? int.saldo ?? 0),
                    monto:         parseFloat(distribucion[int.id] || 0),
                    pago_completo: !distribucion[int.id] || distribucion[int.id] === '',
                }))
            ));
        }

        return formData;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = buildFormData();

        setAlertLocal(null);
        onConfirm(formData, { setAlertLocal, onRequierePin: handleRequierePin });
    };

    return {
        state: {
            metodo, recibido, referencia, archivo, preview,
            esParcial, distribucion, alertLocal,
            tieneComision, comision,
            pinRequerido, pinContexto, pin, pinError, pinCompleto, modoPrendario
        },
        setters: {
            setMetodo, setRecibido, setReferencia, setEsParcial, setAlertLocal,
            setArchivo, setPreview, setTieneComision, setComision, setModoPrendario
        },
        computed: {
            esGrupal, integrantesPendientes, soloUnIntegrante,
            totalAPagar, mora, excedenteIndividual,
            integrantesSinCubrirMora, noCubreMora,
            puedeSubmit, totalDistribuido, comisionNum, esPrendario,
            liquidacion, liqModo,
            montoMinimo, montoMaximo, montoBloqueado,
            errorMontoPrendario, capitalRemanentePreview,
        },
        handlers: {
            handleFileChange, handleMontoIntegrante, reset, handleSubmit, handlePinChange,
        },
    };
};