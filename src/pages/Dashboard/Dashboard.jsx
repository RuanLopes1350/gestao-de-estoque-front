import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import produtoService from '../../services/produtoService';
import movimentacaoService from '../../services/movimentacaoService';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProdutos: 0,
    totalEstoque: 0,
    produtosEstoqueBaixo: 0,
    valorTotalEstoque: 0
  });
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obter estatísticas gerais de produtos
        const produtosResponse = await produtoService.listar();
        
        // Calcular estatísticas
        const produtos = produtosResponse.docs || [];
        const totalProdutos = produtos.length;
        const totalEstoque = produtos.reduce((total, produto) => total + (produto.quantidade || 0), 0);
        const valorTotalEstoque = produtos.reduce(
          (total, produto) => total + ((produto.preco || 0) * (produto.quantidade || 0)), 
          0
        );
        
        // Obter produtos com estoque baixo
        const estoqueBaixoResponse = await produtoService.listarEstoqueBaixo();
        const produtosBaixoEstoque = estoqueBaixoResponse.produtos || [];
        
        // Obter últimas movimentações
        const movimentacoesResponse = await movimentacaoService.listar({
          limite: 5
        });
        
        setStats({
          totalProdutos,
          totalEstoque,
          produtosEstoqueBaixo: produtosBaixoEstoque.length,
          valorTotalEstoque
        });
        
        setProdutosBaixoEstoque(produtosBaixoEstoque);
        setUltimasMovimentacoes(movimentacoesResponse.docs || []);
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Carregando dados...</div>;
  }

  return (
    <div className="dashboard">
      {/* Cards de estatísticas */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total de Produtos</h3>
            <p className="stat-value">{stats.totalProdutos}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <h3>Itens em Estoque</h3>
            <p className="stat-value">{stats.totalEstoque}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Estoque Baixo</h3>
            <p className="stat-value">{stats.produtosEstoqueBaixo}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Valor em Estoque</h3>
            <p className="stat-value">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats.valorTotalEstoque)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Produtos com estoque baixo */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Produtos com Estoque Baixo</h2>
          <Link to="/produtos" className="view-all">Ver Todos</Link>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Quantidade</th>
                <th>Estoque Mínimo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {produtosBaixoEstoque.length > 0 ? (
                produtosBaixoEstoque.map((produto) => (
                  <tr key={produto._id}>
                    <td>{produto.codigo}</td>
                    <td>{produto.nome}</td>
                    <td>{produto.quantidade}</td>
                    <td>{produto.estoqueMinimo || 10}</td>
                    <td>
                      <span className={`status ${produto.quantidade === 0 ? 'critical' : 'warning'}`}>
                        {produto.quantidade === 0 ? 'Sem Estoque' : 'Baixo'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">Nenhum produto com estoque baixo</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Últimas movimentações */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Últimas Movimentações</h2>
          <Link to="/movimentacoes" className="view-all">Ver Todas</Link>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {ultimasMovimentacoes.length > 0 ? (
                ultimasMovimentacoes.map((mov) => (
                  <tr key={mov._id}>
                    <td>
                      {new Date(mov.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <span className={`tipo-${mov.tipo.toLowerCase()}`}>
                        {mov.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td>{mov.produto?.nome || 'N/A'}</td>
                    <td>{mov.quantidade}</td>
                    <td>{mov.responsavel?.nome || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">Nenhuma movimentação recente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;