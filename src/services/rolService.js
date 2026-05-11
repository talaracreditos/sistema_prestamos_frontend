import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/rol`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, search: filters.search || '' });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const combobox = async (page = 1, filters = {}, incluirCliente = false) => {
    const params = new URLSearchParams({ page, search: filters.search || '' });
    if (incluirCliente) params.append('incluir_cliente', 'true');
    const response = await fetchWithAuth(`${BASE_URL}/combobox?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const updatePermisos = async (id, permisosIds) => {
    const response = await fetchWithAuth(`${BASE_URL}/updatePermission/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permisos: permisosIds }),
    });
    return handleResponse(response);
};