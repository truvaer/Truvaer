# Automated Zero-Downtime CI/CD Pipeline Guide
## Truvaer Aviation Platform (AWS EC2 & Azure Cloud)

This guide explains how your development setup here connects directly to GitHub, and how every push or release tag triggers an automated continuous deployment pipeline to AWS EC2 or Azure **with zero downtime and zero data loss for active users**.

---

## 1. How It Works (The 3-Tier Architecture)

```
┌─────────────────────────────────┐
│  AI Studio Development Env      │
│  (You write code / test here)   │
└────────────────┬────────────────┘
                 │ git push origin main  OR  git push origin v1.0.1
                 ▼
┌─────────────────────────────────┐
│       GitHub Repository         │
│  .github/workflows/deploy-*.yml │
└────────────────┬────────────────┘
                 │ Automated CI/CD Trigger (GitHub Actions)
                 ├───────────────────────────────┐
                 ▼                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     AWS EC2 (Ubuntu Linux)      │   │     Azure VM (Ubuntu Linux)     │
│ 1. Pulls new code / release tag │   │ 1. Pulls new code / release tag │
│ 2. npm ci & npm run build       │   │ 2. npm ci & npm run build       │
│ 3. PM2 Cluster Rolling Reload   │   │ 3. PM2 Cluster Rolling Reload   │
│ 4. Health Probe Verification    │   │ 4. Health Probe Verification    │
└─────────────────────────────────┘   └─────────────────────────────────┘
                 │                               │
                 ▼                               ▼
       Zero Connection Drops           Zero Connection Drops
    Database & Sessions Intact      Database & Sessions Intact
```

---

## 2. Why Users Never Feel Data is Lost

When users report "data loss" during traditional website deployments, it usually happens because of three flaws that we have solved:

| Problem in Traditional Deployments | How Truvaer Solves It | Result for Users |
| :--- | :--- | :--- |
| **Server Restart Drops Connections (502)** | PM2 Cluster Mode with `wait_ready: true` and `process.send('ready')` handshake. Old workers stay alive until new workers are confirmed healthy. | **Zero Downtime**: Users submitting a form or booking never see a "502 Bad Gateway" error. |
| **Database Overwritten by Code Deploy** | App code (`/var/www/truvaer`) is completely decoupled from the data layer. Persistent state lives in Cloud Firestore or RDS PostgreSQL outside the git repository. | **Data Continuity**: User profiles, credit balances, broadcasts, and CRM deals are untouched. |
| **Old JavaScript Chunks 404** | Static hashed assets in `dist/assets` are cached with `immutable`, and `index.html` is served with `no-cache`. | **No Broken Scripts**: Users with tabs open can finish what they are doing. |
| **Forced Session Logout** | Tokens and draft states are stored in browser `sessionStorage` and `localStorage`, and the server supports hot reload. | **Session Continuity**: When users refresh, they remain logged in with all work preserved. |
| **Version Awareness in UI** | The new `VersionUpdateNotifier` silently checks `/api/version` every 45s and shows a subtle toast: *"New Platform Update Live (v1.0.1) - Session Safe (No Data Loss)"*. | **Smooth Experience**: Users choose when to apply the update without disruption. |

---

## 3. GitHub Secrets Configuration (One-Time Setup)

Go to your GitHub repository:
**Settings > Secrets and variables > Actions > New repository secret**

### For AWS EC2:
Add the following secrets:
1. `AWS_EC2_HOST`: The Public IP or DNS of your EC2 instance (e.g., `54.210.12.89`).
2. `AWS_EC2_USER`: `ubuntu` (for Ubuntu AMI) or `ec2-user`.
3. `AWS_EC2_SSH_KEY`: The entire content of your private key `.pem` file:
   ```text
   -----BEGIN RSA PRIVATE KEY-----
   ... your secret private key ...
   -----END RSA PRIVATE KEY-----
   ```
4. `AWS_EC2_PORT`: `22` (default).
5. `APP_PUBLIC_DOMAIN` (Optional): `truvaer.com` or your staging domain.

### For Azure VM:
Add the following secrets:
1. `AZURE_VM_HOST`: The Public IP or DNS of your Azure VM.
2. `AZURE_VM_USER`: `azureuser` (or your configured admin username).
3. `AZURE_VM_SSH_KEY`: Your SSH private key contents.
4. `AZURE_VM_PORT`: `22` (default).

---

## 4. How to Release New Versions (Workflow)

### Method A: Automatic Deployment on Every Push to `main`
Any time you push changes to the `main` branch, GitHub Actions will:
1. Test and build your code (`npm run lint`, `npm run build`).
2. Connect to your EC2 / Azure server.
3. Perform the rolling reload with `./deploy.sh`.
4. Verify the server health probe at `/_healthz`.

```bash
git add .
git commit -m "feat: updated FlashNews queue layout and C-Panel sectors"
git push origin main
```

### Method B: Semantic Version Release (Recommended for Production)
Tagging your commit triggers the deployment and stamps the exact version name (e.g., `v1.0.1`):

```bash
# 1. Update version in package.json (e.g. 1.0.1)
git add package.json
git commit -m "chore: release version 1.0.1"

# 2. Create git tag
git tag v1.0.1

# 3. Push code and tag to GitHub
git push origin main
git push origin v1.0.1
```

Once pushed, GitHub Actions automatically deploys `v1.0.1`. The `/api/version` endpoint immediately serves:
```json
{
  "version": "1.0.1",
  "status": "online",
  "environment": "production"
}
```
And active users in the app will see the non-intrusive update badge notifying them that the latest version is active.

---

## 5. Server Initial Setup (Run Once on EC2 or Azure)

Before your first GitHub Action runs, run these commands once on your server:

```bash
# 1. Update system & install Node.js 20, Git, and PM2
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git curl nginx

sudo npm install -g pm2

# 2. Prepare Application Directory
sudo mkdir -p /var/www/truvaer
sudo chown -R $USER:$USER /var/www/truvaer

# 3. Clone Repository
git clone https://github.com/YOUR_ORG/truvaer-platform.git /var/www/truvaer
cd /var/www/truvaer

# 4. Make deploy script executable & run first deployment
chmod +x deploy.sh
./deploy.sh

# 5. Enable PM2 on system boot
pm2 startup
pm2 save
```

---

## 6. Zero-Downtime Rollback (If Needed)

If an unintended bug makes it into production:
```bash
# Instant rollback to previous tag with zero downtime:
./deploy.sh v1.0.0
```
PM2 will roll workers back to the previous stable build in seconds without dropping user traffic.
