import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/ciiu`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, search: filters.search || '' });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const combobox = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetchWithAuth(`${BASE_URL}/combobox?${params.toString()}`, { method: 'GET' });
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