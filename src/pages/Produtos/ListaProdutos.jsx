import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import produtoService from '../../services/produtoService';
import './ListaProdutos.css';

const ListaProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    page: 1,
    limite: 10
  });
  const [totalPages, setTotalPages] = useState(1);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      
      const responseProdutos = await produtoService.listar(filtros);
      setProdutos(responseProdutos.docs || []);
      setTotalPages(responseProdutos.totalPages || 1);
      
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    carregarProdutos();
  }, [filtros.page, filtros.limite]);

  const handleChangePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFiltros({ ...filtros, page: newPage });
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    // Resetar a página ao filtrar
    setFiltros({ ...filtros, page: 1 });
    carregarProdutos();
  };

  const handleLimpar = () => {
    setFiltros({
      nome: '',
      codigo: '',
      categoria: '',
      page: 1,
      limite: 10
    });
  };

  const handleLimiteChange = (e) => {
    const limite = parseInt(e.target.value);
    setFiltros({ ...filtros, limite, page: 1 });
  };

  return (
    <div className="lista-produtos">
      <div className="actions-bar">
        <h2>Produtos em Estoque</h2>
        <Link to="/produtos/novo" className="btn-adicionar">
          + Novo Produto
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="filtro-container">
        <form className="filtro-form" onSubmit={handleFiltrar}>
          <div className="filtro-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={filtros.nome}
                onChange={handleFiltroChange}
                placeholder="Filtrar por nome..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="codigo">Código</label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                value={filtros.codigo}
                onChange={handleFiltroChange}
                placeholder="Filtrar por código..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                value={filtros.categoria}
                onChange={handleFiltroChange}
              >
                <option value="">Todas</option>
                <option value="A">Categoria A</option>
                <option value="B">Categoria B</option>
                <option value="C">Categoria C</option>
              </select>
            </div>
            <div className="form-buttons">
              <button type="submit" className="btn-filtrar">Filtrar</button>
              <button type="button" className="btn-limpar" onClick={handleLimpar}>Limpar</button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-message" style={{ padding: '20px', color: 'red', background: '#ffeeee', marginBottom: '20px', borderRadius: '4px' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando produtos...</div>
      ) : (
        <>
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
                      <td className={`quantidade ${produto.quantidade === 0 ? 'zero' : produto.quantidade < 10 ? 'baixo' : ''}`}>
                        {produto.quantidade}
                      </td>
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

          {/* Componente de Paginação */}
          <div className="pagination">
            <button 
              onClick={() => handleChangePage(1)} 
              disabled={filtros.page === 1}
              className="pagination-btn"
            >
              &laquo;
            </button>
            <button 
              onClick={() => handleChangePage(filtros.page - 1)} 
              disabled={filtros.page === 1}
              className="pagination-btn"
            >
              &lt;
            </button>
            
            <span className="pagination-info">
              Página {filtros.page} de {totalPages}
            </span>
            
            <button 
              onClick={() => handleChangePage(filtros.page + 1)} 
              disabled={filtros.page === totalPages}
              className="pagination-btn"
            >
              &gt;
            </button>
            <button 
              onClick={() => handleChangePage(totalPages)} 
              disabled={filtros.page === totalPages}
              className="pagination-btn"
            >
              &raquo;
            </button>
            
            <div className="items-per-page">
              <span>Itens por página:</span>
              <select value={filtros.limite} onChange={handleLimiteChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListaProdutos;