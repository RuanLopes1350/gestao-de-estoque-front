import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import movimentacaoService from '../../services/movimentacaoService';
import produtoService from '../../services/produtoService';
import usuarioService from '../../services/usuarioService';
import { useAuth } from '../../contexts/AuthContext';
import './FormMovimentacao.css';

const FormMovimentacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(false);
  const [errors, setErrors] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  const [movimentacao, setMovimentacao] = useState({
    tipo: queryParams.get('tipo') || 'ENTRADA',
    produtoId: queryParams.get('produtoId') || '',
    quantidade: '',
    data: new Date().toISOString().split('T')[0],
    responsavelId: user?._id || '',
    observacao: ''
  });
  
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoadingDados(true);
        
        // Carregar produtos
        const produtosResponse = await produtoService.listar({ limite: 100 });
        setProdutos(produtosResponse.docs || []);
        
        // Carregar usuários (responsáveis)
        const usuariosResponse = await usuarioService.listar({ limite: 100 });
        setUsuarios(usuariosResponse.docs || []);
        
        // Se temos ID, carregamos a movimentação existente
        if (id) {
          const movimentacaoData = await movimentacaoService.buscar(id);
          setMovimentacao({
            tipo: movimentacaoData.tipo,
            produtoId: movimentacaoData.produto?._id || '',
            quantidade: movimentacaoData.quantidade,
            data: new Date(movimentacaoData.data).toISOString().split('T')[0],
            responsavelId: movimentacaoData.responsavel?._id || user?._id || '',
            observacao: movimentacaoData.observacao || ''
          });
        }
        
        // Se temos produtoId nos query params, carregamos detalhes do produto
        if (queryParams.get('produtoId')) {
          const produtoId = queryParams.get('produtoId');
          const produtoData = await produtoService.buscar(produtoId);
          setProdutoSelecionado(produtoData);
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados necessários. Tente novamente.');
      } finally {
        setLoadingDados(false);
      }
    };
    
    carregarDados();
  }, [id, user]);
  
  const buscarProduto = async () => {
    if (!movimentacao.produtoId) return;
    
    try {
      setLoadingDados(true);
      const produto = await produtoService.buscar(movimentacao.produtoId);
      setProdutoSelecionado(produto);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setProdutoSelecionado(null);
    } finally {
      setLoadingDados(false);
    }
  };
  
  useEffect(() => {
    if (movimentacao.produtoId) {
      buscarProduto();
    } else {
      setProdutoSelecionado(null);
    }
  }, [movimentacao.produtoId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovimentacao({ ...movimentacao, [name]: value });
    
    // Limpar erro desse campo se houver
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!movimentacao.produtoId) novosErros.produtoId = 'Produto é obrigatório';
    if (!movimentacao.quantidade) novosErros.quantidade = 'Quantidade é obrigatória';
    else if (parseInt(movimentacao.quantidade) <= 0) {
      novosErros.quantidade = 'Quantidade deve ser maior que zero';
    }
    
    // Verificando estoque disponível para saída
    if (movimentacao.tipo === 'SAIDA' && produtoSelecionado) {
      if (parseInt(movimentacao.quantidade) > produtoSelecionado.quantidade) {
        novosErros.quantidade = 'Quantidade maior que disponível em estoque';
      }
    }
    
    if (!movimentacao.data) novosErros.data = 'Data é obrigatória';
    if (!movimentacao.responsavelId) novosErros.responsavelId = 'Responsável é obrigatório';
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Converter campos para os tipos corretos antes de enviar
      const movimentacaoParaEnvio = {
        ...movimentacao,
        quantidade: parseInt(movimentacao.quantidade)
      };
      
      if (id) {
        await movimentacaoService.atualizar(id, movimentacaoParaEnvio);
      } else {
        await movimentacaoService.cadastrar(movimentacaoParaEnvio);
      }
      
      navigate('/movimentacoes');
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
      alert(`Erro ao ${id ? 'atualizar' : 'cadastrar'} movimentação. Verifique os dados e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="form-movimentacao">
      <h2>{id ? 'Editar Movimentação' : 'Nova Movimentação'}</h2>
      
      {loadingDados ? (
        <div className="loading">Carregando dados...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo">Tipo de Movimentação *</label>
              <div className="tipo-selector">
                <label className={`tipo-option ${movimentacao.tipo === 'ENTRADA' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="ENTRADA"
                    checked={movimentacao.tipo === 'ENTRADA'}
                    onChange={handleChange}
                  />
                  Entrada
                </label>
                <label className={`tipo-option ${movimentacao.tipo === 'SAIDA' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="SAIDA"
                    checked={movimentacao.tipo === 'SAIDA'}
                    onChange={handleChange}
                  />
                  Saída
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="produtoId">Produto *</label>
              <select
                id="produtoId"
                name="produtoId"
                value={movimentacao.produtoId}
                onChange={handleChange}
                className={errors.produtoId ? 'error' : ''}
                disabled={queryParams.get('produtoId')}
              >
                <option value="">Selecione um produto...</option>
                {produtos.map((produto) => (
                  <option key={produto._id} value={produto._id}>
                    {produto.codigo} - {produto.nome} ({produto.quantidade} em estoque)
                  </option>
                ))}
              </select>
              {errors.produtoId && <div className="error-message">{errors.produtoId}</div>}
            </div>
          </div>
          
          {produtoSelecionado && (
            <div className="produto-info">
              <div className="produto-info-header">
                <h3>{produtoSelecionado.nome}</h3>
                <span className="produto-codigo">Código: {produtoSelecionado.codigo}</span>
              </div>
              <div className="produto-info-detalhes">
                <span className="info-item">
                  <strong>Preço:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produtoSelecionado.preco)}
                </span>
                <span className="info-item">
                  <strong>Estoque Atual:</strong> {produtoSelecionado.quantidade} unidades
                </span>
                <span className="info-item">
                  <strong>Fabricante:</strong> {produtoSelecionado.fabricante || 'Não informado'}
                </span>
              </div>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantidade">Quantidade *</label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                value={movimentacao.quantidade}
                onChange={handleChange}
                min="1"
                className={errors.quantidade ? 'error' : ''}
              />
              {errors.quantidade && <div className="error-message">{errors.quantidade}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="data">Data *</label>
              <input
                type="date"
                id="data"
                name="data"
                value={movimentacao.data}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={errors.data ? 'error' : ''}
              />
              {errors.data && <div className="error-message">{errors.data}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="responsavelId">Responsável *</label>
              <select
                id="responsavelId"
                name="responsavelId"
                value={movimentacao.responsavelId}
                onChange={handleChange}
                className={errors.responsavelId ? 'error' : ''}
              >
                <option value="">Selecione um responsável...</option>
                {usuarios.map((usuario) => (
                  <option key={usuario._id} value={usuario._id}>
                    {usuario.nome} ({usuario.matricula})
                  </option>
                ))}
              </select>
              {errors.responsavelId && <div className="error-message">{errors.responsavelId}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="observacao">Observação</label>
              <textarea
                id="observacao"
                name="observacao"
                value={movimentacao.observacao}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/movimentacoes')}
              className="btn-cancelar"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-salvar"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Registrar Movimentação'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FormMovimentacao;