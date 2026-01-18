import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';

const AuthContext = createContext();

// Fonction utilitaire pour décoder le JWT (sans vérification de signature)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Crée un hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Le Provider comme composant React
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifie si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me/`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Ne pas déconnecter immédiatement si c'est juste une erreur réseau temporaire
      // Vérifier que c'est bien une 401 avant de déconnecter
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      // Appel login et récupération du token (sans timeout strict pour éviter les erreurs)
      const loginResponse = await axios.post(`${API_URL}/auth/login/`, {
        username,
        password
      });
      
      const { access } = loginResponse.data;
      if (!access) {
        return { 
          success: false, 
          error: 'Token non reçu du serveur' 
        };
      }
      
      localStorage.setItem('token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Décoder le JWT pour obtenir le rôle immédiatement (sans appel API)
      const decodedToken = decodeJWT(access);
      
      if (decodedToken && decodedToken.role) {
        // Créer un objet user minimal avec les données du token
        const userFromToken = {
          id: decodedToken.user_id || decodedToken.userId,
          username: decodedToken.username || username,
          role: decodedToken.role,
          email: decodedToken.email || ''
        };
        
        // Mettre à jour le state immédiatement pour la redirection
        setUser(userFromToken);
        
        // Récupérer les données complètes en arrière-plan (non bloquant, sans timeout)
        // On ne bloque pas la redirection
        Promise.resolve().then(() => {
          fetchUser().catch(() => {
            // Si ça échoue, on garde les données du token
            // Pas de console.warn pour éviter le bruit
          });
        });
        
        return { success: true, user: userFromToken };
      }
      
      // Fallback : récupérer les données utilisateur si le token ne contient pas le rôle
      // Mais seulement si vraiment nécessaire
      try {
        const userResponse = await axios.get(`${API_URL}/auth/me/`);
        setUser(userResponse.data);
        return { success: true, user: userResponse.data };
      } catch (userError) {
        // Si fetchUser échoue, on continue quand même avec le token
        // On retourne success pour permettre la redirection
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          (error.code === 'ECONNABORTED' ? 'Le serveur met trop de temps à répondre' : error.message) ||
                          'Login failed';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const registerClient = async (userData) => {
    try {
      await axios.post(`${API_URL}/auth/register/client/`, userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const registerPartner = async (partnerData) => {
    try {
      await axios.post(`${API_URL}/auth/register/partner/`, partnerData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    registerClient,
    registerPartner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export par défaut pour faciliter l'import
export default AuthContext;