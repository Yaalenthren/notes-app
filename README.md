# Notes App — AWS Cloud Engineer Assessment

A full-stack CRUD application with Django REST Framework, React, PostgreSQL, and Docker. Deployed on AWS EC2 with S3 for file storage.

---

## Architecture

```
docs/ArchitectureDiagramforNotesapp.jpg
```

All services run in Docker containers on a single EC2 instance. Only ports 80 and 443 are publicly exposed. PostgreSQL is on an internal Docker network only.

---

## Project Structure

```
project/
├── backend/
│   ├── core/              # Django project settings, urls, wsgi
│   ├── notes/             # Notes app: models, views, serializers, urls
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # NoteCard, NoteModal
│   │   ├── App.js
│   │   ├── api.js
│   │   └── index.js
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml         # Production
├── docker-compose.dev.yml     # Local development
├── .env.example
└── README.md
```

---

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for running frontend outside Docker)

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd project

# 2. Start all services
docker compose -f docker-compose.dev.yml up --build

# 3. Access the app
#    Frontend: http://localhost:3000
#    Backend API: http://localhost:8000/api/notes/
#    Django Admin: http://localhost:8000/admin/
```

---

## AWS Deployment

### 1. Launch EC2 Instance
- AMI: Ubuntu 22.04 LTS
- Instance type: t2.micro (Free Tier)
- Storage: 20 GB gp2

### 2. Security Group Rules

| Type  | Protocol | Port | Source      | Purpose              |
|-------|----------|------|-------------|----------------------|
| SSH   | TCP      | 22   | Your IP only | Admin access        |
| HTTP  | TCP      | 80   | 0.0.0.0/0   | Web traffic + redirect |
| HTTPS | TCP      | 443  | 0.0.0.0/0   | Secure web traffic   |

**All other ports (5432, 8000, 3000) are NOT exposed.**

### 3. Install Docker on EC2

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
```

### 4. Create S3 Bucket

```bash
aws s3 mb s3://your-notes-bucket --region us-east-1

# Block all public access (files served via signed URLs or Django proxy)
aws s3api put-public-access-block \
  --bucket your-notes-bucket \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 5. IAM Configuration (Least Privilege)

Create an IAM user `notes-app` with only this inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3NotesAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-notes-bucket",
        "arn:aws:s3:::your-notes-bucket/*"
      ]
    }
  ]
}
```

Generate access keys for this user and add to your `.env`.

### 6. SSL with Let's Encrypt

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Certificates saved to: /etc/letsencrypt/live/yourdomain.com/
```

### 7. Deploy

```bash
# On EC2
git clone <your-repo-url>
cd project

# Create .env from example
cp .env.example .env
nano .env  # Fill in all values

# Start production stack
docker compose up -d --build

# Check logs
docker compose logs -f
```

---

## API Endpoints

| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | /api/notes/                 | List all notes      |
| POST   | /api/notes/                 | Create a note       |
| GET    | /api/notes/{id}/            | Get a single note   |
| PUT    | /api/notes/{id}/            | Update a note       |
| DELETE | /api/notes/{id}/            | Delete a note       |
| POST   | /api/notes/{id}/upload/     | Upload file to S3   |

---

## Scaling Considerations

**Horizontal scaling:**
- Replace EC2 + Docker Compose with ECS (Elastic Container Service) or Kubernetes
- Put an Application Load Balancer in front of multiple EC2 instances
- Use RDS (Managed PostgreSQL) instead of a containerized DB

**Database:**
- Migrate to RDS PostgreSQL for managed backups, read replicas, and Multi-AZ failover

**Static/Media:**
- CloudFront CDN in front of S3 for faster global file delivery

**Caching:**
- Add ElastiCache (Redis) for query caching and Django session storage

---

## Backups

- **Database**: Enable automated RDS snapshots (7-day retention), or use `pg_dump` on a cron job: `docker exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql`
- **S3**: Enable S3 Versioning on the bucket to preserve file history
- **EC2**: Create AMI snapshots before major changes

---

## AWS Free Tier Notes

| Service       | Free Tier Limit           | Usage in this project         |
|---------------|---------------------------|-------------------------------|
| EC2 t2.micro  | 750 hrs/month             | 1 instance = ~744 hrs/month ✓ |
| S3            | 5 GB storage, 20K GET     | File uploads only ✓           |
| Data transfer | 1 GB out/month free       | Light usage ✓                 |
| RDS           | 750 hrs t2.micro/month    | Optional, use containerized DB|

---

## Environment Variables Reference

| Variable                | Required | Description                          |
|-------------------------|----------|--------------------------------------|
| DJANGO_SECRET_KEY       | Yes      | Django secret key (50+ chars)        |
| DEBUG                   | Yes      | `False` in production                |
| ALLOWED_HOSTS           | Yes      | Comma-separated EC2 IP / domain      |
| POSTGRES_DB             | Yes      | Database name                        |
| POSTGRES_USER           | Yes      | Database user                        |
| POSTGRES_PASSWORD       | Yes      | Database password                    |
| POSTGRES_HOST           | Yes      | `db` (Docker service name)           |
| CORS_ALLOWED_ORIGINS    | Yes      | Frontend origin URL(s)               |
| USE_S3                  | Yes      | `True` in production                 |
| AWS_ACCESS_KEY_ID       | Prod     | IAM user access key                  |
| AWS_SECRET_ACCESS_KEY   | Prod     | IAM user secret key                  |
| AWS_STORAGE_BUCKET_NAME | Prod     | S3 bucket name                       |
| AWS_S3_REGION_NAME      | Prod     | e.g. `us-east-1`                     |
