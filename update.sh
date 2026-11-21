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
npx prisma db push

# 4. Seed database if empty
if [ ! -f "prisma/dev.db" ] || [ $(sqlite3 prisma/dev.db "SELECT count(*) FROM Post;" 2>/dev/null || echo 0) -eq 0 ]; then
  npx tsx prisma/seed.ts || true
fi

# 5. Build Next.js production build
npm run build

# 6. PM2 restart with ecosystem configuration
if pm2 describe socialman > /dev/null 2>&1; then
  pm2 restart socialman --update-env
else
  pm2 start npm --name "socialman" -- start
fi

# 7. Ensure Background Scheduler is in crontab
CRON_JOB="* * * * * curl -s http://localhost:3000/api/cron/publish > /dev/null 2>&1"
(crontab -l 2>/dev/null | grep -F "$CRON_JOB") || (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "=========================================================="
echo "✅ استقرار پروداکشن با موفقیت انجام شد!"
echo "🌐 آدرس زنده وب‌اپلیکیشن: http://194.117.64.88"
echo "⏰ سرویس زمان‌بندی خودکار پست‌ها فعال گردید."
echo "=========================================================="
