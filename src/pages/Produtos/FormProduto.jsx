import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import produtoService from '../../services/produtoService';
import './FormProduto.css';

const FormProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [produto, setProduto] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    preco: '',
    custo: '',
    quantidade: '',
    categoria: '',
    fabricante: '',
    // imagemUrl: '',
    // dataValidade: '',
    id_fornecedor: 1,
    estoqueMinimo: ''
  });

  useEffect(() => {
    const carregarProduto = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await produtoService.buscar(id);
          
          // Usar diretamente o objeto data retornado pela API
          setProduto({
            nome: data.nome || '',
            codigo: data.codigo || '',
            descricao: data.descricao || '',
            preco: data.preco || '',
            custo: data.custo || '',
            quantidade: data.quantidade || 0,
            categoria: data.categoria || '',
            fabricante: data.fabricante || '',
            id_fornecedor: data.id_fornecedor || 1,
            estoqueMinimo: data.estoqueMinimo || ''
          });
        } catch (error) {
          console.error('Erro ao carregar produto:', error);
          alert('Erro ao carregar dados do produto. Tente novamente.');
        } finally {
          setLoading(false);
        }
      }
    };
  
    carregarProduto();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduto({ ...produto, [name]: value });

    // Limpar erro desse campo se houver
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validarFormulario = () => {
    const novosErros = {};
    
    if (!produto.nome) novosErros.nome = 'Nome é obrigatório';
    if (!produto.codigo) novosErros.codigo = 'Código é obrigatório';
    
    if (!produto.preco) novosErros.preco = 'Preço é obrigatório';
    else if (parseFloat(produto.preco) <= 0) novosErros.preco = 'Preço deve ser maior que zero';
    
    if (!produto.custo) novosErros.custo = 'Custo é obrigatório'; // Validação para custo
    else if (parseFloat(produto.custo) < 0) novosErros.custo = 'Custo não pode ser negativo';
    
    if (!produto.quantidade) novosErros.quantidade = 'Quantidade é obrigatória';
    else if (parseInt(produto.quantidade) < 0) novosErros.quantidade = 'Quantidade não pode ser negativa';
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // const isValidUrl = (url) => {
  //   try {
  //     new URL(url);
  //     return true;
  //   } catch (err) {
  //     return false;
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      // Converter campos para os tipos corretos antes de enviar
      const produtoParaEnvio = {
        ...produto,
        preco: parseFloat(produto.preco),
        custo: parseFloat(produto.custo), // Garantir que custo seja um número
        quantidade: parseInt(produto.quantidade),
        estoqueMinimo: produto.estoqueMinimo ? parseInt(produto.estoqueMinimo) : undefined,
        id_fornecedor: parseInt(produto.id_fornecedor || 1) // Garantir que id_fornecedor seja um número
      };
  
      if (id) {
        await produtoService.atualizar(id, produtoParaEnvio);
      } else {
        await produtoService.cadastrar(produtoParaEnvio);
      }
  
      navigate('/produtos');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert(`Erro ao ${id ? 'atualizar' : 'cadastrar'} produto. Verifique os dados e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-produto">
      <h2>{id ? 'Editar Produto' : 'Novo Produto'}</h2>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={produto.nome}
                onChange={handleChange}
                className={errors.nome ? 'error' : ''}
              />
              {errors.nome && <div className="error-message">{errors.nome}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="codigo">Código *</label>
              <input
                type="text"
                id="codigo"
                name="codigo"
                value={produto.codigo}
                onChange={handleChange}
                className={errors.codigo ? 'error' : ''}
              />
              {errors.codigo && <div className="error-message">{errors.codigo}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={produto.descricao}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preco">Preço *</label>
              <input
                type="number"
                id="preco"
                name="preco"
                value={produto.preco}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={errors.preco ? 'error' : ''}
              />
              {errors.preco && <div className="error-message">{errors.preco}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="custo">Custo *</label>
              <input
                type="number"
                id="custo"
                name="custo"
                value={produto.custo}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={errors.custo ? 'error' : ''}
              />
              {errors.custo && <div className="error-message">{errors.custo}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="quantidade">Quantidade *</label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                value={produto.quantidade}
                onChange={handleChange}
                min="0"
                className={errors.quantidade ? 'error' : ''}
              />
              {errors.quantidade && <div className="error-message">{errors.quantidade}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="estoqueMinimo">Estoque Mínimo</label>
              <input
                type="number"
                id="estoqueMinimo"
                name="estoqueMinimo"
                value={produto.estoqueMinimo}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fabricante">Fabricante</label>
              <input
                type="text"
                id="fabricante"
                name="fabricante"
                value={produto.fabricante}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                name="categoria"
                value={produto.categoria}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="A">Categoria A</option>
                <option value="B">Categoria B</option>
                <option value="C">Categoria C</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* <div className="form-group">
              <label htmlFor="dataValidade">Data de Validade</label>
              <input
                type="date"
                id="dataValidade"
                name="dataValidade"
                value={produto.dataValidade || ''}
                onChange={handleChange}
              />
            </div> */}

            {/* <div className="form-group">
              <label htmlFor="imagemUrl">URL da Imagem</label>
              <input
                type="text"
                id="imagemUrl"
                name="imagemUrl"
                value={produto.imagemUrl || ''}
                onChange={handleChange}
                className={errors.imagemUrl ? 'error' : ''}
              />
              {errors.imagemUrl && <div className="error-message">{errors.imagemUrl}</div>}
            </div> */}
          </div>

          {/* {produto.imagemUrl && (
            <div className="imagem-preview">
              <label>Preview da Imagem:</label>
              <img 
                src={produto.imagemUrl} 
                alt="Preview do produto" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Imagem+Não+Disponível';
                }}
              />
            </div>
          )} */}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="btn-cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-salvar"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FormProduto;