import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import produtoService from '../../services/produtoService';
import './DetalhesProduto.css';

const DetalhesProduto = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarProduto = async () => {
      try {
        setLoading(true);
        const data = await produtoService.buscar(id);
        setProduto(data);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setError('Não foi possível carregar os detalhes do produto.');
      } finally {
        setLoading(false);
      }
    };

    carregarProduto();
  }, [id]);

  if (loading) {
    return <div className="loading">Carregando detalhes do produto...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!produto) {
    return <div className="error">Produto não encontrado.</div>;
  }

  return (
    <div className="detalhes-produto">
      <div className="actions-bar">
        <h2>Detalhes do Produto</h2>
        <div className="action-buttons">
          <Link to={`/produtos/editar/${id}`} className="btn-editar">
            Editar Produto
          </Link>
          <Link to="/produtos" className="btn-voltar">
            Voltar
          </Link>
        </div>
      </div>

      <div className="produto-container">
        <div className="produto-cabecalho">
          <div className="produto-info-principal">
            <h3>{produto.nome}</h3>
            <p className="produto-codigo">Código: {produto.codigo}</p>
          </div>
          <div className="produto-status">
            <span className={`status-indicator ${produto.quantidade > 10 ? 'status-ok' : produto.quantidade > 0 ? 'status-alerta' : 'status-critico'}`}>
              {produto.quantidade > 10 ? 'Estoque Normal' : produto.quantidade > 0 ? 'Estoque Baixo' : 'Sem Estoque'}
            </span>
          </div>
        </div>

        <div className="produto-content">
          <div className="produto-imagem">
            {produto.imagemUrl ? (
              <img 
                src={produto.imagemUrl} 
                alt={produto.nome} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300?text=Sem+Imagem';
                }}
              />
            ) : (
              <div className="sem-imagem">
                <span>Sem imagem disponível</span>
              </div>
            )}
          </div>

          <div className="produto-detalhes">
            <div className="detalhes-grid">
              <div className="detalhe-item">
                <span className="detalhe-label">Preço:</span>
                <span className="detalhe-valor">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(produto.preco)}
                </span>
              </div>

              <div className="detalhe-item">
                <span className="detalhe-label">Quantidade em Estoque:</span>
                <span className="detalhe-valor">{produto.quantidade} unidades</span>
              </div>

              <div className="detalhe-item">
                <span className="detalhe-label">Categoria:</span>
                <span className="detalhe-valor">
                  {produto.categoria ? `Categoria ${produto.categoria}` : 'Não classificado'}
                </span>
              </div>

              <div className="detalhe-item">
                <span className="detalhe-label">Fabricante:</span>
                <span className="detalhe-valor">{produto.fabricante || 'Não informado'}</span>
              </div>

              <div className="detalhe-item">
                <span className="detalhe-label">Estoque Mínimo:</span>
                <span className="detalhe-valor">{produto.estoqueMinimo || 10} unidades</span>
              </div>

              <div className="detalhe-item">
                <span className="detalhe-label">Data de Validade:</span>
                <span className="detalhe-valor">
                  {produto.dataValidade ? new Date(produto.dataValidade).toLocaleDateString('pt-BR') : 'Não se aplica'}
                </span>
              </div>
            </div>

            <div className="detalhes-descricao">
              <span className="detalhe-label">Descrição:</span>
              <p className="descricao-texto">
                {produto.descricao || 'Nenhuma descrição disponível para este produto.'}
              </p>
            </div>

            <div className="detalhes-acoes">
              <Link to={`/movimentacoes/nova?produtoId=${id}&tipo=ENTRADA`} className="btn-movimentacao entrada">
                Registrar Entrada
              </Link>
              <Link to={`/movimentacoes/nova?produtoId=${id}&tipo=SAIDA`} className="btn-movimentacao saida">
                Registrar Saída
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesProduto;