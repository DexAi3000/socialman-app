#!/bin/bash
set -e
echo "🚀 در حال بروزرسانی سوشال‌من روی سرور..."

cd /var/www/socialman-app

# Discard local package-lock.json modifications to prevent merge conflicts
git fetch origin master
git reset --hard origin/master

npm install --production=false
npx prisma db push
if [ ! -f "prisma/dev.db" ] || [ $(sqlite3 prisma/dev.db "SELECT count(*) FROM Post;" 2>/dev/null || echo 0) -eq 0 ]; then
  npx tsx prisma/seed.ts || true
fi
npm run build
pm2 restart socialman

echo "✅ بروزرسانی با موفقیت انجام شد! سایت روی http://194.117.64.88 فعال است."
