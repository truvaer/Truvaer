# Truvaer Aviation Platform - Production Database Deployment Guide

This guide provides the complete, tested instructions to take Truvaer live on **Amazon Web Services (AWS)**, **Google Cloud Platform (GCP)**, **Supabase**, **Neon**, or any containerized hosting platform.

---

## 1. Database Architecture Overview

The production schema (`/src/db/schema.sql`) uses **PostgreSQL 14+** and provides:
- **Core User & Identity:** `users`, `business_profiles`, `business_followers`.
- **LinkedIn Social Feed & Marketing Engine:** `business_posts`, `post_marketing_campaigns`, `post_likes`, `post_comments`.
- **Wallets & Currency Settlement:** `digital_wallets`, `digital_wallet_transactions`, `corporate_wallets`, `corporate_wallet_transactions`.
- **Service Directory & Unifinder:** `service_listings`, `unlocked_contacts` (30-day auto expiry), `customer_reviews`.
- **CRM Pipeline & Commercial Sales:** `crm_leads`, `crm_opportunities`, `crm_quotations`, `crm_sales_records`, `platform_commissions`.
- **Real-Time Governance:** `admin_activity_feed` (tracks business approvals, commission payouts, and lead status changes in real-time).

---

## 2. Deploying to AWS (Amazon Web Services)

### Option A: AWS RDS PostgreSQL / Aurora Serverless v2

1. **Create an RDS PostgreSQL Instance:**
   - Engine: **PostgreSQL 15.x or 16.x**
   - DB instance class: `db.t4g.medium` (or Aurora Serverless v2: 0.5 - 4 ACUs)
   - Enable **Storage Auto-scaling** (20 GB - 200 GB)
   - VPC: Place in private subnets with a Security Group allowing inbound port `5432` from your application's security group.

2. **Initialize Schema & Seed Data:**
   Connect via bastion host, AWS CloudShell, or psql:
   ```bash
   psql -h <your-rds-endpoint.rds.amazonaws.com> \
        -p 5432 \
        -U truvaer_admin \
        -d postgres \
        -f src/db/schema.sql
   ```

3. **Set Environment Variables on AWS App Runner / ECS:**
   ```bash
   DATABASE_URL="postgresql://truvaer_admin:<PASSWORD>@<your-rds-endpoint.rds.amazonaws.com>:5432/truvaer_production?sslmode=require"
   NODE_ENV="production"
   ```

---

## 3. Deploying to GCP (Google Cloud Platform)

### Option B: Google Cloud SQL for PostgreSQL

1. **Create a Cloud SQL Instance:**
   ```bash
   gcloud sql instances create truvaer-db-prod \
       --database-version=POSTGRES_15 \
       --cpu=2 \
       --memory=7680MiB \
       --region=asia-southeast1 \
       --root-password="<STRONG_PASSWORD>"
   ```

2. **Create the Database:**
   ```bash
   gcloud sql databases create truvaer_production --instance=truvaer-db-prod
   ```

3. **Import the Production Schema:**
   ```bash
   gcloud sql import sql truvaer-db-prod gs://<your-bucket>/schema.sql --database=truvaer_production
   # Or using Cloud SQL Auth Proxy with psql:
   psql "host=127.0.0.1 port=5432 dbname=truvaer_production user=postgres" -f src/db/schema.sql
   ```

4. **Connect from Cloud Run:**
   - Add Cloud SQL connection: `<PROJECT_ID>:<REGION>:truvaer-db-prod`
   - Set environment variable:
     ```bash
     DATABASE_URL="postgresql://postgres:<PASSWORD>@/truvaer_production?host=/cloudsql/<PROJECT_ID>:<REGION>:truvaer-db-prod"
     ```

---

## 4. 1-Click Serverless Database Alternatives

- **Supabase / Neon:**
  1. Create a free project.
  2. Open the **SQL Editor**.
  3. Paste the contents of `src/db/schema.sql` and run.
  4. Copy the connection string to your `.env` file as `DATABASE_URL`.

---

## 5. Summary of Enforced Conditions in Database

| Condition | Database Constraint / Implementation |
|---|---|
| **Real-time Admin Activity Feed** | Stored in `admin_activity_feed` with categories `BUSINESS_APPROVAL`, `COMMISSION_PAYOUT`, `LEAD_STATUS_CHANGE`, `WALLET_DEBIT`, `PUBLICATION_COMPLIANCE`. |
| **Only Business Users Can Publish** | `business_posts` has foreign key `business_id REFERENCES business_profiles(business_id)`. Regular users cannot author posts. |
| **Follow Page Relationship** | `business_followers` table with unique constraint `(user_id, business_id)` and compound indexes. |
| **Organic Posts Visible Only to Followers** | Resolved via `SELECT * FROM business_posts WHERE business_id IN (SELECT business_id FROM business_followers WHERE user_id = $1)`. |
| **Targeted Marketing Campaign Rules** | `post_marketing_campaigns` stores `radius_km`, `country`, `duration_days`, `category`, and strictly sets `target_audience = 'STANDARD_USERS_ONLY'`. Excluded from business users. |
