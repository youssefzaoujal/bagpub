#!/bin/bash
# Script de démarrage pour Railway
# Exécute les migrations, collectstatic, puis démarre gunicorn

set -e  # Arrêter en cas d'erreur

echo "🔄 Exécution des migrations..."
python manage.py migrate --noinput

echo "📦 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

echo "🚀 Démarrage du serveur Gunicorn..."
exec gunicorn backpub.wsgi --log-file -
