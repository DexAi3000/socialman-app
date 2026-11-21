#!/bin/bash
set -e
echo "🚀 در حال بروزرسانی سوشال‌من روی سرور..."

cd /var/www/socialman-app
git pull origin master
npm run build
pm2 restart socialman

echo "✅ بروزرسانی با موفقیت انجام شد! سایت روی http://194.117.64.88 فعال است."
