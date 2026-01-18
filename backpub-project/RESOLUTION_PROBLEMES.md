# 🔧 Résolution des Problèmes de Déploiement

## ❌ Problème 1 : Vercel 404 NOT_FOUND

### Solutions possibles :

#### ✅ Solution 1 : Vérifier le Root Directory dans Vercel

1. Allez dans **Vercel Dashboard** → Votre projet
2. **Settings** → **General**
3. Vérifiez que **Root Directory** = `frontend`
4. Si ce n'est pas le cas, changez-le et redéployez

#### ✅ Solution 2 : Vérifier que le build fonctionne

1. Dans votre terminal local, testez :
```bash
cd backpub-project/frontend
npm install
npm run build
```

2. Vérifiez que le dossier `build/` est créé avec `index.html` dedans

3. Si le build échoue, corrigez les erreurs avant de pousser

#### ✅ Solution 3 : Vérifier vercel.json

Assurez-vous que `frontend/vercel.json` existe et contient :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### ✅ Solution 4 : Redéployer complètement

1. Dans Vercel : **Deployments** → Cliquez sur **"..."** → **Redeploy**
2. Ou poussez un nouveau commit :
```bash
git add .
git commit -m "Fix Vercel 404"
git push
```

---

## ❌ Problème 2 : Railway se crash en boucle

### Diagnostic nécessaire :

**Première étape : Regarder les logs Railway**

1. Allez dans **Railway** → Votre service backend
2. Cliquez sur **"Logs"** ou **"Deploy Logs"**
3. Regardez les **dernières erreurs** avant le crash

### Solutions communes :

#### ✅ Solution 1 : Variables d'environnement manquantes

Vérifiez que toutes ces variables sont définies dans Railway :

```
SECRET_KEY=(doit être défini)
DEBUG=False
ALLOWED_HOSTS=*
DATABASE_URL=(automatique avec PostgreSQL)
FRONTEND_URL=https://bagpub.vercel.app
CORS_ALLOWED_ORIGINS=https://bagpub.vercel.app
```

#### ✅ Solution 2 : Problème de migrations

Si vous voyez des erreurs de base de données :

1. Ouvrez **Shell** dans Railway
2. Exécutez :
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

#### ✅ Solution 3 : Erreur dans settings.py

Vérifiez que `settings.py` n'a pas d'erreurs de syntaxe :

```bash
# En local, testez :
cd backend
python manage.py check
```

#### ✅ Solution 4 : Port incorrect

Le Procfile devrait être :
```
web: gunicorn backpub.wsgi --log-file -
```

Railway détecte automatiquement le port via `$PORT`.

#### ✅ Solution 5 : Erreur de dépendances

Vérifiez `requirements.txt` - peut-être qu'une dépendance pose problème.

Testez en local :
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

---

## 🔍 Comment diagnostiquer le problème Railway

### Étape 1 : Voir les logs d'erreur

1. **Railway** → Service backend
2. **Deploy Logs** ou **HTTP Logs**
3. Copiez les **dernières lignes d'erreur**

### Étape 2 : Vérifier les métriques

1. **Railway** → **Metrics**
2. Regardez :
   - **Memory usage** (si ça monte trop, c'est peut-être un memory leak)
   - **CPU usage**
   - **Request rate**

### Étape 3 : Tester en local avec les mêmes variables

Créez un `.env` local avec les mêmes variables que Railway et testez :
```bash
cd backend
python manage.py runserver
```

---

## 🚨 Erreurs communes et solutions

### Erreur : "ModuleNotFoundError"

**Solution** : Vérifiez que toutes les dépendances sont dans `requirements.txt`

### Erreur : "No such file or directory: 'manage.py'"

**Solution** : Root Directory dans Railway doit être `backend`

### Erreur : "Database connection failed"

**Solution** : 
1. Vérifiez que PostgreSQL est bien créé dans Railway
2. Vérifiez que `DATABASE_URL` est défini automatiquement
3. Exécutez les migrations

### Erreur : "SECRET_KEY not set"

**Solution** : Ajoutez `SECRET_KEY` dans les variables d'environnement Railway

### Erreur : "CORS error"

**Solution** : Ajoutez l'URL Vercel dans `CORS_ALLOWED_ORIGINS`

---

## ✅ Checklist de débogage

- [ ] Root Directory Vercel = `frontend`
- [ ] Root Directory Railway = `backend`
- [ ] Build local fonctionne (`npm run build`)
- [ ] Toutes les variables d'environnement sont définies
- [ ] `DATABASE_URL` est présent (automatique avec PostgreSQL)
- [ ] Migrations exécutées
- [ ] Logs Railway consultés pour voir l'erreur exacte
- [ ] `Procfile` existe dans `backend/`
- [ ] `vercel.json` existe dans `frontend/`

---

## 📞 Besoin d'aide ?

Pour m'aider à résoudre le problème, donnez-moi :

1. **Les logs d'erreur Railway** (copiez les dernières lignes)
2. **Le message d'erreur exact** de Vercel (si différent de 404)
3. **Les métriques Railway** (Memory, CPU)

Avec ces informations, je pourrai vous donner une solution précise !
