import axios from 'axios';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011';

console.log('API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptador para logging e debug
api.interceptors.request.use(
  (config) => {
    console.log(`Requisição: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptador de resposta para verificar erros
api.interceptors.response.use(
  (response) => {
    console.log(`Resposta recebida: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error.response?.data || error);
    return Promise.reject(error);
  }
);

export default api;