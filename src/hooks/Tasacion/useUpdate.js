import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/tasacionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const round = (n) => Math.round(n * 100) / 100;
const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const KILATES_OPCIONES = ['18', '21', '24'];
const KILATE_DEFAULT = '18';

const vacioDetalle = () => ({
    tipo_joya: null,
    subtipo_joya: null,
    descripcion_detallada: '',
    peso_bruto: '',
    peso_incrustacion: '0',
    kilates: KILATE_DEFAULT,
});

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);

    const [porcentajePrestamo, setPorcentajePrestamo] = useState(70);
    const [precioOroGramo, setPrecioOroGramo] = useState('');
    const [cliente, setCliente] = useState(null);
    const [fechaTasacion, setFechaTasacion] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [detalleActual, setDetalleActual] = useState(vacioDetalle());
    const [editandoId, setEditandoId] = useState(null);
    const [montoAnteriorEdicion, setMontoAnteriorEdicion] = useState(null);
    const [showCancelarModal, setShowCancelarModal] = useState(false);

    const [camposLimitados, setCamposLimitados] = useState(false);

    // ── Cargar tasación existente ────────────────────────────────────────────
    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const response = await show(id);
                const data = response.data || response;

                if (data.estado === 3) {
                    setAlert({ type: 'error', message: 'Esta tasación ya fue convertida en préstamo y no se puede editar.' });
                    setLoading(false);
                    return;
                }

                setFechaTasacion(data.fecha_tasacion);
                setPorcentajePrestamo(data.porcentaje_prestamo_aplicado ?? 70);
                setPrecioOroGramo(data.precio_oro_gramo_aplicado ?? '');

                setCliente(data.cliente ? {
                    id: data.cliente.id,
                    nombre_completo: data.cliente.nombre_completo,
                    documento: data.cliente.documento,
                } : null);

                setDetalles((data.detalles || []).map(d => ({
                    id: d.id,
                    tipo_joya: d.tipo_joya ? { id: d.tipo_joya.id, descripcion: d.tipo_joya.descripcion } : null,
                    subtipo_joya: d.subtipo_joya ? { id: d.subtipo_joya.id, descripcion: d.subtipo_joya.descripcion } : null,
                    descripcion_detallada: d.descripcion_detallada || '',
                    peso_bruto: d.peso_bruto,
                    peso_incrustacion: d.peso_incrustacion,
                    peso_neto: d.peso_neto,
                    kilates: d.kilates || KILATE_DEFAULT,
                    valor_tasado: d.valor_tasado,
                    maximo_prestar: d.maximo_prestar,
                })));
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la tasación.'));
            } finally {
                setLoading(false);
            }
        };
        if (id) cargar();
    }, [id]);

    // ── Cliente ──────────────────────────────────────────────────────────────
    const handleSeleccionarCliente = (clienteSeleccionado) => {
        setCliente(clienteSeleccionado);
    };

    const handleCambiarCliente = () => {
        setCliente(null);
        setDetalles([]);
    };

    const handleCancelarEdicionTasacion = () => {
        setShowCancelarModal(false);
        navigate('/tasacion/listar');
    };

    // ── Cálculo automático de la joya en edición ────────────────────────────
    // El precio ingresado (S/ por gramo) YA corresponde al kilataje seleccionado.
    // El kilataje NO debe volver a aplicar ninguna conversión sobre ese precio.
    const pesoBrutoNum      = parseFloat(detalleActual.peso_bruto) || 0;
    const pesoIncrustNum    = parseFloat(detalleActual.peso_incrustacion) || 0;
    const pesoNeto           = Math.max(0, round(pesoBrutoNum - pesoIncrustNum));
    const porcentajeNum       = parseFloat(porcentajePrestamo) || 0;
    const precioOroGramoNum   = parseFloat(precioOroGramo) || 0;

    const valorTasadoNum = useMemo(
        () => round(pesoNeto * precioOroGramoNum),
        [pesoNeto, precioOroGramoNum]
    );

    const maximoSugerido = useMemo(
        () => round(valorTasadoNum * (porcentajeNum / 100)),
        [valorTasadoNum, porcentajeNum]
    );

    const handleAgregarDetalle = () => {
        if (precioOroGramoNum <= 0) {
            setAlert({ type: 'error', message: 'Debes ingresar el precio del oro por gramo para poder tasar.' });
            return;
        }
        if (!detalleActual.tipo_joya || !detalleActual.subtipo_joya) {
            setAlert({ type: 'error', message: 'Selecciona tipo y subtipo de joya.' });
            return;
        }
        if (!detalleActual.kilates) {
            setAlert({ type: 'error', message: 'Selecciona el kilataje de la joya.' });
            return;
        }
        if (pesoBrutoNum <= 0) {
            setAlert({ type: 'error', message: 'El peso bruto debe ser mayor a 0.' });
            return;
        }

        const detalleCalculado = {
            ...detalleActual,
            peso_neto: pesoNeto,
            valor_tasado: valorTasadoNum,
            maximo_prestar: maximoSugerido,
        };

        if (editandoId) {
            setDetalles(prev => prev.map(d => d.id === editandoId
                ? { ...detalleCalculado, id: editandoId }
                : d
            ));
            setEditandoId(null);
            setMontoAnteriorEdicion(null);
            setCamposLimitados(false);
            setAlert({ type: 'success', message: 'Joya actualizada.' });
        } else {
            setDetalles(prev => [...prev, {
                ...detalleCalculado,
                id: `nueva-${Date.now()}`,
            }]);
            setAlert(null);
        }

        setDetalleActual(vacioDetalle());
    };

    const handleEditarDetalle = (detalle) => {
        const esExistente = typeof detalle.id === 'number';

        setDetalleActual({
            tipo_joya: detalle.tipo_joya,
            subtipo_joya: detalle.subtipo_joya,
            descripcion_detallada: detalle.descripcion_detallada,
            peso_bruto: detalle.peso_bruto,
            peso_incrustacion: detalle.peso_incrustacion,
            kilates: detalle.kilates || KILATE_DEFAULT,
        });
        setEditandoId(detalle.id);
        setMontoAnteriorEdicion(parseFloat(detalle.maximo_prestar) || 0);
        setCamposLimitados(esExistente);
        setAlert(null);
    };

    const handleCancelarEdicion = () => {
        setDetalleActual(vacioDetalle());
        setEditandoId(null);
        setMontoAnteriorEdicion(null);
        setCamposLimitados(false);
    };

    const handleEliminarDetalle = (id) => {
        setDetalles(prev => prev.filter(d => d.id !== id));
        if (editandoId === id) handleCancelarEdicion();
    };

    // ── Totales ───────────────────────────────────────────────────────────────
    const totalTasacion = round(detalles.reduce((acc, d) => acc + parseFloat(d.valor_tasado || 0), 0));
    const totalMaximoPrestar = round(detalles.reduce((acc, d) => acc + parseFloat(d.maximo_prestar || 0), 0));

    const formularioTieneDatos = !!(
        detalleActual.tipo_joya || detalleActual.subtipo_joya ||
        detalleActual.descripcion_detallada || detalleActual.peso_bruto ||
        (detalleActual.peso_incrustacion && detalleActual.peso_incrustacion !== '0') ||
        (detalleActual.kilates && detalleActual.kilates !== KILATE_DEFAULT)
    );

    // ── Guardar cambios ──────────────────────────────────────────────────────
    const handleGuardarCambios = async () => {
        if (editandoId) {
            setAlert({ type: 'error', message: 'Termina o cancela la edición de la joya antes de guardar.' });
            return;
        }
        if (!cliente) {
            setAlert({ type: 'error', message: 'Debes seleccionar un cliente.' });
            return;
        }
        if (precioOroGramoNum <= 0) {
            setAlert({ type: 'error', message: 'Debes ingresar el precio del oro por gramo.' });
            return;
        }
        if (detalles.length === 0) {
            setAlert({ type: 'error', message: 'Agrega al menos una joya a la tasación.' });
            return;
        }

        const payload = {
            cliente_id: cliente.id,
            fecha_tasacion: fechaTasacion,
            porcentaje_prestamo_aplicado: porcentajeNum,
            precio_oro_gramo_aplicado: precioOroGramoNum,
            total_tasacion: totalTasacion,
            total_maximo_prestar: totalMaximoPrestar,
            detalles: detalles.map(d => ({
                tipo_joya_id: d.tipo_joya?.id,
                subtipo_joya_id: d.subtipo_joya?.id,
                descripcion_detallada: d.descripcion_detallada,
                peso_bruto: d.peso_bruto,
                peso_incrustacion: d.peso_incrustacion,
                peso_neto: d.peso_neto,
                kilates: d.kilates,
                valor_tasado: d.valor_tasado,
                maximo_prestar: d.maximo_prestar,
            })),
        };

        setAlert(null);
        setGuardando(true);
        try {
            await update(id, payload);
            setAlert({ type: 'success', message: `Tasación actualizada exitosamente. Total máx. a prestar: S/ ${fmt(totalMaximoPrestar)}. Redirigiendo...` });
            setTimeout(() => navigate('/tasacion/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar la tasación.'));
        } finally {
            setGuardando(false);
        }
    };

    return {
        loading,

        cliente, handleSeleccionarCliente, handleCambiarCliente,

        detalles, detalleActual, setDetalleActual, editandoId, montoAnteriorEdicion,
        pesoNeto, valorTasadoNum, porcentajeNum, maximoSugerido, formularioTieneDatos,
        handleAgregarDetalle, handleEditarDetalle, handleCancelarEdicion, handleEliminarDetalle,

        porcentajePrestamo, setPorcentajePrestamo,
        precioOroGramo, setPrecioOroGramo,

        camposLimitados,
        kilatesOpciones: KILATES_OPCIONES,

        totalTasacion, totalMaximoPrestar, handleGuardarCambios, guardando,
        showCancelarModal, setShowCancelarModal, handleCancelarEdicionTasacion,

        alert, setAlert,
    };
};