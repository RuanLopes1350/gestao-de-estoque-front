import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('Dashboard');
  
  useEffect(() => {
    const pathMap = {
      '/': 'Dashboard',
      '/produtos': 'Produtos',
      '/movimentacoes': 'Movimentações',
      '/usuarios': 'Usuários',
      '/fornecedores': 'Fornecedores',
      '/relatorios': 'Relatórios',
    };
    
    if (location.pathname.includes('/produtos/novo')) {
      setPageTitle('Cadastrar Produto');
    } else if (location.pathname.includes('/produtos/editar')) {
      setPageTitle('Editar Produto');
    } else if (location.pathname.includes('/movimentacoes/nova')) {
      setPageTitle('Nova Movimentação');
    } else {
      setPageTitle(pathMap[location.pathname] || 'Página');
    }
  }, [location]);

  return (
    <header className="app-header">
      <h1>{pageTitle}</h1>
      {/* <div className="header-actions">
        <div className="search-bar">
          <input type="text" placeholder="Buscar..." />
          <button className="search-btn">🔍</button>
        </div>
        <div className="notification-icon">
          🔔
        </div>
      </div> */}
    </header>
  );
};

export default Header;