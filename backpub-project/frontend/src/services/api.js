// services/api.js - AJOUTER ces fonctions
import axios from 'axios';
import { API_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne rediriger que sur les vraies erreurs 401 d'authentification
    // Exclure les routes publiques ou les erreurs réseau
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Ne pas rediriger si on est déjà sur la page de login ou si c'est une erreur réseau
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Utiliser un petit délai pour éviter les redirections en boucle
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// AJOUTER CES NOUVELLES FONCTIONS :
export const passwordAPI = {
  // Mot de passe oublié
  forgotPassword: (email) => api.post('/auth/password/forgot/', { email }),
  
  // Valider un token de réinitialisation
  validateResetToken: (token) => api.get(`/auth/password/reset/${token}/validate/`),
  
  // Réinitialiser le mot de passe
  resetPassword: (token, newPassword, confirmPassword) => 
    api.post('/auth/password/reset/', {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword
    }),
  
  // Changer le mot de passe (utilisateur connecté)
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/auth/password/change/', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    }),
};

// ... autres exports existants ...

export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  registerClient: (data) => api.post('/auth/register/client/', data),
  registerPartner: (data) => api.post('/auth/register/partner/', data),
  getProfile: () => api.get('/auth/me/'),
};

// ... autres exports ...

export default api;