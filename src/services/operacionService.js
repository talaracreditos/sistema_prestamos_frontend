import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/operacion-caja`;

export const desembolsar = async (formData) => {
    const response = await fetchWithAuth(`${BASE_URL}/desembolsar`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse(response);
};

export const cobrarCuota = async (formData) => {
    const response = await fetchWithAuth(`${BASE_URL}/cobrar`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse(response);
};
