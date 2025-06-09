# 🚀 BikeRef - Guide de Déploiement pour cross.golene-evasion.com

Ce guide vous explique comment déployer l'application BikeRef avec nginx sur le domaine cross.golene-evasion.com.

## 📋 Prérequis

**Machine de développement:**
- Node.js 18+ et npm installés
- Git pour cloner le projet

**Serveur de production:**
- Ubuntu/Debian avec accès sudo
- Nginx installé (`sudo apt install nginx`)
- Votre backend BikeRef fonctionnel sur le port 9000

## 🔧 Déploiement en 2 étapes (Dev → Prod)

### 1. Build sur votre machine de développement

```bash
# Cloner et préparer le projet
git clone <votre-repo-bikeref>
cd bike-ref
npm install

# Rendre le script exécutable
chmod +x nginx-config/build-local.sh

# Build avec configuration pour le proxy
./nginx-config/build-local.sh
```

### 2. Déploiement sur le serveur de production

```bash
# Copier le package sur le serveur
scp bikeref-deploy.tar.gz user@cross.golene-evasion.com:~/

# Se connecter au serveur
ssh user@cross.golene-evasion.com

# Extraire et déployer
tar -xzf bikeref-deploy.tar.gz
chmod +x nginx-config/deploy-remote.sh
sudo ./nginx-config/deploy-remote.sh
```

## ⚙️ Configuration Manuelle

### 1. Build de l'application

```bash
# Créer le fichier d'environnement
echo "VITE_API_URL=/api/" > .env.production

# Build
npm run build
```

### 2. Copier les fichiers

```bash
# Créer le répertoire de déploiement
sudo mkdir -p /var/www/bikeref

# Copier les fichiers buildés
sudo cp -r dist/* /var/www/bikeref/

# Permissions
sudo chown -R www-data:www-data /var/www/bikeref
sudo chmod -R 755 /var/www/bikeref
```

### 3. Configuration Nginx

```bash
# Copier la configuration
sudo cp nginx-config/bikeref-proxy.conf /etc/nginx/sites-available/bikeref

# Activer le site
sudo ln -s /etc/nginx/sites-available/bikeref /etc/nginx/sites-enabled/

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

## 🌐 Options de Configuration Backend

### Option 1: Proxy Nginx (Recommandé)

**Frontend**: `VITE_API_URL=/api/`
**Nginx**: Proxy `/api/*` vers `http://127.0.0.1:9000/`

✅ **Avantages**:
- Même domaine (pas de CORS)
- URL propres
- Cache et load balancing possibles

```nginx
location /api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://127.0.0.1:9000;
    # ... headers proxy
}
```

### Option 2: Backend séparé

**Frontend**: `VITE_API_URL=https://api.mondomaine.com/`
**Backend**: Serveur indépendant

⚠️ **Configuration CORS requise** sur le backend

### Option 3: Sous-domaine

**Frontend**: `VITE_API_URL=https://api.mondomaine.com/`
**DNS**: `api.mondomaine.com` → IP du backend

## 🔒 HTTPS avec Let's Encrypt

### 1. Installer Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obtenir le certificat

```bash
sudo certbot --nginx -d mondomaine.com -d www.mondomaine.com
```

### 3. Utiliser la config SSL

```bash
# Remplacer par la config HTTPS
sudo cp nginx-config/bikeref-ssl.conf /etc/nginx/sites-available/bikeref
sudo systemctl reload nginx
```

## 🐳 Déploiement avec Docker

### Dockerfile pour le frontend

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
ARG VITE_API_URL=/api/
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-config/bikeref-proxy.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      args:
        VITE_API_URL: /api/
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    image: your-backend-image
    ports:
      - "9000:9000"
```

## 🔍 Troubleshooting

### Problème: API non accessible

1. **Vérifier la config nginx**:
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Vérifier le backend**:
   ```bash
   curl http://localhost:9000/health
   ```

3. **Vérifier les permissions**:
   ```bash
   ls -la /var/www/bikeref/
   ```

### Problème: CORS

Si vous utilisez un backend séparé, configurez CORS:

```javascript
// Backend Express.js example
app.use(cors({
  origin: ['https://mondomaine.com', 'https://www.mondomaine.com'],
  credentials: true
}));
```

### Problème: React Router

Si les routes React ne fonctionnent pas, vérifiez:

```nginx
# Cette config doit être présente
location / {
    try_files $uri $uri/ /index.html;
}
```

## 📊 Monitoring

### Logs Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

### Health Check

```bash
# Test de santé
curl http://mondomaine.com/health

# Test API via proxy
curl http://mondomaine.com/api/health
```

## 🔄 Mise à jour

### Déploiement automatique

```bash
# Pull des dernières modifications
git pull origin main

# Redéploiement
BACKEND_URL="http://127.0.0.1:9000/" ./nginx-config/deploy.sh
```

### Déploiement manuel

```bash
npm run build
sudo rsync -av --delete dist/ /var/www/bikeref/
sudo systemctl reload nginx
```

## 📝 Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `/api/` ou `https://api.mondomaine.com/` |
| `BACKEND_URL` | URL pour le script de déploiement | `http://127.0.0.1:9000/` |
| `DEPLOY_DIR` | Répertoire de déploiement | `/var/www/bikeref` |

## 🎯 Configuration Complète Exemple

```bash
# 1. Configuration
echo "VITE_API_URL=/api/" > .env.production

# 2. Build
npm run build

# 3. Déploiement
sudo cp -r dist/* /var/www/bikeref/
sudo cp nginx-config/bikeref-proxy.conf /etc/nginx/sites-available/bikeref
sudo ln -sf /etc/nginx/sites-available/bikeref /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. SSL (optionnel)
sudo certbot --nginx -d mondomaine.com

# 5. Test
curl http://mondomaine.com/health
```

Votre application BikeRef est maintenant déployée ! 🎉 
