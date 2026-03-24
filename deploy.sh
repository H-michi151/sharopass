#!/bin/bash
# deploy.sh - ローカルからさくらサーバーへデプロイ
# 使い方: ./deploy.sh

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔨 Building Next.js..."
cd "$APP_DIR"
npm run build

echo ""
echo "📤 Uploading to Sakura Server..."
python3 << 'PYEOF'
import ftplib, os

HOST = 'mdl-japan.sakura.ne.jp'
USER = 'mdl-japan'
PASS = 'UDM.r7K9Hy33'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_OUT = os.path.join(SCRIPT_DIR, 'out')
LOCAL_API = os.path.join(SCRIPT_DIR, 'sakura-api')
REMOTE_BASE = '/www/sharopass'

def ensure_dir(ftp, path):
    parts = [p for p in path.split('/') if p]
    cur = ''
    for p in parts:
        cur += '/' + p
        try: ftp.mkd(cur)
        except: pass

def upload_dir(ftp, local_dir, remote_dir):
    ensure_dir(ftp, remote_dir)
    for item in sorted(os.listdir(local_dir)):
        lp = os.path.join(local_dir, item)
        rp = remote_dir + '/' + item
        if os.path.isdir(lp):
            upload_dir(ftp, lp, rp)
        else:
            with open(lp, 'rb') as f:
                ftp.storbinary(f'STOR {rp}', f)
            print(f'  ✓ {rp}')

ftp = ftplib.FTP()
ftp.connect(HOST, 21, timeout=30)
ftp.login(USER, PASS)
ftp.set_pasv(True)
print(f'Connected to {HOST}')

upload_dir(ftp, LOCAL_OUT, REMOTE_BASE)
if os.path.exists(LOCAL_API):
    upload_dir(ftp, LOCAL_API, REMOTE_BASE + '/sakura-api')

ftp.quit()
print('\n✅ Deploy complete!')
PYEOF
