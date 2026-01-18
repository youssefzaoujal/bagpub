# 🔍 Débogage CORS - Étapes à suivre

## ✅ La variable est déjà dans Railway

Si `CORS_ALLOWED_ORIGINS` contient déjà `https://bagpub.vercel.app` dans Railway mais que l'erreur persiste :

---

## 🔧 Solution 1 : Forcer un Redéploiement

1. **Dans Railway** :
   - Service backend → **Settings** → **Deployments**
   - Cliquez sur **"Deploy"** ou **"Redeploy"**
   - Attendez 2-3 minutes que le redéploiement termine

**OU**

2. **Faire un petit changement pour forcer le redéploiement** :
   - Modifiez `CORS_ALLOWED_ORIGINS` dans Railway : ajoutez un espace puis supprimez-le
   - Sauvegardez (Railway redéploiera automatiquement)

---

## 🔍 Solution 2 : Vérifier la Valeur Exacte

Dans Railway → Variables, vérifiez que `CORS_ALLOWED_ORIGINS` contient **EXACTEMENT** :

```
https://bagpub.vercel.app
```

**Sans** :
- ❌ Pas de `/` à la fin
- ❌ Pas d'espaces avant/après
- ❌ Pas de guillemets

---

## 🔍 Solution 3 : Vérifier les Logs Railway

Après le redéploiement, ouvrez les **Deploy Logs** Railway et cherchez :
- Messages de démarrage Django
- Erreurs de configuration CORS
- Messages de debug (si ajoutés)

---

## 🚨 Solution 4 : Vérifier le Format dans Railway

Dans Railway → Variables, la valeur doit être **sur une seule ligne** :

✅ **BON** :
```
https://bagpub.vercel.app
```

❌ **MAUVAIS** (surlignage sur plusieurs lignes ou avec retours) :
```
https://bagpub.vercel.app
https://bagpub-8te9.vercel.app
```

Si vous avez plusieurs URLs, elles doivent être **séparées par des virgules** sur la même ligne :
```
https://bagpub.vercel.app,https://bagpub-8te9.vercel.app
```

---

## 💡 Solution 5 : Vérifier l'Erreur Exacte

L'erreur dans la console montre :
```
Access to XMLHttpRequest at 'https://bagpub-production.up.railway.app/api/campaigns/create-complete/' 
from origin 'https://bagpub.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

Cela signifie que **Django ne renvoie pas le header CORS**. Cela peut arriver si :
1. La variable n'est pas lue correctement au démarrage
2. Le service n'a pas redéployé après la modification
3. Il y a un problème avec le middleware CORS

---

## ✅ Solution 6 : Forcer un Redéploiement via Git

Si rien ne fonctionne, poussez un commit vide pour forcer le redéploiement :

```bash
cd backpub-project
git commit --allow-empty -m "Force redeploy for CORS fix"
git push
```

---

## 🎯 Action Immédiate

**Faites ça maintenant** :

1. Railway → Service backend → **Settings** → **Variables**
2. Ouvrez `CORS_ALLOWED_ORIGINS`
3. **Copiez-collez la valeur exacte** : `https://bagpub.vercel.app`
4. **Sauvegardez** (vérifiez qu'il n'y a pas de `/` à la fin)
5. **Attendez 2-3 minutes** que Railway redéploie automatiquement
6. **Testez à nouveau**

Si ça ne fonctionne toujours pas après 5 minutes, le problème peut être ailleurs (middleware, cache navigateur, etc.).

---

## 🔍 Vérification dans les Logs

Après le redéploiement, dans les logs Railway, vous devriez voir :
- Le serveur Django démarrer
- Pas d'erreurs liées à CORS
- Les headers CORS être ajoutés aux requêtes OPTIONS
