#!/bin/bash

# Deployment Script for Date Maple Catering Service
# Run this on the EC2 instance after connecting via SSH

set -e

# Configurable paths
APP_DIR="/home/ubuntu/opt/Date_Maple_Catering_Service"
DOMAIN="dateandmaple.com"
SERVER_IP="3.85.132.30"

echo "=== Starting Deployment ==="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Clone or pull the repository
echo "Cloning repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    # Backup live .env if it exists (contains real secrets)
    if [ -f backend/.env ]; then
        cp backend/.env /tmp/date-maple-env-backup
        echo "Backed up backend/.env"
    fi
    # Stash or reset any local changes/conflicts so pull can succeed
    git reset --hard HEAD
    git clean -fd
    git pull origin main
    # Restore live .env
    if [ -f /tmp/date-maple-env-backup ]; then
        cp /tmp/date-maple-env-backup backend/.env
        echo "Restored backend/.env"
    fi
else
    mkdir -p "$(dirname "$APP_DIR")"
    git clone https://github.com/Kamal362/Date_Maple_Catering_Service.git "$APP_DIR"
    cd "$APP_DIR"
fi

# Setup Backend
echo "Setting up Backend..."
cd backend
npm install

# Create .env file only if it doesn't exist (preserves existing secrets on re-deploy)
if [ ! -f .env ]; then
    cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URL_LIVE=mongodb+srv://Kamal:vudhmODqO8ps9bKH@cluster0.lhtiwgs.mongodb.net/DateAndMapple?appName=Cluster0
JWT_SECRET=datemaple_jwt_secret_key_2024_secure_random_string
JWT_EXPIRE=30d

## CORS - customer and admin apps are both served from the same origin
## (path-based routing: dateandmaple.com and dateandmaple.com/admin)
ADMIN_URL=http://dateandmaple.com,http://www.dateandmaple.com,http://3.85.132.30
CUSTOMER_URL=http://dateandmaple.com,http://www.dateandmaple.com,http://3.85.132.30

## Stripe API keys
# Replace with your live keys from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

# Webhook endpoint URL: https://dateandmaple.com/api/stripe/webhook
# Replace with the signing secret from your Stripe webhook endpoint (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_signing_secret_here
EOF
else
    echo ".env already exists, preserving existing credentials"
    # Make sure critical production values are set
    grep -q "^NODE_ENV=" .env && sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env || echo "NODE_ENV=production" >> .env
    grep -q "^PORT=" .env && sed -i 's/^PORT=.*/PORT=5000/' .env || echo "PORT=5000" >> .env
fi

# Start backend with PM2 in production mode
pm2 delete date-maple-api 2>/dev/null || true
NODE_ENV=production pm2 start server.js --name date-maple-api

# Wait for backend to start, then health check
echo "Waiting for backend to start..."
sleep 3
for i in {1..10}; do
    if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/stripe/config | grep -q "200\|401\|404"; then
        echo "Backend is responding on port 5000"
        break
    fi
    echo "Backend not ready yet (attempt $i/10)..."
    sleep 2
done

if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/stripe/config | grep -q "200\|401\|404"; then
    echo "ERROR: Backend failed to start. Showing PM2 logs:"
    pm2 logs date-maple-api --lines 50
    exit 1
fi

cd ..

# Migrate old absolute upload URLs to relative paths
echo "Migrating upload URLs..."
NODE_ENV=production node backend/scripts/migrateUploadUrls.js

# Setup Frontend Admin
echo "Setting up Frontend Admin..."
cd frontend-admin
npm install
npm run build

# Setup Frontend Customer
echo "Setting up Frontend Customer..."
cd ../frontend-customer
npm install
npm run build

cd ..

# Configure Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/date-maple << 'EOF'
server {
    listen 80;
    server_name dateandmaple.com www.dateandmaple.com 3.85.132.30;

    client_max_body_size 20M;

    # Serve admin static assets directly so they never fall back to HTML
    location ^~ /admin/assets/ {
        alias /home/ubuntu/opt/Date_Maple_Catering_Service/frontend-admin/dist/assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Admin SPA fallback
    location ^~ /admin {
        alias /home/ubuntu/opt/Date_Maple_Catering_Service/frontend-admin/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Origin $http_origin;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header Origin $http_origin;
    }

    location /uploads/ {
        alias /home/ubuntu/opt/Date_Maple_Catering_Service/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    root /home/ubuntu/opt/Date_Maple_Catering_Service/frontend-customer/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/date-maple /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Fix permissions so nginx (www-data) can read the static files
# /home/ubuntu is typically 700, which blocks nginx from traversing into ~/opt
sudo chmod 755 /home/ubuntu
sudo chmod -R 755 "$APP_DIR/frontend-customer/dist"
sudo chmod -R 755 "$APP_DIR/frontend-admin/dist"

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Save PM2 configuration
pm2 save
pm2 startup systemd

echo ""
echo "=== Smoke tests ==="
sleep 2
curl -s -o /dev/null -w "Homepage: %{http_code} — " http://$SERVER_IP/
curl -s http://$SERVER_IP/ | grep -o "<title>[^<]*</title>"
curl -s -o /dev/null -w "Admin: %{http_code} — " http://$SERVER_IP/admin/
curl -s http://$SERVER_IP/admin/ | grep -o "<title>[^<]*</title>"
curl -s -o /dev/null -w "API: %{http_code}\n" http://$SERVER_IP/api/stripe/config

echo "=== Deployment Complete ==="
echo ""
echo "Your application should be accessible at:"
echo "  - Customer Site: http://dateandmaple.com/  (or http://3.85.132.30/)"
echo "  - Admin Site: http://dateandmaple.com/admin/  (or http://3.85.132.30/admin/)"
echo "  - API: http://dateandmaple.com/api/  (or http://3.85.132.30/api/)"
echo ""
echo "NOTE: Point dateandmaple.com's DNS A record at 3.85.132.30, then run certbot"
echo "      (e.g. sudo certbot --nginx -d dateandmaple.com -d www.dateandmaple.com) for HTTPS."
echo ""
echo "IMPORTANT: Update the .env file in /home/ubuntu/opt/Date_Maple_Catering_Service/backend/.env with your actual credentials"
