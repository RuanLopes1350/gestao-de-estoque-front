import axios from 'axios';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptador para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@GestaoEstoque:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Requisição: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
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
    console.log(`Resposta recebida: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error.response?.data || error);
    return Promise.reject(error);
  }
);

export default api;