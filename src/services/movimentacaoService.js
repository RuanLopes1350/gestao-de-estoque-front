import api from './api';

const movimentacaoService = {
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.produtoId) params.append('produtoId', filtros.produtoId);
      if (filtros.responsavelId) params.append('responsavelId', filtros.responsavelId);
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limite) params.append('limite', filtros.limite);
      
      console.log('Fazendo requisição para movimentações com parâmetros:', params.toString());
      
      try {
        const response = await api.get(`/movimentacoes?${params.toString()}`);
        
        // Processar resposta para garantir formato consistente
        let result = {
          docs: [],
          totalPages: 1,
          page: filtros.page || 1,
          total: 0
        };
        
        // Estrutura nested com data.docs
        if (response.data && response.data.data && Array.isArray(response.data.data.docs)) {
          result = {
            docs: response.data.data.docs,
            totalPages: response.data.data.totalPages || Math.ceil(response.data.data.total / filtros.limite) || 1,
            page: response.data.data.page || filtros.page || 1,
            total: response.data.data.total || response.data.data.docs.length
          };
        }
        // Estrutura com apenas response.data.docs
        else if (response.data && Array.isArray(response.data.docs)) {
          result = {
            docs: response.data.docs,
            totalPages: response.data.totalPages || Math.ceil(response.data.total / filtros.limite) || 1,
            page: response.data.page || filtros.page || 1,
            total: response.data.total || response.data.docs.length
          };
        }
        // Array simples
        else if (response.data && Array.isArray(response.data)) {
          result = {
            docs: response.data,
            totalPages: Math.ceil(response.data.length / (filtros.limite || 10)) || 1,
            page: filtros.page || 1,
            total: response.data.length
          };
        }
        // Último caso: se temos uma estrutura aninhada com data
        else if (response.data && response.data.data) {
          const movimentacoes = Array.isArray(response.data.data) 
            ? response.data.data 
            : [];
          
          result = {
            docs: movimentacoes,
            totalPages: Math.ceil(movimentacoes.length / (filtros.limite || 10)) || 1,
            page: filtros.page || 1,
            total: movimentacoes.length
          };
        }
        
        // Normalizar os dados para garantir que os objetos relacionados existem
        result.docs = result.docs.map(mov => ({
          _id: mov._id,
          data: mov.data || mov.data_movimentacao || new Date().toISOString(),
          tipo: mov.tipo || 'ENTRADA',
          quantidade: mov.quantidade || 0,
          produto: mov.produto || { nome: 'Produto não disponível', codigo: 'N/A' },
          responsavel: mov.responsavel || { nome: 'Usuário não disponível' },
          observacao: mov.observacao || ''
        }));
        
        return result;
        
      } catch (apiError) {
        console.error('Erro na API de movimentações:', apiError);
        
        // Solução temporária: retornar estrutura vazia até o backend ser corrigido
        return {
          docs: [],
          totalPages: 1,
          page: filtros.page || 1,
          total: 0,
          error: apiError.message || 'Erro ao buscar movimentações'
        };
      }
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      throw error;
    }
  },
  
  buscar: async (id) => {
    try {
      const response = await api.get(`/movimentacoes/${id}`);
      
      // Verificar diferentes respostas possíveis da API
      const movimentacao = response.data.data || response.data;
      
      // Garantir que todos os relacionamentos existam
      return {
        ...movimentacao,
        produto: movimentacao.produto || { nome: 'Produto não disponível', codigo: 'N/A' },
        responsavel: movimentacao.responsavel || { nome: 'Usuário não disponível' }
      };
    } catch (error) {
      console.error('Erro ao buscar movimentação:', error);
      throw error;
    }
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