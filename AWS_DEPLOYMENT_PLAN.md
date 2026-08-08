# E-Commerce Deployment Plan — AWS Free Tier (Docker version)

Deploy the **full stack** (backend + frontend + Redis + MongoDB) on AWS with **no recurring cost** using the Docker Compose setup already built in this repo.

## Architecture

```
Browser ──► http://<EC2-Public-IP>:5173 ──► Nginx (frontend, production build)
                                              │  /api/*  proxied internally
                                              ▼  backend:5000
                                  Express (Node) on EC2 (t2.micro) inside Docker
                                              │
                                              ├── Redis (sessions + cache)
                                              └── MongoDB (persistent volume)
```

Everything runs as containers on **one** `t2.micro` EC2 instance using the existing `docker-compose.yml`.

| Service      | Host port | Container           |
|--------------|-----------|---------------------|
| Frontend     | `5173`    | nginx serving SPA   |
| Backend API  | `5001`    | Express on `5000`   |
| Redis        | internal  | cache + sessions    |
| MongoDB      | `27017`   | persistent data     |

> Note: host port `5001` → container `5000` included in compose (5000 is often taken locally). Keep as-is.

---

## Phase 1 — One-time prep on your laptop

### 1. Install & configure the AWS CLI

```powershell
# already installed: aws-cli/2.36.13
aws configure
# AWS Access Key ID:      <from IAM>
# AWS Secret Access Key:  <from IAM>
# Default region name:    ap-south-1   (or your nearest)
# Default output format:  json
```

Create an IAM user:
1. AWS Console → IAM → Users → **Create user** (`deploy-admin`)
2. Attach policy `AdministratorAccess` (free-tier dev setup; fine for this project)
3. Save the **Access Key ID** + **Secret Access Key**
4. Test: `aws sts get-caller-identity`

### 2. Prepare the repo on GitHub (recommended)
```powershell
git init && git add -A && git commit -m "ecommerce docker stack"
# create an EMPTY repo on GitHub (e.g. ecommerce)
git remote add origin https://github.com/<you>/ecommerce.git
git push -u origin main
```
`.gitignore` in both `backend/` and `frontend/` already excludes `node_modules`, `dist`, `.env`.

---

## Phase 2 — Launch a free EC2 instance

### 3. Launch the instance (Console or one-command CLI)

Console click-through:
1. EC2 → **Launch instance** → name `ecommerce`
2. AMI: **Ubuntu 22.04 LTS** (free-tier eligible)
3. Type: **`t2.micro`** (Free Tier)
4. Key pair: create/download `ecommerce-key.pem`
5. **Security group** → Add rules:
   - `SSH` `22` from `0.0.0.0/0`
   - `HTTP` `80`/`443` (for HTTPS later)
   - For raw access: `Custom TCP` `5173` and `5001` from `0.0.0.0/0`
6. Storage: 8GB gp2/gp3 (Free Tier), Launch.

CLI one-liner (PowerShell) — same result:
```powershell
aws ec2 run-instances `
  --image-id ami-0df24e148fdb9f1d0 `  # Ubuntu 22.04 ap-south-1 (verify ami)
  --instance-type t2.micro `
  --key-name ecommerce-key `
  --security-group-ids <sg-id> `
  --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":8,\"VolumeType\":\"gp3\"}}]"
```

### 3. Allocate a static Elastic IP (recommended, free while attached)
1. EC2 → **Elastic IPs → Allocate** (keep default pool) → **Associate** to your instance
2. Note the public IP — use it everywhere below.

---

## Phase 3 — Provision the server (scripted deploy)

### 4. Connect
```powershell
ssh -i "C:\path\ecommerce-key.pem" ubuntu@<EC2-PUBLIC-IP>
# if permission error on Windows:
icacls "C:\path\ecommerce-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

### 5. One-shot setup script
I'll provide `deploy.sh` (create it → run once):

```bash
#!/usr/bin/env bash
set -e
cd ~
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git
# Install Docker (Ubuntu 22.04)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt-get install -y docker-compose-plugin
# get repo
git clone https://github.com/<you>/ecommerce.git
cd ecommerce
# create env (edit with your values)
cp backend/.env.example backend/.env
# (optional) restore your data: see "Data migration" below
docker compose up -d --build
docker compose ps
curl http://localhost:5173/api/v1/products
```
> After `sudo usermod -aG docker`, re-login (`exit`/ssh again) so `$USER` is in the docker group.

