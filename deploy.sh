#!/bin/bash

# Deployment Script for Date Maple Catering Service
# Run this on the EC2 instance after connecting via SSH

set -e

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
cd ~
if [ -d "Date_Maple_Catering_Service" ]; then
    cd Date_Maple_Catering_Service
    git pull origin main
else
    git clone https://github.com/Kamal362/Date_Maple_Catering_Service.git
    cd Date_Maple_Catering_Service
fi

# Setup Backend
echo "Setting up Backend..."
cd backend
npm install

# Create .env file
    cat > .env << EOF
NODE_ENV=production
PORT=5002
MONGODB_URI=mongodb+srv://Kamal:vudhmODqO8ps9bKH@cluster0.lhtiwgs.mongodb.net/DateAndMapple?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=datemaple_jwt_secret_key_2024_secure_random_string
JWT_EXPIRE=30d
EOF

# Start backend with PM2
pm2 delete date-maple-backend 2>/dev/null || true
pm2 start server.js --name date-maple-backend

cd ..

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
    server_name 44.202.252.118;

    # Backend API
    location /api {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Customer Frontend
    location / {
        root /home/ubuntu/Date_Maple_Catering_Service/frontend-customer/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Admin Frontend
    location /admin {
        alias /home/ubuntu/Date_Maple_Catering_Service/frontend-admin/dist;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/date-maple /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Save PM2 configuration
pm2 save
pm2 startup systemd

echo "=== Deployment Complete ==="
echo ""
echo "Your application should be accessible at:"
echo "  - Customer Site: http://44.202.252.118/"
echo "  - Admin Site: http://44.202.252.118/admin/"
echo "  - API: http://44.202.252.118/api/"
echo ""
echo "IMPORTANT: Update the .env file in ~/Date_Maple_Catering_Service/backend/.env with your actual credentials"
