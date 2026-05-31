import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/pagos`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page,
        search:       filters.search       || '',
        prestamo_id:  filters.prestamo_id  || '',
        cliente:      filters.cliente      || '',
        estado:       filters.estado       ?? '',
        fecha_inicio: filters.fecha_inicio || '',
        fecha_fin:    filters.fecha_fin    || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const pdf = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/${id}/pdf`, { method: 'GET' });
    return handleResponse(response);
};

export const destroy = async (id, pin) => {
    const response = await fetchWithAuth(`${BASE_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
    });
    return handleResponse(response);
};