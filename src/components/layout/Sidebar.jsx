import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3>{collapsed ? 'H&R' : 'H&R Estoque'}</h3>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.nome?.charAt(0) || 'U'}
        </div>
        {!collapsed && (
          <div className="user-info">
            <h4>{user?.nome || 'Usuário'}</h4>
            <span>{user?.matricula || ''}</span>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/')}>
            <Link to="/">
              <i className="icon">📊</i>
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={isActive('/produtos')}>
            <Link to="/produtos">
              <i className="icon">📦</i>
              {!collapsed && <span>Produtos</span>}
            </Link>
          </li>
          <li className={isActive('/movimentacoes')}>
            <Link to="/movimentacoes">
              <i className="icon">🔄</i>
              {!collapsed && <span>Movimentações</span>}
            </Link>
          </li>
          <li className={isActive('/usuarios')}>
            <Link to="/usuarios">
              <i className="icon">👥</i>
              {!collapsed && <span>Usuários</span>}
            </Link>
          </li>
          <li className={isActive('/fornecedores')}>
            <Link to="/fornecedores">
              <i className="icon">🏭</i>
              {!collapsed && <span>Fornecedores</span>}
            </Link>
          </li>
          <li className={isActive('/relatorios')}>
            <Link to="/relatorios">
              <i className="icon">📝</i>
              {!collapsed && <span>Relatórios</span>}
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <i className="icon">🚪</i>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;