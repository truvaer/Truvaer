# 🚀 CI/CD Pipeline Architecture: GitHub to Production (AWS / Azure)

This document provides complete architectural specifications and operational instructions for deploying TruvAer via an automated 5-stage Continuous Integration and Continuous Deployment (CI/CD) pipeline.

---

## 🏗️ 5-Stage CI/CD Pipeline Overview

```text
  ┌───────────────────────┐
  │ 1. Source Control     │  • GitHub Repository (main / release tags)
  │    (GitHub)           │  • Pull Request validation
  └──────────┬────────────┘
             │ On Push / PR
             ▼
  ┌───────────────────────┐
  │ 2. Continuous         │  • Dependency caching (npm ci)
  │    Integration (CI)   │  • Strict Linting & TypeCheck (npm run lint)
  │                       │  • Production compilation (npm run build)
  └──────────┬────────────┘
             │ Tests Passed
             ▼
  ┌───────────────────────┐
  │ 3. Artifact Registry  │  • Containerize via Multi-stage Dockerfile
  │    (Docker/ECR/GHCR)  │  • Semantic version & commit hash tagging
  │                       │  • Push to secure image registry
  └──────────┬────────────┘
             │ Image Published
             ▼
  ┌───────────────────────┐
  │ 4. Continuous         │  • Staging auto-deploy & smoke verification
  │    Deployment (CD)    │  • Production environment protection rule
  │                       │  • Zero-downtime rolling container rollout
  └──────────┬────────────┘
             │ Rollout Complete
             ▼
  ┌───────────────────────┐
  │ 5. Monitoring &       │  • Post-deployment smoke health check (/health)
  │    Feedback           │  • APM metrics (Datadog, Prometheus)
  │                       │  • Team notifications (Slack / Discord / Email)
  └───────────────────────┘
```

---

## 📋 Detailed Stage Breakdown

### Stage 1: Source Control (GitHub)
- **Repository Management**: Developers commit code and push branches to GitHub.
- **Pull Request Trigger**: Opening a PR to `main` triggers automated checks. Merging is blocked if tests fail.
- **Version Branching Strategy**:
  - `feature/*` -> Development branches.
  - `staging` -> Pre-production validation.
  - `main` / `v*.*.*` -> Triggers production deployment pipeline.

### Stage 2: Continuous Integration (CI)
- Triggered automatically by GitHub Actions (`.github/workflows/production-pipeline.yml`).
- Steps:
  1. Checks out repository code.
  2. Sets up Node.js 20 environment with npm cache.
  3. Executes `npm ci` for deterministic dependency resolution.
  4. Runs strict TypeScript & ESLint validation (`npm run lint`).
  5. Runs production compilation (`npm run build`).

### Stage 3: Artifact Registry
- Docker multi-stage build creates an optimized, lightweight container image.
- Image is tagged with commit SHA (`sha-abc1234`) and semantic version (`v1.2.0`).
- Pushed to:
  - **GitHub Container Registry (GHCR)**: `ghcr.io/your-org/truvaer:latest`
  - Or **AWS ECR**: `123456789012.dkr.ecr.us-east-1.amazonaws.com/truvaer:latest`
  - Or **Azure ACR**: `truvaeracr.azurecr.io/truvaer:latest`

### Stage 4: Continuous Deployment/Delivery (CD)
- **Staging Deployment**: First deployed to Staging to verify environment stability.
- **Production Gate**: Requires manual approval (GitHub Environment Protection Rule) or runs automatically on tag push (`v*.*.*`).
- **Zero-Downtime Deployment**:
  - Rolling updates using Docker Compose / Kubernetes / ECS.
  - New container is started and passes health checks before the old container is decommissioned.
  - User sessions (`sessionStorage`) and active connections remain uninterrupted.

### Stage 5: Monitoring & Feedback
- Post-deployment smoke check verifies HTTP 200 on `https://truvaer.com` and `https://admin.truvaer.com`.
- Telemetry dispatch notifies Prometheus, Datadog, or Slack webhook.

---

## 🔐 GitHub Repository Secrets Configuration

To connect GitHub Actions to your AWS EC2 or Azure VM, configure these secrets under **Settings > Secrets and variables > Actions**:

| Secret Name | Value Description |
|---|---|
| `PROD_SERVER_IP` | Public IP of your AWS EC2 instance or Azure VM |
| `PROD_SSH_USER` | SSH username (e.g. `ubuntu` for AWS Ubuntu, `azureuser` for Azure) |
| `PROD_SSH_KEY` | Private SSH Key (PEM or ed25519) authorized on the server |
| `AWS_ACCESS_KEY_ID` | (Optional) AWS IAM access key for ECR pushing |
| `AWS_SECRET_ACCESS_KEY` | (Optional) AWS IAM secret key |
| `SLACK_WEBHOOK_URL` | (Optional) Incoming webhook URL for deployment alerts |

---

## 🛠️ Step-by-Step Production Release Workflow

1. **Commit and Tag**:
   ```bash
   git add .
   git commit -m "feat: release v1.4.0 with executive MPin and multi-country pricing"
   git tag v1.4.0
   git push origin main --tags
   ```
2. **Watch Pipeline**:
   - Open GitHub > **Actions** tab.
   - Observe **Stage 2 (CI)**, **Stage 3 (Docker Build & Push)**, **Stage 4 (Deploy)**, and **Stage 5 (Feedback)** execute sequentially.
3. **Verify Live Production**:
   - Marketplace: `https://truvaer.com`
   - Executive Admin Desk: `https://admin.truvaer.com`
