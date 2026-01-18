# 🔍 Débogage "Registration failed"

## ❌ Problème : "Registration failed" sur le site

Le backend est actif mais l'inscription échoue. Voici comment résoudre :

---

## 🔧 Vérifications à faire

### 1. Vérifier CORS dans Railway

**Le problème le plus courant !**

1. Allez dans **Railway** → Service backend "bagpub"
2. **Settings** → **Variables**
3. Vérifiez que `CORS_ALLOWED_ORIGINS` contient votre URL Vercel :

```
CORS_ALLOWED_ORIGINS=https://bagpub.vercel.app,https://bagpub-m8cnz7ttr-youssefs-projects-a24d1c9a.vercel.app
```

**Important** : 
- Utilisez `https://` au début
- Pas de `/` à la fin
- Si vous avez plusieurs URLs, séparez-les par des virgules

4. **Redéployez** après avoir modifié les variables

---

### 2. Vérifier REACT_APP_API_URL dans Vercel

1. Allez dans **Vercel** → Votre projet
2. **Settings** → **Environment Variables**
3. Vérifiez que `REACT_APP_API_URL` est défini :

```
REACT_APP_API_URL=https://bagpub-production.up.railway.app
```

**Important** :
- Utilisez `https://` au début
- Pas de `/api` à la fin (c'est ajouté automatiquement)
- Pas de `/` à la fin

4. **Redéployez** après avoir modifié les variables

---

### 3. Vérifier les logs Railway

Pour voir l'erreur exacte :

1. **Railway** → Service backend → **Logs** ou **HTTP Logs**
2. Essayez de vous inscrire sur le site
3. Regardez les **nouvelles erreurs** dans les logs
4. Copiez l'erreur exacte

**Types d'erreurs possibles** :

- **CORS error** : Ajoutez l'URL Vercel dans `CORS_ALLOWED_ORIGINS`
- **Validation error** : Le backend rejette les données (champs manquants, format invalide)
- **Database error** : Problème avec PostgreSQL (migrations non exécutées ?)
- **Email error** : Problème avec la configuration email (peut bloquer l'inscription)

---

### 4. Vérifier la console du navigateur

1. Ouvrez votre site Vercel : `https://bagpub.vercel.app`
2. Ouvrez la **console** (F12 → Console)
3. Essayez de vous inscrire
4. Regardez les **erreurs dans la console**

**Types d'erreurs possibles** :

- **Network error** : Le frontend ne peut pas joindre le backend
  - Vérifiez `REACT_APP_API_URL` dans Vercel
  - Vérifiez que le backend Railway est accessible

- **CORS error** : `Access-Control-Allow-Origin`
  - Ajoutez l'URL Vercel dans `CORS_ALLOWED_ORIGINS` dans Railway

- **404 Not Found** : L'endpoint n'existe pas
  - Vérifiez que l'URL est correcte : `https://bagpub-production.up.railway.app/api/auth/register/client/`

---

### 5. Tester l'API directement

Testez l'endpoint d'inscription directement pour voir l'erreur :

```bash
curl -X POST https://bagpub-production.up.railway.app/api/auth/register/client/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "company_name": "Test Company",
    "siret": "12345678901234",
    "tva_number": "FR12345678901"
  }'
```

Ou utilisez un outil comme **Postman** ou **Insomnia** pour tester l'API.

---

## ✅ Checklist de débogage

- [ ] `CORS_ALLOWED_ORIGINS` contient l'URL Vercel dans Railway
- [ ] `REACT_APP_API_URL` est correctement défini dans Vercel
- [ ] Les variables sont redéployées après modification
- [ ] Le backend Railway est accessible (testez l'URL dans le navigateur)
- [ ] Les logs Railway sont consultés pour voir l'erreur exacte
- [ ] La console du navigateur est vérifiée pour les erreurs frontend

---

## 🚨 Solutions rapides

### Si erreur CORS :

1. **Railway** → Service backend → **Variables**
2. Ajoutez/modifiez :

```
CORS_ALLOWED_ORIGINS=https://bagpub.vercel.app
```

3. Railway redéploie automatiquement

### Si erreur réseau :

1. **Vercel** → **Environment Variables**
2. Vérifiez/modifiez :

```
REACT_APP_API_URL=https://bagpub-production.up.railway.app
```

3. **Redéployez** le frontend dans Vercel

### Si erreur de validation :

Regardez les logs Railway pour voir quels champs manquent ou sont invalides.

---

## 📞 Besoin d'aide ?

Donnez-moi :

1. **L'erreur exacte dans la console du navigateur** (F12 → Console)
2. **Les logs Railway** lors de la tentative d'inscription (copiez les dernières lignes)
3. **Les valeurs de vos variables** :
   - `CORS_ALLOWED_ORIGINS` dans Railway
   - `REACT_APP_API_URL` dans Vercel

Avec ces informations, je pourrai vous donner une solution précise !
