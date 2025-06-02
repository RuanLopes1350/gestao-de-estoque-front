import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import produtoService from '../../services/produtoService';
import './ListaProdutos.css';

const ListaProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        setLoading(true);
        
        // Usar o serviço atualizado
        const responseProdutos = await produtoService.listar();
        setProdutos(responseProdutos.docs || []);
        
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError('Não foi possível carregar os produtos. Verifique se a API está rodando.');
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