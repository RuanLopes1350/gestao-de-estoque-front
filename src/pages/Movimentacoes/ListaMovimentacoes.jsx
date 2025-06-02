import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movimentacaoService from '../../services/movimentacaoService';
import produtoService from '../../services/produtoService';
import usuarioService from '../../services/usuarioService';
import './ListaMovimentacoes.css';

const ListaMovimentacoes = () => {
  // Variáveis de estado existentes
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOpcoes, setLoadingOpcoes] = useState(false);
  const [error, setError] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [apiError, setApiError] = useState(false); // Nova variável para indicar erro específico da API
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
    dataFim: new Date().toISOString().split('T')[0], // hoje
    tipo: '',
    produtoId: '',
    responsavelId: '',
    page: 1,
    limite: 10
  });
  
  // Estados para paginação
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Carregar dados para os filtros (produtos e usuários)
  useEffect(() => {
    const carregarOpcoesParaFiltros = async () => {
      try {
        setLoadingOpcoes(true);
        // Carregar produtos para o filtro
        const produtosResponse = await produtoService.listar({ limite: 100 });
        setProdutos(produtosResponse.docs || []);
        
        // Carregar usuários para o filtro
        const usuariosResponse = await usuarioService.listar({ limite: 100 });
        setUsuarios(usuariosResponse.docs || []);
      } catch (error) {
        console.error('Erro ao carregar opções para filtros:', error);
        setError('Erro ao carregar dados para filtros. Tente novamente.');
      } finally {
        setLoadingOpcoes(false);
      }
    };
    
    carregarOpcoesParaFiltros();
  }, []);

  const carregarMovimentacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      setApiError(false);
      
      // Converter parâmetros para o formato esperado pela API
      const params = { ...filtros };
      
      // Somente incluir filtros com valor
      Object.keys(params).forEach(key => 
        !params[key] && key !== 'page' && key !== 'limite' && delete params[key]
      );
      
      console.log('Carregando movimentações com filtros:', params);
      const response = await movimentacaoService.listar(params);
      
      // Verificar se houve erro específico da API
      if (response.error) {
        setApiError(true);
        setError(`O servidor retornou um erro: ${response.error}. Exibindo dados limitados.`);
      }
      
      setMovimentacoes(response.docs || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || response.docs?.length || 0);
      
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      setError('Não foi possível carregar as movimentações. Verifique sua conexão.');
      setMovimentacoes([]); // Limpar movimentações em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMovimentacoes();
  }, [filtros.page, filtros.limite]);

  // O resto do seu código permanece o mesmo
  const handleChangePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFiltros({ ...filtros, page: newPage });
    }
  };

  const handleLimiteChange = (e) => {
    const limite = parseInt(e.target.value);
    setFiltros({ ...filtros, limite, page: 1 });
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setFiltros({
      ...filtros,
      page: 1 // Resetar para página 1 ao aplicar filtros
    });
    carregarMovimentacoes();
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dataFim: new Date().toISOString().split('T')[0],
      tipo: '',
      produtoId: '',
      responsavelId: '',
      page: 1,
      limite: 10
    });
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

  const exportarCSV = () => {
    if (movimentacoes.length === 0) {
      alert('Não há dados para exportar');
      return;
    }
    
    // Cabeçalhos do CSV
    const headers = [
      'Data',
      'Tipo',
      'Produto',
      'Quantidade',
      'Responsável',
      'Observação'
    ];
    
    // Dados para o CSV
    const csvData = movimentacoes.map(mov => [
      formatarData(mov.data),
      mov.tipo === 'ENTRADA' ? 'Entrada' : 'Saída',
      mov.produto?.nome || 'N/A',
      mov.quantidade,
      mov.responsavel?.nome || 'N/A',
      mov.observacao || ''
    ]);
    
    // Combinar cabeçalhos e dados
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `movimentacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="lista-movimentacoes">
      <div className="actions-bar">
        <h2>Movimentações de Estoque</h2>
        <div className="actions-buttons">
          <button onClick={exportarCSV} className="btn-exportar">
            Exportar CSV
          </button>
          <Link to="/movimentacoes/nova" className="btn-adicionar">
            + Nova Movimentação
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtro-container">
        <form className="filtro-form" onSubmit={aplicarFiltros}>
          <div className="filtro-row">
            <div className="form-group">
              <label htmlFor="dataInicio">Data Início</label>
              <input
                type="date"
                id="dataInicio"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dataFim">Data Fim</label>
              <input
                type="date"
                id="dataFim"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tipo">Tipo</label>
              <select
                id="tipo"
                name="tipo"
                value={filtros.tipo}
                onChange={handleFiltroChange}
              >
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="produtoId">Produto</label>
              <select
                id="produtoId"
                name="produtoId"
                value={filtros.produtoId}
                onChange={handleFiltroChange}
                disabled={loadingOpcoes}
              >
                <option value="">Todos</option>
                {produtos.map(produto => (
                  <option key={produto._id} value={produto._id}>
                    {produto.codigo} - {produto.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="responsavelId">Responsável</label>
              <select
                id="responsavelId"
                name="responsavelId"
                value={filtros.responsavelId}
                onChange={handleFiltroChange}
                disabled={loadingOpcoes}
              >
                <option value="">Todos</option>
                {usuarios.map(usuario => (
                  <option key={usuario._id} value={usuario._id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn-filtrar">Filtrar</button>
              <button type="button" onClick={limparFiltros} className="btn-limpar">Limpar</button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className={`error-message ${apiError ? 'warning' : 'error'}`}>
          <strong>{apiError ? 'Atenção:' : 'Erro:'}</strong> {error}
        </div>
      )}

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
                  <th>Código</th>
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
                      <td>{movimentacao.produto?.codigo || 'N/A'}</td>
                      <td>{movimentacao.quantidade}</td>
                      <td>{movimentacao.responsavel?.nome || 'N/A'}</td>
                      <td className="observacao" title={movimentacao.observacao}>
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
                    <td colSpan="8" className="no-data">
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
              Página {filtros.page} de {totalPages} {movimentacoes.length > 0 ? `(mostrando ${movimentacoes.length} de ${totalItems})` : ''}
            </span>
            
            <button 
              onClick={() => handleChangePage(filtros.page + 1)} 
              disabled={filtros.page === totalPages || totalPages === 0}
              className="pagination-btn"
            >
              &gt;
            </button>
            <button 
              onClick={() => handleChangePage(totalPages)} 
              disabled={filtros.page === totalPages || totalPages === 0}
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

export default ListaMovimentacoes;