import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [user, setUser] = useState(null);
  const [user, setUser] = useState({
    _id: '1',
    nome: 'Usuário Teste',
    matricula: '123456',
    tipoUsuario: 'admin'
  });
  // const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const storedUser = localStorage.getItem('@GestaoEstoque:user');
  //   const storedToken = localStorage.getItem('@GestaoEstoque:token');
    
  //   if (storedUser && storedToken) {
  //     setUser(JSON.parse(storedUser));
  //     api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  //   }
    
  //   setLoading(false);
  // }, []);

  const login = async (matricula, senha) => {
    try {
      const response = await api.post('/auth/login', { matricula, senha });
      const { token, user } = response.data;
      
      localStorage.setItem('@GestaoEstoque:token', token);
      localStorage.setItem('@GestaoEstoque:user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao realizar login' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      localStorage.removeItem('@GestaoEstoque:token');
      localStorage.removeItem('@GestaoEstoque:user');
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};