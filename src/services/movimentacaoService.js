import api from './api';

const movimentacaoService = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limite) params.append('limite', filtros.limite);
    
    const response = await api.get(`/movimentacoes?${params.toString()}`);
    return response.data;
  },
  
  buscar: async (id) => {
    const response = await api.get(`/movimentacoes/${id}`);
    return response.data;
  },
  
  cadastrar: async (movimentacao) => {
    const response = await api.post('/movimentacoes', movimentacao);
    return response.data;
  },
  
  atualizar: async (id, movimentacao) => {
    const response = await api.put(`/movimentacoes/${id}`, movimentacao);
    return response.data;
  },
  
  excluir: async (id) => {
    const response = await api.delete(`/movimentacoes/${id}`);
    return response.data;
  }
};

export default movimentacaoService;