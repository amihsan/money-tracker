[![CI/CD for Money Tracker App](https://github.com/amihsan/quiz-app/actions/workflows/ci-cd-docker-aws-ec2.yml/badge.svg)](https://github.com/amihsan/quiz-app/actions/workflows/ci-cd-docker-aws-ec2.yml)  
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

# 💡 Money Tracker App

A full-stack web application to track borrowings, repayments, and unpaid amounts. Built with **React**, **Flask**, and **AWS**, it is deployed with **Docker** and **CI/CD** for automatic updates.

## 🔗 Live Demo

[https://moneytracker.me](https://moneytracker.me)  

---

## 🧱 Built With

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Python, Flask  
- **Database:** DynamoDB  
- **Cloud & Hosting:** AWS EC2  
- **Containerization:** Docker, Docker Compose  
- **CI/CD:** GitHub Actions  

---

## 🚀 Features

- User registration and authentication  
- Track borrowings, repayments, and unpaid amounts  
- CRUD operations for transactions  
- Mobile-friendly responsive design  
- Dockerized for local development and production  
- SSL/TLS via Let's Encrypt on AWS EC2  
- Automated CI/CD deployment via GitHub Actions  

---


---

## ⚡ Getting Started

### ⚙️ Local Setup

1. **Create DynamoDB Table**  
   - Primary key: `user_id`  
   - Sort key: `transaction_id`

2. **Clone Repository**  
   ```bash
   git clone <your-repository-url>
   cd <your-project-directory>


3. **Frontend Setup**

   ```shell
   cd frontend
   npm install
   ```

4. **Backend Setup**
   ```shell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate # Windows
   source venv/bin/activate # Linux/Mac
   pip install -r requirements.txt
   ```

## 👟 Usage

### 🏠 Local Usage

1. Run frontend:

   ```bash
   cd frontend
   npm run dev
   ```

2. Run backend: after activate venv:

   ```bash
   cd backend
   .\venv\Scripts\activate # Windows activate venv
   source venv/bin/activate # Linux/Mac activate venv
   python app.py
   ```

3. Create two seperate .env files inside both frontend and backend directory. Follow template.env and replace with necessary values.

## ⛴️ Docker Usage

 Nginx is used used to serve react build and proxy to backend flask api.

#### For local development:

```bash
docker-compose -f docker-compose-dev.yml up --build -d
```

## 🌍 Cloud Deployment on AWS EC2 with SSL/TLS using Let's Encrypt (Certbot)

This guide covers the manual deployment of your application on AWS EC2 with SSL/TLS certificates provided by Let's Encrypt using Certbot.

### Setting Up GitHub Secrets

For continuous deployment via GitHub Actions, configure the following GitHub secrets in your repository:

- `EC2_HOST_DNS`: The public IP address of your AWS EC2 instance.
- `EC2_USERNAME`: The EC2 username (e.g., `ec2-user` for Amazon Linux).
- `EC2_SSH_KEY`: The SSH private key (PEM file) for connecting to your EC2 instance.
- `EC2_TARGET_DIR`: The target directory on the EC2 instance where your project will reside.
- `DOCKER_USERNAME`: Your Docker Hub username.
- `DOCKER_PASSWORD`: Your Docker Hub password.

To add these secrets, navigate to **Settings > Secrets > Actions** in your repository.

### Deployment Steps

#### Manual Deployment

1. **Clone Repository to EC2:**

   - SSH into your EC2 instance and clone your repository:

   ```bash
   git clone <your-repository-url>
   cd <your-project-directory>
   ```

2. **Create Environment Files:**

   - Create `.env` files in both the **frontend** and **backend** directories for environment-specific configurations.

3. **Run Let's Encrypt for SSL Certificates:**

   - Obtain SSL Certificates (First Time)
   - Run the below command only one time from root directory to collect lets encrypt certificate. After that it will be automatically updated via cicd workflow and docker-compose.

   - Replace `your-email@example.com` with a real email for expiration notifications, and update domains.

     ```bash

     docker run -it --rm \
     -p 80:80 \
     -v $(pwd)/ssl/certbot/conf:/etc/letsencrypt \
     -v $(pwd)/ssl/certbot/www:/var/www/certbot \
     certbot/certbot certonly --standalone \
     -d your-other-domain.com -d www.your-other-domain.com \
     --email your-email@example.com --agree-tos --no-eff-email
     ```

4. **Build and Start Docker Containers:**
   - Use Docker Compose to build and start your application containers:
     ```bash
     docker-compose up  -d
     ```

#### CI/CD Deployment

- From this point onward, every time changes are pushed to the main branch, the GitHub Actions workflow will automatically deploy the application to your EC2 instance.

---