Full file is committed at `deploy/ec2-setup.sh` in this repo — upload & run it.

### 6. Configure secrets on the server
**Never** commit `.env` with real secrets. On the server:
```bash
cd ecommerce
nano backend/.env   # set JWT_SECRET, JWT_REFRESH_SECRET, SMTP, Stripe, Cloudinary, CLIENT_URL
```
`docker compose` reads `backend/.env` via `env_file`, so values are injected as-is.

---

## Phase 4 — Data on AWS (choose how to run MongoDB)

### Option A — Mongo inside Docker (recommended locally, free)
Already in `docker-compose.yml` — `mongo` container with `mongo-data` volume. Zero extra cost, self-contained. **To make production-safe fork this later.**

### Option B — MongoDB Atlas M0 (free) [recommended for AWS]
1. Already have the M0 cluster with real data.
2. In compose override, point backend to Atlas:
   ```yml
   services:
     backend:
       environment:
         - MONGO_URI=mongodb+srv://<user>:<pass>@cluster0....mongodb.net/ecommerce
   ```
   (Remove the local `mongo` service.) Atlas M0 has no per-hour cost.

---

## Verify

```bash
curl http://localhost:5173/            # frontend HTML
curl http://localhost:5173/api/v1/products
curl http://localhost:5173/health
docker logs ecommerce-backend          # MongoDB connected / Redis connected
```

---

## Restore your existing data onto the EC2 Mongo (from local / Atlas)

We already have a working sync script (Atlas ↔ Docker). On the EC2, run the same logic targeting its container:

```bash
# from the project root on the server (inside docker net)
docker cp deploy/sync_data.mjs ecommerce-backend:/app/sync_data.mjs
docker exec -w /app ecommerce-backend node sync_data.mjs   # Atlas URI as SRC, mongo container as DST
docker exec ecommerce-backend rm /app/sync_data.mjs
```

Or cross from your laptop over the internet only if your EC2 security group is open **and** you guard the container port (`27017`) with SSH tunneling:
```bash
ssh -i key.pem -L 27017:localhost:27017 ubuntu@EC2_IP
mongorestore --uri mongodb://127.0.0.1:27017/ecommerce /dump
```

---

## Free tier / cost summary

| Resource              | Free amount                     | Notes                              |
|-----------------------|---------------------------------|------------------------------------|
| t2.micro (1 vCPU/1GB) | 750 hrs/mo                      | **1 instance max.** 1GB RAM is ok for this stack |
| gp3 volume 8GB        | 30 GB (in Free Tier)            | adjust later                     |
| Elastic IP attached   | Free while attached to running  | Release on terminate |
| MongoDB Atlas M0 / Docker mongo | free / free | free forever                   |

- Stop/terminate instance when not needed (stops the hourly-free pool).
- One running `t2.micro` is within the 750 free hours for 12 months.

## Rollback / cleanup

```bash
# stop (keeps EBS, no extra cost):
aws ec2 stop-instances --instance-ids <id>
# full destroy:
aws ec2 terminate-instances --instance-ids <id>
docker compose down -v   # on server: erase volumes (mongo data)
# release EIP once instance gone
aws ec2 release-address --allocation-id <eip-id>
```

## Checklist before going live

- [ ] AWS CLI configured (`aws sts get-caller-identity` works)
- [ ] IAM `deploy-admin` key saved safely (not committed)
- Your `docker-compose.yml` builds cleanly on EC2 (tested locally)
- `.env` on server has prod secrets (`JWT_SECRET`, Stripe, Cloudinary, `CLIENT_URL`)
- [ ] Security group: `22`, `5173`, `5001` (optional 443 later)
- [ ] Elastic IP attached (EIP public = your site URL until domain)
- [ ] `docker compose up -d` → all 4 containers healthy, `/health` OK
- [ ] Atlas/Mongo data restored; `/api/v1/products` returns your rows
- [ ] PM2 not needed — Docker `restart: unless-stopped` handles auto-restart