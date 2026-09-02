#!/bin/bash

set -e

echo "=========================================="
echo "BangCheck EC2 초기 설정 스크립트 (Ubuntu)"
echo "=========================================="

export DEBIAN_FRONTEND=noninteractive

# 1. 시스템 업데이트
echo "[1/9] 시스템 업데이트 중..."
sudo apt update -y
sudo apt upgrade -y

# 2. Git 설치
echo "[2/9] Git 설치 중..."
sudo apt install -y git

# 3. Java 17 설치
echo "[3/9] Java 17 (OpenJDK) 설치 중..."
sudo apt install -y openjdk-17-jdk

# 4. Node.js 20 설치
echo "[4/9] Node.js 20 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 5. MySQL 8.0 서버 설치
echo "[5/9] MySQL 8.0 서버 설치 중..."
sudo apt install -y mysql-server

# MySQL 시작 및 재부팅 시 자동 시작 등록
sudo systemctl start mysql
sudo systemctl enable mysql

echo "  ✅ MySQL 설치 완료"
echo "  ⚠ Ubuntu MySQL은 root가 auth_socket 기본 (비밀번호 없음):"
echo "     sudo mysql"
echo "  ⚠ 보안 설정 권장:"
echo "     sudo mysql_secure_installation"

# 6. 저장소 clone
echo "[6/9] BangCheck 저장소 clone 중..."
cd ~
if [ ! -d "BangCheck" ]; then
  git clone https://github.com/BangCheck/BangCheck.git
  cd BangCheck
else
  cd BangCheck
  git pull origin main
fi

# 7. 백엔드 JAR 빌드
echo "[7/9] 백엔드 JAR 빌드 중..."
cd backend
chmod +x gradlew
./gradlew bootJar -x test
cd ..

# 8. 프론트엔드 의존성 설치
echo "[8/9] 프론트엔드 npm 의존성 설치 중..."
cd frontend
npm install
cd ..

# 9. systemd 서비스 unit 파일 등록 (자동 시작은 첫 실행 검증 후 수동 enable)
echo "[9/9] Spring Boot systemd unit 파일 생성 중..."
sudo bash -c 'cat > /etc/systemd/system/bangcheck-backend.service << EOF
[Unit]
Description=BangCheck Spring Boot Backend
After=network.target mysql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/BangCheck/backend
ExecStart=/usr/bin/java -jar /home/ubuntu/BangCheck/backend/build/libs/bangcheck.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=on-failure
RestartSec=10
StandardOutput=append:/home/ubuntu/app.log
StandardError=append:/home/ubuntu/app.log

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload

echo ""
echo "=========================================="
echo "✅ 초기 설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo ""
echo "1. MySQL 보안 설정 + DB/유저 생성 (최초 1회):"
echo "   sudo mysql_secure_installation"
echo "   sudo mysql"
echo "   CREATE DATABASE bangcheck CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'bangcheck'@'localhost' IDENTIFIED BY '[비밀번호]';"
echo "   GRANT ALL PRIVILEGES ON bangcheck.* TO 'bangcheck'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo ""
echo "2. 환경변수 파일 업로드 (로컬에서 실행):"
echo "   scp -i your-key.pem application-prod.yaml ubuntu@[EC2_IP]:~/BangCheck/backend/src/main/resources/"
echo ""
echo "3. 백엔드 재빌드 (코드 변경 시):"
echo "   cd ~/BangCheck/backend && ./gradlew bootJar -x test"
echo ""
echo "4. 백엔드 서비스 시작 및 정상 실행 검증:"
echo "   sudo systemctl start bangcheck-backend"
echo "   sudo systemctl status bangcheck-backend    # active (running) 확인"
echo "   tail -f ~/app.log                           # 로그 정상 출력 확인"
echo ""
echo "5. 정상 실행 확인 후 자동 시작 등록 (재부팅 시 자동 실행):"
echo "   sudo systemctl enable bangcheck-backend"
echo ""
echo "6. 프론트엔드 빌드 및 실행:"
echo "   cd ~/BangCheck/frontend && npm run build && npm run start"
echo ""
