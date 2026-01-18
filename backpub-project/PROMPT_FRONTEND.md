# PROMPT COMPLET POUR GÉNÉRATION DU FRONTEND BagPub

## 🎯 VUE D'ENSEMBLE DU PROJET

BagPub est une plateforme SaaS complète de gestion de campagnes de cartes de visite/publicitaires. Le système permet aux clients de créer des campagnes de distribution de cartes, de choisir entre des templates prédéfinis ou d'uploader leurs propres designs, et de suivre l'ensemble du processus jusqu'à la livraison.

**Backend :** Django REST Framework avec JWT authentication, déjà implémenté et fonctionnel
**Frontend à créer :** Application React moderne, élégante et professionnelle avec une UX exceptionnelle

---

## 🏗️ ARCHITECTURE BACKEND (DÉJÀ IMPLÉMENTÉE)

### Base URL API
```
https://127.0.0.1:8000/api
```

### Authentification
- **Type :** JWT (JSON Web Tokens)
- **Format :** `Authorization: Bearer <token>`
- **Token stocké dans :** `localStorage.getItem('token')`

### Structure des réponses
- **Succès :** Status 200/201 avec données JSON
- **Erreur :** Status 4xx/5xx avec `{ "error": "message" }` ou `{ "detail": "message" }`

---

## 👥 RÔLES ET PERMISSIONS

### 1. **ADMIN** (Administrateur)
- Accès complet à toutes les fonctionnalités
- Gestion des campagnes, clients, partenaires
- Création et assignation de batchs d'impression
- Envoi des campagnes à l'impression
- Dashboard avec statistiques globales

### 2. **CLIENT** (Client)
- Création de campagnes
- Choix entre template ou carte personnalisée
- Suivi de ses campagnes
- Dashboard personnel
- Gestion de son profil

### 3. **PARTNER** (Partenaire/Imprimeur)
- Visualisation des campagnes assignées
- Gestion des batchs d'impression
- Mise à jour des statuts

### 4. **PRINT_EMPLOYEE** (Employé d'impression)
- Dashboard dédié aux ordres d'impression
- Assignation d'ordres à soi-même
- Marquage des ordres comme terminés
- Visualisation des détails d'impression

---

## 📡 ENDPOINTS API COMPLETS

### 🔐 AUTHENTIFICATION

#### 1. Inscription Client
```
POST /api/auth/register/client/
Body: {
  "username": "string",
  "email": "string",
  "password": "string",
  "company_name": "string",
  "phone": "string",
  "siret": "string (optionnel)",
  "tva_number": "string (optionnel)",
  "address": "string (optionnel)",
  "city": "string (optionnel)",
  "postal_code": "string (optionnel)"
}
Response: { "message": "Inscription réussie !" }
```

#### 2. Inscription Partenaire
```
POST /api/auth/register/partner/
Body: {
  "username": "string",
  "email": "string",
  "password": "string",
  "company_name": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "postal_code": "string",
  "partner_type": "string",
  "coverage_radius": "integer"
}
Response: { "message": "Demande de partenariat envoyée." }
```

#### 3. Connexion
```
POST /api/auth/login/
Body: { "username": "string", "password": "string" }
Response: {
  "access": "jwt_token",
  "refresh": "refresh_token"
}
```

#### 4. Rafraîchir Token
```
POST /api/auth/refresh/
Body: { "refresh": "refresh_token" }
Response: { "access": "new_jwt_token" }
```

#### 5. Profil Utilisateur
```
GET /api/auth/me/
Headers: Authorization: Bearer <token>
Response: {
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "admin|client|partner|print_employee",
  "company_name": "string",
  "phone": "string",
  ...
}
```

#### 6. Mot de passe oublié
```
POST /api/auth/password/forgot/
Body: { "email": "string" }
Response: { "message": "Si votre email existe..." }
```

