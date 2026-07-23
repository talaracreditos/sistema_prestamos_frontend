import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/feriados`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page });
    if (filters.search) params.append('search', filters.search);
    if (filters.anio)   params.append('anio',   filters.anio);
    if (filters.dia !== undefined && filters.dia !== '') params.append('dia', filters.dia);

    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

/**
 * Trae TODOS los feriados sin paginar. Úsalo solo para marcar días en
 * <Calendario />. Para la tabla del listado sigue usando `index()`.
 */
export const calendario = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/calendario`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const store = async (data) => {
    const response = await fetchWithAuth(`${BASE_URL}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const update = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const destroy = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/delete/${id}`, { method: 'DELETE' });
    return handleResponse(response);
};