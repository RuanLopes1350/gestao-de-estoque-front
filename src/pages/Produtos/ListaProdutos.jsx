import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './ListaProdutos.css';

const ListaProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setLoading(true);
        
        // Fazendo a requisição para a API
        const response = await api.get('/produtos');
        console.log('Resposta completa da API:', response.data);
        
        // Verificando a estrutura exata da resposta
        if (response.data && response.data.data && response.data.data.docs) {
          // Se a resposta seguir o padrão esperado
          const produtosAPI = response.data.data.docs;
          setProdutos(produtosAPI.map(item => ({
            _id: item._id,
            nome: item.nome_produto,
            codigo: item.codigo_produto,
            preco: item.preco,
            quantidade: item.estoque,
            categoria: item.categoria,
            status: item.status
          })));
        } else if (response.data && Array.isArray(response.data.docs)) {
          // Formato alternativo possível
          const produtosAPI = response.data.docs;
          setProdutos(produtosAPI.map(item => ({
            _id: item._id,
            nome: item.nome_produto,
            codigo: item.codigo_produto,
            preco: item.preco,
            quantidade: item.estoque,
            categoria: item.categoria,
            status: item.status
          })));
        } else if (response.data && Array.isArray(response.data)) {
          // Se a API retornar um array simples
          const produtosAPI = response.data;
          setProdutos(produtosAPI.map(item => ({
            _id: item._id,
            nome: item.nome_produto || item.nome,
            codigo: item.codigo_produto || item.codigo,
            preco: item.preco,
            quantidade: item.estoque || item.quantidade,
            categoria: item.categoria,
            status: item.status !== undefined ? item.status : true
          })));
        } else {
          console.error('Formato de resposta inesperado:', response.data);
          setError('Formato de resposta incorreto da API');
        }
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError('Não foi possível carregar os produtos. Verifique o console para detalhes.');
      } finally {
        setLoading(false);
      }
    };
    
    carregarProdutos();
  }, []);

  return (
    <div className="lista-produtos">
      <div className="actions-bar">
        <h2>Produtos em Estoque</h2>
        <Link to="/produtos/novo" className="btn-adicionar">
          + Novo Produto
        </Link>
      </div>

      {error && (
        <div className="error-message" style={{ padding: '20px', color: 'red', background: '#ffeeee', marginBottom: '20px', borderRadius: '4px' }}>
          <strong>Erro:</strong> {error}
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando produtos...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length > 0 ? (
                produtos.map((produto) => (
                  <tr key={produto._id}>
                    <td>{produto.codigo}</td>
                    <td>{produto.nome}</td>
                    <td>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(produto.preco)}
                    </td>
                    <td>{produto.quantidade}</td>
                    <td>{produto.categoria || '-'}</td>
                    <td>
                      <span className={`status-badge ${produto.status ? 'ativo' : 'inativo'}`}>
                        {produto.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes">
                        <Link to={`/produtos/${produto._id}`} className="btn-visualizar">
                          👁️
                        </Link>
                        <Link to={`/produtos/editar/${produto._id}`} className="btn-editar">
                          ✏️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaProdutos;