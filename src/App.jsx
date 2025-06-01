import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import api from './services/api';
import './App.css';

function App() {
  useEffect(() => {
    console.log('App inicializado');
    
    // Teste de conexão com API
    const testConnection = async () => {
      try {
        console.log('Testando conexão com API...');
        await api.get('/produtos');
        console.log('Conexão com API estabelecida com sucesso!');
      } catch (error) {
        console.error('Erro na conexão com API:', error);
      }
    };
    
    testConnection();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;