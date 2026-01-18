import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';

// --- COMPOSANTS D'ICÔNES (Pour éviter d'installer une lib externe) ---
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);
const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);

const CampaignLanding = () => {
  const { companySlug, secure_token } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const identifier = companySlug || secure_token;

  useEffect(() => {
    if (identifier) fetchCampaignData();
  }, [identifier]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Chargement landing page pour: ${identifier}`);
      
      const response = await axios.get(
        `${API_URL}/landing/${identifier}/`,
        { timeout: 10000, headers: { 'Accept': 'application/json' } }
      );
      
      if (response.data.type === 'campaign') {
        setData(response.data);
      } else {
        setError('Format de données invalide');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      if (err.response) {
        if (err.response.status === 404) setError('Page introuvable ou supprimée');
        else if (err.response.status === 403) setError('Accès non autorisé');
        else setError(`Erreur serveur (${err.response.status})`);
      } else {
        setError('Problème de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => navigate('/');

  // --- RENDU : LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-700 animate-pulse">Chargement de votre expérience...</h2>
      </div>
    );
  }

  // --- RENDU : ERROR / INVALID ---
  if (!identifier || error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops !</h2>
          <p className="text-slate-500 mb-6">{error || "L'URL semble invalide."}</p>
          <button onClick={handleBackToHome} className="w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
            <ArrowLeftIcon /> Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const { campaign, design, company, whatsapp_url } = data;

  // --- RENDU : MAIN CAMPAIGN ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 text-slate-800">
      
      {/* Background Decoratif (Blurry Blobs) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-indigo-200/40 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6">
        
        {/* HEADER CARD */}
        <header className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          {design.logo && (
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-3 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
              <img 
                src={design.logo} 
                alt={company.company_name} 
                className="w-full h-full object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mb-2">
            {company.company_name}
          </h1>
          
          {design.slogan && (
            <p className="text-base sm:text-lg text-slate-500 font-medium italic mb-4 sm:mb-6">"{design.slogan}"</p>
          )}

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold tracking-wide border border-indigo-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Campagne BagPub • 1 000 sacs
          </div>
        </header>

        {/* QR & CONTACT GRID - Mobile Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* QR CARD */}
          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
             {/* Cercles déco */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-xl"></div>

            <h2 className="text-xl font-bold mb-1 opacity-90">Gardez le contact</h2>
            <p className="text-sm text-indigo-100 mb-6">Scannez pour enregistrer</p>
            
            <div className="bg-white p-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              {design.qr_code ? (
                <img src={design.qr_code} alt="QR Code" className="w-40 h-40 object-cover rounded-xl" />
              ) : (
                <div className="w-40 h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">QR Indisponible</div>
              )}
            </div>
            
            <p className="mt-4 text-xs font-medium text-indigo-200 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Ouvrez l'appareil photo
            </p>
          </section>

          {/* CONTACT ACTIONS */}
          <section className="flex flex-col gap-3">
             {/* WhatsApp Button (Highlight) */}
             {whatsapp_url && design.contact_method !== 'email' && (
              <a href={whatsapp_url} target="_blank" rel="noopener noreferrer" 
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center gap-4 group">
                <div className="bg-white/20 p-3 rounded-xl group-hover:rotate-12 transition-transform">
                  <WhatsappIcon />
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium opacity-90">Discussion instantanée</div>
                  <div className="text-lg font-bold">WhatsApp</div>
                </div>
              </a>
            )}

            {/* Phone Button */}
            {design.company_phone && (
              <a href={`tel:${design.company_phone}`} 
                className="flex-1 bg-white hover:bg-slate-50 text-slate-800 p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 transition-all active:scale-95 flex items-center gap-4 group">
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                  <PhoneIcon />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-medium">Appelez-nous</div>
                  <div className="text-lg font-bold">{design.company_phone}</div>
                </div>
              </a>
            )}

            {/* Email Button */}
            {design.company_email && (
              <a href={`mailto:${design.company_email}`} 
                className="flex-1 bg-white hover:bg-slate-50 text-slate-800 p-4 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 transition-all active:scale-95 flex items-center gap-4 group">
                <div className="bg-purple-50 text-purple-600 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                  <MailIcon />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-medium">Écrivez-nous</div>
                  <div className="text-lg font-bold truncate max-w-[200px]">{design.company_email}</div>
                </div>
              </a>
            )}
          </section>
        </div>

        {/* ADDRESS CARD */}
        {design.company_address && (
          <div className="bg-white/80 backdrop-blur-md border border-white/60 p-6 rounded-3xl shadow-lg flex items-start gap-4">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl shrink-0">
              <MapIcon />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Nous trouver</h3>
              <p className="text-lg font-medium text-slate-800 leading-snug">{design.company_address}</p>
            </div>
          </div>
        )}

        {/* DESCRIPTION & GALLERY */}
        {design.want_landing_page && design.landing_description && (
          <section className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">À propos</h3>
              <p className="text-slate-600 leading-relaxed text-lg">{design.landing_description}</p>
            </div>
            
            {/* Gallery Grid */}
            {[design.landing_image_1, design.landing_image_2, design.landing_image_3].filter(Boolean).length > 0 && (
              <div className="px-8 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {[design.landing_image_1, design.landing_image_2, design.landing_image_3]
                    .filter(Boolean)
                    .map((img, idx) => (
                      <div key={idx} className={`rounded-2xl overflow-hidden shadow-md h-40 group ${idx === 0 ? 'col-span-2 md:col-span-1' : ''}`}>
                        <img 
                          src={img} 
                          alt="Galerie" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* CAMPAIGN STATS (Minimalist) */}
        <div className="grid grid-cols-3 gap-4 text-center py-6">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🎒</span>
            <span className="text-xs font-bold text-slate-500 uppercase">Quantité</span>
            <span className="font-bold text-slate-800">1 000 Sacs</span>
          </div>
          <div className="flex flex-col items-center border-l border-r border-slate-200">
            <span className="text-2xl mb-1">📍</span>
            <span className="text-xs font-bold text-slate-500 uppercase">Couverture</span>
            <span className="font-bold text-slate-800">Locale</span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-2xl mb-1">🚀</span>
             <span className="text-xs font-bold text-slate-500 uppercase">Impact</span>
             <span className="font-bold text-slate-800">Éco-resp.</span>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="text-center mt-8 pb-8">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
            <div className="h-px w-8 bg-slate-300"></div>
            <span className="text-xs font-semibold uppercase tracking-widest">BagPub</span>
            <div className="h-px w-8 bg-slate-300"></div>
          </div>
          
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Vous avez reçu ce message grâce à un sac publicitaire éco-responsable distribué dans votre quartier.
          </p>
          
          <div className="inline-flex gap-4 text-xs font-medium text-slate-400">
            <a href="https://BagPub.com" className="hover:text-indigo-600 transition-colors">Site Officiel</a>
            <span>•</span>
            <span>Commande #{campaign.order_number}</span>
            <span>•</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default CampaignLanding;