#### 7. Réinitialiser mot de passe
```
POST /api/auth/password/reset/
Body: {
  "token": "string",
  "new_password": "string",
  "confirm_password": "string"
}
Response: { "message": "Votre mot de passe a été réinitialisé..." }
```

#### 8. Valider token de réinitialisation
```
GET /api/auth/password/reset/{token}/validate/
Response: {
  "valid": true/false,
  "email": "string",
  "company_name": "string"
}
```

---

### 📊 CAMPAGNES

#### 9. Créer une campagne complète (ENDPOINT PRINCIPAL)
```
POST /api/campaigns/create-complete/
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body (FormData):
  - name: "string" (optionnel, généré auto si vide)
  - quantity: "1000|2000|3000|4000|5000" (requis)
  - postal_codes: "75001,75002,75003,..." (requis, min 5 codes)
  - special_instructions: "string" (optionnel)
  - faces: "1|2" (défaut: 1)
  - use_custom_card: "true|false" (défaut: false)
  - custom_card: File (si use_custom_card=true)
  
  Si use_custom_card=false (mode template):
    - design: JSON string {
        "slogan": "string",
        "company_email": "string",
        "company_phone": "string",
        "company_address": "string",
        "company_postal_code": "string",
        "template": "template_1|template_2|...|template_20",
        "accent_color": "#HEXCOLOR",
        "contact_method": "email|whatsapp|both"
      }
    - logo: File (optionnel)

Response: {
  "success": true,
  "campaign_id": "uuid",
  "order_number": "string",
  "campaign_name": "string",
  "quantity": 1000,
  "estimated_price": 100.00,
  "has_custom_card": false,
  "has_design": true,
  "design": {
    "template": "template_1",
    "qr_code_url": "https://..."
  },
  "message": "Campagne créée avec succès !"
}
```

#### 10. Liste des campagnes (ViewSet)
```
GET /api/campaigns/
Headers: Authorization: Bearer <token>
Response: [Campaign objects array]
```

#### 11. Détails d'une campagne
```
GET /api/campaigns/{uuid}/
Headers: Authorization: Bearer <token>
Response: Campaign object complet
```

#### 12. Mettre à jour une campagne
```
PUT/PATCH /api/campaigns/{uuid}/
Headers: Authorization: Bearer <token>
Body: { ...champs à modifier... }
```

#### 13. Supprimer une campagne
```
DELETE /api/campaigns/{uuid}/
Headers: Authorization: Bearer <token>
```

#### 14. Design d'une campagne
```
POST /api/campaigns/{uuid}/design/
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: {
  "slogan": "string",
  "company_email": "string",
  "company_phone": "string",
  "template": "template_1",
  "accent_color": "#HEX",
  "contact_method": "email|whatsapp|both",
  "logo": File (optionnel)
}
```

#### 15. Logs d'une campagne
```
GET /api/campaigns/{uuid}/logs/
Headers: Authorization: Bearer <token>
Response: [Log objects array]
```

#### 16. Preuves d'une campagne
```
GET /api/campaigns/{uuid}/proofs/
Headers: Authorization: Bearer <token>
Response: [Proof objects array]

POST /api/campaigns/{uuid}/proofs/
Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: { "image": File, "description": "string" }
```

---

### 👨‍💼 ADMIN

#### 17. Dashboard Admin - Campagnes
```
GET /api/admin/campaigns/
Headers: Authorization: Bearer <token> (admin only)
Response: {
  "stats": {
    "total_campaigns": 100,
    "unassigned_campaigns": 20,
    "assigned_campaigns": 30,
    "in_printing": 25,
    "printed_campaigns": 25
  },
  "campaigns": [Campaign objects],
  "unassigned_campaigns": [Campaign objects]
}
```

