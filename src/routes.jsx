import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import ListaProdutos from './pages/Produtos/ListaProdutos';
import FormProduto from './pages/Produtos/FormProduto';
import DetalhesProduto from './pages/Produtos/DetalhesProduto';
import ListaMovimentacoes from './pages/Movimentacoes/ListaMovimentacoes';
import FormMovimentacao from './pages/Movimentacoes/FormMovimentacao';
import Relatorios from './pages/Relatorios/Relatorios';

const RotasPrivadas = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-app">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* <Route path="/produtos" element={<ListaProdutos />} /> */}
        <Route path="/produtos" element={<Layout><ListaProdutos /></Layout>} />
        <Route path="/produtos/novo" element={<Layout><FormProduto /></Layout>} />
        <Route path="/produtos/editar/:id" element={<Layout><FormProduto /></Layout>} />
        <Route path="/produtos/:id" element={<Layout><DetalhesProduto /></Layout>} />
        
        <Route path="/movimentacoes" element={<Layout><ListaMovimentacoes /></Layout>} />
        <Route path="/movimentacoes/nova" element={<Layout><FormMovimentacao /></Layout>} />
        <Route path="/movimentacoes/:id" element={<Layout><FormMovimentacao /></Layout>} />
        
        <Route path="/relatorios" element={<Layout><Relatorios /></Layout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<RotasPrivadas />} />
    </Routes>
  );
};

export default AppRoutes;