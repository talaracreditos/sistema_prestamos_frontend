import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/caja-chica-sesiones`;

// 1. Listar todas las sesiones (Historial)
export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page: page,
        estado: filters.estado || '',
        fecha: filters.fecha || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

// 2. Ver el detalle de una sesión (con sus movimientos)
export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

// 3. Verificar si el usuario logueado tiene una caja chica abierta
export const getMiSesion = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/mi-sesion`, { method: 'GET' });
    return handleResponse(response);
};

// 4. Abrir un nuevo turno de caja chica
export const abrirCaja = async (data) => {
    const response = await fetchWithAuth(`${BASE_URL}/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

// 5. Cerrar el turno de caja chica
export const cerrarCaja = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/${id}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};