import api from './api';

const usuarioService = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limite) params.append('limite', filtros.limite);
    
    const response = await api.get(`/usuarios?${params.toString()}`);
    return response.data;
  },
  
  buscar: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  
  cadastrar: async (usuario) => {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },
  
  atualizar: async (id, usuario) => {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },
  
  excluir: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};

export default usuarioService;