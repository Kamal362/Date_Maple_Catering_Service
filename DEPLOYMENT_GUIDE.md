# Date Maple Catering Service - Deployment Guide

## EC2 Instance Details
- **IP Address**: 44.202.252.118
- **User**: ubuntu
- **SSH Key**: aws-gpu-key.pem

## Step 1: Connect to EC2 Instance

Using Git Bash, WSL, or Terminal:
```bash
chmod 400 aws-gpu-key.pem
ssh -i aws-gpu-key.pem ubuntu@44.202.252.118
```

Using PuTTY:
1. Convert .pem to .ppk using PuTTYgen
2. Use PuTTY with the .ppk file

## Step 2: Run Deployment Commands

Once connected, run these commands:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install PM2 and Nginx
sudo npm install -g pm2
sudo apt-get install -y nginx git

# Clone repository
cd ~
git clone https://github.com/Kamal362/Date_Maple_Catering_Service.git
cd Date_Maple_Catering_Service

# Setup Backend
cd backend
npm install

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5002
MONGODB_URI=mongodb+srv://Kamal:vudhmODqO8ps9bKH@cluster0.lhtiwgs.mongodb.net/DateAndMapple?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=datemaple_jwt_secret_key_2024_secure_random_string
JWT_EXPIRE=30d
EOF

# Start backend with PM2
pm2 start server.js --name date-maple-backend
pm2 save

# Setup Frontend Admin
cd ../frontend-admin
npm install
npm run build

# Setup Frontend Customer
cd ../frontend-customer
npm install
npm run build

# Configure Nginx
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

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# Setup PM2 startup
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## Step 3: Verify Deployment

After running all commands, verify:

1. **Backend API**: http://44.202.252.118/api/health (or any endpoint)
2. **Customer Site**: http://44.202.252.118/
3. **Admin Site**: http://44.202.252.118/admin/

## Useful Commands

```bash
# Check backend logs
pm2 logs date-maple-backend

# Restart backend
pm2 restart date-maple-backend

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Update deployment (after code changes)
cd ~/Date_Maple_Catering_Service
git pull
# Then rebuild frontends and restart backend as needed
```

## Troubleshooting

1. **Permission Denied on SSH**: Make sure the .pem file has correct permissions (chmod 400)
2. **Backend not starting**: Check pm2 logs with `pm2 logs`
3. **Frontend not loading**: Check Nginx config with `sudo nginx -t`
4. **API 502 error**: Ensure backend is running on port 5002
