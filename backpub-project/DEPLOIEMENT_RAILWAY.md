# Guide de Déploiement sur Railway

Ce guide vous explique étape par étape comment déployer votre application Django + React sur Railway.

## 📋 Prérequis

1. Un compte Railway (gratuit sur [railway.app](https://railway.app))
2. Un compte GitHub (si vous voulez déployer depuis un repository Git)
3. Les outils Git installés sur votre machine

---

## 🚀 Étape 1: Préparer le projet

### 1.1 Vérifier la structure du projet

Votre projet doit avoir cette structure :
```
backpub-project/
├── backend/          # Django backend
│   ├── backpub/
│   ├── manage.py
│   ├── requirements.txt
│   └── Procfile
└── frontend/         # React frontend
    ├── src/
    ├── package.json
    └── public/
```

### 1.2 Créer un repository Git (si pas déjà fait)

```bash
cd backpub-project
git init
git add .
git commit -m "Initial commit - Ready for Railway deployment"
```

### 1.3 Créer un repository sur GitHub

1. Allez sur [GitHub](https://github.com)
2. Créez un nouveau repository
3. Poussez votre code :
```bash
git remote add origin https://github.com/votre-username/votre-repo.git
git branch -M main
git push -u origin main
```

---

## 🚂 Étape 2: Déployer le Backend Django sur Railway

### 2.1 Créer un nouveau projet Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"** (ou "Empty Project" si vous préférez déployer manuellement)
4. Choisissez votre repository

### 2.2 Configurer le service Backend

1. Dans votre projet Railway, cliquez sur **"+ New"** puis **"Service"**
2. Sélectionnez votre repository GitHub
3. Railway va détecter automatiquement votre projet

#### Configuration du service Backend :

1. **Root Directory** : Configurez le root directory sur `backend/`
   - Allez dans **Settings** → **Root Directory** → Entrez `backend`

2. **Variables d'environnement** : Configurez les variables nécessaires
   - Allez dans **Variables** et ajoutez :

```
SECRET_KEY=Générez une clé secrète aléatoire (utilisez: python -c "import secrets; print(secrets.token_urlsafe(50))")
DEBUG=False
ALLOWED_HOSTS=*
DATABASE_URL=Laissé vide - Railway créera automatiquement une base PostgreSQL
FRONTEND_URL=https://votre-frontend.railway.app (à remplacer après déploiement du frontend)
CORS_ALLOWED_ORIGINS=https://votre-frontend.railway.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-application-gmail
DEFAULT_FROM_EMAIL=BagPub <bagbup.ads@gmail.com>
SERVER_EMAIL=bagbup.ads@gmail.com
ADMIN_EMAIL=bagbup.ads@gmail.com
```

3. **Ajouter une base de données PostgreSQL** :
   - Cliquez sur **"+ New"** dans votre projet
   - Sélectionnez **"Database"** → **"Add PostgreSQL"**
   - Railway va créer automatiquement la variable `DATABASE_URL`
   - Connectez la base de données à votre service backend (optionnel, la variable DATABASE_URL est suffisante)

4. **Build & Deploy** :
   - Railway détectera automatiquement le `Procfile` dans le dossier `backend/`
   - Le build commencera automatiquement
   - Attendez que le déploiement soit terminé

### 2.3 Créer un domaine public pour le backend

1. Dans les **Settings** de votre service backend
2. Allez dans **Networking**
3. Cliquez sur **"Generate Domain"** pour obtenir une URL publique
4. Copiez cette URL (ex: `backend-production.up.railway.app`)

### 2.4 Initialiser la base de données

Une fois le déploiement terminé, ouvrez les **Logs** et exécutez les migrations :

1. Ouvrez les **Deploy Logs** de votre service backend
2. Cliquez sur le bouton **"View Logs"** puis **"Shell"**
3. Exécutez :
```bash
python manage.py migrate
python manage.py createsuperuser  # Créez un superutilisateur admin
python manage.py collectstatic --noinput
```

**OU** utilisez la commande Railway CLI :
```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
railway run python manage.py collectstatic --noinput
```

---

## ⚛️ Étape 3: Déployer le Frontend React sur Railway

### 3.1 Créer un nouveau service pour le Frontend

1. Dans votre projet Railway, cliquez sur **"+ New"** → **"Service"**
2. Sélectionnez à nouveau votre repository GitHub

#### Configuration du service Frontend :

1. **Root Directory** : Configurez sur `frontend/`
   - **Settings** → **Root Directory** → `frontend`

2. **Variables d'environnement** :
```
REACT_APP_API_URL=https://votre-backend.railway.app
```

3. **Build Command** :
   - **Settings** → **Build Command** : `npm install && npm run build`

4. **Start Command** :
   - **Settings** → **Start Command** : `npx serve -s build -l 3000`
   - Ou utilisez un serveur statique. Si `serve` n'est pas installé, ajoutez-le au `package.json` :
   ```json
   "dependencies": {
     ...
     "serve": "^14.2.0"
   }
   ```

5. **Output Directory** : `build/`

### 3.2 Créer un domaine public pour le frontend

1. **Settings** → **Networking**
2. **Generate Domain** pour obtenir une URL publique
3. Copiez cette URL (ex: `frontend-production.up.railway.app`)

### 3.3 Mettre à jour les variables d'environnement

Après avoir obtenu les URLs des deux services :

1. **Backend** : Mettez à jour :
   ```
   FRONTEND_URL=https://votre-frontend.railway.app
   CORS_ALLOWED_ORIGINS=https://votre-frontend.railway.app
   ```

2. **Frontend** : Mettez à jour :
   ```
   REACT_APP_API_URL=https://votre-backend.railway.app
   ```

3. Redéployez les deux services après avoir mis à jour les variables

---

## 🔧 Étape 4: Configuration finale

### 4.1 Vérifier que tout fonctionne

1. Accédez à l'URL du frontend : `https://votre-frontend.railway.app`
2. Testez la connexion au backend
3. Vérifiez que les API calls fonctionnent (ouvrez la console du navigateur)

### 4.2 Gérer les migrations de base de données

À chaque fois que vous modifiez les modèles Django :

```bash
# Localement
python manage.py makemigrations
git add backend/api/migrations/
git commit -m "Add migrations"
git push

# Sur Railway (via Shell ou CLI)
railway run python manage.py migrate
```

### 4.3 Collecter les fichiers statiques

Après chaque déploiement du backend :

```bash
railway run python manage.py collectstatic --noinput
```

---

## 📝 Notes importantes

### Sécurité

- ✅ **Ne jamais** commiter les fichiers `.env` ou les secrets dans Git
- ✅ Utilisez toujours `DEBUG=False` en production
- ✅ Générez une `SECRET_KEY` unique et sécurisée
- ✅ Utilisez des variables d'environnement pour tous les secrets

### Performance

- Les fichiers statiques sont servis par WhiteNoise
- La base de données PostgreSQL est gérée automatiquement par Railway
- Les médias (uploads) sont stockés localement (pour une production importante, considérez un service de stockage cloud)

### Monitoring

- Consultez les **Logs** dans Railway pour déboguer
- Utilisez **Metrics** pour surveiller les performances
- Configurez des **Alerts** si nécessaire

---

## 🐛 Résolution de problèmes

### Backend ne démarre pas

1. Vérifiez les logs : **Deploy Logs** dans Railway
2. Vérifiez que `Procfile` est présent dans `backend/`
3. Vérifiez que toutes les variables d'environnement sont définies
4. Vérifiez que `requirements.txt` est correct

### Frontend ne peut pas se connecter au backend

1. Vérifiez `REACT_APP_API_URL` dans les variables d'environnement du frontend
2. Vérifiez `CORS_ALLOWED_ORIGINS` dans le backend
3. Vérifiez que le domaine du backend est accessible publiquement

### Erreurs de base de données

1. Vérifiez que `DATABASE_URL` est défini automatiquement (Railway le fait)
2. Exécutez les migrations : `railway run python manage.py migrate`
3. Vérifiez les logs de la base de données PostgreSQL

### Fichiers statiques non chargés

1. Vérifiez que WhiteNoise est dans `requirements.txt`
2. Exécutez `collectstatic` : `railway run python manage.py collectstatic --noinput`
3. Vérifiez la configuration de WhiteNoise dans `settings.py`

---

## 🎉 Félicitations !

Votre application Django + React est maintenant déployée sur Railway !

Pour toute question ou problème, consultez :
- [Documentation Railway](https://docs.railway.app)
- [Documentation Django](https://docs.djangoproject.com)
- [Documentation React](https://react.dev)
