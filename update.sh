#!/bin/bash
set -e

echo "🚀 در حال بروزرسانی و استقرار پروداکشن سوشال‌من روی سرور..."

TARGET_DIR="/var/www/socialman-app"
BACKUP_DIR="/var/backups/socialman-db"

# 1. Create automatic backup of SQLite database
if [ -f "$TARGET_DIR/prisma/dev.db" ]; then
  mkdir -p "$BACKUP_DIR"
  BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).db"
  cp "$TARGET_DIR/prisma/dev.db" "$BACKUP_FILE"
  echo "📦 نسخه پشتیبان از دیتابیس در $BACKUP_FILE ذخیره شد."
fi

cd "$TARGET_DIR"

# 2. Reset and fetch latest code from master
git fetch origin master
git reset --hard origin/master

# 3. Install dependencies and push Prisma schema
npm install --production=false
npx prisma db push --accept-data-loss
npx prisma generate

# 4. Seed database if empty
if [ ! -f "prisma/dev.db" ] || [ $(sqlite3 prisma/dev.db "SELECT count(*) FROM Post;" 2>/dev/null || echo 0) -eq 0 ]; then
  npx tsx prisma/seed.ts || true
fi

# 5. Build Next.js production build with basePath /socialman
npm run build

# 6. PM2 restart with ecosystem configuration
if pm2 describe socialman > /dev/null 2>&1; then
  pm2 restart socialman --update-env
else
  pm2 start npm --name "socialman" -- start
fi

# 7. Ensure Background Scheduler is in crontab
CRON_JOB="* * * * * curl -s http://localhost:3000/socialman/api/cron/publish > /dev/null 2>&1"
(crontab -l 2>/dev/null | grep -F "$CRON_JOB") || (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

# 8. Configure Nginx for nimaariyanfar.com/socialman and IP
cat << 'EOF' > /etc/nginx/sites-available/socialman.conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name nimaariyanfar.com www.nimaariyanfar.com 194.117.64.88 _;

    location /socialman {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = / {
        return 301 /socialman;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/socialman.conf /etc/nginx/sites-enabled/socialman.conf
nginx -t
systemctl reload nginx

echo "=========================================================="
echo "✅ استقرار پروداکشن با موفقیت انجام شد!"
echo "🌐 آدرس رسمی جهت تایید SMS.ir: http://nimaariyanfar.com/socialman"
echo "🌐 آدرس آی‌پی مستقیم: http://194.117.64.88/socialman"
echo "⏰ سرویس زمان‌بندی خودکار پست‌ها فعال گردید."
echo "=========================================================="
