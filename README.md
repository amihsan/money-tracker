### **1️⃣ Obtain SSL Certificates (First Time)**

Replace `your-email@example.com` with a real email for expiration notifications, and update domains.

```bash
# Money Tracker
docker run -it --rm \
  -p 80:80 \
  -v $(pwd)/ssl/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/ssl/certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d your-other-domain.com -d www.your-other-domain.com \
  --email your-email@example.com --agree-tos --no-eff-email