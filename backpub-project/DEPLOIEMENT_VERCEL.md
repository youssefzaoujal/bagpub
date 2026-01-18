# Guide de Déploiement : Frontend Vercel + Backend Railway

Ce guide explique comment déployer votre frontend React sur Vercel tout en utilisant Railway pour le backend Django.

---

## 📋 Architecture

```
Frontend (React)    →    Backend (Django)
   Vercel.com            Railway.app
   (CDN Global)          (API + PostgreSQL)
```

---

## 🚀 ÉTAPE 1 : Déployer le Backend sur Railway

Si vous ne l'avez pas encore fait, suivez le guide `DEPLOIEMENT_RAILWAY.md` pour :
1. Déployer votre backend Django sur Railway
2. Obtenir l'URL du backend (ex: `https://votre-backend.up.railway.app`)
3. Configurer PostgreSQL et toutes les variables d'environnement

**Important** : Notez l'URL du backend Railway ! Vous en aurez besoin pour Vercel.

---

## ⚡ ÉTAPE 2 : Déployer le Frontend sur Vercel

### 2.1 Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub (recommandé)

### 2.2 Importer votre projet

1. Dans le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre repository GitHub
3. Vercel détectera automatiquement que c'est un projet React

### 2.3 Configurer le projet

#### Configuration de base :

1. **Framework Preset** : `Create React App` (détecté automatiquement)
2. **Root Directory** : `frontend` (important !)
   - Cliquez sur "Edit" à côté de "Root Directory"
   - Entrez `frontend`

3. **Build and Output Settings** :
   - Build Command : `npm run build` (déjà configuré)
   - Output Directory : `build` (déjà configuré)
   - Install Command : `npm install` (déjà configuré)

### 2.4 Configurer les Variables d'environnement

**C'est la partie la plus importante !**

1. Dans la section **"Environment Variables"**, ajoutez :

```
REACT_APP_API_URL=https://votre-backend.up.railway.app
```

**Remplacez `votre-backend.up.railway.app` par votre vraie URL Railway !**

2. Assurez-vous que la variable est disponible pour :
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optionnel, pour tester)

### 2.5 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez la fin du build (1-2 minutes)
3. Vercel vous donnera une URL (ex: `https://votre-app.vercel.app`)

---

## 🔧 ÉTAPE 3 : Mettre à jour CORS dans le Backend

Une fois que vous avez l'URL Vercel, vous devez mettre à jour CORS dans Railway :

1. Allez dans votre projet Railway → Service Backend
2. **Settings** → **Variables**
3. Mettez à jour :

```
FRONTEND_URL=https://votre-app.vercel.app
CORS_ALLOWED_ORIGINS=https://votre-app.vercel.app
```

4. Railway redéploiera automatiquement

---

## ✅ ÉTAPE 4 : Vérifier que tout fonctionne

1. Ouvrez votre URL Vercel (ex: `https://votre-app.vercel.app`)
2. Testez l'inscription/connexion
3. Vérifiez que les appels API fonctionnent
4. Ouvrez la console du navigateur (F12) pour vérifier les erreurs

---

## 🎯 Avantages de cette configuration

### Vercel (Frontend) :
- ✅ **CDN global** : Les fichiers statiques sont servis rapidement partout dans le monde
- ✅ **Déploiements automatiques** : Chaque push sur GitHub = nouveau déploiement
- ✅ **Preview URLs** : Une URL de preview pour chaque Pull Request
- ✅ **SSL automatique** : HTTPS gratuit et automatique
- ✅ **Optimisation automatique** : Images, CSS, JS optimisés

### Railway (Backend) :
- ✅ **PostgreSQL géré** : Base de données incluse
- ✅ **Variables d'environnement** : Facile à gérer
- ✅ **Logs en temps réel** : Débogage facile
- ✅ **Évolutif** : Facile d'augmenter les ressources

---

## 🔄 Workflow de développement

### 1. Développement local :

```bash
# Backend (Railway)
cd backend
python manage.py runserver

# Frontend (local)
cd frontend
REACT_APP_API_URL=http://localhost:8000 npm start
```

### 2. Push vers GitHub :

```bash
git add .
git commit -m "Your changes"
git push
```

- **Vercel** : Déploie automatiquement le frontend
- **Railway** : Déploie automatiquement le backend (si configuré)

---

## 🌍 Gestion des environnements

### Variables d'environnement Vercel :

Vous pouvez avoir différentes URLs pour différents environnements :

1. **Production** :
   ```
   REACT_APP_API_URL=https://backend-production.up.railway.app
   ```

2. **Preview/Staging** :
   ```
   REACT_APP_API_URL=https://backend-staging.up.railway.app
   ```

3. **Development** (local) :
   ```bash
   REACT_APP_API_URL=http://localhost:8000 npm start
   ```

---

## 🐛 Résolution de problèmes

### Le frontend ne peut pas se connecter au backend

1. **Vérifiez `REACT_APP_API_URL` dans Vercel** :
   - Settings → Environment Variables
   - Assurez-vous que l'URL est correcte (avec `https://`)

2. **Vérifiez CORS dans Railway** :
   - `CORS_ALLOWED_ORIGINS` doit inclure votre URL Vercel
   - Format : `https://votre-app.vercel.app` (sans `/` à la fin)

3. **Vérifiez les logs** :
   - Vercel : Deployments → Click sur un déploiement → Logs
   - Railway : Deploy Logs pour voir les erreurs backend

### Erreur CORS dans le navigateur

**Solution** : Ajoutez l'URL Vercel dans `CORS_ALLOWED_ORIGINS` dans Railway

```
CORS_ALLOWED_ORIGINS=https://votre-app.vercel.app,https://votre-app-git-main.vercel.app
```

(La deuxième URL est pour les previews Vercel)

### Les variables d'environnement ne sont pas appliquées

1. Les variables `REACT_APP_*` doivent être définies **avant** le build
2. Si vous ajoutez une variable après le build, **redéployez**
3. Vérifiez que la variable est activée pour "Production"

---

## 📝 Notes importantes

### Sécurité

- ✅ **Ne jamais** commiter les variables d'environnement
- ✅ Utilisez les Environment Variables dans Vercel
- ✅ Les variables `REACT_APP_*` sont exposées dans le build (pas de secrets ici)

### Performance

- Vercel sert le frontend depuis un CDN (très rapide)
- Railway gère votre API backend
- Les deux sont optimisés pour la production

### Coûts

- **Vercel** : Gratuit pour les projets personnels (limites généreuses)
- **Railway** : $5/mois gratuit + pay-as-you-go après

---

## 🎉 Félicitations !

Votre architecture est maintenant :
- **Frontend** : Vercel (rapide, CDN global)
- **Backend** : Railway (PostgreSQL, API Django)

C'est une combinaison très performante et moderne !

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Railway](https://docs.railway.app)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
