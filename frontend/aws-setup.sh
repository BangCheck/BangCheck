#!/usr/bin/env bash
# BangCheck 인프라 1회 셋업 스크립트
# - S3 버킷 (private, OAC)
# - ACM 인증서 (us-east-1, DNS 검증 자동)
# - CloudFront 배포 (SPA 라우팅 + 커스텀 도메인)
# - Route53 alias (apex + www)
# 재실행 안전(idempotent). 이미 있으면 재사용.

set -euo pipefail

# ── 설정 ──────────────────────────────────────────────────
DOMAIN="bangcheck.site"
WWW_DOMAIN="www.bangcheck.site"
BUCKET="bangcheck-s3-bucket"
REGION="ap-northeast-2"
CERT_REGION="us-east-1"   # CloudFront ACM 고정
CF_ALIAS_HZ="Z2FDTNDATAQYW2"  # CloudFront 고정 hosted zone

# ── 사전 확인 ─────────────────────────────────────────────
command -v aws >/dev/null || { echo "❌ aws CLI 미설치"; exit 1; }
command -v jq >/dev/null  || { echo "❌ jq 미설치 (brew install jq)"; exit 1; }
aws sts get-caller-identity >/dev/null || { echo "❌ AWS 자격증명 실패"; exit 1; }

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "▶ Account: $ACCOUNT_ID"

# ── 1. Route53 Hosted Zone 조회 ───────────────────────────
echo "▶ Route53 Hosted Zone 조회"
HZ_ID=$(aws route53 list-hosted-zones-by-name --dns-name "$DOMAIN." \
  --query "HostedZones[?Name=='$DOMAIN.'].Id | [0]" --output text)
if [[ "$HZ_ID" == "None" || -z "$HZ_ID" ]]; then
  echo "❌ Hosted Zone($DOMAIN) 없음. 콘솔에서 먼저 생성하세요."
  exit 1
fi
HZ_ID="${HZ_ID##*/}"
echo "  HostedZoneId=$HZ_ID"

# ── 2. ACM 인증서 (us-east-1) ─────────────────────────────
echo "▶ ACM 인증서"
CERT_ARN=$(aws acm list-certificates --region "$CERT_REGION" \
  --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn | [0]" --output text)

if [[ "$CERT_ARN" == "None" || -z "$CERT_ARN" ]]; then
  CERT_ARN=$(aws acm request-certificate \
    --region "$CERT_REGION" \
    --domain-name "$DOMAIN" \
    --subject-alternative-names "$WWW_DOMAIN" \
    --validation-method DNS \
    --query CertificateArn --output text)
  echo "  발급 요청: $CERT_ARN"
else
  echo "  기존 사용: $CERT_ARN"
fi

# DNS 검증 레코드를 Route53에 자동 등록
echo "▶ ACM DNS 검증 레코드 Route53 등록"
for i in {1..30}; do
  VALIDATIONS=$(aws acm describe-certificate --region "$CERT_REGION" \
    --certificate-arn "$CERT_ARN" \
    --query "Certificate.DomainValidationOptions[].ResourceRecord" --output json)
  COUNT=$(echo "$VALIDATIONS" | jq '[.[] | select(.!=null)] | unique_by(.Name) | length')
  [[ "$COUNT" -ge 1 ]] && break
  sleep 2
done

echo "$VALIDATIONS" | jq -c 'unique_by(.Name) | .[]?' | while read -r rec; do
  N=$(echo "$rec" | jq -r '.Name')
  V=$(echo "$rec" | jq -r '.Value')
  T=$(echo "$rec" | jq -r '.Type')
  CHANGE=$(jq -nc --arg n "$N" --arg v "$V" --arg t "$T" '{
    Changes:[{Action:"UPSERT",ResourceRecordSet:{
      Name:$n,Type:$t,TTL:300,ResourceRecords:[{Value:$v}]
    }}]
  }')
  aws route53 change-resource-record-sets --hosted-zone-id "$HZ_ID" --change-batch "$CHANGE" >/dev/null
  echo "  upsert $T $N"
done

echo "▶ 인증서 검증 대기 (최대 ~10분)"
aws acm wait certificate-validated --region "$CERT_REGION" --certificate-arn "$CERT_ARN"
echo "  ✅ 인증서 ISSUED"

# ── 3. S3 버킷 ────────────────────────────────────────────
echo "▶ S3 버킷"
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "  이미 존재"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
    --create-bucket-configuration "LocationConstraint=$REGION" >/dev/null
  echo "  생성됨"
fi

# 퍼블릭 차단 유지 (OAC로만 접근)
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# ── 4. CloudFront OAC ─────────────────────────────────────
echo "▶ CloudFront Origin Access Control"
OAC_ID=$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${BUCKET}-oac'].Id | [0]" --output text)
if [[ "$OAC_ID" == "None" || -z "$OAC_ID" ]]; then
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config \
    "Name=${BUCKET}-oac,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" \
    --query 'OriginAccessControl.Id' --output text)
  echo "  생성: $OAC_ID"
else
  echo "  기존: $OAC_ID"
fi

# ── 5. CloudFront 배포 ────────────────────────────────────
echo "▶ CloudFront 배포"
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Aliases.Items != null && contains(Aliases.Items, '$DOMAIN')].Id | [0]" \
  --output text)

