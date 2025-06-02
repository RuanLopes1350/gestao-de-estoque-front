import api from './api';

const produtoService = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.nome) params.append('nome_produto', filtros.nome);
    if (filtros.codigo) params.append('codigo_produto', filtros.codigo);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    // Convertendo explicitamente para string
    if (filtros.page) params.append('page', String(filtros.page));
    if (filtros.limite) params.append('limite', String(filtros.limite));

    try {
      console.log(`Fazendo requisição com parâmetros: ${params.toString()}`);
      const response = await api.get(`/produtos?${params.toString()}`);
      console.log('Resposta da API:', response.data);
      
      let produtos = [];
      let totalPages = 1;
      let total = 0;
      
      // Verificar diferentes estruturas possíveis da API
      if (response.data && response.data.data && Array.isArray(response.data.data.docs)) {
        // Estrutura nested com data.docs
        produtos = response.data.data.docs.map(produto => ({
          _id: produto._id,
          nome: produto.nome_produto,
          codigo: produto.codigo_produto,
          descricao: produto.descricao,
          preco: produto.preco,
          quantidade: produto.estoque,
          categoria: produto.categoria,
          fabricante: produto.marca,
          estoqueMinimo: produto.estoque_min,
          dataValidade: produto.data_validade,
          status: produto.status
        }));
        total = response.data.data.total || produtos.length;
        totalPages = response.data.data.totalPages || Math.ceil(total / filtros.limite) || 1;
      } else if (response.data && Array.isArray(response.data.docs)) {
        // Estrutura com apenas response.data.docs
        produtos = response.data.docs.map(produto => ({
          _id: produto._id,
          nome: produto.nome_produto,
          codigo: produto.codigo_produto,
          descricao: produto.descricao,
          preco: produto.preco,
          quantidade: produto.estoque,
          categoria: produto.categoria,
          fabricante: produto.marca,
          estoqueMinimo: produto.estoque_min,
          dataValidade: produto.data_validade,
          status: produto.status
        }));
        total = response.data.total || produtos.length;
        totalPages = response.data.totalPages || Math.ceil(total / filtros.limite) || 1;
      } else if (response.data && Array.isArray(response.data)) {
        // Array simples
        produtos = response.data.map(produto => ({
          _id: produto._id,
          nome: produto.nome_produto || produto.nome,
          codigo: produto.codigo_produto || produto.codigo,
          descricao: produto.descricao,
          preco: produto.preco,
          quantidade: produto.estoque || produto.quantidade,
          categoria: produto.categoria,
          fabricante: produto.marca || produto.fabricante,
          estoqueMinimo: produto.estoque_min,
          dataValidade: produto.data_validade,
          status: produto.status !== undefined ? produto.status : true
        }));
        
        // Se a API retorna só um array, vamos verificar se há headers com informações de paginação
        const totalCountHeader = response.headers['x-total-count'] || response.headers['total-count'];
        total = totalCountHeader ? parseInt(totalCountHeader) : produtos.length;
        totalPages = response.headers['x-total-pages'] || Math.ceil(total / filtros.limite) || 1;
      }

      console.log(`Produtos processados: ${produtos.length}, Total de páginas: ${totalPages}`);
      
      return {
        docs: produtos,
        totalPages: parseInt(totalPages),
        page: parseInt(filtros.page || 1),
        total: total
      };
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      throw error;
    }
  },

  buscar: async (id) => {
    try {
      const response = await api.get(`/produtos/${id}`);
      
      // Suportar diferentes estruturas de resposta
      const produto = response.data.data || response.data;

      return {
        _id: produto._id,
        nome: produto.nome_produto || produto.nome,
        codigo: produto.codigo_produto || produto.codigo,
        descricao: produto.descricao,
        preco: produto.preco,
        quantidade: produto.estoque || produto.quantidade,
        categoria: produto.categoria,
        fabricante: produto.marca || produto.fabricante,
        estoqueMinimo: produto.estoque_min || produto.estoqueMinimo,
        dataValidade: produto.data_validade || produto.dataValidade,
        status: produto.status
      };
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      throw error;
    }
  },

  cadastrar: async (produto) => {
    // Mapear do formato do frontend para o formato da API
    const produtoParaAPI = {
      nome_produto: produto.nome,
      codigo_produto: produto.codigo,
      descricao: produto.descricao,
      preco: parseFloat(produto.preco),
      custo: parseFloat(produto.custo),
      marca: produto.fabricante,
      categoria: produto.categoria,
      estoque: produto.quantidade,
      estoque_min: produto.estoqueMinimo,
      id_fornecedor: produto.id_fornecedor || 564,
      status: true
    };
  
    try {
      const response = await api.post('/produtos', produtoParaAPI);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      throw error;
    }
  },

  atualizar: async (id, produto) => {
    // Transformar do modelo de frontend para o modelo da API
    const produtoParaAPI = {
      nome_produto: produto.nome,
      codigo_produto: produto.codigo,
      descricao: produto.descricao,
      preco: parseFloat(produto.preco || 0),
      custo: parseFloat(produto.custo || 0),
      marca: produto.fabricante || '',
      categoria: produto.categoria || '',
      estoque: parseInt(produto.quantidade || 0),
      estoque_min: parseInt(produto.estoqueMinimo || 0),
      id_fornecedor: parseInt(produto.id_fornecedor || 564),
      status: produto.status !== undefined ? produto.status : true
    };
  
    try {
      console.log(`Enviando atualização para produto ${id}:`, produtoParaAPI);
      const response = await api.patch(`/produtos/${id}`, produtoParaAPI);
      console.log('Resposta da API após atualização:', response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error.response?.data || error);
      throw error;
    }
  },

  listarEstoqueBaixo: async () => {
    try {
      const response = await api.get('/produtos/estoque-baixo');
      
      // Verificar diferentes estruturas possíveis da API
      let produtos = [];
      
      // Adicionar tratamento para a estrutura response.data.data
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        produtos = response.data.data.map(produto => ({
          _id: produto._id,
          nome: produto.nome_produto || produto.nome,
          codigo: produto.codigo_produto || produto.codigo,
          descricao: produto.descricao,
          preco: produto.preco,
          quantidade: produto.estoque || produto.quantidade,
          categoria: produto.categoria,
          fabricante: produto.marca || produto.fabricante,
          estoqueMinimo: produto.estoque_min || produto.estoqueMinimo,
          dataValidade: produto.data_validade || produto.dataValidade,
          status: produto.status !== undefined ? produto.status : true
        }));
      } else if (response.data && response.data.produtos && Array.isArray(response.data.produtos)) {
        produtos = response.data.produtos.map(produto => ({
          _id: produto._id,
          nome: produto.nome_produto || produto.nome,
          codigo: produto.codigo_produto || produto.codigo,
          descricao: produto.descricao,
          preco: produto.preco,
          quantidade: produto.estoque || produto.quantidade,
          categoria: produto.categoria,
          fabricante: produto.marca || produto.fabricante,
          estoqueMinimo: produto.estoque_min || produto.estoqueMinimo,
          dataValidade: produto.data_validade || produto.dataValidade,
          status: produto.status !== undefined ? produto.status : true
        }));
      } else if (Array.isArray(response.data)) {
        produtos = response.data.map(produto => ({
          _id: produto._id,
          nome: produto.nome_produto || produto.nome,
          codigo: produto.codigo_produto || produto.codigo,
          descricao: produto.descricao,
          preco: produto.preco,
          quantidade: produto.estoque || produto.quantidade,
          categoria: produto.categoria,
          fabricante: produto.marca || produto.fabricante,
          estoqueMinimo: produto.estoque_min || produto.estoqueMinimo,
          dataValidade: produto.data_validade || produto.dataValidade,
          status: produto.status !== undefined ? produto.status : true
        }));
      }
      
      return { produtos };
    } catch (error) {
      console.error("Erro ao listar produtos com estoque baixo:", error);
      throw error;
    }
  }
};

export default produtoService;