#### 18. Envoyer campagnes à l'impression
```
POST /api/admin/campaigns/send-to-print/
Headers: Authorization: Bearer <token> (admin only)
Body: {
  "campaign_ids": ["uuid1", "uuid2", ...]
}
Response: {
  "success": true,
  "message": "X campagne(s) envoyée(s) par email...",
  "campaigns_count": 5,
  "total_quantity": 5000,
  "email_sent_to": "email@example.com"
}
```

#### 19. Liste des clients
```
GET /api/admin/clients/
Headers: Authorization: Bearer <token> (admin only)
Response: [{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "company_name": "string",
  "campaigns_count": 10,
  "total_spent": 5000.00,
  ...
}]
```

---

### 👤 CLIENT

#### 20. Dashboard Client
```
GET /api/client/campaigns/
Headers: Authorization: Bearer <token> (client only)
Response: {
  "stats": {
    "total": 10,
    "in_printing": 3,
    "printed": 5,
    "delivered": 2,
    "with_custom_card": 2,
    "total_investment": 5000.00
  },
  "campaigns": [Campaign objects avec détails]
}
```

---

### 📈 DASHBOARD STATS

#### 21. Statistiques générales
```
GET /api/dashboard/stats/
Headers: Authorization: Bearer <token>
Response (selon rôle):
  - Client: {
      "total_campaigns": 10,
      "active_campaigns": 5,
      "campaigns_in_printing": 3,
      "total_investment": 5000.00
    }
  - Admin: {
      "total_campaigns": 100,
      "total_clients": 50,
      "total_partners": 10,
      "unassigned_campaigns": 20,
      "campaigns_in_printing": 25,
      "printed_campaigns": 30
    }
```

---

### 🖨️ BATCHS ET IMPRESSION

#### 22. Liste des batchs
```
GET /api/print-batches/
Headers: Authorization: Bearer <token> (admin only)
Response: [PrintBatch objects]
```

#### 23. Détails d'un batch
```
GET /api/print-batches/{id}/
GET /api/print-batches/{id}/details/
```

#### 24. Assigner un partenaire à un batch
```
POST /api/print-batches/{id}/assign-partner/
Body: { "partner_id": "uuid" }
```

#### 25. Envoyer batch à l'impression
```
POST /api/print-batches/{id}/send-to-print/
```

#### 26. Dashboard Employé Impression
```
GET /api/print-orders/{id}/printing-details/
Headers: Authorization: Bearer <token> (print_employee)
Response: {
  "stats": {
    "total_assigned": 5,
    "in_progress": 2,
    "completed_today": 3,
    "available_orders": 10
  },
  "available_orders": [...],
  "assigned_orders": [...]
}
```

#### 27. Assigner un ordre à soi-même
```
POST /api/print-orders/{id}/assign-to-me/
```

#### 28. Marquer ordre comme terminé
```
POST /api/print-orders/{id}/mark-completed/
```

---

### 🤝 PARTENAIRES

#### 29. Liste des partenaires
```
GET /api/partners/
Headers: Authorization: Bearer <token>
Response: [Partner objects]
```

---

## 📦 MODÈLES DE DONNÉES

### User
```javascript
{
  id: "uuid",
  username: "string",
  email: "string",
  role: "admin|client|partner|print_employee",
  company_name: "string",
  phone: "string",
  city: "string",
  postal_code: "string",
  siret: "string",
  tva_number: "string",
  is_active: boolean
}
```

### Campaign
```javascript
{
  id: "uuid",
  order_number: "string (unique)",
  name: "string",
  client: "uuid",
  client_details: { username, email, company_name },
  partner: "uuid|null",
  partner_details: { company_name, city } | null,
  postal_codes: "75001,75002,...",
  quantity: 1000|2000|3000|4000|5000,
  status: "CREATED|ASSIGNED|IN_PRINTING|PRINTED|IN_DISTRIBUTION|DELIVERED|FINISHED",
  printing_status: "NOT_SENT|SENT_TO_PRINT|IN_PROGRESS|COMPLETED",
  estimated_price: 100.00,
  faces: 1|2,
  use_custom_card: boolean,
  has_custom_card: boolean,
  custom_card: "url|null",
  design: {
    template: "template_1|...|template_20",
    slogan: "string",
    company_email: "string",
    company_phone: "string",
    accent_color: "#HEX",
    qr_code_url: "string",
    logo: "url|null"
  } | null,
  payment_status: "PENDING|PAID|FAILED|REFUNDED",
  created_at: "ISO datetime",
  updated_at: "ISO datetime"
}
```

