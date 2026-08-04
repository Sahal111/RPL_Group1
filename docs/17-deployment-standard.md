# 17 · Deployment Standard

---

## Environment

| Environment | Tujuan | Branch |
|---|---|---|
| `local` | Development harian | feature/*, fix/*, refactor/* |
| `staging` | Testing sebelum production | develop |
| `production` | Live, dipakai sekolah sungguhan | main |

**Jangan pernah deploy langsung ke production tanpa lewat staging.**

---

## Environment Variables

### Backend `.env` (production)

```bash
APP_NAME="SIAKAD Enterprise"
APP_ENV=production
APP_KEY=base64:...                 # wajib di-generate: php artisan key:generate
APP_DEBUG=false                    # WAJIB false di production
APP_URL=https://api.siakad.id

LOG_CHANNEL=daily
LOG_LEVEL=error                    # production hanya log error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=siakad_production
DB_USERNAME=siakad_user
DB_PASSWORD=...                    # password kuat, bukan 'password'

CACHE_DRIVER=redis                 # pakai redis di production
QUEUE_CONNECTION=redis             # pakai redis untuk queue
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=siakad.id,*.siakad.id

FILESYSTEM_DISK=local              # atau s3 saat scaling
```

### Frontend `.env.production`

```bash
VITE_API_URL=https://api.siakad.id/api
VITE_APP_NAME=SIAKAD Enterprise
```

---

## Server Requirements

```
PHP          >= 8.2
MySQL        >= 8.0
Redis        >= 6.0
Node.js      >= 20 (untuk build frontend)
Nginx        >= 1.20
Composer     >= 2.x

PHP Extensions wajib:
  BCMath, Ctype, Fileinfo, JSON, Mbstring,
  OpenSSL, PDO, MySQL driver, Tokenizer, XML,
  GD atau Imagick (untuk image processing)
```

---

## Deploy Checklist — Backend

```bash
# 1. Pull kode terbaru
git pull origin main

# 2. Install/update dependency
composer install --no-dev --optimize-autoloader

# 3. Jalankan migration
php artisan migrate --force       # --force karena production

# 4. Clear dan rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 5. Restart queue worker
php artisan queue:restart
# Supervisor akan restart worker otomatis setelah ini

# 6. Clear cache aplikasi (kalau ada perubahan config)
php artisan cache:clear

# 7. Set permission storage
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 8. Symlink storage (hanya pertama kali atau kalau hilang)
php artisan storage:link
```

---

## Deploy Checklist — Frontend

```bash
# 1. Pull kode terbaru
git pull origin main

# 2. Install dependency
npm ci                            # pakai ci, bukan install (lebih deterministik)

# 3. Build untuk production
npm run build

# 4. Copy dist ke web root (atau sudah otomatis via CI/CD)
cp -r dist/* /var/www/siakad-frontend/

# Nginx akan serve file statis dari folder ini
```

---

## Nginx Config

### Backend (Laravel API)

```nginx
server {
    listen 80;
    server_name api.siakad.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.siakad.id;

    ssl_certificate     /etc/letsencrypt/live/api.siakad.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.siakad.id/privkey.pem;

    root /var/www/siakad-backend/public;
    index index.php;

    client_max_body_size 20M;     # sesuai max upload file

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Blok akses langsung ke file sensitif
    location ~ /\.(env|git) {
        deny all;
    }
}
```

### Frontend (React SPA)

```nginx
server {
    listen 443 ssl;
    server_name *.siakad.id;     # wildcard untuk subdomain tenant

    ssl_certificate     /etc/letsencrypt/live/siakad.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/siakad.id/privkey.pem;

    root /var/www/siakad-frontend;
    index index.html;

    # SPA routing — semua route ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Queue Worker — Supervisor

```ini
; /etc/supervisor/conf.d/siakad-worker.conf

[program:siakad-default]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/siakad-backend/artisan queue:work redis --queue=default --tries=3 --timeout=90
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/siakad-default.log

[program:siakad-imports]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/siakad-backend/artisan queue:work redis --queue=imports --tries=1 --timeout=300
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/supervisor/siakad-imports.log
```

```bash
# Restart supervisor setelah ubah config
supervisorctl reread
supervisorctl update
supervisorctl start siakad-worker:*
```

---

## Scheduled Tasks — Crontab

```bash
# /etc/cron.d/siakad
* * * * * www-data php /var/www/siakad-backend/artisan schedule:run >> /dev/null 2>&1
```

```php
// app/Console/Kernel.php (atau routes/console.php di Laravel 11+)
Schedule::command('queue:prune-failed --hours=48')->daily();
Schedule::command('sanctum:prune-expired --hours=168')->daily();  // hapus token > 7 hari
// Schedule::command('backup:run')->dailyAt('02:00');             // backup DB (fase berikutnya)
```

---

## Zero-Downtime Deploy

Untuk menghindari downtime saat deploy:

```bash
# Aktifkan maintenance mode (tampilkan halaman "sedang update")
php artisan down --retry=60

# ... lakukan semua langkah deploy ...

# Matikan maintenance mode
php artisan up
```

Untuk zero-downtime penuh, gunakan deployment tool seperti **Laravel Envoy** atau **Deployer**.

---

## Backup

```bash
# Backup database harian (jalankan via Scheduler)
mysqldump -u siakad_user -p siakad_production | gzip > /backup/db-$(date +%Y%m%d).sql.gz

# Simpan backup minimal 30 hari
find /backup -name "*.sql.gz" -mtime +30 -delete

# Backup storage/app/schools/ juga
rsync -av /var/www/siakad-backend/storage/app/schools/ /backup/storage/
```

---

## SSL Certificate

Pakai Let's Encrypt dengan Certbot:

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Generate wildcard certificate (untuk *.siakad.id)
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d siakad.id -d *.siakad.id

# Auto-renew sudah di-setup otomatis oleh certbot
# Cek dengan:
certbot renew --dry-run
```