if [[ "$DIST_ID" == "None" || -z "$DIST_ID" ]]; then
  CFG=$(jq -nc \
    --arg ref "bangcheck-$(date +%s)" \
    --arg d1 "$DOMAIN" --arg d2 "$WWW_DOMAIN" \
    --arg origin "$BUCKET.s3.$REGION.amazonaws.com" \
    --arg oid "s3-$BUCKET" \
    --arg oac "$OAC_ID" \
    --arg cert "$CERT_ARN" '{
    CallerReference:$ref,
    Aliases:{Quantity:2,Items:[$d1,$d2]},
    DefaultRootObject:"index.html",
    Origins:{Quantity:1,Items:[{
      Id:$oid,
      DomainName:$origin,
      OriginAccessControlId:$oac,
      S3OriginConfig:{OriginAccessIdentity:""},
      CustomHeaders:{Quantity:0},
      ConnectionAttempts:3,
      ConnectionTimeout:10
    }]},
    OriginGroups:{Quantity:0},
    DefaultCacheBehavior:{
      TargetOriginId:$oid,
      ViewerProtocolPolicy:"redirect-to-https",
      AllowedMethods:{Quantity:2,Items:["GET","HEAD"],
        CachedMethods:{Quantity:2,Items:["GET","HEAD"]}},
      Compress:true,
      CachePolicyId:"658327ea-f89d-4fab-a63d-7e88639e58f6",
      SmoothStreaming:false,
      FieldLevelEncryptionId:"",
      LambdaFunctionAssociations:{Quantity:0},
      FunctionAssociations:{Quantity:0},
      TrustedSigners:{Enabled:false,Quantity:0},
      TrustedKeyGroups:{Enabled:false,Quantity:0}
    },
    CacheBehaviors:{Quantity:0},
    CustomErrorResponses:{Quantity:2,Items:[
      {ErrorCode:403,ResponseCode:"200",ResponsePagePath:"/index.html",ErrorCachingMinTTL:10},
      {ErrorCode:404,ResponseCode:"200",ResponsePagePath:"/index.html",ErrorCachingMinTTL:10}
    ]},
    Comment:"BangCheck frontend",
    Enabled:true,
    ViewerCertificate:{
      ACMCertificateArn:$cert,
      SSLSupportMethod:"sni-only",
      MinimumProtocolVersion:"TLSv1.2_2021",
      Certificate:$cert,
      CertificateSource:"acm"
    },
    PriceClass:"PriceClass_200",
    HttpVersion:"http2",
    IsIPV6Enabled:true,
    Staging:false,
    WebACLId:"",
    Restrictions:{GeoRestriction:{RestrictionType:"none",Quantity:0}}
  }')
  RESP=$(aws cloudfront create-distribution --distribution-config "$CFG")
  DIST_ID=$(echo "$RESP" | jq -r '.Distribution.Id')
  DIST_DOMAIN=$(echo "$RESP" | jq -r '.Distribution.DomainName')
  echo "  생성: $DIST_ID  ($DIST_DOMAIN)"
else
  DIST_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" \
    --query 'Distribution.DomainName' --output text)
  echo "  기존: $DIST_ID  ($DIST_DOMAIN)"
fi

# ── 6. S3 버킷 정책 (OAC 만 허용) ──────────────────────────
echo "▶ S3 버킷 정책 (CloudFront OAC 허용)"
POLICY=$(jq -nc \
  --arg bucket "$BUCKET" \
  --arg distarn "arn:aws:cloudfront::$ACCOUNT_ID:distribution/$DIST_ID" '{
  Version:"2012-10-17",
  Statement:[{
    Sid:"AllowCloudFrontServicePrincipal",
    Effect:"Allow",
    Principal:{Service:"cloudfront.amazonaws.com"},
    Action:"s3:GetObject",
    Resource:("arn:aws:s3:::"+$bucket+"/*"),
    Condition:{StringEquals:{"AWS:SourceArn":$distarn}}
  }]
}')
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "$POLICY"

# ── 7. Route53 A/AAAA alias (apex + www) ──────────────────
echo "▶ Route53 alias 레코드"
for D in "$DOMAIN" "$WWW_DOMAIN"; do
  for T in A AAAA; do
    CHANGE=$(jq -nc \
      --arg n "$D" --arg t "$T" \
      --arg dn "$DIST_DOMAIN" --arg hz "$CF_ALIAS_HZ" '{
      Changes:[{Action:"UPSERT",ResourceRecordSet:{
        Name:$n,Type:$t,
        AliasTarget:{HostedZoneId:$hz,DNSName:$dn,EvaluateTargetHealth:false}
      }}]
    }')
    aws route53 change-resource-record-sets --hosted-zone-id "$HZ_ID" --change-batch "$CHANGE" >/dev/null
  done
  echo "  $D → $DIST_DOMAIN"
done

# ── 8. .env.deploy 생성 ───────────────────────────────────
ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.env.deploy"
if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<EOF
S3_BUCKET=$BUCKET
CLOUDFRONT_DISTRIBUTION_ID=$DIST_ID
AWS_REGION=$REGION
VITE_API_URL=
EOF
  echo "▶ .env.deploy 생성"
else
  echo "▶ .env.deploy 이미 있음 (덮어쓰지 않음)"
fi

cat <<EOF

✅ 인프라 셋업 완료
   S3 Bucket:         $BUCKET
   CloudFront ID:     $DIST_ID
   CloudFront Domain: $DIST_DOMAIN
   사이트 (HTTPS):    https://$DOMAIN  /  https://$WWW_DOMAIN

⚠ CloudFront 전파에 5~20분 소요됩니다.
▶ 다음: VITE_API_URL 채운 뒤 ./deploy.sh 실행
EOF
