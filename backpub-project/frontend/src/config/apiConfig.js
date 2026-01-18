// Configuration centralisée pour l'API
// Utilise REACT_APP_API_URL si défini, sinon utilise localhost pour le développement
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const API_URL = `${API_BASE_URL}/api`;

// Exporter pour debug (visible dans la console)
if (typeof window !== 'undefined') {
  window.__API_CONFIG__ = {
    API_BASE_URL,
    API_URL,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
  };
  console.log('🔧 API Configuration:', window.__API_CONFIG__);
}
