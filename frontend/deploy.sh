#!/usr/bin/env bash
# BangCheck frontend → S3 + CloudFront 배포 스크립트
#
# 사용법:
#   1) cp .env.deploy.template .env.deploy  (최초 1회)
#   2) .env.deploy 값 채우기
#   3) ./deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── 환경변수 로드 ─────────────────────────────────────────
if [[ ! -f .env.deploy ]]; then
  echo "❌ .env.deploy 파일이 없습니다. .env.deploy.template 복사 후 값 채우세요."
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env.deploy
set +a

: "${S3_BUCKET:?S3_BUCKET 미설정}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?CLOUDFRONT_DISTRIBUTION_ID 미설정}"
: "${AWS_REGION:=ap-northeast-2}"

# ── AWS CLI / 자격증명 확인 ───────────────────────────────
command -v aws >/dev/null || { echo "❌ aws CLI 미설치"; exit 1; }
aws sts get-caller-identity >/dev/null || { echo "❌ AWS 자격증명 실패. aws configure 필요"; exit 1; }

echo "▶ 배포 시작: bucket=$S3_BUCKET region=$AWS_REGION"

# ── 1. 빌드 ───────────────────────────────────────────────
echo "▶ 빌드 중..."
npm run build

if [[ ! -d dist ]]; then
  echo "❌ dist/ 디렉토리가 생성되지 않았습니다."
  exit 1
fi

# ── 2. S3 업로드 ─────────────────────────────────────────
# 해시 파일(JS/CSS): 1년 immutable 캐시
# 비해시 파일(html 등): 캐시 금지 (항상 최신)
echo "▶ S3 업로드: 해시 자산 (long cache)"
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --region "$AWS_REGION" \
  --delete \
  --exclude "*.html" \
  --exclude "*.json" \
  --exclude "*.txt" \
  --exclude "*.xml" \
  --cache-control "public, max-age=31536000, immutable"

echo "▶ S3 업로드: HTML/메타 (no cache)"
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --region "$AWS_REGION" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --include "*.txt" \
  --include "*.xml" \
  --cache-control "no-cache, no-store, must-revalidate"

# ── 3. CloudFront 캐시 무효화 ────────────────────────────
echo "▶ CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ 배포 완료 (Invalidation: $INVALIDATION_ID)"
echo "   전체 반영까지 1~3분 소요"
