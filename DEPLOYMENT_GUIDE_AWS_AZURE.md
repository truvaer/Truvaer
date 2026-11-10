# 🚀 Truvaer Aviation Platform: Cloud Deployment Guide (AWS EC2 & Microsoft Azure)

This comprehensive guide walks you through deploying the **Truvaer Aviation Platform** to **Amazon Web Services (AWS EC2)** or **Microsoft Azure Virtual Machines / Azure App Service** from scratch. 

The codebase has already been structured with a production Express server (`server.js`), multi-stage `Dockerfile`, PM2 process configuration (`ecosystem.config.cjs`), Nginx reverse-proxy template (`nginx.conf.template`), and automated deployment script (`deploy.sh`).

---

## 📋 Table of Contents
1. [Architecture Overview & Recommended Sizing](#1-architecture-overview--recommended-sizing)
2. [Prerequisites & Firewall/Security Group Rules](#2-prerequisites--firewallsecurity-group-rules)
3. [Method A: AWS EC2 Deployment (Ubuntu 22.04 / 24.04 LTS)](#3-method-a-aws-ec2-deployment-ubuntu-2204--2404-lts)
4. [Method B: Microsoft Azure Virtual Machine Deployment](#4-method-b-microsoft-azure-virtual-machine-deployment)
5. [Method C: Containerized Deployment (Docker & Azure App Service / AWS App Runner)](#5-method-c-containerized-deployment-docker--azure-app-service--aws-app-runner)
6. [Nginx Reverse Proxy & Free SSL with Let's Encrypt (Certbot)](#6-nginx-reverse-proxy--free-ssl-with-lets-encrypt-certbot)
7. [Automated CI/CD: Push-to-Deploy with GitHub Actions](#7-automated-cicd-push-to-deploy-with-github-actions)
8. [Production Maintenance, PM2 Commands & Logs](#8-production-maintenance-pm2-commands--logs)

---

## 1. Architecture Overview & Recommended Sizing

The platform consists of:
- **Frontend SPA**: High-performance React 19 + Vite bundle optimized with Tailwind CSS and Lucide icons.
- **Production Server (`server.js`)**: Node.js Express server handling SPA client routes, static asset caching, health checks (`/_healthz`), and API endpoints.
- **Process Manager**: PM2 running in cluster mode utilizing all vCPU cores with automatic restart on crash or high memory threshold.
- **Web Server / Reverse Proxy**: Nginx listening on ports 80/443, handling SSL termination, Gzip compression, and security headers.

### Recommended Hardware Specifications
| Cloud Provider | Instance / VM Type | vCPU | RAM | Storage | Estimated Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AWS EC2** | `t3.medium` (or `t3.small` for dev/staging) | 2 | 4 GB | 30 GB gp3 SSD | ~$15 - $30 / mo |
| **Azure VM** | `Standard_B2s` (or `Standard_B2ms`) | 2 | 4 GB - 8 GB | 30 GB Premium SSD | ~$18 - $35 / mo |

---

## 2. Prerequisites & Firewall/Security Group Rules

Before spinning up your server, ensure you have:
1. An **AWS** or **Azure** account.
2. A registered domain name (e.g. `truvaer.com`, `yarifly.com`, or subdomain `app.truvaer.com`).
3. An SSH key pair downloaded to your local computer (e.g., `truvaer-key.pem`).

### Inbound Firewall Rules (Security Groups / NSG)
Configure the following inbound rules on AWS EC2 Security Group or Azure Network Security Group:

| Type | Protocol | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | `My IP` (or `0.0.0.0/0`) | Remote terminal access |
| **HTTP** | TCP | `80` | `0.0.0.0/0` (Anywhere) | Public web traffic & SSL challenge |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` (Anywhere) | Secure encrypted public web traffic |

---

## 3. Method A: AWS EC2 Deployment (Ubuntu 22.04 / 24.04 LTS)

### Step 1: Launch EC2 Instance
1. Go to **AWS Console** > **EC2** > **Launch Instance**.
2. **Name**: `truvaer-production-server`.
3. **AMI**: `Ubuntu Server 24.04 LTS` (or `22.04 LTS`) - 64-bit (x86_64).
4. **Instance Type**: `t3.medium` (recommended) or `t3.small`.
5. **Key Pair**: Select your existing key pair or create `truvaer-key.pem`.
6. **Network Settings**:
   - Check **Allow SSH traffic**
   - Check **Allow HTTP traffic from the internet**
   - Check **Allow HTTPS traffic from the internet**
7. **Storage**: Set root volume to `30 GiB gp3`.
8. Click **Launch Instance**.

### Step 2: Connect via SSH
On your local terminal (macOS/Linux or PowerShell on Windows):
```bash
# Set secure permission on your private key
chmod 400 truvaer-key.pem

# SSH into your EC2 instance (replace with your Elastic / Public IP)
ssh -i "truvaer-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3: Install Node.js 20 LTS, Git, PM2, and Nginx
Run the following commands on your remote server:
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Git, Curl, and build essentials
sudo apt install -y git curl wget build-essential nginx

# 3. Install Node.js 20 LTS (NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v   # Should show v20.x
npm -v    # Should show v10.x

# 4. Install PM2 globally
sudo npm install -g pm2
```

### Step 4: Clone Repository & Setup Project
```bash
# Create directory for application
sudo mkdir -p /var/www/truvaer
sudo chown -R ubuntu:ubuntu /var/www/truvaer
cd /var/www/truvaer

# Clone your GitHub/GitLab repository
git clone https://github.com/YOUR_ORGANIZATION/truvaer-app.git .

# Install dependencies and build production assets
npm ci
npm run build
```

### Step 5: Configure Environment Variables
Create your production `.env` file:
```bash
cp .env.example .env
nano .env
```
Ensure `PORT=3000` and add your required runtime environment keys. Save with `Ctrl+O`, then exit with `Ctrl+X`.

### Step 6: Start Application with PM2
```bash
# Make deploy script executable
chmod +x deploy.sh

# Start the cluster using ecosystem.config.cjs
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list so it automatically starts on system reboot
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## 4. Method B: Microsoft Azure Virtual Machine Deployment

### Step 1: Create Azure VM
1. Go to **Azure Portal** > **Virtual Machines** > **Create** > **Azure virtual machine**.
2. **Resource Group**: Create or select existing (e.g. `rg-truvaer`).
3. **Virtual machine name**: `vm-truvaer-prod`.
4. **Region**: Select closest to your primary audience (e.g. `Central India`, `East US`, `West Europe`).
5. **Image**: `Ubuntu Server 24.04 LTS - x64 Gen2`.
6. **Size**: `Standard_B2s` (2 vCPU, 4 GiB memory).
7. **Authentication type**: SSH public key.
8. **Inbound port rules**: Select `SSH (22)`, `HTTP (80)`, and `HTTPS (443)`.
9. Click **Review + create** > **Create**.

### Step 2: Connect to Azure VM
```bash
ssh -i "azure-key.pem" azureuser@YOUR_AZURE_PUBLIC_IP
```

### Step 3: Install Software & Deploy
Follow the exact same steps as AWS EC2 (Step 3 to Step 6 above). Replace `ubuntu` with `azureuser` in file paths.

---

## 5. Method C: Containerized Deployment (Docker & Azure App Service / AWS App Runner)

If you prefer containerized deployment rather than managing a VM:

### 1-Command Local/Server Docker Run:
```bash
# 1. Build the Docker image
docker build -t truvaer-app .

# 2. Run the container on port 80
docker run -d \
  -p 80:3000 \
  --name truvaer-platform \
  --restart unless-stopped \
  truvaer-app
```

### AWS App Runner (Zero-Ops Managed Containers):
1. Push your code to GitHub.
2. In AWS Console, go to **AWS App Runner** > **Create service**.
3. Choose **Source code repository**, connect your GitHub repo, and choose branch `main`.
4. Set build command: `npm run build`, start command: `node server.js`, port: `3000`.
5. AWS handles automatic SSL and scaling out-of-the-box!

### Azure App Service (Web App for Containers):
1. Push Docker image to Azure Container Registry (ACR) or Docker Hub.
2. Go to **Azure App Service** > **Create Web App**.
3. Publish: **Container**, OS: **Linux**.
4. Point to your container image. Azure provides managed HTTPS certificates automatically.

---

## 6. Nginx Reverse Proxy & Free SSL with Let's Encrypt (Certbot)

To map your domain (e.g. `truvaer.com`) to the Node.js application running on port 3000 and enable HTTPS:

### Step 1: Point Your Domain DNS to Cloud Server IP
In your DNS provider (Cloudflare, GoDaddy, Namecheap, Route 53):
- **A Record**: `@` points to `YOUR_SERVER_PUBLIC_IP`
- **A Record**: `www` points to `YOUR_SERVER_PUBLIC_IP`

### Step 2: Configure Nginx
```bash
# Copy template into Nginx sites-available
sudo cp /var/www/truvaer/nginx.conf.template /etc/nginx/sites-available/truvaer

# Edit domain name
sudo nano /etc/nginx/sites-available/truvaer
```
*Replace `your-domain.com` with your real domain (e.g. `truvaer.com` and `www.truvaer.com`).*

Enable the site and remove default:
```bash
sudo ln -sf /etc/nginx/sites-available/truvaer /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 3: Install Free SSL with Certbot
```bash
# Install Certbot and python3-certbot-nginx
sudo apt install -y certbot python3-certbot-nginx

# Obtain and auto-install SSL certificates
sudo certbot --nginx -d truvaer.com -d www.truvaer.com
```
Follow the prompt, enter your notification email, and Certbot will automatically install the certificate, configure TLS 1.3, and schedule auto-renewals!

Verify auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 7. Automated CI/CD: Push-to-Deploy with Zero Downtime & Zero Data Loss

The repository is now pre-configured with complete, automated GitHub Actions workflows:
- **AWS EC2 Workflow**: `.github/workflows/deploy-aws-ec2.yml`
- **Azure Cloud Workflow**: `.github/workflows/deploy-azure.yml`
- **Pull Request CI Verification**: `.github/workflows/ci.yml`
- **In-Depth Guide**: See `docs/CI_CD_ZERO_DOWNTIME_PIPELINE.md`

### How It Guarantees Zero Downtime & Zero Data Loss
1. **Zero Connection Drops**: PM2 rolling reload utilizes `wait_ready: true`. A new cluster worker is booted, tests readiness, and only then signals PM2 with `process.send('ready')` to take over new connections. Existing in-flight requests on old workers drain gracefully over 6 seconds.
2. **Persistent Data Isolation**: Application state and records reside in Cloud Firestore (`ai-studio-truvaercom-eb70d8ca-51b3-4512-83dd-c9b39235dcbe`) and external database tiers. Code deployments pull only source code and never modify or purge database records.
3. **Seamless Client Continuity**: Active browser sessions, login tokens, drafts, and theme preferences reside safely in `sessionStorage` and `localStorage`. When the automated CI/CD pipeline deploys a new version tag (e.g., `v1.0.1`), the `VersionUpdateNotifier` displays a non-intrusive toast in the application UI: *"New Platform Update Live - Session Safe (No Data Loss)"*, allowing users to refresh on their own terms without interrupting ongoing work.

### GitHub Repository Secrets Setup
In your GitHub repository, navigate to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:

| Cloud Provider | Secret Name | Value |
| :--- | :--- | :--- |
| **AWS EC2** | `AWS_EC2_HOST` | EC2 Public IPv4 or DNS (e.g. `54.210.12.89`) |
| **AWS EC2** | `AWS_EC2_USER` | `ubuntu` (default) or `ec2-user` |
| **AWS EC2** | `AWS_EC2_SSH_KEY` | Private SSH key contents (`.pem`) |
| **Azure VM** | `AZURE_VM_HOST` | Azure VM Public IPv4 or DNS |
| **Azure VM** | `AZURE_VM_USER` | `azureuser` |
| **Azure VM** | `AZURE_VM_SSH_KEY` | Private SSH key contents |

### Releasing New Code
Every `git push origin main` or release tag push (e.g. `git tag v1.0.1 && git push origin v1.0.1`) will automatically build, test, deploy, and reload your production cloud server with zero downtime!

---

## 8. Production Maintenance, PM2 Commands & Logs

### PM2 Monitoring Commands
```bash
# View live status of process cluster
pm2 status

# Real-time interactive CPU & memory dashboard
pm2 monit

# View streaming application output logs
pm2 logs truvaer-app

# Restart application
pm2 restart truvaer-app

# Zero-downtime cluster reload
pm2 reload truvaer-app
```

### Nginx Log Inspection
```bash
# Access logs (view incoming visitors and IP addresses)
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### One-Command Manual Update
Whenever you want to manually update the server:
```bash
cd /var/www/truvaer
./deploy.sh
```

---

## ✅ Production Readiness Checklist
- [x] Node.js Express static server with health check (`/_healthz`) created (`server.js`)
- [x] Multi-stage production `Dockerfile` created
- [x] PM2 cluster configuration file created (`ecosystem.config.cjs`)
- [x] Production Nginx reverse-proxy template created (`nginx.conf.template`)
- [x] Automated deployment shell script created (`deploy.sh`)
- [x] Static build verified (`npm run build` succeeds cleanly)
- [x] TypeScript validation passing (`npm run lint` 0 errors)
- [x] Help Center articles enhanced with click-by-click routes and step-by-step procedures

Your platform is completely ready to be pushed to your Git repository and deployed to AWS EC2 or Microsoft Azure!
