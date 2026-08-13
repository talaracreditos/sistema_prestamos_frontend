import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/asistencia`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page: page,
        search: filters.search || '',
        usuario: filters.usuario || '',
        fecha_desde: filters.fecha_desde || '',
        fecha_hasta: filters.fecha_hasta || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/index/?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const registrar = async ({ qr, usuario_id }) => {
    const response = await fetchWithAuth(`${BASE_URL}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qr ? { qr } : { usuario_id }),
    });
    return handleResponse(response);
};

export const justificar = async (asistenciaId, { justificada, motivo_justificacion }) => {
    const response = await fetchWithAuth(`${BASE_URL}/${asistenciaId}/justificar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justificada, motivo_justificacion }),
    });
    return handleResponse(response);
};

export const exportar = async (filters = {}) => {
    const params = new URLSearchParams({
        search: filters.search || '',
        usuario: filters.usuario || '',
        fecha_desde: filters.fecha_desde || '',
        fecha_hasta: filters.fecha_hasta || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/export/?${params.toString()}`, { method: 'GET' });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        const error = new Error(data?.message || 'No se pudo exportar la asistencia.');
        error.details = data?.error;
        error.status = response.status;
        throw error;
    }

    return response.blob();
};