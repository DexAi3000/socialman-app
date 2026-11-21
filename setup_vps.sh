#!/bin/bash
set -e

echo "=============================================="
echo "🚀 نصب و استقرار امن سوشال‌من روی سرور ابری"
echo "🛡️ سایت اصلی و پورتفولیو (nima-portfolio) کاملاً حفظ می‌شود"
echo "=============================================="

# 1. Update & Prerequisites
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx build-essential

# 2. Install Node.js 20 LTS if not installed or outdated
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
    echo "📦 در حال نصب Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "✓ نسخه Node.js: $(node -v)"
echo "✓ نسخه NPM: $(npm -v)"

# 3. Install PM2 process manager
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 4. Clone or pull repository in a completely separate directory
mkdir -p /var/www
cd /var/www

if [ -d "socialman-app" ]; then
    echo "🔄 دریافت آخرین تغییرات کد..."
    cd socialman-app
    git reset --hard HEAD
    git pull origin master
else
    echo "📥 دریافت مخزن سورس‌کد..."
    git clone https://github.com/DexAi3000/socialman-app.git
    cd socialman-app
fi

# 5. Configure Production Environment Variables (.env.local)
echo "⚙️ تنظیم متغیرهای محیطی و کلیدهای پنل پیامک و بات‌ها..."
cat << 'EOF' > .env.local
TELEGRAM_BOT_TOKEN=9115798954:AAHHygpdWUJlhI3k-FX7rtU2egGt7wwHwrg
TELEGRAM_BOT_USERNAME=@SocialManPublishBot

RUBIKA_BOT_TOKEN=CJIJEG0ICJPDQSHEUWTHRWIDFFITRQUHWBZFEAQAYUJHCUZUGSYBGUQXCUZHERIR
RUBIKA_BOT_USERNAME=@SocialManPublishBot

BALE_BOT_TOKEN=369114062:R7BeEnjLaDSiFv26-wsP-4ol_aGbTKmBNo
BALE_BOT_USERNAME=@SocialManPublishBot

SMS_IR_API_KEY=wQXNOwaL75yUIMjRgdMBzYcQ1w3o8WRmuvhnhSwYAoBOweiC
SMS_IR_TEMPLATE_ID=492717
SMS_IR_LINE_NUMBER=30002108021452

GEMINI_API_KEY=
EOF

# 6. Install dependencies and Build
echo "📦 در حال نصب پکیج‌ها (npm install)..."
npm install --legacy-peer-deps

echo "⚡ در حال بیلد بهینه‌شده Next.js..."
npm run build

# 7. Start PM2 daemon on port 3000
echo "🚀 اجرای سرویس در پس‌زمینه با PM2..."
pm2 delete socialman || true
PORT=3000 pm2 start npm --name "socialman" -- start
pm2 save
pm2 startup systemd -u root --hp /root || true

# 8. Configure Nginx for nimaariyanfar.com/socialman and IP
echo "🌐 پیکربندی Nginx برای دامنه رسمی nimaariyanfar.com/socialman و آی‌پی..."
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

echo "=============================================="
echo "🎉 تبریک! اپلیکیشن سوشال‌من با موفقیت لایو شد!"
echo "🌐 آدرس رسمی وب‌سایت جهت تایید SMS.ir: http://nimaariyanfar.com/socialman"
echo "🌐 آدرس آی‌پی مستقیم: http://194.117.64.88/socialman"
echo "=============================================="
