import api from './api';

const relatorioService = {
  estoque: async () => {
    const response = await api.get('/relatorios/estoque');
    return response.data;
  },
  
  movimentacoes: async (filtros = {}) => {
    const params = new URLSearchParams();
    
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    
    const response = await api.get(`/relatorios/movimentacoes?${params.toString()}`);
    return response.data;
  },
  
  produtosPopulares: async () => {
    const response = await api.get('/relatorios/produtos-populares');
    return response.data;
  }
};

export default relatorioService;