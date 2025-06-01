import api from './api';

const produtoService = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.nome) params.append('nome_produto', filtros.nome);
    if (filtros.codigo) params.append('codigo_produto', filtros.codigo);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limite) params.append('limite', filtros.limite);
    if (filtros.precoMinimo) params.append('precoMinimo', filtros.precoMinimo);
    if (filtros.precoMaximo) params.append('precoMaximo', filtros.precoMaximo);

    try {
      console.log('URL da requisição:', `/produtos?${params.toString()}`);
      const response = await api.get(`/produtos?${params.toString()}`);
      console.log('Resposta bruta da API:', response.data);

      // Mapear os campos recebidos da API para o formato esperado pelo frontend
      const produtos = response.data.data.docs.map(produto => ({
        _id: produto._id,
        nome: produto.nome_produto,
        codigo: produto.codigo_produto,
        descricao: produto.descricao,
        preco: produto.preco,
        quantidade: produto.estoque,
        categoria: produto.categoria,
        fabricante: produto.marca,
        estoqueMinimo: produto.estoque_min,
        dataValidade: produto.data_validade || null,
        status: produto.status
      }));

      return {
        docs: produtos,
        totalPages: Math.ceil(response.data.data.total / filtros.limite) || 1,
        page: filtros.page || 1
      };
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      throw error;
    }
  },

  buscar: async (id) => {
    try {
      const response = await api.get(`/produtos/${id}`);
      const produto = response.data.data;

      // Mapear resposta da API para formato esperado
      return {
        _id: produto._id,
        nome: produto.nome_produto,
        codigo: produto.codigo_produto,
        descricao: produto.descricao,
        preco: produto.preco,
        quantidade: produto.estoque,
        categoria: produto.categoria,
        fabricante: produto.marca,
        estoqueMinimo: produto.estoque_min,
        dataValidade: produto.data_validade || null,
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
      preco: produto.preco,
      marca: produto.fabricante,
      categoria: produto.categoria,
      estoque: produto.quantidade,
      estoque_min: produto.estoqueMinimo,
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
    // Mapear do formato do frontend para o formato da API
    const produtoParaAPI = {
      nome_produto: produto.nome,
      codigo_produto: produto.codigo,
      descricao: produto.descricao,
      preco: produto.preco,
      marca: produto.fabricante,
      categoria: produto.categoria,
      estoque: produto.quantidade,
      estoque_min: produto.estoqueMinimo,
      status: produto.status !== undefined ? produto.status : true
    };

    try {
      const response = await api.put(`/produtos/${id}`, produtoParaAPI);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  },

  excluir: async (id) => {
    try {
      const response = await api.delete(`/produtos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      throw error;
    }
  },

  listarEstoqueBaixo: async () => {
    try {
      const response = await api.get('/produtos');

      // Filtrar produtos com estoque baixo
      const todosProdutos = response.data.data.docs;
      const produtosBaixoEstoque = todosProdutos.filter(p =>
        p.estoque < (p.estoque_min || 5)
      ).map(produto => ({
        _id: produto._id,
        nome: produto.nome_produto,
        codigo: produto.codigo_produto,
        quantidade: produto.estoque,
        estoqueMinimo: produto.estoque_min
      }));

      return { produtos: produtosBaixoEstoque };
    } catch (error) {
      console.error("Erro ao listar produtos com estoque baixo:", error);
      throw error;
    }
  }
};

export default produtoService;