### Partner
```javascript
{
  id: "uuid",
  company_name: "string",
  email: "string",
  phone: "string",
  city: "string",
  postal_code: "string",
  coverage_radius: integer,
  is_active: boolean
}
```

---

## 🎨 DESIGN UI/UX - EXIGENCES

### Style Global
- **Design moderne et professionnel** avec une identité visuelle forte
- **Palette de couleurs :** 
  - Primaire : Bleu professionnel (#3B82F6 ou similaire)
  - Secondaire : Accents verts pour les succès, orange pour les warnings
  - Fond : Blanc/Gris très clair (#F9FAFB)
- **Typography :** Police moderne et lisible (Inter, Poppins, ou similaire)
- **Espacements :** Design aéré avec beaucoup d'espace blanc
- **Animations :** Transitions fluides et micro-interactions subtiles
- **Responsive :** Mobile-first, parfaitement adapté à tous les écrans

### Composants Clés

#### 1. **Page de Connexion**
- Design épuré et centré
- Formulaire élégant avec validation en temps réel
- Lien "Mot de passe oublié"
- Options d'inscription (Client/Partenaire)
- Animations subtiles au focus

#### 2. **Dashboard Principal**
- **Cards de statistiques** avec icônes et graphiques
- **Tableaux interactifs** avec tri, filtres, recherche
- **Graphiques** (Chart.js ou Recharts) pour visualiser les données
- **Notifications** en temps réel
- **Sidebar navigation** collapsible et moderne
- **Breadcrumbs** pour la navigation

#### 3. **Création de Campagne**
- **Wizard multi-étapes** avec indicateur de progression
- **Étape 1 :** Informations de base (quantité, codes postaux)
- **Étape 2 :** Choix du mode (Template ou Carte personnalisée)
- **Étape 3a (Template) :** 
  - Sélection de template (grille avec preview)
  - Personnalisation (couleurs, slogan, logo)
  - Prévisualisation en temps réel
- **Étape 3b (Custom) :** Upload de fichier avec preview
- **Étape 4 :** Récapitulatif et validation
- **Validation en temps réel** à chaque étape
- **Sauvegarde automatique** des brouillons

#### 4. **Liste des Campagnes**
- **Vue tableau** avec colonnes personnalisables
- **Vue carte** avec preview visuelle
- **Filtres avancés** (statut, date, quantité)
- **Recherche** en temps réel
- **Actions rapides** (modifier, supprimer, voir détails)
- **Badges de statut** colorés et visuels

#### 5. **Détails de Campagne**
- **Timeline** visuelle du statut
- **Onglets** : Informations, Design, Logs, Preuves
- **Preview** du design ou de la carte personnalisée
- **Actions contextuelles** selon le rôle

#### 6. **Dashboard Admin**
- **Vue d'ensemble** avec KPIs
- **Graphiques** de tendances
- **Liste des campagnes non assignées** avec actions rapides
- **Gestion des batchs** avec drag & drop (optionnel)

#### 7. **Dashboard Employé Impression**
- **Liste des ordres disponibles** avec détails
- **Assignation rapide** en un clic
- **Suivi de progression** visuel
- **Détails d'impression** avec fichiers téléchargeables

---

## 🛠️ TECHNOLOGIES À UTILISER

### Core
- **React 18+** avec hooks modernes
- **React Router v6** pour la navigation
- **Axios** pour les appels API
- **Context API** pour la gestion d'état globale (Auth, etc.)

### UI/UX
- **Tailwind CSS** pour le styling (recommandé) OU **Material-UI** / **Chakra UI**
- **Framer Motion** pour les animations
- **React Hook Form** pour les formulaires
- **Zod** ou **Yup** pour la validation

### Visualisation
- **Recharts** ou **Chart.js** pour les graphiques
- **React Table** ou **TanStack Table** pour les tableaux avancés

### Utilitaires
- **date-fns** pour la manipulation des dates
- **react-hot-toast** ou **react-toastify** pour les notifications
- **react-loading-skeleton** pour les loaders

### Gestion d'état (optionnel)
- **Zustand** ou **Jotai** pour un state management léger si nécessaire

---

## ✨ FONCTIONNALITÉS DÉTAILLÉES

### 1. Authentification
- [ ] Page de connexion élégante
- [ ] Inscription client avec formulaire complet
- [ ] Inscription partenaire
- [ ] Mot de passe oublié avec flow complet
- [ ] Réinitialisation de mot de passe
- [ ] Gestion automatique du token JWT
- [ ] Refresh token automatique
- [ ] Redirection selon le rôle après connexion
- [ ] Protection des routes selon les permissions

### 2. Dashboard Client
- [ ] Vue d'ensemble avec statistiques
- [ ] Liste des campagnes avec filtres
- [ ] Graphiques de progression
- [ ] Actions rapides (créer campagne, voir détails)
- [ ] Notifications de statut

### 3. Création de Campagne
- [ ] Wizard multi-étapes fluide
- [ ] Validation en temps réel
- [ ] Upload de fichiers avec preview
- [ ] Sélection de template avec preview
- [ ] Personnalisation de design
- [ ] Calcul automatique du prix
- [ ] Prévisualisation avant soumission
- [ ] Gestion des erreurs claire

### 4. Gestion des Campagnes
- [ ] Liste avec vue tableau/carte
- [ ] Filtres et recherche avancée
- [ ] Détails complets avec timeline
- [ ] Modification de campagne
- [ ] Suppression avec confirmation
- [ ] Téléchargement de fichiers

### 5. Dashboard Admin
- [ ] Vue globale avec KPIs
- [ ] Gestion des campagnes non assignées
- [ ] Création et assignation de batchs
- [ ] Envoi à l'impression (sélection multiple)
- [ ] Gestion des clients
- [ ] Graphiques et rapports

### 6. Dashboard Employé Impression
- [ ] Liste des ordres disponibles
- [ ] Assignation rapide
- [ ] Suivi de progression
- [ ] Détails d'impression
- [ ] Téléchargement de fichiers

### 7. Profil Utilisateur
- [ ] Affichage des informations
- [ ] Modification du profil
- [ ] Changement de mot de passe
- [ ] Historique des actions

---

## 🎯 EXIGENCES TECHNIQUES

### Performance
- **Lazy loading** des routes
- **Code splitting** automatique
- **Optimisation des images** (compression, lazy load)
- **Memoization** des composants lourds
- **Debouncing** des recherches

### Accessibilité
- **ARIA labels** appropriés
- **Navigation au clavier** complète
- **Contraste** des couleurs conforme WCAG
- **Focus visible** sur tous les éléments interactifs

### Sécurité
- **Validation côté client** (mais toujours vérifier côté serveur)
- **Sanitization** des inputs
- **Gestion sécurisée** des tokens
- **Protection CSRF** (gérée par Django)

### UX
- **Loading states** pour toutes les actions async
- **Error handling** avec messages clairs
- **Success feedback** pour toutes les actions
- **Confirmations** pour les actions destructives
- **Undo** pour les actions importantes (optionnel)

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
- **Mobile :** < 640px
- **Tablet :** 640px - 1024px
- **Desktop :** > 1024px
- **Large Desktop :** > 1280px

### Adaptations
- **Navigation :** Menu hamburger sur mobile
- **Tableaux :** Scroll horizontal ou vue carte sur mobile
- **Formulaires :** Colonnes empilées sur mobile
- **Graphiques :** Adaptés à la taille d'écran

---

## 🎨 EXEMPLES DE COMPOSANTS ATTENDUS

### Card de Campagne
```jsx
- Image preview (template ou custom card)
- Nom de la campagne
- Numéro de commande
- Statut avec badge coloré
- Quantité et prix
- Dates
- Actions rapides (voir, modifier, supprimer)
```

### Formulaire de Création
```jsx
- Steps indicator (1/4, 2/4, etc.)
- Validation en temps réel
- Messages d'erreur contextuels
- Preview en temps réel
- Boutons navigation (Précédent, Suivant, Soumettre)
```

### Dashboard Stats
```jsx
- Cards avec icônes
- Graphiques interactifs
- Comparaisons (vs période précédente)
- Filtres par période
```

---

## 🚀 STRUCTURE DE PROJET SUGGÉRÉE

```
src/
├── components/
│   ├── common/          # Composants réutilisables
│   ├── forms/           # Composants de formulaire
│   ├── layout/          # Header, Sidebar, Footer
│   └── ui/              # Boutons, Cards, Modals
├── pages/
│   ├── auth/            # Login, Register, ForgotPassword
│   ├── dashboard/       # Dashboards par rôle
│   ├── campaigns/       # Liste, Création, Détails
│   └── admin/           # Pages admin
├── services/
│   ├── api.js           # Configuration axios
│   └── endpoints.js     # Tous les endpoints
├── context/
│   └── AuthContext.js   # Gestion de l'authentification
├── hooks/
│   ├── useAuth.js
│   ├── useCampaigns.js
│   └── ...
├── utils/
│   ├── validation.js
│   ├── formatters.js
│   └── constants.js
└── App.js
```

---

## 📝 NOTES IMPORTANTES

1. **Tous les appels API doivent inclure le token JWT** dans les headers
2. **Gérer les erreurs 401** en redirigeant vers la page de connexion
3. **Les fichiers uploadés** doivent être en `multipart/form-data`
4. **Les quantités** sont limitées à : 1000, 2000, 3000, 4000, 5000
5. **Les codes postaux** doivent être au format français (5 chiffres)
6. **Les templates** vont de `template_1` à `template_20`
7. **Le prix** est calculé automatiquement : (quantité / 1000) * 100€
8. **Les statuts** ont des couleurs spécifiques à respecter
9. **Le backend est en HTTPS** avec certificat auto-signé (accepter dans le navigateur)
10. **CORS est configuré** pour accepter toutes les origines en développement

---

## 🎯 OBJECTIF FINAL

Créer une application React **moderne, élégante, performante et intuitive** qui offre une expérience utilisateur exceptionnelle. Le frontend doit être **professionnel, responsive, et visuellement impressionnant** tout en restant **fonctionnel et facile à utiliser**.

L'interface doit refléter la qualité et le professionnalisme de la plateforme BagPub, avec une attention particulière aux détails, aux animations subtiles, et à la fluidité de l'expérience utilisateur.

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Toutes les pages sont accessibles et fonctionnelles
- [ ] L'authentification fonctionne pour tous les rôles
- [ ] La création de campagne fonctionne (template et custom)
- [ ] Les dashboards affichent les bonnes données
- [ ] Les filtres et recherches fonctionnent
- [ ] Le responsive est parfait sur tous les écrans
- [ ] Les animations sont fluides
- [ ] Les erreurs sont bien gérées et affichées
- [ ] Les loading states sont présents partout
- [ ] Le code est propre et bien organisé
- [ ] Les performances sont optimales

---

**BONNE CHANCE ! Créez un frontend à couper le souffle ! 🚀✨**
