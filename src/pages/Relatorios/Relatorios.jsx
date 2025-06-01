import { useState, useEffect } from 'react';
import relatorioService from '../../services/relatorioService';
import './Relatorios.css';

const Relatorios = () => {
  const [loading, setLoading] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState('estoque');
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  });
  const [dadosRelatorio, setDadosRelatorio] = useState(null);

  const carregarRelatorio = async () => {
    try {
      setLoading(true);
      let dados;

      switch (tipoRelatorio) {
        case 'estoque':
          dados = await relatorioService.estoque();
          break;
        case 'movimentacoes':
          dados = await relatorioService.movimentacoes(filtros);
          break;
        case 'produtosPopulares':
          dados = await relatorioService.produtosPopulares();
          break;
        default:
          dados = await relatorioService.estoque();
      }

      setDadosRelatorio(dados);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      alert('Erro ao carregar dados do relatório.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRelatorio();
  }, [tipoRelatorio]);

  const handleFiltrosChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    carregarRelatorio();
  };

  return (
    <div className="relatorios">
      <h2>Relatórios</h2>

      <div className="relatorios-tabs">
        <button 
          className={`tab-button ${tipoRelatorio === 'estoque' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('estoque')}
        >
          Situação do Estoque
        </button>
        <button 
          className={`tab-button ${tipoRelatorio === 'movimentacoes' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('movimentacoes')}
        >
          Movimentações
        </button>
        <button 
          className={`tab-button ${tipoRelatorio === 'produtosPopulares' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('produtosPopulares')}
        >
          Produtos Populares
        </button>
      </div>

      {tipoRelatorio === 'movimentacoes' && (
        <div className="filtros-relatorio">
          <form onSubmit={handleFiltrar}>
            <div className="filtros-row">
              <div className="filtro-item">
                <label htmlFor="dataInicio">Data Início</label>
                <input
                  type="date"
                  id="dataInicio"
                  name="dataInicio"
                  value={filtros.dataInicio}
                  onChange={handleFiltrosChange}
                />
              </div>
              
              <div className="filtro-item">
                <label htmlFor="dataFim">Data Fim</label>
                <input
                  type="date"
                  id="dataFim"
                  name="dataFim"
                  value={filtros.dataFim}
                  onChange={handleFiltrosChange}
                />
              </div>
              
              <button type="submit" className="btn-filtrar">
                Filtrar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relatorio-container">
        {loading ? (
          <div className="loading">Carregando dados do relatório...</div>
        ) : (
          <div className="relatorio-conteudo">
            {tipoRelatorio === 'estoque' && dadosRelatorio && (
              <RelatorioEstoque dados={dadosRelatorio} />
            )}
            
            {tipoRelatorio === 'movimentacoes' && dadosRelatorio && (
              <RelatorioMovimentacoes dados={dadosRelatorio} />
            )}
            
            {tipoRelatorio === 'produtosPopulares' && dadosRelatorio && (
              <RelatorioProdutosPopulares dados={dadosRelatorio} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RelatorioEstoque = ({ dados }) => {
  return (
    <div className="relatorio-estoque">
      <div className="resumo-cards">
        <div className="resumo-card">
          <h3>Total de Produtos</h3>
          <p className="valor">{dados.totalProdutos || 0}</p>
        </div>
        
        <div className="resumo-card">
          <h3>Valor Total em Estoque</h3>
          <p className="valor">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(dados.valorTotalEstoque || 0)}
          </p>
        </div>
        
        <div className="resumo-card">
          <h3>Produtos sem Estoque</h3>
          <p className="valor">{dados.produtosSemEstoque || 0}</p>
        </div>
        
        <div className="resumo-card">
          <h3>Produtos com Estoque Baixo</h3>
          <p className="valor">{dados.produtosEstoqueBaixo || 0}</p>
        </div>
      </div>
      
      <h3 className="secao-titulo">Distribuição por Categorias</h3>
      <div className="categorias-tabela">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Quantidade de Produtos</th>
              <th>Valor em Estoque</th>
              <th>% do Estoque</th>
            </tr>
          </thead>
          <tbody>
            {dados.categorias?.map((categoria) => (
              <tr key={categoria.nome}>
                <td>Categoria {categoria.nome}</td>
                <td>{categoria.quantidade}</td>
                <td>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(categoria.valor)}
                </td>
                <td>{categoria.percentual.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RelatorioMovimentacoes = ({ dados }) => {
  return (
    <div className="relatorio-movimentacoes">
      <div className="resumo-cards">
        <div className="resumo-card">
          <h3>Total de Entradas</h3>
          <p className="valor">{dados.totalEntradas || 0}</p>
        </div>
        
        <div className="resumo-card">
          <h3>Total de Saídas</h3>
          <p className="valor">{dados.totalSaidas || 0}</p>
        </div>
        
        <div className="resumo-card">
          <h3>Valor Total Entrada</h3>
          <p className="valor">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(dados.valorTotalEntradas || 0)}
          </p>
        </div>
        
        <div className="resumo-card">
          <h3>Valor Total Saída</h3>
          <p className="valor">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(dados.valorTotalSaidas || 0)}
          </p>
        </div>
      </div>
      
      <h3 className="secao-titulo">Últimas Movimentações</h3>
      <div className="movimentacoes-tabela">
        <table>
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
            {dados.ultimasMovimentacoes?.map((mov) => (
              <tr key={mov._id}>
                <td>{new Date(mov.data).toLocaleDateString('pt-BR')}</td>
                <td>
                  <span className={mov.tipo === 'ENTRADA' ? 'tipo-entrada' : 'tipo-saida'}>
                    {mov.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td>{mov.produto?.nome || 'N/A'}</td>
                <td>{mov.quantidade}</td>
                <td>{mov.responsavel?.nome || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RelatorioProdutosPopulares = ({ dados }) => {
  return (
    <div className="relatorio-populares">
      <h3 className="secao-titulo">Produtos Mais Movimentados</h3>
      <div className="populares-tabela">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Código</th>
              <th>Entradas</th>
              <th>Saídas</th>
              <th>Total Movimentações</th>
            </tr>
          </thead>
          <tbody>
            {dados.produtos?.map((produto) => (
              <tr key={produto._id}>
                <td>{produto.nome}</td>
                <td>{produto.codigo}</td>
                <td>{produto.totalEntradas || 0}</td>
                <td>{produto.totalSaidas || 0}</td>
                <td>{(produto.totalEntradas || 0) + (produto.totalSaidas || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Relatorios;