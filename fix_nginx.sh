#!/bin/bash
set -x

echo "=========================================="
echo "🔧 تنظیم خودکار Nginx برای آی‌پی 194.117.64.88"
echo "=========================================="

# 1. پشتیبان‌گیری
mkdir -p /etc/nginx/backup_conf
cp -r /etc/nginx/sites-available /etc/nginx/backup_conf/ || true
cp -r /etc/nginx/sites-enabled /etc/nginx/backup_conf/ || true

# 2. حذف لینک default
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/socialman.conf

# 3. حذف کلمه default_server از تمام فایل‌های دیگر تا تداخل پیش نیاید
find /etc/nginx/sites-available/ -type f -exec sed -i 's/default_server//g' {} +

# 4. ایجاد کانفیگ اختصاصی و دقیق برای سوشال‌من
cat << 'EOF' > /etc/nginx/conf.d/socialman.conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 194.117.64.88 _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 5. تست و ری‌استارت قطعی Nginx
nginx -t
systemctl restart nginx

echo "=========================================="
echo "✅ تست اتصال محلی به پورت ۸۰:"
curl -I http://127.0.0.1/ || true
echo "=========================================="
