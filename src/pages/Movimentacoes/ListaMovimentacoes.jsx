import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movimentacaoService from '../../services/movimentacaoService';
import './ListaMovimentacoes.css';

const ListaMovimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    page: 1,
    limite: 10
  });
  const [totalPages, setTotalPages] = useState(1);

  const carregarMovimentacoes = async () => {
    try {
      setLoading(true);
      const response = await movimentacaoService.listar(filtros);
      setMovimentacoes(response.docs || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMovimentacoes();
  }, [filtros.page, filtros.limite]);

  const handleChangePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFiltros({ ...filtros, page: newPage });
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação? Esta ação afetará o estoque.')) {
      try {
        await movimentacaoService.excluir(id);
        carregarMovimentacoes();
      } catch (error) {
        console.error('Erro ao excluir movimentação:', error);
        alert('Erro ao excluir movimentação. Tente novamente.');
      }
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  return (
    <div className="lista-movimentacoes">
      <div className="actions-bar">
        <h2>Movimentações de Estoque</h2>
        <Link to="/movimentacoes/nova" className="btn-adicionar">
          + Nova Movimentação
        </Link>
      </div>

      {loading ? (
        <div className="loading">Carregando movimentações...</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Responsável</th>
                  <th>Observação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.length > 0 ? (
                  movimentacoes.map((movimentacao) => (
                    <tr key={movimentacao._id}>
                      <td>{formatarData(movimentacao.data)}</td>
                      <td>
                        <span className={`tipo-${movimentacao.tipo.toLowerCase()}`}>
                          {movimentacao.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td>{movimentacao.produto?.nome || 'N/A'}</td>
                      <td>{movimentacao.quantidade}</td>
                      <td>{movimentacao.responsavel?.nome || 'N/A'}</td>
                      <td className="observacao">
                        {movimentacao.observacao || 'Sem observação'}
                      </td>
                      <td>
                        <div className="acoes">
                          <Link to={`/movimentacoes/${movimentacao._id}`} className="btn-visualizar">
                            👁️
                          </Link>
                          <button 
                            onClick={() => handleExcluir(movimentacao._id)} 
                            className="btn-excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Nenhuma movimentação encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
          </div>
        </>
      )}
    </div>
  );
};

export default ListaMovimentacoes;